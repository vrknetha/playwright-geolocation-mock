import { BrowserContext } from '@playwright/test';
import { GeoPosition, GeoMockOptions, RouteOptions, GeolocationPermission, GeoLocationErrorCode } from './types';
import { DEFAULT_OPTIONS, DEFAULT_ACCURACY, ERROR_CODES } from './constants';
import { validatePosition, validateOptions, validateRouteOptions } from './utils/validators';
import { interpolatePosition } from './utils/calculations';

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
    await this.context.addInitScript(`
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
    `);
  }

  async mockPermission(permission: GeolocationPermission): Promise<void> {
    await this.context.grantPermissions(['geolocation'], {
      origin: permission === 'denied' ? undefined : '*'
    });
  }

  private async updateGeolocationOverride(): Promise<void> {
    if (!this.currentPosition) return;

    await this.context.addInitScript(`
      window.navigator.geolocation = {
        getCurrentPosition: (success) => {
          success(${JSON.stringify(this.currentPosition)});
        },
        watchPosition: (success) => {
          const watchId = ${++this.watchId};
          success(${JSON.stringify(this.currentPosition)});
          window._geoWatchCallbacks = window._geoWatchCallbacks || new Map();
          window._geoWatchCallbacks.set(watchId, success);
          return watchId;
        },
        clearWatch: (watchId) => {
          if (window._geoWatchCallbacks) {
            window._geoWatchCallbacks.delete(watchId);
          }
        }
      };
    `);

    await this.context.evaluate((position) => {
      if (window._geoWatchCallbacks) {
        for (const callback of window._geoWatchCallbacks.values()) {
          callback(position);
        }
      }
    }, this.currentPosition);
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