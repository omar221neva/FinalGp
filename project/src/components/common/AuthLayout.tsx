import React from 'react';
import Header from '../Header';
import Footer from './Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex mt-16">
        <div className="w-3/5 h-[calc(100vh-4rem)] bg-cover bg-center" style={{ backgroundImage: 'url("/images/miamii.jpg")' }}></div>
        <div className="w-2/5 flex items-center pl-8 pr-4 bg-white">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;