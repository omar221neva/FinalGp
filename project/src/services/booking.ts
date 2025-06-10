import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';

export interface Property {
  id: number;
  name: string;
  description: string;
  price: number;
  longitude: number;
  latitude: number;
  beds: number;
  bedrooms: number;
  bathrooms_text: string;
  bathrooms: number;
  property_type: string;
  amenities: string;
  review_scores_rating: number;
  city: string;
  country: string;
  continent: string;
  picture_urls: string[];
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  property_id: number;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  property?: Property;
}

export interface CreateBookingDTO {
  property_id: number;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
}

/* create new booking */


export const createBooking = async (bookingData: CreateBookingDTO): Promise<{ success: boolean; error?: string; booking?: Booking }> => {
  try {
    // get user it
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to make a booking.');
      return { success: false, error: 'You must be logged in to make a booking.' };
    }

    // check if its avaliable by going to supa
    const isAvailable = await checkPropertyAvailability(
      bookingData.property_id,
      bookingData.check_in_date,
      bookingData.check_out_date
    );

    if (!isAvailable) {
      toast.error('Property is not available for the selected dates.');
      return { success: false, error: 'Property is not available for the selected dates.' };
    }

    // adds to table booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        ...bookingData,
        customer_id: user.id,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select('*, property:properties(*)')
      .single();

    if (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
      return { success: false, error: error.message };
    }

    toast.success('Booking created successfully!');
    return { success: true, booking };
  } catch (err: any) {
    console.error('Unexpected error during booking:', err);
    toast.error('An unexpected error occurred. Please try again.');
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
};

/**
 * Get all bookings for the current user
 */
export const getUserBookings = async (): Promise<{ bookings: Booking[]; error?: string }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to view bookings.');
      return { bookings: [], error: 'You must be logged in to view bookings.' };
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*, property:properties(*)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get bookings error:', error);
      toast.error('Failed to fetch bookings. Please try again.');
      return { bookings: [], error: error.message };
    }

    return { bookings: data || [] };
  } catch (err: any) {
    console.error('Unexpected error getting bookings:', err);
    toast.error('An unexpected error occurred while fetching bookings.');
    return { bookings: [], error: err.message || 'An unexpected error occurred' };
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to cancel a booking.');
      return { success: false, error: 'You must be logged in to cancel a booking.' };
    }

    // Verify the booking belongs to the user
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('customer_id, status, check_in_date')
      .eq('id', bookingId)
      .single();  

    if (fetchError || !booking) {
      toast.error('Booking not found.');
      return { success: false, error: 'Booking not found.' };
    }

    if (booking.customer_id !== user.id) {
      toast.error('You do not have permission to cancel this booking.');
      return { success: false, error: 'You do not have permission to cancel this booking.' };
    }

    if (booking.status === 'cancelled') {
      toast.error('This booking is already cancelled.');
      return { success: false, error: 'This booking is already cancelled.' };
    }

    // Check if the check-in date is within 24 hours
    const checkInDate = new Date(booking.check_in_date);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilCheckIn < 24) {
      toast.error('Bookings cannot be cancelled within 24 hours of check-in.');
      return { success: false, error: 'Bookings cannot be cancelled within 24 hours of check-in.' };
    }

    // Cancel the booking
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to cancel booking. Please try again.');
      return { success: false, error: error.message };
    }

    toast.success('Booking cancelled successfully!');
    return { success: true };
  } catch (err: any) {
    console.error('Error cancelling booking:', err);
    toast.error('An unexpected error occurred while cancelling the booking.');
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
};

/**
 * Check if a property is available for the given dates
 */
const checkPropertyAvailability = async (
  propertyId: number,
  checkInDate: string,
  checkOutDate: string
): Promise<boolean> => {
  try {
    // Check for any overlapping confirmed bookings
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .eq('status', 'confirmed')
      .or(
        `and(check_in_date.lte.${checkOutDate},check_out_date.gte.${checkInDate})`
      );

    if (error) {
      console.error('Error checking availability:', error);
      return false; // Default to unavailable if there's an error checking
    }

    // For debugging
    console.log('Availability check:', {
      propertyId,
      checkInDate,
      checkOutDate,
      existingBookings: data
    });

    // If no overlapping bookings found, the property is available
    return data.length === 0;
  } catch (err) {
    console.error('Unexpected error checking availability:', err);
    return false; // Default to unavailable if there's an unexpected error
  }
};