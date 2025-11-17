import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationResult {
  suburb: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  display_name: string;
}

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    province?: string;
    region?: string;
    suburb?: string;
    county?: string;
    country: string;
    country_code: string;
  };
}

export const getCurrentLocation = async (): Promise<LocationResult | null> => {
  try {
    // Request permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Please enable location permissions in settings to use automatic location detection.',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Get current position
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Reverse geocode using Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.coords.latitude}&lon=${location.coords.longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Uthutho/1.0 (shaqeel@crechespots.co.za)',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data: NominatimResult = await response.json();

    if (data && data.address) {
      const address = data.address;
      
      // Extract location components with fallbacks
      const suburb = address.suburb || address.village || address.municipality || '';
      const city = address.city || address.town || address.municipality || address.county || '';
      const province = address.province || address.state || address.region || '';

      return {
        suburb,
        city,
        province,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        display_name: data.display_name,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting location:', error);
    Alert.alert(
      'Location Error',
      'Unable to get your current location. Please try again or select a location manually.',
      [{ text: 'OK' }]
    );
    return null;
  }
};

export const searchLocations = async (query: string): Promise<LocationResult[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=za&bounded=1&viewbox=16.45,-22.13,32.89,-34.83&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Uthutho/1.0 (shaqeel@crechespots.co.za)',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search locations');
    }

    const data: NominatimResult[] = await response.json();

    return data.map((item: NominatimResult, index: number) => {
      // Prioritize suburb for filtering since that's what your database uses
      const suburb = item.address.suburb || item.address.village || item.address.municipality || '';
      const city = item.address.city || item.address.town || item.address.municipality || item.address.county || '';
      
      return {
        id: `search-${index}`,
        name: item.display_name.split(',')[0],
        suburb: suburb || city, // Use city as fallback for suburb
        city: city,
        province: item.address.province || item.address.state || item.address.region || '',
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        display_name: item.display_name,
      };
    });
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};

// Get popular South African locations
// Get popular South African locations
export const getPopularLocations = (): LocationResult[] => {
  return [
    {
      id: 'johannesburg',
      name: 'Johannesburg',
      suburb: 'Johannesburg Central',
      city: 'Johannesburg',
      province: 'Gauteng',
      latitude: -26.2041,
      longitude: 28.0473,
      display_name: 'Johannesburg, Gauteng, South Africa',
    },
    {
      id: 'cape-town',
      name: 'Cape Town',
      suburb: 'City Bowl',
      city: 'Cape Town',
      province: 'Western Cape',
      latitude: -33.9249,
      longitude: 18.4241,
      display_name: 'Cape Town, Western Cape, South Africa',
    },
    {
      id: 'durban',
      name: 'Durban',
      suburb: 'Beachfront',
      city: 'Durban',
      province: 'KwaZulu-Natal',
      latitude: -29.8587,
      longitude: 31.0218,
      display_name: 'Durban, KwaZulu-Natal, South Africa',
    },
    {
      id: 'pretoria',
      name: 'Pretoria',
      suburb: 'Pretoria Central',
      city: 'Pretoria',
      province: 'Gauteng',
      latitude: -25.7479,
      longitude: 28.2293,
      display_name: 'Pretoria, Gauteng, South Africa',
    },
    {
      id: 'soweto',
      name: 'Soweto',
      suburb: 'Soweto',
      city: 'Johannesburg',
      province: 'Gauteng',
      latitude: -26.2485,
      longitude: 27.8540,
      display_name: 'Soweto, Gauteng, South Africa',
    },
  ];
};