# Playwright Geolocation Mock

A comprehensive geolocation mocking utility for Playwright testing. This package allows you to easily mock geolocation data in your Playwright tests, including single locations, routes, and error scenarios.

## Features

- Mock single location with customizable accuracy
- Simulate movement along routes
- Mock geolocation errors
- Control geolocation permissions
- Predefined common locations
- TypeScript support

## Installation

```bash
npm install --save-dev playwright-geolocation-mock
```

## Usage

### Basic Location Mocking

```typescript
import { test } from '@playwright/test';
import { GeoMocker, PREDEFINED_LOCATIONS } from 'playwright-geolocation-mock';

test('mock user location', async ({ context, page }) => {
  const geo = new GeoMocker(context);
  
  // Use predefined location
  await geo.mockLocation(PREDEFINED_LOCATIONS.LONDON);
  
  // Or specify custom location
  await geo.mockLocation({
    latitude: 51.5074,
    longitude: -0.1278
  });
});
```

### Route Simulation

```typescript
test('simulate movement', async ({ context, page }) => {
  const geo = new GeoMocker(context);
  
  // Simulate movement between locations
  await geo.mockRoute([
    PREDEFINED_LOCATIONS.LONDON,
    PREDEFINED_LOCATIONS.PARIS
  ], {
    interval: 1000, // Update every second
    loop: true      // Loop the route
  });
});
```

### Error Simulation

```typescript
test('handle location errors', async ({ context, page }) => {
  const geo = new GeoMocker(context);
  
  // Simulate permission denied error
  await geo.mockError(1); // PERMISSION_DENIED
});
```

### Permission Control

```typescript
test('manage permissions', async ({ context, page }) => {
  const geo = new GeoMocker(context);
  
  // Grant geolocation permission
  await geo.mockPermission('granted');
  
  // Or deny it
  await geo.mockPermission('denied');
});
```

## API Reference

### `GeoMocker`

#### Constructor
```typescript
constructor(context: BrowserContext)
```

#### Methods

##### `mockLocation(position: GeoPosition, options?: GeoMockOptions)`
Mock a single location with optional configuration.

##### `mockRoute(positions: GeoPosition[], options?: RouteOptions)`
Simulate movement between multiple locations.

##### `mockError(code: GeoLocationErrorCode)`
Simulate a geolocation error.

##### `mockPermission(permission: GeolocationPermission)`
Control geolocation permissions.

##### `stopRoute()`
Stop an ongoing route simulation.

##### `dispose()`
Clean up resources.

### Types

```typescript
interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface GeoMockOptions {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
}

interface RouteOptions {
  interval?: number;
  loop?: boolean;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 