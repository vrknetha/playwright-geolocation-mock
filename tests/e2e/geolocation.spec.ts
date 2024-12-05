import { test as base, expect } from "@playwright/test";
import { GeoMocker } from "../../src/GeoMocker";
import { PREDEFINED_LOCATIONS } from "../../src/constants";
import type { GeoPosition } from "../../src/types";
import * as path from "path";
import * as http from "http";
import * as fs from "fs";

// Extend the test fixture to include GeoMocker and local server
type TestFixtures = {
  geoMocker: GeoMocker;
  testUrl: string;
};

const test = base.extend<TestFixtures>({
  geoMocker: async ({ context }, use) => {
    const geoMocker = new GeoMocker(context);
    await use(geoMocker);
    geoMocker.dispose();
  },
  // eslint-disable-next-line no-empty-pattern
  testUrl: async ({}, use) => {
    // Create a simple HTTP server to serve the test page
    const server = http.createServer((req, res) => {
      const testHtml = fs.readFileSync(path.join(__dirname, "test.html"));
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(testHtml);
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as { port: number }).port;
    const url = `http://localhost:${port}`;

    await use(url);
    server.close();
  },
});

test.describe("GeoMocker Tests", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["geolocation"]);
  });

  test("should mock single location", async ({ page, geoMocker, testUrl }) => {
    // First mock the location
    await geoMocker.mockLocation(PREDEFINED_LOCATIONS.LONDON);

    // Navigate to the test page
    await page.goto(testUrl);

    // Wait for the position to be updated in the DOM
    await expect(page.locator("#latitude")).not.toHaveText("Waiting...", {
      timeout: 5000,
    });

    // Get values from the DOM
    const latitude = await page.locator("#latitude").textContent();
    const longitude = await page.locator("#longitude").textContent();

    expect(Number(latitude)).toBeCloseTo(
      PREDEFINED_LOCATIONS.LONDON.latitude,
      6
    );
    expect(Number(longitude)).toBeCloseTo(
      PREDEFINED_LOCATIONS.LONDON.longitude,
      6
    );
  });

  test("should handle basic geolocation data", async ({
    page,
    geoMocker,
    testUrl,
  }) => {
    const position: GeoPosition = {
      ...PREDEFINED_LOCATIONS.LONDON,
      accuracy: 10,
    };

    await geoMocker.mockLocation(position);
    await page.goto(testUrl);

    // Wait for the position to be updated in the DOM
    await expect(page.locator("#latitude")).not.toHaveText("Waiting...", {
      timeout: 5000,
    });

    // Get values from the DOM
    const latitude = await page.locator("#latitude").textContent();
    const longitude = await page.locator("#longitude").textContent();
    const accuracy = await page.locator("#accuracy").textContent();

    expect(Number(latitude)).toBeCloseTo(position.latitude, 6);
    expect(Number(longitude)).toBeCloseTo(position.longitude, 6);
    expect(accuracy).toBe("10m");
  });

  test("should simulate movement with route", async ({
    page,
    geoMocker,
    testUrl,
  }) => {
    const route = [
      PREDEFINED_LOCATIONS.LONDON,
      PREDEFINED_LOCATIONS.PARIS,
      PREDEFINED_LOCATIONS.TOKYO,
    ];

    await page.goto(testUrl);

    // Start route simulation with longer intervals
    await geoMocker.mockRoute(route, { interval: 3000 });

    // Wait for all updates to accumulate with a longer timeout
    await expect(page.locator("#updates")).toHaveText("3", { timeout: 15000 });

    // Wait for the last position to be Tokyo
    const maxAttempts = 10;
    let attempts = 0;
    let lastLat = 0;
    let lastLng = 0;

    while (attempts < maxAttempts) {
      const lastPosition = await page.locator("#watchPosition").textContent();
      [lastLat, lastLng] = lastPosition!
        .split(",")
        .map((s) => Number(s.trim()));

      if (
        Math.abs(lastLat - PREDEFINED_LOCATIONS.TOKYO.latitude) < 0.0000005 &&
        Math.abs(lastLng - PREDEFINED_LOCATIONS.TOKYO.longitude) < 0.0000005
      ) {
        break;
      }

      await page.waitForTimeout(1000);
      attempts++;
    }

    // Verify final position
    expect(lastLat).toBeCloseTo(PREDEFINED_LOCATIONS.TOKYO.latitude, 6);
    expect(lastLng).toBeCloseTo(PREDEFINED_LOCATIONS.TOKYO.longitude, 6);
  });

  test("should handle permission changes", async ({
    page,
    geoMocker,
    testUrl,
    browserName,
  }) => {
    // Test granted permission
    await geoMocker.mockPermission("granted");
    await geoMocker.mockLocation(PREDEFINED_LOCATIONS.LONDON);
    await page.goto(testUrl);

    // Wait for position to be updated
    await expect(page.locator("#latitude")).not.toHaveText("Waiting...", {
      timeout: 5000,
    });

    const latitude = await page.locator("#latitude").textContent();
    const longitude = await page.locator("#longitude").textContent();

    expect(Number(latitude)).toBeCloseTo(
      PREDEFINED_LOCATIONS.LONDON.latitude,
      6
    );
    expect(Number(longitude)).toBeCloseTo(
      PREDEFINED_LOCATIONS.LONDON.longitude,
      6
    );

    // Test denied permission by reloading the page after permission change
    await geoMocker.mockPermission("denied");
    await page.reload();

    if (browserName === "firefox") {
      // Firefox handles permission errors differently, just verify the permission is denied
      await geoMocker.mockError(1); // 1 = PERMISSION_DENIED
      await page.reload();

      // Verify that we can't get the position anymore
      const newLatitude = await page.locator("#latitude").textContent();
      expect(newLatitude).toBe("Waiting...");
    } else {
      // Try to get position again to trigger error
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            (error) => {
              document.getElementById(
                "error"
              )!.textContent = `Error: ${error.code} - ${error.message}`;
              resolve();
            }
          );
        });
      });

      // Wait for error to appear with a longer timeout
      await expect(page.locator("#error")).toContainText("Error", {
        timeout: 10000,
      });
    }
  });

  test("should handle high accuracy mode", async ({
    page,
    geoMocker,
    testUrl,
  }) => {
    const position: GeoPosition = {
      ...PREDEFINED_LOCATIONS.LONDON,
      accuracy: 5,
    };

    await geoMocker.mockLocation(position, { enableHighAccuracy: true });
    await page.goto(testUrl);

    // Wait for high accuracy position to be updated
    await expect(page.locator("#highAccuracy")).not.toHaveText("Waiting...", {
      timeout: 5000,
    });

    const highAccuracyText = await page.locator("#highAccuracy").textContent();
    const accuracyMatch = highAccuracyText!.match(/±(\d+)m/);

    expect(accuracyMatch).not.toBeNull();
    expect(Number(accuracyMatch![1])).toBe(5);
  });
});
