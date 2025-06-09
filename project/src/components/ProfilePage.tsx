import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone_number, country, role')
          .eq('id', user.id)
          .single();
        if (!error) setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-white mr-4">
          {profile.full_name?.charAt(0) || '?'}
        </div>
        <div>
          <div className="text-xl font-semibold">{profile.full_name}</div>
          <div className="text-gray-600">{email}</div>
        </div>
      </div>
      <div className="mb-2"><strong>Country:</strong> {profile.country || '-'}</div>
      <div className="mb-2"><strong>Phone:</strong> {profile.phone_number || '-'}</div>
      <div className="mb-2"><strong>Role:</strong> {profile.role || '-'}</div>
    </div>
  );
};

export default ProfilePage; 