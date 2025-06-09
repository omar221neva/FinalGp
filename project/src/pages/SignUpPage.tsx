import React from 'react';
import SignUpForm from '../components/SignUpForm';
import AuthLayout from '../components/common/AuthLayout';

const SignUpPage: React.FC = () => {
  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Join Bolt</h1>
        <p className="text-sm text-gray-600 mb-8">
          Find your perfect property match
        </p>
        <SignUpForm />
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;