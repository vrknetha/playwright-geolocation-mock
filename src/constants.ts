import { GeoMockOptions } from './types';

export const DEFAULT_OPTIONS: GeoMockOptions = {
  timeout: 0,
  maximumAge: 0,
  enableHighAccuracy: false
};

export const PREDEFINED_LOCATIONS = {
  // Europe
  LONDON: { latitude: 51.5074, longitude: -0.1278 },
  PARIS: { latitude: 48.8566, longitude: 2.3522 },
  BERLIN: { latitude: 52.5200, longitude: 13.4050 },
  ROME: { latitude: 41.9028, longitude: 12.4964 },
  MADRID: { latitude: 40.4168, longitude: -3.7038 },
  AMSTERDAM: { latitude: 52.3676, longitude: 4.9041 },
  
  // North America
  NEW_YORK: { latitude: 40.7128, longitude: -74.0060 },
  SAN_FRANCISCO: { latitude: 37.7749, longitude: -122.4194 },
  LOS_ANGELES: { latitude: 34.0522, longitude: -118.2437 },
  CHICAGO: { latitude: 41.8781, longitude: -87.6298 },
  TORONTO: { latitude: 43.6532, longitude: -79.3832 },
  VANCOUVER: { latitude: 49.2827, longitude: -123.1207 },
  
  // Asia
  TOKYO: { latitude: 35.6762, longitude: 139.6503 },
  SINGAPORE: { latitude: 1.3521, longitude: 103.8198 },
  HONG_KONG: { latitude: 22.3193, longitude: 114.1694 },
  SEOUL: { latitude: 37.5665, longitude: 126.9780 },
  SHANGHAI: { latitude: 31.2304, longitude: 121.4737 },
  MUMBAI: { latitude: 19.0760, longitude: 72.8777 },
  DUBAI: { latitude: 25.2048, longitude: 55.2708 },
  
  // Oceania
  SYDNEY: { latitude: -33.8688, longitude: 151.2093 },
  MELBOURNE: { latitude: -37.8136, longitude: 144.9631 },
  AUCKLAND: { latitude: -36.8509, longitude: 174.7645 },
  
  // South America
  SAO_PAULO: { latitude: -23.5505, longitude: -46.6333 },
  RIO_DE_JANEIRO: { latitude: -22.9068, longitude: -43.1729 },
  BUENOS_AIRES: { latitude: -34.6037, longitude: -58.3816 },
  
  // Africa
  CAPE_TOWN: { latitude: -33.9249, longitude: 18.4241 },
  CAIRO: { latitude: 30.0444, longitude: 31.2357 },
  NAIROBI: { latitude: -1.2921, longitude: 36.8219 },
  
  // Famous Places
  EIFFEL_TOWER: { latitude: 48.8584, longitude: 2.2945 },
  STATUE_OF_LIBERTY: { latitude: 40.6892, longitude: -74.0445 },
  TAJ_MAHAL: { latitude: 27.1751, longitude: 78.0421 },
  PYRAMIDS_OF_GIZA: { latitude: 29.9792, longitude: 31.1342 },
  MACHU_PICCHU: { latitude: -13.1631, longitude: -72.5450 },
  GREAT_WALL: { latitude: 40.4319, longitude: 116.5704 },
  
  // Tech Hubs
  SILICON_VALLEY: { latitude: 37.3875, longitude: -122.0575 }, // Mountain View
  BANGALORE: { latitude: 12.9716, longitude: 77.5946 },
  SHENZHEN: { latitude: 22.5431, longitude: 114.0579 },
  BERLIN_STARTUP: { latitude: 52.5200, longitude: 13.4050 }, // Kreuzberg/Friedrichshain area
  TEL_AVIV: { latitude: 32.0853, longitude: 34.7818 }
} as const;

export const DEFAULT_ACCURACY = 10; // meters
export const HIGH_ACCURACY = 5; // meters
export const LOW_ACCURACY = 100; // meters 