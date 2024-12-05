import { GeoPosition, GeoMockOptions, RouteOptions } from '../types';

export function validatePosition(position: GeoPosition): void {
  if (typeof position.latitude !== 'number' || position.latitude < -90 || position.latitude > 90) {
    throw new Error('Invalid latitude: must be a number between -90 and 90');
  }
  
  if (typeof position.longitude !== 'number' || position.longitude < -180 || position.longitude > 180) {
    throw new Error('Invalid longitude: must be a number between -180 and 180');
  }

  if (position.accuracy !== undefined && (typeof position.accuracy !== 'number' || position.accuracy < 0)) {
    throw new Error('Invalid accuracy: must be a positive number');
  }
}

export function validateOptions(options: GeoMockOptions): void {
  if (options.timeout !== undefined && (typeof options.timeout !== 'number' || options.timeout < 0)) {
    throw new Error('Invalid timeout: must be a positive number');
  }

  if (options.maximumAge !== undefined && (typeof options.maximumAge !== 'number' || options.maximumAge < 0)) {
    throw new Error('Invalid maximumAge: must be a positive number');
  }
}

export function validateRouteOptions(options: RouteOptions): void {
  if (options.interval !== undefined && (typeof options.interval !== 'number' || options.interval < 0)) {
    throw new Error('Invalid interval: must be a positive number');
  }
} 