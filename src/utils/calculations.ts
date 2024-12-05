import { GeoPosition } from '../types';

const EARTH_RADIUS = 6371000; // Earth's radius in meters

export function calculateDistance(start: GeoPosition, end: GeoPosition): number {
  const lat1 = toRadians(start.latitude);
  const lat2 = toRadians(end.latitude);
  const deltaLat = toRadians(end.latitude - start.latitude);
  const deltaLon = toRadians(end.longitude - start.longitude);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

export function interpolatePosition(start: GeoPosition, end: GeoPosition, fraction: number): GeoPosition {
  const lat = start.latitude + (end.latitude - start.latitude) * fraction;
  const lon = start.longitude + (end.longitude - start.longitude) * fraction;
  
  return {
    latitude: lat,
    longitude: lon,
    accuracy: start.accuracy,
    altitude: start.altitude,
    altitudeAccuracy: start.altitudeAccuracy,
    heading: start.heading,
    speed: calculateSpeed(start, end, fraction)
  };
}

export function calculateSpeed(start: GeoPosition, end: GeoPosition, timeFraction: number): number {
  if (timeFraction === 0) return 0;
  const distance = calculateDistance(start, end);
  return distance / timeFraction;
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
} 