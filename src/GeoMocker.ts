import { BrowserContext } from '@playwright/test';
import { GeoPosition, GeoMockOptions, RouteOptions, GeolocationPermission, GeoLocationErrorCode } from './types';
import { DEFAULT_OPTIONS, DEFAULT_ACCURACY } from './constants';
import { validatePosition, validateOptions, validateRouteOptions } from './utils/validators';

declare global {
  interface Window {
    _geoWatchCallbacks?: Map<number, (position: GeolocationPositionType) => void>;
  }
}

interface GeolocationPositionType {
  coords: GeolocationCoordinates;
  timestamp: number;
}

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export class GeoMocker {
  private context: BrowserContext;
  private currentPosition?: GeoPosition;
  private watchId: number = 0;
  private routeInterval?: NodeJS.Timeout;
  private routePositions: GeoPosition[] = [];
  private currentRouteIndex: number = 0;

  constructor(context: BrowserContext) {
    this.context = context;
  }

  async mockLocation(position: GeoPosition, options: GeoMockOptions = DEFAULT_OPTIONS): Promise<void> {
    validatePosition(position);
    validateOptions(options);

    this.currentPosition = {
      accuracy: options.enableHighAccuracy ? DEFAULT_ACCURACY / 2 : DEFAULT_ACCURACY,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      ...position
    };

    await this.context.setGeolocation({
      latitude: position.latitude,
      longitude: position.longitude,
      accuracy: position.accuracy
    });

    await this.updateGeolocationOverride();
  }

  async mockRoute(positions: GeoPosition[], options: RouteOptions = {}): Promise<void> {
    positions.forEach(validatePosition);
    validateRouteOptions(options);

    this.stopRoute();
    this.routePositions = positions;
    this.currentRouteIndex = 0;

    const interval = options.interval || 1000;
    this.routeInterval = setInterval(async () => {
      await this.updateRoutePosition(options.loop || false);
    }, interval);

    await this.mockLocation(positions[0]);
  }

  async mockError(code: GeoLocationErrorCode): Promise<void> {
    const script = `
      window.navigator.geolocation = {
        getCurrentPosition: (success, error) => {
          error({ code: ${code}, message: 'Mocked geolocation error' });
        },
        watchPosition: (success, error) => {
          error({ code: ${code}, message: 'Mocked geolocation error' });
          return 0;
        },
        clearWatch: () => {}
      };
    `;

    await this.context.addInitScript(script);
    
    const pages = this.context.pages();
    await Promise.all(pages.map(page => page.evaluate(script)));
  }

  async mockPermission(permissionState: GeolocationPermission): Promise<void> {
    if (permissionState === 'denied') {
      await this.context.clearPermissions();
    } else {
      await this.context.grantPermissions(['geolocation']);
    }

    if (this.currentPosition && permissionState === 'granted') {
      await this.mockLocation(this.currentPosition);
    }
  }

  private async updateGeolocationOverride(): Promise<void> {
    if (!this.currentPosition) return;

    const geolocationPosition: GeolocationPositionType = {
      coords: {
        latitude: this.currentPosition.latitude,
        longitude: this.currentPosition.longitude,
        accuracy: this.currentPosition.accuracy || DEFAULT_ACCURACY,
        altitude: this.currentPosition.altitude || null,
        altitudeAccuracy: this.currentPosition.altitudeAccuracy || null,
        heading: this.currentPosition.heading || null,
        speed: this.currentPosition.speed || null
      },
      timestamp: Date.now()
    };

    const script = `
      if (!window._geoWatchCallbacks) {
        window._geoWatchCallbacks = new Map();
      }

      const mockPosition = ${JSON.stringify(geolocationPosition)};
      
      window.navigator.geolocation = {
        getCurrentPosition: (success, error, options) => {
          setTimeout(() => {
            success(mockPosition);
          }, 0);
        },
        watchPosition: (success, error, options) => {
          const watchId = ${++this.watchId};
          setTimeout(() => {
            success(mockPosition);
          }, 0);
          window._geoWatchCallbacks.set(watchId, success);
          return watchId;
        },
        clearWatch: (watchId) => {
          window._geoWatchCallbacks.delete(watchId);
        }
      };

      // Notify existing watchers
      if (window._geoWatchCallbacks) {
        for (const callback of window._geoWatchCallbacks.values()) {
          setTimeout(() => {
            callback(mockPosition);
          }, 0);
        }
      }
    `;

    // First add it as an init script for future page loads
    await this.context.addInitScript(script);

    // Then execute it immediately on all current pages
    const pages = this.context.pages();
    await Promise.all(pages.map(async (page) => {
      try {
        await page.evaluate(script);
      } catch (e) {
        // Ignore evaluation errors on pages that might be closed or not ready
      }
    }));
  }

  private async updateRoutePosition(loop: boolean): Promise<void> {
    if (this.routePositions.length < 2) return;

    this.currentRouteIndex++;
    if (this.currentRouteIndex >= this.routePositions.length) {
      if (loop) {
        this.currentRouteIndex = 0;
      } else {
        this.stopRoute();
        return;
      }
    }

    const currentPos = this.routePositions[this.currentRouteIndex];
    await this.mockLocation(currentPos);
  }

  stopRoute(): void {
    if (this.routeInterval) {
      clearInterval(this.routeInterval);
      this.routeInterval = undefined;
    }
    this.routePositions = [];
    this.currentRouteIndex = 0;
  }

  dispose(): void {
    this.stopRoute();
  }
} 