import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
}

export const getUserProfile = async (): Promise<{ profile?: UserProfile; error?: string }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Not authenticated' };
    }

    // Get user profile from auth.users
    const { data: profile, error: profileError } = await supabase
      .from('auth.users')
      .select('id, email, user_metadata')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { error: 'Failed to fetch profile' };
    }

    // Transform the data to match our UserProfile interface
    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      first_name: profile.user_metadata?.first_name,
      last_name: profile.user_metadata?.last_name,
      phone_number: profile.user_metadata?.phone_number,
      avatar_url: profile.user_metadata?.avatar_url,
      created_at: new Date().toISOString() // Default to now if not available
    };

    return { profile: userProfile };
  } catch (err: any) {
    console.error('Unexpected error fetching profile:', err);
    return { error: 'An unexpected error occurred' };
  }
};

export const updateUserProfile = async (
  updates: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at'>>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update user metadata in auth.users
    const { error: updateError } = await supabase.auth.updateUser({
      data: updates
    });

    if (updateError) {
      console.error('Error updating profile:', updateError);
      toast.error('Failed to update profile');
      return { success: false, error: updateError.message };
    }

    toast.success('Profile updated successfully!');
    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error updating profile:', err);
    toast.error('An unexpected error occurred');
    return { success: false, error: err.message };
  }
};

export const getUserBookingHistory = async (): Promise<{ bookings: any[]; error?: string }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { bookings: [], error: 'Not authenticated' };
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        property:properties(
          id,
          name,
          price,
          picture_urls,
          city,
          country
        )
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching booking history:', bookingsError);
      return { bookings: [], error: 'Failed to fetch booking history' };
    }

    return { bookings: bookings || [] };
  } catch (err: any) {
    console.error('Unexpected error fetching booking history:', err);
    return { bookings: [], error: 'An unexpected error occurred' };
  }
}; 