export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface GeoMockOptions {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
}

export interface RouteOptions {
  interval?: number;
  loop?: boolean;
}

export type GeolocationPermission = 'granted' | 'denied' | 'prompt';

export type GeoLocationErrorCode = 1 | 2 | 3;  // PERMISSION_DENIED | POSITION_UNAVAILABLE | TIMEOUT 