import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PropertySearchFilters from '../components/PropertySearchFilters';
import PropertyList from '../components/PropertyList';
import PropertyDetail from '../components/PropertyDetail';
import { Property, PropertyService } from '../services/PropertyService';
import { useAuth } from '../contexts/AuthContext';

interface UserPreference {
  minPrice: number;
  maxPrice: number;
  minBeds: number;
  minBedrooms: number;
  minBathrooms: number;
  propertyTypes: string[];
  amenities: string[];
  locations: string[];
}

const defaultPreferences: UserPreference = {
  minPrice: 50,
  maxPrice: 1000,
  minBeds: 1,
  minBedrooms: 1,
  minBathrooms: 1,
  propertyTypes: [],
  amenities: [],
  locations: []
};

const SearchPage: React.FC = () => {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [savedProperties, setSavedProperties] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAndFilterProperties(defaultPreferences, '');
  }, []);

  const fetchAndFilterProperties = async (preferences: UserPreference, searchTerm: string) => {
    try {
      setLoading(true);
      let properties = await PropertyService.getProperties();
      
      // Filter properties based on preferences
      properties = properties.filter(property => {
        // Price filter
        if (property.price < preferences.minPrice || property.price > preferences.maxPrice) {
          return false;
        }
        
        // Beds filter
        if (property.beds < preferences.minBeds) {
          return false;
        }
        
        // Bedrooms filter
        if (property.bedrooms < preferences.minBedrooms) {
          return false;
        }
        
        // Bathrooms filter
        if (property.bathrooms && preferences.minBathrooms > 0 && property.bathrooms < preferences.minBathrooms) {
          return false;
        }
        
        // Property type filter
        if (preferences.propertyTypes.length > 0 && !preferences.propertyTypes.includes(property.property_type || '')) {
          return false;
        }
        
        // Location filter
        if (preferences.locations.length > 0 && !preferences.locations.includes(property.city)) {
          return false;
        }
        
        // Amenities filter - property must have at least one of the selected amenities
        if (preferences.amenities.length > 0 && property.amenities) {
          const propertyAmenities = typeof property.amenities === 'string' 
            ? JSON.parse(property.amenities) 
            : property.amenities;
            
          const hasAmenity = preferences.amenities.some(amenity => 
            propertyAmenities.includes(amenity)
          );
          if (!hasAmenity) {
            return false;
          }
        }
        
        return true;
      });

      // Apply search term filter if provided
      if (searchTerm) {
        properties = properties.filter(property => 
          property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.country.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredProperties(properties);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch properties');
      setLoading(false);
    }
  };

  const handleFilterChange = (preferences: UserPreference, searchTerm: string) => {
    fetchAndFilterProperties(preferences, searchTerm);
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleSaveProperty = async (property: Property) => {
    if (!user) return;
    
    try {
      if (savedProperties.includes(property.id)) {
        setSavedProperties(savedProperties.filter(id => id !== property.id));
      } else {
        setSavedProperties([...savedProperties, property.id]);
      }
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with Search */}
        <section 
          className="relative h-[650px] bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: 'url(/images/search-hero.jpg)',
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10 -mt-32">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
              Find Your Perfect Rental
            </h1>
            <div className="max-w-4xl mx-auto">
              <PropertySearchFilters 
                onFilterChange={handleFilterChange}
                showAdvancedFilters={true}
              />
            </div>
          </div>
        </section>
        
        {/* Search Results */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredProperties.length} Properties Found
              </h2>
              <div className="flex items-center gap-4">
                <select className="px-4 py-2 border rounded-lg">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>
            </div>
            
            {/* Display filtered properties */}
            <PropertyList 
              properties={filteredProperties}
              onPropertyClick={handlePropertyClick}
              onSaveProperty={handleSaveProperty}
            />
          </div>
        </section>
      </main>
      
      <Footer />
      
      {selectedProperty && (
        <PropertyDetail 
          property={selectedProperty} 
          onClose={() => setSelectedProperty(null)} 
        />
      )}
    </div>
  );
};

export default SearchPage;