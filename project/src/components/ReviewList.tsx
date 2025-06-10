import React, { useEffect, useState } from 'react';
import { Review, getPropertyReviews } from '../services/reviewService';

interface ReviewListProps {
  propertyId: number;
}

export const ReviewList: React.FC<ReviewListProps> = ({ propertyId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const fetchedReviews = await getPropertyReviews(propertyId);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  if (isLoading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-center py-4 text-gray-500">No reviews yet</div>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{review.user_name}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={`text-xl ${
                    index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}; 