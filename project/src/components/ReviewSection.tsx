import React, { useState } from 'react';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { canReviewProperty } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';

interface ReviewSectionProps {
  propertyId: number;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ propertyId }) => {
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const { user } = useAuth();

  React.useEffect(() => {
    const checkReviewEligibility = async () => {
      if (user) {
        const eligible = await canReviewProperty(propertyId, user.id);
        setCanReview(eligible);
      } else {
        setCanReview(false);
      }
    };

    checkReviewEligibility();
  }, [propertyId, user]);

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Reviews</h2>
        
        {canReview === null ? (
          <div className="text-center py-4">Checking review eligibility...</div>
        ) : canReview ? (
          <ReviewForm propertyId={propertyId} />
        ) : (
          <div className="text-center py-4 text-gray-500">
            {user
              ? 'You can only review properties after completing a booking.'
              : 'Please log in to leave a review.'}
          </div>
        )}
      </div>

      <ReviewList propertyId={propertyId} />
    </div>
  );
}; 