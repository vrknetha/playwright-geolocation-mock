import { test, expect } from '@playwright/test';
import { GeoMocker } from '../../src/GeoMocker';
import { PREDEFINED_LOCATIONS } from '../../src/constants';

test.describe('Geolocation E2E Tests', () => {
  // Simple HTML page that displays geolocation data
  const HTML_CONTENT = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Geolocation Test</title>
      </head>
      <body>
        <div id="location">Waiting for location...</div>
        <div id="watch">Watching location...</div>
        <div id="error"></div>
        <script>
          function updateLocation(position) {
            document.getElementById('location').textContent = 
              \`Latitude: \${position.coords.latitude}, Longitude: \${position.coords.longitude}\`;
          }

          function handleError(error) {
            document.getElementById('error').textContent = 
              \`Error: \${error.code} - \${error.message}\`;
          }

          // Get current position
          navigator.geolocation.getCurrentPosition(updateLocation, handleError);

          // Watch position
          let watchCount = 0;
          navigator.geolocation.watchPosition(
            (position) => {
              watchCount++;
              document.getElementById('watch').textContent = 
                \`Watch #\${watchCount}: Lat: \${position.coords.latitude}, Lng: \${position.coords.longitude}\`;
            },
            handleError
          );
        </script>
      </body>
    </html>
  `;

  test.beforeEach(async ({ context, page }) => {
    // Serve the test HTML content
    await page.setContent(HTML_CONTENT);
  });

  test('should display mocked single location', async ({ context, page }) => {
    const geo = new GeoMocker(context);
    await geo.mockLocation(PREDEFINED_LOCATIONS.LONDON);

    // Wait for the location to be displayed
    await expect(page.locator('#location')).toContainText(
      `Latitude: ${PREDEFINED_LOCATIONS.LONDON.latitude}`
    );
    await expect(page.locator('#location')).toContainText(
      `Longitude: ${PREDEFINED_LOCATIONS.LONDON.longitude}`
    );
  });

  test('should update location when watching route', async ({ context, page }) => {
    const geo = new GeoMocker(context);
    const positions = [PREDEFINED_LOCATIONS.LONDON, PREDEFINED_LOCATIONS.PARIS];
    
    await geo.mockRoute(positions, { interval: 1000 });

    // Wait for initial location
    await expect(page.locator('#watch')).toContainText(
      `Lat: ${PREDEFINED_LOCATIONS.LONDON.latitude}`
    );

    // Wait for location update
    await expect(page.locator('#watch')).toContainText(
      `Lat: ${PREDEFINED_LOCATIONS.PARIS.latitude}`
    );
  });

  test('should handle permission denied error', async ({ context, page }) => {
    const geo = new GeoMocker(context);
    
    // First deny permission
    await geo.mockPermission('denied');
    await geo.mockError(1); // PERMISSION_DENIED

    // Wait for error message
    await expect(page.locator('#error')).toContainText('Error: 1');
    await expect(page.locator('#error')).toContainText('Mocked geolocation error');
  });

  test('should handle high accuracy request', async ({ context, page }) => {
    const geo = new GeoMocker(context);
    const position = {
      ...PREDEFINED_LOCATIONS.LONDON,
      accuracy: 5 // High accuracy in meters
    };

    await geo.mockLocation(position, { enableHighAccuracy: true });

    // Verify location is received with high accuracy
    await expect(page.locator('#location')).toContainText(
      `Latitude: ${position.latitude}`
    );
  });

  test('should simulate movement between multiple cities', async ({ context, page }) => {
    const geo = new GeoMocker(context);
    const route = [
      PREDEFINED_LOCATIONS.LONDON,
      PREDEFINED_LOCATIONS.PARIS,
      PREDEFINED_LOCATIONS.TOKYO
    ];

    await geo.mockRoute(route, { interval: 500, loop: true });

    // Wait for each location update
    for (const position of route) {
      await expect(page.locator('#watch')).toContainText(
        `Lat: ${position.latitude}`
      );
    }
  });
}); 