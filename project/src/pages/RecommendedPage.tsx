import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PropertyList from '../components/PropertyList';
import { Property, PropertyService } from '../services/PropertyService';
import { useAuth } from '../contexts/AuthContext';

const RecommendedPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendedProperties = async () => {
      try {
        setLoading(true);
        // For now, just get top-rated properties
        const recommendedProperties = await PropertyService.getTopProperties(12);
        setProperties(recommendedProperties);
      } catch (err) {
        setError('Failed to fetch recommended properties');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProperties();
  }, []);

  const handlePropertyClick = (property: Property) => {
    // Handle property click - can be implemented later
    console.log('Property clicked:', property);
  };

  const handleSaveProperty = (property: Property) => {
    // Handle save property - can be implemented later
    console.log('Property saved:', property);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          className="relative h-[300px] bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: 'url(/images/recommended-hero.jpg)',
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Recommended Properties
            </h1>
            <p className="text-xl text-white opacity-90">
              Curated selections based on your preferences
            </p>
          </div>
        </section>

        {/* Properties Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {properties.length} Properties Found
              </h2>
              <p className="text-gray-600 mt-2">
                Properties we think you'll love based on your preferences and browsing history
              </p>
            </div>

            <PropertyList
              properties={properties}
              onPropertyClick={handlePropertyClick}
              onSaveProperty={handleSaveProperty}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default RecommendedPage; 