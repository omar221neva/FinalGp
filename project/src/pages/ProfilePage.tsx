import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLocation, useNavigate } from 'react-router-dom';

const MyInfoSection = () => {
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone_number: '', country: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Auth error:', authError);
          setLoading(false);
          return;
        }

        setEmail(user.email || '');

        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number, country, role, created_at')
          .eq('id', user.id)
          .single();

        if (profileError) {
          // If profile doesn't exist, create one
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: '',
              phone_number: '',
              country: '',
              role: 'customer'
            })
            .select()
            .single();

          if (!insertError && newProfile) {
            setProfile(newProfile);
            setForm({
              full_name: '',
              phone_number: '',
              country: ''
            });
          } else {
            console.error('Error creating profile:', insertError);
          }
        } else {
          setProfile(profileData);
          setForm({
            full_name: profileData.full_name || '',
            phone_number: profileData.phone_number || '',
            country: profileData.country || ''
          });
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone_number: form.phone_number,
        country: form.country,
      })
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, ...form });
      setEditing(false);
    } else {
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    // Supabase requires only the new password for update
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    if (error) {
      setPasswordError(error.message || 'Failed to update password.');
    } else {
      setPasswordSuccess('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-10 bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6 text-center">Profile</h2>
      <div className="flex flex-col items-center mb-8 w-full">
        <img
          src="/images/profileicon.png"
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-200 shadow"
        />
        <div className="text-2xl font-semibold mb-1">{profile.full_name}</div>
        <div className="text-gray-500 mb-4">{email}</div>
        <hr className="w-full border-t border-gray-200 my-4" />
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>
          <div className="flex space-x-2 justify-end">
            <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300" onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </form>
      ) : (
        <>
          <div className="w-full mb-6">
            <div className="mb-2 text-lg"><span className="font-bold text-gray-700">Country:</span> {profile.country || '-'}</div>
            <div className="mb-2 text-lg"><span className="font-bold text-gray-700">Phone:</span> {profile.phone_number || '-'}</div>
            <div className="mb-2 text-lg"><span className="font-bold text-gray-700">Role:</span> {profile.role || '-'}</div>
          </div>
          <div className="flex space-x-4 w-full justify-center">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition" onClick={handleEdit}>Edit Profile</button>
            <button className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition" onClick={() => setShowPasswordForm((v) => !v)}>Change Password</button>
          </div>
          {showPasswordForm && (
            <div className="mt-8 w-full max-w-md mx-auto bg-gray-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    name="new"
                    value={passwordForm.new}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm"
                    value={passwordForm.confirm}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
                {passwordSuccess && !showPasswordForm && (
                  <div className="text-green-600 text-sm mb-4">{passwordSuccess}</div>
                )}
                <div className="flex space-x-2 justify-end">
                  <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setShowPasswordForm(false)}>Cancel</button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Password</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SavedPropertiesSection = () => {
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Auth error:', authError);
          setError('Authentication error');
          return;
        }

        // Get user ID from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          setError('Error fetching user data');
          return;
        }

        // Fetch saved properties with joined property data
        const { data, error: savedError } = await supabase
          .from('saved_properties')
          .select(`
            *,
            properties(*)
          `)
          .eq('user_id', userData.id);

        if (savedError) {
          console.error('Error fetching saved properties:', savedError);
          setError('Could not load saved properties');
          return;
        }

        console.log('Saved properties with details:', data);
        setSavedProperties(data || []);
      } catch (error) {
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();
  }, []);

  const handleUnsave = async (propertyId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user ID from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }

      // Delete the saved property record
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', userData.id)
        .eq('property_id', propertyId);

      if (error) {
        console.error('Error removing saved property:', error);
        return;
      }

      // Update local state
      setSavedProperties(prev => prev.filter(item => item.property_id !== propertyId));
    } catch (error) {
      console.error('Error unsaving property:', error);
    }
  };

  if (loading) return <div className="text-center py-4">Loading saved properties...</div>;
  if (error) return <div className="text-red-600 text-center py-4">{error}</div>;
  if (!savedProperties || savedProperties.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Saved Properties</h3>
        <p className="text-gray-600">Start exploring and save properties you like!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Saved Properties ({savedProperties.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedProperties.map((saved) => {
          const property = saved.properties;
          if (!property) return null;
          
          const imageUrl = property.picture_urls ? 
            (Array.isArray(property.picture_urls) ? property.picture_urls[0] : JSON.parse(property.picture_urls)[0]) 
            : '/images/placeholder.png';
          
          return (
            <div key={saved.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="relative h-48">
                <img
                  src={imageUrl}
                  alt={property.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => handleUnsave(property.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
                <p className="text-gray-600 mb-2">{property.city}, {property.country}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>{property.beds} beds</span>
                  <span>•</span>
                  <span>{property.bedrooms} bedrooms</span>
                  <span>•</span>
                  <span>{property.bathrooms} baths</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">${property.price}/night</span>
                  <button 
                    onClick={() => window.location.href = `/properties/${property.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BookingsSection = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError('Authentication error');
        return;
      }

      // Fetch bookings with property details
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          check_in_date,
          check_out_date,
          total_price,
          status,
          created_at,
          properties (
            id,
            name,
            city,
            country,
            picture_urls
          )
        `)
        .eq('customer_id', user.id)
        .order('check_in_date', { ascending: false });

      if (bookingsError) {
        setError('Error fetching bookings');
        console.error('Bookings error:', bookingsError);
        return;
      }

      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string, checkInDate: string) => {
    try {
      // Check if the booking is within 24 hours
      const checkIn = new Date(checkInDate);
      const now = new Date();
      const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilCheckIn < 24) {
        alert('Bookings cannot be cancelled within 24 hours of check-in.');
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
        return;
      }

      // Refresh bookings after cancellation
      fetchBookings();
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred while cancelling the booking.');
    }
  };

  const canCancelBooking = (checkInDate: string, status: string) => {
    // Allow cancellation for both pending and confirmed bookings
    if (status !== 'confirmed' && status !== 'pending') return false;
    const checkIn = new Date(checkInDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilCheckIn >= 24;
  };

  if (loading) return <div className="text-center py-4">Loading your bookings...</div>;
  if (error) return <div className="text-red-600 text-center py-4">{error}</div>;
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
        <p className="text-gray-600">Start exploring properties and make your first booking!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
      <div className="space-y-6">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-32 h-24 flex-shrink-0">
                <img
                  src={booking.properties?.picture_urls ? JSON.parse(booking.properties.picture_urls)[0] : '/images/placeholder.png'}
                  alt={booking.properties?.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-2">{booking.properties?.name}</h3>
                <p className="text-gray-600 mb-2">
                  {booking.properties?.city}, {booking.properties?.country}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Check-in</p>
                    <p className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Check-out</p>
                    <p className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600">Total Price</p>
                <p className="text-xl font-semibold mb-2">${booking.total_price}</p>
                {canCancelBooking(booking.check_in_date, booking.status) && (
                  <button
                    onClick={() => handleCancelBooking(booking.id, booking.check_in_date)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const section = params.get('section') || 'info';

  const handleSectionChange = (newSection: string) => {
    navigate(`/profile?section=${newSection}`);
  };

  let content;
  if (section === 'saved') content = <SavedPropertiesSection />;
  else if (section === 'bookings') content = <BookingsSection />;
  else content = <MyInfoSection />;

  return (
    <div className="w-full min-h-screen pt-24 p-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8 space-x-4 border-b border-gray-200">
          <button
            onClick={() => handleSectionChange('info')}
            className={`px-6 py-3 font-semibold transition-colors duration-200 ${
              section === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            My Info
          </button>
          <button
            onClick={() => handleSectionChange('bookings')}
            className={`px-6 py-3 font-semibold transition-colors duration-200 ${
              section === 'bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => handleSectionChange('saved')}
            className={`px-6 py-3 font-semibold transition-colors duration-200 ${
              section === 'saved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Saved Properties
          </button>
        </div>
        {content}
      </div>
    </div>
  );
};

export default ProfilePage; 