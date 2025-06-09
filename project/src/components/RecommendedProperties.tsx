import { useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";
import { Property } from "../services/PropertyService";

interface RecommendedPropertiesProps {
  onPropertyClick: (property: Property) => void;
}

export default function RecommendedProperties({ onPropertyClick }: RecommendedPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noRecommendations, setNoRecommendations] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        setNoRecommendations(false);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
          setNoRecommendations(true);
          return;
        }

        const response = await fetch(`http://localhost:8000/recommend?user_id=${user.id}`);
        const data = await response.json();

        // Handle response types
        if (!response.ok || !Array.isArray(data)) {
          if (data?.message || data?.error) {
            setNoRecommendations(true);
          } else {
            throw new Error("Unexpected response from API.");
          }
          return;
        }

        if (data.length === 0) {
          setNoRecommendations(true);
          return;
        }

        setProperties(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <section className="py-12 px-6 md:px-10 bg-gray-50 text-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-gray-600">Loading recommendations...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 px-6 md:px-10 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-4">Recommended For You</h2>
        <p className="text-red-600 mb-4">{error}</p>
      </section>
    );
  }

  if (noRecommendations) {
    return (
      <section className="py-12 px-6 md:px-10 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-4">Recommended For You</h2>
        <p className="text-gray-600 mb-6">
          Book your first property to get personalized recommendations!
        </p>
        <a
          href="/properties"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Explore Properties
        </a>
      </section>
    );
  }

  return (
    <section className="py-12 px-6 md:px-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">
          Recommended For You
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => onPropertyClick(property)}
            >
              <div className="relative h-48">
                <img
                  src={
                    Array.isArray(property.picture_urls)
                      ? property.picture_urls[0] || "/placeholder.jpg"
                      : "/placeholder.jpg"
                  }
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full">
                  ${property.price}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
                <p className="text-gray-600 mb-2">
                  {property.city}, {property.country}
                </p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{property.beds} Beds</span>
                  <span>{property.bathrooms} Baths</span>
                  <span>{property.property_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
