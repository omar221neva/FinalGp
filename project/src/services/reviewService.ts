import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export interface Review {
  id: string;
  property_id: number;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
}

// Check if user can review (has completed booking)
export const canReviewProperty = async (propertyId: number, customerId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .eq('customer_id', customerId)
      .eq('status', 'completed')
      .single();

    if (error) {
      console.error('Error checking review eligibility:', error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('Unexpected error checking review eligibility:', err);
    return false;
  }
};

// Create a new review
export const createReview = async (
  propertyId: number,
  rating: number,
  comment: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'You must be logged in to leave a review.' };
    }

    // Check if user can review
    const canReview = await canReviewProperty(propertyId, user.id);
    if (!canReview) {
      return { success: false, error: 'You can only review properties after completing a booking.' };
    }

    // Check if user has already reviewed this property
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('property_id', propertyId)
      .eq('customer_id', user.id)
      .single();

    if (existingReview) {
      return { success: false, error: 'You have already reviewed this property.' };
    }

    // Get user's name from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    // Create the review
    const { error } = await supabase
      .from('reviews')
      .insert([{
        property_id: propertyId,
        customer_id: user.id,
        rating,
        comment,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Review creation error:', error);
      return { success: false, error: 'Failed to create review.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error creating review:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
};

// Get reviews for a property
export const getPropertyReviews = async (propertyId: number): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    // Always return user_name as 'Anonymous'
    return (data || []).map(review => ({
      ...review,
      user_name: 'Anonymous'
    }));
  } catch (err) {
    console.error('Unexpected error fetching reviews:', err);
    return [];
  }
}; 