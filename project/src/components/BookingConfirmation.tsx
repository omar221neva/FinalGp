import React from 'react';
import { Property } from '../services/PropertyService';
import { CheckCircle } from 'lucide-react';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';

interface BookingConfirmationProps {
  bookingDetails: {
    propertyTitle: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

const BookingConfirmation = ({ bookingDetails, onConfirm, onCancel }: BookingConfirmationProps) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Confirm Your Booking</h2>
      
      <div className="space-y-6">
        {/* Property Details */}
        <div className="border-b pb-4">
          <h3 className="text-xl font-medium mb-2">{bookingDetails.propertyTitle}</h3>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">Booking Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in</span>
              <span className="font-medium">{new Date(bookingDetails.checkIn).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out</span>
              <span className="font-medium">{new Date(bookingDetails.checkOut).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests</span>
              <span className="font-medium">{bookingDetails.guests}</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="text-gray-900 font-medium">Total Price</span>
              <span className="text-lg font-semibold">${bookingDetails.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Cancellation Policy</h4>
          <p className="text-sm text-blue-800">
            Free cancellation up to 48 hours before check-in. 
            After that, the first night is non-refundable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="w-full"
          >
            Confirm & Proceed to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation; 