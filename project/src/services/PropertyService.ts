import { supabase } from '../lib/supabase';

export interface Property {
  id: number;
  name: string;
  description: string | null;
  price: number;
  longitude: number;
  latitude: number;
  host_id: number;
  beds: number;
  bedrooms: number;
  bathrooms_text: string | null;
  property_type: string | null;
  amenities: string[];
  review_scores_rating: number | null;
  city: string;
  country: string;
  continent: string;
  bathrooms: number | null;
  picture_urls: string[];
}

export class PropertyService {
  /**
   * Get all properties
   */
  static async getProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*');

    if (error) throw error;
    return data.map(this.mapPropertyFromDatabase);
  }

  /**
   * Get a single property by ID
   */
  static async getPropertyById(id: number): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapPropertyFromDatabase(data);
  }

  /**
   * Search properties by query string (searches in name, city, country)
   */
  static async searchProperties(query: string): Promise<Property[]> {
    let allData: any[] = [];
    let from = 0;
    const PAGE_SIZE = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(`name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%`)
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      allData = [...allData, ...data];
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    return allData.map(this.mapPropertyFromDatabase);
  }

  /**
   * Get top properties based on review scores
   */
  static async getTopProperties(limit: number = 9): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('review_scores_rating', { ascending: false })
      .not('review_scores_rating', 'is', null)
      .limit(limit);

    if (error) throw error;
    return data.map(this.mapPropertyFromDatabase);
  }

  /**
   * Get properties by city
   */
  static async getPropertiesByCity(city: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .ilike('city', `%${city}%`);

    if (error) throw error;
    return data.map(this.mapPropertyFromDatabase);
  }

  /**
   * Get properties by continent
   */
  static async getPropertiesByContinent(continent: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('continent', continent);

    if (error) throw error;
    return data.map(this.mapPropertyFromDatabase);
  }

  /**
   * Get unique destinations (city, country, continent combinations)
   */
  static async getDestinations(): Promise<{ city: string; country: string; continent: string; picture_url: string | null }[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('city, country, continent, picture_urls')
      .order('city');

    if (error) throw error;

    // Get unique city-country-continent combinations with a sample image
    const uniqueDestinations = [...new Set(data.map(d => 
      JSON.stringify({ 
        city: d.city, 
        country: d.country,
        continent: d.continent,
        picture_url: d.picture_urls ? JSON.parse(d.picture_urls)[0] : null
      })
    ))].map(d => JSON.parse(d));

    return uniqueDestinations;
  }

  /**
   * Get properties by multiple IDs
   */
  static async getPropertiesByIds(ids: number[]): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', ids);

    if (error) throw error;
    return data.map(this.mapPropertyFromDatabase);
  }

  /**
   * Get properties by host ID
   */
  static async getPropertiesByHost(hostId: number): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('host_id', hostId);

    if (error) throw error;
    return data.map(this.mapPropertyFromDatabase);
  }

  /**
   * Map database property to frontend property type
   */
  private static mapPropertyFromDatabase(item: any): Property {
    // Parse JSON fields
    const pictureUrls = item.picture_urls ? JSON.parse(item.picture_urls) : [];
    const amenitiesList = item.amenities ? JSON.parse(item.amenities) : [];

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      longitude: item.longitude,
      latitude: item.latitude,
      host_id: item.host_id,
      beds: item.beds,
      bedrooms: item.bedrooms,
      bathrooms_text: item.bathrooms_text,
      property_type: item.property_type,
      amenities: amenitiesList,
      review_scores_rating: item.review_scores_rating ? parseFloat(item.review_scores_rating) : null,
      city: item.city,
      country: item.country,
      continent: item.continent,
      bathrooms: item.bathrooms,
      picture_urls: pictureUrls
    };
  }
}
