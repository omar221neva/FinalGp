import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PropertyService, type Property } from '../services/PropertyService';
import { MapPin } from 'lucide-react';
import PropertyDetail from '../components/PropertyDetail';
import RecommendedProperties from '../components/RecommendedProperties';

export default function HomePage() {
  const [topProperties, setTopProperties] = useState<Property[]>([]);
  const [destinations, setDestinations] = useState<{ city: string; country: string; continent: string; picture_url: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [properties, destinationData] = await Promise.all([
          PropertyService.getTopProperties(9),
          PropertyService.getDestinations()
        ]);
        setTopProperties(properties);
        setDestinations(destinationData.slice(0, 3)); // Get top 3 destinations
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {selectedProperty && (
        <PropertyDetail 
          property={selectedProperty} 
          onClose={() => setSelectedProperty(null)} 
        />
      )}

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
            alt="Luxury home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-6">Find Your Dream Home</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover the perfect property from our extensive collection of homes worldwide
          </p>
          <a
            href="/search"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            Start Your Search
          </a>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
              <p className="text-gray-600">Explore our highest-rated properties</p>
            </div>
            <a
              href="/search"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              View all properties
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topProperties.map((property) => (
              <div 
                key={property.id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" 
                onClick={() => setSelectedProperty(property)}
              >
                <div className="relative h-64">
                  <img
                    src={property.picture_urls[0] || 'https://via.placeholder.com/400x300'}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full">
                    ${property.price.toLocaleString()}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.name}</h3>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{property.city}, {property.country}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{property.beds} Beds</span>
                    <span>{property.bathrooms_text || `${property.bathrooms} Bath${property.bathrooms !== 1 ? 's' : ''}`}</span>
                    <span>{property.property_type}</span>
                  </div>
                  {property.review_scores_rating && (
                    <div className="mt-4 text-sm text-gray-600">
                      Rating: {property.review_scores_rating.toFixed(1)}/5
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Properties Section */}
      <RecommendedProperties onPropertyClick={setSelectedProperty} />

      {/* Popular Destinations Section */}
      <section className="py-20 px-6 md:px-10 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <p className="text-gray-600">Explore properties in these trending locations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((destination, index) => (
              <div
                key={index}
                className="relative h-[400px] rounded-2xl overflow-hidden group"
              >
                <img
                  src={destination.picture_url || 'https://via.placeholder.com/400x500'}
                  alt={destination.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{destination.city}</h3>
                    <p className="text-white/90">{destination.country}</p>
                    <p className="text-white/70">{destination.continent}</p>
                  </div>
                </div>
                <a
                  href={`/search?city=${encodeURIComponent(destination.city)}`}
                  className="absolute inset-0"
                  aria-label={`View properties in ${destination.city}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6 md:px-10 bg-blue-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive property listings and market insights
            </p>
          </div>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-xl border-2 border-transparent focus:border-white/20 bg-white/10 text-white placeholder-white/60 outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
