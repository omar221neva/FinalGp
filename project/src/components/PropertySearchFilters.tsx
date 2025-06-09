import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import Button from './ui/Button';

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

interface PropertySearchFiltersProps {
  onFilterChange: (preferences: UserPreference, searchTerm: string) => void;
  showAdvancedFilters?: boolean;
}

const PropertySearchFilters: React.FC<PropertySearchFiltersProps> = ({
  onFilterChange,
  showAdvancedFilters = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(50);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minBeds, setMinBeds] = useState(1);
  const [minBedrooms, setMinBedrooms] = useState(1);
  const [minBathrooms, setMinBathrooms] = useState(1);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const propertyTypes = [
    'Apartment',
    'House',
    'Villa',
    'Condo',
    'Townhouse'
  ];

  const amenities = [
    'WiFi',
    'Pool',
    'Gym',
    'Parking',
    'Air Conditioning',
    'Kitchen'
  ];

  const handleSearch = () => {
    const preferences: UserPreference = {
      minPrice,
      maxPrice,
      minBeds,
      minBedrooms,
      minBathrooms,
      propertyTypes: selectedPropertyTypes,
      amenities: selectedAmenities,
      locations: selectedLocations
    };
    onFilterChange(preferences, searchTerm);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Main Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <input
            type="text"
            placeholder="Address, School, City, Zip or Neighborhood"
            className="w-full h-14 pl-12 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
        </div>
        <Button 
          onClick={handleSearch}
          className="h-14 px-8 bg-red-600 hover:bg-red-700 text-lg"
        >
          Search
        </Button>
      </div>

      {/* Filter Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <SlidersHorizontal size={20} className="mr-2" />
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Price Range (per night)</h3>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border rounded-md"
                  />
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Beds & Baths */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Beds & Baths</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Beds</label>
                  <select
                    value={minBeds}
                    onChange={(e) => setMinBeds(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num}+</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Baths</label>
                  <select
                    value={minBathrooms}
                    onChange={(e) => setMinBathrooms(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>{num}+</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Property Type</h3>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      if (selectedPropertyTypes.includes(type)) {
                        setSelectedPropertyTypes(selectedPropertyTypes.filter(t => t !== type));
                      } else {
                        setSelectedPropertyTypes([...selectedPropertyTypes, type]);
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm ${
                      selectedPropertyTypes.includes(type)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="lg:col-span-3">
              <h3 className="font-medium text-gray-800 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map(amenity => (
                  <button
                    key={amenity}
                    onClick={() => {
                      if (selectedAmenities.includes(amenity)) {
                        setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                      } else {
                        setSelectedAmenities([...selectedAmenities, amenity]);
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm ${
                      selectedAmenities.includes(amenity)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSearch}
              className="bg-red-600 hover:bg-red-700"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySearchFilters;