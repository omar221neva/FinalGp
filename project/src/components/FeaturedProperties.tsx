import React from 'react';
import { Property } from '../types';
import PropertyCard from './PropertyCard';

interface FeaturedPropertiesProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  onSaveProperty: (property: Property) => void;
}

const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  onPropertyClick,
  onSaveProperty,
}) => {
  // Filter only featured properties
  const featuredProperties = properties.filter(property => property.featured);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-600 mt-2">Discover our handpicked selection of exceptional properties</p>
          </div>
          <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
            View all properties
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map(property => (
            <div 
              key={property.id}
              className="transform transition-transform duration-300 hover:-translate-y-1"
            >
              <PropertyCard 
                property={property}
                isFeatured={true}
                onClick={() => onPropertyClick(property)}
                onSave={() => onSaveProperty(property)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;