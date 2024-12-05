import { test, expect } from '@playwright/test';
import { GeoMocker } from '../../src/GeoMocker';
import { PREDEFINED_LOCATIONS } from '../../src/constants';

test.describe('GeoMocker', () => {
  test('should mock a single location', async ({ context, page }) => {
    const geo = new GeoMocker(context);
    await geo.mockLocation(PREDEFINED_LOCATIONS.LONDON);

    await page.goto('about:blank');
    const position = await page.evaluate(() => {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition((pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        });
      });
    });

    expect(position).toEqual({
      latitude: PREDEFINED_LOCATIONS.LONDON.latitude,
      longitude: PREDEFINED_LOCATIONS.LONDON.longitude
    });
  });

  test('should simulate route between locations', async ({ context, page }) => {
    const geo = new GeoMocker(context);
    const positions = [PREDEFINED_LOCATIONS.LONDON, PREDEFINED_LOCATIONS.PARIS];
    
    await geo.mockRoute(positions, { interval: 100 });
    await page.goto('about:blank');

    const locations = await page.evaluate(() => {
      return new Promise((resolve) => {
        const positions: any[] = [];
        const watchId = navigator.geolocation.watchPosition((pos) => {
          positions.push({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          if (positions.length >= 2) {
            navigator.geolocation.clearWatch(watchId);
            resolve(positions);
          }
        });
      });
    });

    expect(locations[0]).toEqual({
      latitude: PREDEFINED_LOCATIONS.LONDON.latitude,
      longitude: PREDEFINED_LOCATIONS.LONDON.longitude
    });

    expect(locations[1]).toEqual({
      latitude: PREDEFINED_LOCATIONS.PARIS.latitude,
      longitude: PREDEFINED_LOCATIONS.PARIS.longitude
    });
  });

  test('should handle geolocation errors', async ({ context, page }) => {
    const geo = new GeoMocker(context);
    await geo.mockError(1); // PERMISSION_DENIED

    await page.goto('about:blank');
    const error = await page.evaluate(() => {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => {},
          (err) => resolve({ code: err.code, message: err.message })
        );
      });
    });

    expect(error).toEqual({
      code: 1,
      message: 'Mocked geolocation error'
    });
  });
}); 