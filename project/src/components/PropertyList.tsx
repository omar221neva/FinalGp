import React from 'react';
import { Property } from '../services/PropertyService';
import PropertyCard from './PropertyCard';

interface PropertyListProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  onSaveProperty: (property: Property) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onPropertyClick,
  onSaveProperty,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map(property => (
        <PropertyCard 
          key={property.id}
          property={property}
          onClick={() => onPropertyClick(property)}
          onSave={() => onSaveProperty(property)}
        />
      ))}
      
      {properties.length === 0 && (
        <div className="col-span-full text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default PropertyList;