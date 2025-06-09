import { supabase } from '../lib/supabase';

export const ENDPOINTS = {
    // Auth endpoints
    auth: {
        // Get current logged in user
        getUser: async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            return data.user;
        },

        // Login with email and password
        login: async (email: string, password: string) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return data;
        },

        // Sign up new user
        signUp: async (email: string, password: string, userData: any) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: userData }
            });
            if (error) throw error;
            return data;
        },

        // Logout current user
        logout: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        }
    },

    // Profile endpoints
    profiles: {
        // Get user profile
        get: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            return data;
        },

        // Update user profile
        update: async (profileData: any) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    },

    // Property endpoints
    properties: {
        // Get all properties
        getAll: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*');
            if (error) throw error;
            return data;
        },

        // Get single property
        getOne: async (id: string) => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        }
    },

    // Booking endpoints
    bookings: {
        // Get user's bookings
        getMyBookings: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('bookings')
                .select('*, property:properties(*)')
                .eq('user_id', user.id);

            if (error) throw error;
            return data;
        },

        // Create new booking
        create: async (bookingData: any) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('bookings')
                .insert([{ ...bookingData, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        // Update existing booking
        update: async (id: string, bookingData: any) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('bookings')
                .update(bookingData)
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }
}; 