import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    city: '',
    country: '',
    property_type: '',
    beds: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [] as string[],
    picture_urls: [] as string[]
  });

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      toast.error('Please login to create a listing');
      navigate('/login');
    }
  }, [user, navigate]);

  const amenityOptions = [
    'WiFi',
    'Kitchen',
    'Washer',
    'Dryer',
    'Air Conditioning',
    'Heating',
    'Pool',
    'Hot Tub',
    'Free Parking',
    'Gym',
    'TV',
    'Iron',
    'Workspace'
  ];

  const propertyTypes = [
    'Apartment',
    'House',
    'Villa',
    'Condo',
    'Townhouse',
    'Cabin',
    'Beach House',
    'Farm Stay'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow positive numbers
    if (Number(value) >= 0) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAmenitiesChange = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Simple function to upload a single image
  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Check file size and type
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size too large (max 5MB)');
      }

      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      // First check if we can access the bucket
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('images');

      if (bucketError) {
        console.error('Bucket access error:', bucketError);
        throw new Error('Unable to access storage bucket');
      }

      // Try to upload
      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(`listings/${fileName}`, file, {
          cacheControl: '3600',
          contentType: file.type // Explicitly set content type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      if (!data?.path) {
        throw new Error('No upload path returned');
      }

      // Get URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(`listings/${fileName}`);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error details:', error);
      throw error;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setLoading(true);
    setError('');

    try {
      // Upload one at a time instead of parallel
      const urls: string[] = [];
      for (const file of Array.from(e.target.files)) {
        try {
          const url = await uploadImage(file);
          urls.push(url);
          toast.success(`Uploaded ${file.name}`);
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
          console.error(`Error uploading ${file.name}:`, error);
        }
      }

      if (urls.length > 0) {
        setFormData(prev => ({
          ...prev,
          picture_urls: [...prev.picture_urls, ...urls]
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload images';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        throw new Error('Please login to create a listing');
      }

      // Get user ID from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', session.user.id)
        .single();

      if (userError) throw new Error('Failed to get user data');

      // Create the property listing
      const { error: insertError } = await supabase
        .from('properties')
        .insert({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          city: formData.city,
          country: formData.country,
          property_type: formData.property_type,
          beds: Number(formData.beds),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          amenities: formData.amenities,
          picture_urls: formData.picture_urls,
          host_id: userData.id
        });

      if (insertError) throw new Error('Failed to create listing');

      toast.success('Listing created successfully!');
      navigate('/my-listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create listing';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white py-10 px-8 shadow-xl rounded-2xl sm:px-12 border border-gray-200">
          <h2 className="mb-10 text-3xl font-extrabold text-blue-700 text-center tracking-tight">Create New Property Listing</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2"><span>🏠</span> Basic Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Property Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price per Night ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleNumberInput}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2"><span>📍</span> Location</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2"><span>🛏️</span> Property Details</h3>
              
              <div>
                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">Property Type</label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a property type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="beds" className="block text-sm font-medium text-gray-700">Beds</label>
                  <input
                    type="number"
                    id="beds"
                    name="beds"
                    value={formData.beds}
                    onChange={handleNumberInput}
                    required
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleNumberInput}
                    required
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleNumberInput}
                    required
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2"><span>✨</span> Amenities</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {amenityOptions.map(amenity => (
                  <label key={amenity} className="flex items-center cursor-pointer bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 hover:border-blue-400 transition">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenitiesChange(amenity)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <span className="block text-sm text-gray-900">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2"><span>🖼️</span> Property Images</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                <div className="mt-1 border-2 border-dashed border-blue-300 rounded-lg p-4 bg-white flex flex-col items-center justify-center text-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Drag and drop or click to upload. Accepted formats: JPG, PNG, GIF, WebP. Max size: 5MB per image.
                  </p>
                </div>
              </div>
              {formData.picture_urls.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mt-4">
                  {formData.picture_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Property ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          picture_urls: prev.picture_urls.filter((_, i) => i !== index)
                        }))}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating Listing...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage; 