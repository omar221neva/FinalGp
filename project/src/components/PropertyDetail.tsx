import React, { useState } from 'react';
import { Property } from '../services/PropertyService';
import Button from './ui/Button';
import { Heart, Share2, MapPin, Bed, Bath, Star, Home as HomeIcon } from 'lucide-react';
import BookingForm from './BookingForm';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ReviewSection } from './ReviewSection';

interface PropertyDetailProps {
  property: Property;
  onClose: () => void;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    id,
    name,
    description,
    price,
    city,
    country,
    beds,
    bedrooms,
    bathrooms,
    bathrooms_text,
    property_type,
    amenities,
    review_scores_rating,
    picture_urls
  } = property;

  const [currentImage, setCurrentImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleBookingSuccess = () => {
    toast.success('Booking completed successfully!');
    setShowBookingForm(false);
    onClose();
  };

  const handleBookingCancel = () => {
    console.log('Canceling booking form');
    setShowBookingForm(false);
  };

  const handleBookNowClick = () => {
    console.log('Book Now clicked');
    if (!user) {
      console.log('No user, redirecting to login');
      toast.error('Please log in to make a booking');
      navigate('/login');
      return;
    }
    console.log('Setting showBookingForm to true');
    setShowBookingForm(prev => {
      console.log('Previous showBookingForm state:', prev);
      return true;
    });
  };

  const propertyForBooking = {
    id: Number(id),
    name,
    price,
    picture_urls: picture_urls?.[0],
    bathrooms_text: bathrooms_text || undefined,
    beds,
    bedrooms
  };

  console.log('Rendering PropertyDetail, showBookingForm:', showBookingForm);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {showBookingForm ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Book {name}</h2>
              <button 
                onClick={handleBookingCancel}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <BookingForm
              property={propertyForBooking}
              onSuccess={handleBookingSuccess}
              onCancel={handleBookingCancel}
            />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative">
              <img 
                src={picture_urls[currentImage] || 'https://via.placeholder.com/800x600'} 
                alt={name}
                className="w-full h-96 object-cover"
              />
              
              {picture_urls.length > 1 && (
                <>
                  <button 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                    onClick={() => setCurrentImage((prev) => (prev === 0 ? picture_urls.length - 1 : prev - 1))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                    onClick={() => setCurrentImage((prev) => (prev === picture_urls.length - 1 ? 0 : prev + 1))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin size={16} className="mr-1" />
                    <span>{city}, {country}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    ${price.toLocaleString()} <span className="text-xl font-normal text-gray-600">per night</span>
                  </h1>
                  {review_scores_rating && (
                    <div className="flex items-center text-gray-600">
                      <Star size={16} className="mr-1 fill-yellow-400 text-yellow-400" />
                      <span>{review_scores_rating.toFixed(1)} rating</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsSaved(!isSaved)}
                    className={isSaved ? 'bg-red-50 text-red-600 border-red-200' : ''}
                  >
                    <Heart
                      size={18}
                      className={`mr-2 ${isSaved ? 'fill-red-600 text-red-600' : ''}`}
                    />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Bed size={24} className="text-gray-600 mr-3" />
                  <div>
                    <div className="font-semibold">{beds} {beds === 1 ? 'Bed' : 'Beds'}</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <HomeIcon size={24} className="text-gray-600 mr-3" />
                  <div>
                    <div className="font-semibold">{bedrooms} {bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Bath size={24} className="text-gray-600 mr-3" />
                  <div>
                    <div className="font-semibold">{bathrooms_text || `${bathrooms} Bath${bathrooms !== 1 ? 's' : ''}`}</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <HomeIcon size={24} className="text-gray-600 mr-3" />
                  <div>
                    <div className="font-semibold">{property_type}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">About this property</h2>
                <p className="text-gray-700">{description}</p>
              </div>

              {amenities && amenities.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <ReviewSection propertyId={Number(id)} />
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">
                  ${price.toLocaleString()} <span className="text-base font-normal text-gray-600">per night</span>
                </div>
                <Button onClick={handleBookNowClick}>
                  Book Now
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;