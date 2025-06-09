import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Property } from '../services/PropertyService';

interface PropertyDetailProps {
  property: Property;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property }) => {
  const handleSave = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        return;
      }

      // Check if property is already saved
      const { data: existingSave } = await supabase
        .from('saved_properties')
        .select()
        .eq('user_id', user.id)
        .eq('property_id', property.id)
        .single();

      if (existingSave) {
        alert('Property is already saved!');
        return;
      }

      // Insert into saved_properties table
      const { error: saveError } = await supabase
        .from('saved_properties')
        .insert({
          user_id: user.id,
          property_id: property.id
        });

      if (saveError) {
        console.error('Error saving property:', saveError);
        return;
      }

      // Show success message or update UI
      alert('Property saved successfully!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {/* Add a save button that calls handleSave */}
      <button 
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Save Property
      </button>
    </div>
  );
};

export default PropertyDetail; 