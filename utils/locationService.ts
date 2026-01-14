export interface LocationResult {
  id?: string;
  name?: string;
  suburb: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  display_name: string;
}

export interface NominatimResult {
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

import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

export const getCurrentLocation = async (): Promise<LocationResult | null> => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Please enable location permissions in settings to use automatic location detection.',
        [{ text: 'OK' }]
      );
      return null;
    }

    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

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

// Calculate distance between two coordinates in kilometers
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get creches within a radius using client-side filtering
export const getCrechesWithinRadius = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
) => {
  try {
    console.log(`🔍 Fetching creches within ${radiusKm}km of (${latitude}, ${longitude})`);
    
    const { data: allCreches, error } = await supabase
      .from('creches')
      .select('*');
    
    if (error) throw error;
    
    if (!allCreches || allCreches.length === 0) {
      console.log('No creches found in database');
      return [];
    }
    
    // Count creches with coordinates
    const crechesWithCoords = allCreches.filter(c => c.latitude && c.longitude);
    console.log(`${crechesWithCoords.length}/${allCreches.length} creches have coordinates`);
    
    const nearbyCreches = crechesWithCoords.filter(creche => {
      const distance = calculateDistance(
        latitude,
        longitude,
        creche.latitude,
        creche.longitude
      );
      
      // Add distance property to creche object
      creche.distance = Math.round(distance * 10) / 10;
      return distance <= radiusKm;
    });
    
    console.log(`✅ Found ${nearbyCreches.length} creches within ${radiusKm}km radius`);
    
    // Sort by distance
    return nearbyCreches.sort((a, b) => (a.distance || 999) - (b.distance || 999));
  } catch (error) {
    console.error('Error fetching creches within radius:', error);
    return [];
  }
};

// Database-side radius query (more efficient for large datasets)
export const getCrechesWithinRadiusDB = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
) => {
  try {
    console.log(`📍 Database query: Within ${radiusKm}km of (${latitude}, ${longitude})`);
    
    // Using PostGIS-like calculation in Supabase
    const { data, error } = await supabase
      .rpc('get_creches_within_radius', {
        user_lat: latitude,
        user_lon: longitude,
        radius_km: radiusKm
      });
    
    if (error) {
      console.log('Falling back to client-side calculation');
      return await getCrechesWithinRadius(latitude, longitude, radiusKm);
    }
    
    console.log(`✅ Database returned ${data?.length || 0} creches`);
    return data || [];
  } catch (error) {
    console.error('Error in database radius query:', error);
    return await getCrechesWithinRadius(latitude, longitude, radiusKm);
  }
};

export const searchLocations = async (query: string): Promise<LocationResult[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    console.log(`🔍 Searching for location: "${query}"`);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=za&bounded=1&viewbox=16.45,-22.13,32.89,-34.83&limit=10&addressdetails=1`,
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
    
    console.log(`📍 Nominatim returned ${data.length} results for "${query}"`);
    
    return data.map((item: NominatimResult, index: number) => {
      const address = item.address;
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      
      // Enhanced address extraction
      let suburb = '';
      if (address.suburb) {
        suburb = address.suburb;
      } else if (address.village) {
        suburb = address.village;
      } else if (address.town && address.town !== address.city) {
        suburb = address.town;
      } else if (address.municipality) {
        suburb = address.municipality;
      }
      
      const city = address.city || address.town || address.municipality || address.county || '';
      const province = address.province || address.state || address.region || '';
      
      // For townships, use display_name first part as suburb
      const displayParts = item.display_name.split(',');
      if (!suburb && displayParts.length > 0) {
        const firstPart = displayParts[0].trim();
        if (firstPart.toLowerCase().includes(query.toLowerCase())) {
          suburb = firstPart;
        }
      }

      return {
        id: `search-${index}-${Date.now()}`,
        name: item.display_name.split(',')[0],
        suburb: suburb || city,
        city: city,
        province: province,
        latitude: lat,
        longitude: lon,
        display_name: item.display_name,
      };
    });
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};

export const getPopularLocations = (): LocationResult[] => {
  return [
    {
      id: 'lentegeur',
      name: 'Lentegeur',
      suburb: 'Lentegeur',
      city: 'Cape Town',
      province: 'Western Cape',
      latitude: -34.0522,
      longitude: 18.6700,
      display_name: 'Lentegeur, Cape Town, Western Cape',
    },
    {
      id: 'cape-town',
      name: 'Cape Town',
      suburb: 'City Bowl',
      city: 'Cape Town',
      province: 'Western Cape',
      latitude: -33.9249,
      longitude: 18.4241,
      display_name: 'Cape Town, Western Cape',
    },
    {
      id: 'johannesburg',
      name: 'Johannesburg',
      suburb: 'Johannesburg Central',
      city: 'Johannesburg',
      province: 'Gauteng',
      latitude: -26.2041,
      longitude: 28.0473,
      display_name: 'Johannesburg, Gauteng',
    },
    {
      id: 'durban',
      name: 'Durban',
      suburb: 'Beachfront',
      city: 'Durban',
      province: 'KwaZulu-Natal',
      latitude: -29.8587,
      longitude: 31.0218,
      display_name: 'Durban, KwaZulu-Natal',
    },
    {
      id: 'khayelitsha',
      name: 'Khayelitsha',
      suburb: 'Khayelitsha',
      city: 'Cape Town',
      province: 'Western Cape',
      latitude: -34.0392,
      longitude: 18.6735,
      display_name: 'Khayelitsha, Cape Town, Western Cape',
    },
  ];
};

// Geocode a creche address
export const geocodeCrecheAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=za`,
      {
        headers: {
          'User-Agent': 'Uthutho/1.0 (shaqeel@crechespots.co.za)',
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};