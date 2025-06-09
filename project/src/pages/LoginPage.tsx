import React from 'react';
import LoginForm from '../components/LoginForm';
import AuthLayout from '../components/common/AuthLayout';

const LoginPage: React.FC = () => {
  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-600 mb-8">
          Sign in to your account to continue
        </p>
        <LoginForm />
      </div>
    </AuthLayout>
  );
};

export default LoginPage;