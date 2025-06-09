import React, { useState } from 'react';
import { Property } from '../services/PropertyService';
import { Heart, MapPin, Bed, Bath, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PropertyCardProps {
  property: Property;
  isFeatured?: boolean;
  onSave?: () => void;
  onClick?: () => void;
  isSaved?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFeatured = false,
  onSave,
  onClick,
  isSaved = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to save properties');
      return;
    }
    if (onSave) onSave();
  };

  const {
    name,
    price,
    city,
    country,
    beds,
    bedrooms,
    bathrooms,
    bathrooms_text,
    property_type,
    review_scores_rating,
    picture_urls
  } = property;

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={picture_urls[0] || '/images/property-placeholder.jpg'} 
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        
        {/* Save Button */}
        <button 
          onClick={handleSave}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isSaved 
              ? 'bg-red-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Heart size={20} className={isSaved ? 'fill-current' : ''} />
        </button>

        {/* Property Type Tag */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {property_type || 'Property'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin size={16} className="mr-1" />
          <span>{city}, {country}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h3>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Bed size={16} className="mr-1" />
            <span>{beds} beds</span>
          </div>
          <div className="flex items-center">
            <Bath size={16} className="mr-1" />
            <span>{bathrooms || bathrooms_text}</span>
          </div>
          {review_scores_rating && (
            <div className="flex items-center">
              <Star size={16} className="mr-1 text-yellow-400" />
              <span>{review_scores_rating}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline">
          <span className="text-xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-500 ml-1">/night</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;