import React, { useState } from 'react';
import Button from './ui/Button';
import { CreditCard, Calendar } from 'lucide-react';

interface PaymentDetailsProps {
  totalAmount: number;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

interface ValidationErrors {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  name?: string;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  totalAmount,
  onPaymentComplete,
  onCancel
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validate card number (Luhn algorithm)
  const validateCardNumber = (number: string): boolean => {
    const digits = number.replace(/\D/g, '');
    if (digits.length !== 16) return false;
    
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // Validate expiry date (MM/YY format and not expired)
  const validateExpiryDate = (expiry: string): boolean => {
    const pattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!pattern.test(expiry)) return false;

    const [month, year] = expiry.split('/');
    const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    
    return expDate > today;
  };

  // Validate CVV (3 or 4 digits)
  const validateCVV = (cvv: string): boolean => {
    return /^[0-9]{3,4}$/.test(cvv);
  };

  // Format card number as user types
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // Add spaces every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(value);
  };

  // Format expiry date as user types
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiryDate(value);
  };

  // Handle CVV input
  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCvv(value);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Cardholder name is required';
    }

    if (!validateCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!validateExpiryDate(expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!validateCVV(cvv)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'cash' || validateForm()) {
      onPaymentComplete();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Details</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Total Amount</h2>
          <span className="text-2xl font-bold">${totalAmount}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div className="flex gap-4">
            <button
              type="button"
              className={`flex-1 p-4 rounded-lg border ${
                paymentMethod === 'card' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              <CreditCard className="mb-2" />
              <div className="font-medium">Credit Card</div>
            </button>
            <button
              type="button"
              className={`flex-1 p-4 rounded-lg border ${
                paymentMethod === 'cash' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
              onClick={() => setPaymentMethod('cash')}
            >
              <Calendar className="mb-2" />
              <div className="font-medium">Pay Later</div>
            </button>
          </div>

          {paymentMethod === 'card' && (
            <>
              {/* Card Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : ''}`}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full p-2 border rounded-md ${errors.cardNumber ? 'border-red-500' : ''}`}
                  required
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/YY"
                    className={`w-full p-2 border rounded-md ${errors.expiryDate ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.expiryDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={handleCVVChange}
                    placeholder="123"
                    className={`w-full p-2 border rounded-md ${errors.cvv ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Confirm Booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentDetails; 