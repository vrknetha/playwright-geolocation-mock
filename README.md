# Playwright Geolocation Mock

A comprehensive geolocation mocking utility for Playwright testing. This package allows you to easily mock geolocation data in your Playwright tests, including single locations, routes, and error scenarios.

## Features

- Mock single location with customizable accuracy
- Simulate movement along routes
- Mock geolocation errors
- Control geolocation permissions
- 35+ predefined locations across continents and landmarks
- TypeScript support
- Cross-browser support (Chrome, Firefox, Safari)
- Mobile browser support

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
  
  // Use predefined locations
  await geo.mockLocation(PREDEFINED_LOCATIONS.LONDON);          // Cities
  await geo.mockLocation(PREDEFINED_LOCATIONS.EIFFEL_TOWER);    // Landmarks
  await geo.mockLocation(PREDEFINED_LOCATIONS.SILICON_VALLEY);  // Tech Hubs
  
  // Or specify custom location
  await geo.mockLocation({
    latitude: 51.5074,
    longitude: -0.1278,
    accuracy: 10 // optional, in meters
  });
});
```

### Route Simulation

```typescript
test('simulate movement', async ({ context, page }) => {
  const geo = new GeoMocker(context);
  
  // Simulate a European tour
  await geo.mockRoute([
    PREDEFINED_LOCATIONS.LONDON,
    PREDEFINED_LOCATIONS.PARIS,
    PREDEFINED_LOCATIONS.BERLIN,
    PREDEFINED_LOCATIONS.ROME,
    PREDEFINED_LOCATIONS.MADRID
  ], {
    interval: 3000, // Update every 3 seconds
    loop: false     // Stop at the last position
  });

  // Or simulate a world tech hub tour
  await geo.mockRoute([
    PREDEFINED_LOCATIONS.SILICON_VALLEY,
    PREDEFINED_LOCATIONS.BANGALORE,
    PREDEFINED_LOCATIONS.SHENZHEN,
    PREDEFINED_LOCATIONS.TEL_AVIV
  ]);

  // Stop route simulation if needed
  geo.stopRoute();
});
```

### Error Simulation

```typescript
test('handle location errors', async ({ context, page }) => {
  const geo = new GeoMocker(context);
  
  // Simulate permission denied error
  await geo.mockError(1); // PERMISSION_DENIED = 1
  
  // Error codes:
  // 1 = PERMISSION_DENIED
  // 2 = POSITION_UNAVAILABLE
  // 3 = TIMEOUT
});
```

### Permission Control

```typescript
test('manage permissions', async ({ context, page }) => {
  const geo = new GeoMocker(context);
  
  // Grant geolocation permission
  await geo.mockPermission('granted');
  
  // Deny permission
  await geo.mockPermission('denied');
  
  // Note: When permission is granted, the last mocked location will be restored
});
```

### High Accuracy Mode

```typescript
test('use high accuracy mode', async ({ context, page }) => {
  const geo = new GeoMocker(context);
  
  await geo.mockLocation(PREDEFINED_LOCATIONS.LONDON, {
    enableHighAccuracy: true // Reduces accuracy value by half
  });
});
```

## Testing Setup

### Test Fixtures

```typescript
import { test as base } from '@playwright/test';
import { GeoMocker } from 'playwright-geolocation-mock';

type TestFixtures = {
  geoMocker: GeoMocker;
};

const test = base.extend<TestFixtures>({
  geoMocker: async ({ context }, use) => {
    const geoMocker = new GeoMocker(context);
    await use(geoMocker);
    geoMocker.dispose();
  },
});
```

## API Reference

### `GeoMocker`

#### Constructor
```typescript
constructor(context: BrowserContext)
```

#### Methods

##### `mockLocation(position: GeoPosition, options?: GeoMockOptions): Promise<void>`
Mock a single location with optional configuration.

##### `mockRoute(positions: GeoPosition[], options?: RouteOptions): Promise<void>`
Simulate movement between multiple locations.

##### `mockError(code: GeoLocationErrorCode): Promise<void>`
Simulate a geolocation error.

##### `mockPermission(permission: GeolocationPermission): Promise<void>`
Control geolocation permissions.

##### `stopRoute(): void`
Stop an ongoing route simulation.

##### `dispose(): void`
Clean up resources (automatically stops any active route).

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
  enableHighAccuracy?: boolean;
}

interface RouteOptions {
  interval?: number;  // Default: 1000ms
  loop?: boolean;     // Default: false
}

type GeolocationPermission = 'granted' | 'denied';

type GeoLocationErrorCode = 1 | 2 | 3;  // PERMISSION_DENIED | POSITION_UNAVAILABLE | TIMEOUT
```

## Browser Support

- Chromium (Desktop & Mobile)
- Firefox (Desktop)
- WebKit/Safari (Desktop & Mobile)

Note: Some features like high accuracy mode and error handling may behave differently across browsers.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 

## Releases

Release Title Format: `v{major}.{minor}.{patch}`
Example: `v1.0.0`

Release Description Template:
```markdown
## What's Changed
- Brief summary of major changes
- New features added
- Bug fixes
- Breaking changes (if any)

## New Features
- Detailed description of new feature 1
- Detailed description of new feature 2

## Bug Fixes
- Fixed issue with X
- Resolved problem with Y

## Breaking Changes
- List any breaking changes
- Migration steps if needed

## Dependencies
- Updated dependencies
- New dependencies added

## Documentation
- Documentation updates
- New examples added

## Contributors
@username - Feature/Fix description
``` 