import { useState } from 'react';
import { createBooking } from '../services/booking';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';
import { CreditCard, Wallet } from 'lucide-react';

interface BookingFormProps {
  property: {
    id: number;
    name: string;
    price: number;
    picture_urls?: string;
    bathrooms_text?: string;
    beds?: number;
    bedrooms?: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

type BookingStep = 'details' | 'confirmation';
type PaymentMethod = 'card' | 'cash' | null;

const BookingForm = ({ property, onSuccess, onCancel }: BookingFormProps) => {
  const [step, setStep] = useState<BookingStep>('details');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights * property.price;
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    if (start >= end) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (start < new Date()) {
      toast.error('Check-in date cannot be in the past');
      return;
    }

    if (adults < 1) {
      toast.error('At least one adult is required');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setStep('confirmation');
  };

  const handleConfirmBooking = async () => {
    if (paymentMethod === 'card' && (!cardHolder || !cardNumber || !expiryDate || !cvv)) {
      toast.error('Please fill in all payment details');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await createBooking({
        property_id: property.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        total_price: calculateTotalPrice()
      });

      if (result.success) {
        toast.success('Booking created successfully!');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'details') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Make a Reservation</h3>
        
        {/* Property Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">{property.name}</h4>
          <div className="mt-2 text-sm text-gray-600">
            <div>{property.bedrooms} bedrooms • {property.beds} beds • {property.bathrooms_text}</div>
            <div className="mt-1">${property.price} per night</div>
          </div>
        </div>

        <form onSubmit={handleDetailsSubmit} className="space-y-6">
          {/* Dates Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                min={checkIn || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Guest Count */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Adults <span className='text-gray-500'>(18+)</span></label>
              <input
                type="number"
                value={adults}
                onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Children <span className='text-gray-500'>(1-12)</span></label>
              <input
                type="number"
                value={children}
                onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* Price Display */}
          <div className="text-lg font-semibold">
            Total Price: ${calculateTotalPrice()}
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Select Payment Method</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border rounded-lg text-center ${
                  paymentMethod === 'card' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="mx-auto mb-2 h-6 w-6" />
                <span className="block font-medium">Credit Card</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 border rounded-lg text-center ${
                  paymentMethod === 'cash' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wallet className="mx-auto mb-2 h-6 w-6" />
                <span className="block font-medium">Pay in Cash</span>
              </button>
            </div>
          </div>

          {/* Credit Card Fields */}
          {paymentMethod === 'card' && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder's Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Name as on card"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cash Payment Notice */}
          {paymentMethod === 'cash' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-800">Pay at Check-in</p>
              <p className="text-sm text-yellow-700 mt-1">
                Please have the exact amount ready in cash upon arrival.
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full"
            >
              Continue to Confirmation
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Confirm Your Booking</h3>
      
      <div className="space-y-6">
        {/* Property Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">{property.name}</h4>
          <div className="mt-2 text-sm text-gray-600">
            <div>{property.bedrooms} bedrooms • {property.beds} beds • {property.bathrooms_text}</div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Booking Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in</span>
              <span className="font-medium">{new Date(checkIn).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out</span>
              <span className="font-medium">{new Date(checkOut).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests</span>
              <span className="font-medium">{adults} {adults === 1 ? 'Adult' : 'Adults'}{children > 0 ? `, ${children} ${children === 1 ? 'Child' : 'Children'}` : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium">{paymentMethod === 'card' ? 'Credit Card' : 'Cash'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-900 font-medium">Total Price</span>
              <span className="text-lg font-semibold">${calculateTotalPrice()}</span>
            </div>
          </div>
        </div>

        {/* Payment Instructions for Cash */}
        {paymentMethod === 'cash' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p className="font-medium">Pay at Check-in</p>
            <p className="text-sm mt-1">
              Please have the exact amount ready in cash upon arrival.
            </p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Cancellation Policy</h4>
          <p className="text-sm text-blue-800">
            Free cancellation up to 24 hours before check-in. 
            Cancellations after that are not permitted.
          </p>
        </div>

        <div className="flex space-x-4">
          <Button
            type="button"
            onClick={() => setStep('details')}
            variant="outline"
            className="w-full"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleConfirmBooking}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm; 