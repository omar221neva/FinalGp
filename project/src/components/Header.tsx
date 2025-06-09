import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Heart, Menu, X } from 'lucide-react';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  variant?: 'default' | 'auth';
}

const Header: React.FC<HeaderProps> = ({ variant = 'default' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md py-2"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/images/finallogo.jpg"
              alt="Rentify Logo"
              className="h-14 w-auto"
            />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              onClick={() => navigate('/')} 
              className="font-medium text-gray-900 hover:text-blue-500 transition-colors cursor-pointer"
            >
              Home
            </a>
            <a 
              onClick={() => navigate('/search')} 
              className="font-medium text-gray-900 hover:text-blue-500 transition-colors cursor-pointer"
            >
              Search
            </a>
            <a 
              onClick={() => navigate('/recommended')} 
              className="font-medium text-gray-900 hover:text-blue-500 transition-colors cursor-pointer"
            >
              Recommended
            </a>
            {user && (
              <a 
                onClick={() => navigate('/create-listing')} 
                className="font-medium text-gray-900 hover:text-blue-500 transition-colors cursor-pointer"
              >
                Create Listing
              </a>
            )}
          </nav>
          
          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-900">
              <Heart size={20} />
            </button>
            {user ? (
              <div className="relative flex items-center space-x-2" ref={profileDropdownRef}>
                <span className="font-medium text-gray-900">Welcome, {user.email}</span>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded focus:outline-none flex items-center"
                  onClick={() => setIsProfileDropdownOpen((open) => !open)}
                >
                  Profile
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded shadow-lg z-50">
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { navigate('/profile?section=info'); setIsProfileDropdownOpen(false); }}>My Info</button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { navigate('/profile?section=saved'); setIsProfileDropdownOpen(false); }}>Saved Properties</button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { navigate('/profile?section=bookings'); setIsProfileDropdownOpen(false); }}>Bookings</button>
                  </div>
                )}
                <Button className="bg-red-600 hover:bg-red-700 text-white ml-2" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => navigate('/signup')}>Sign Up</Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => navigate('/login')}>Log In</Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={24} className={isScrolled ? 'text-gray-900' : 'text-white'} />
            ) : (
              <Menu size={24} className={isScrolled ? 'text-gray-900' : 'text-white'} />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-4 transition-all">
            <nav className="flex flex-col space-y-4">
              <a 
                onClick={() => navigate('/')} 
                className="font-medium text-gray-700 hover:text-blue-500 transition-colors cursor-pointer"
              >
                Home
              </a>
              <a 
                onClick={() => navigate('/search')} 
                className="font-medium text-gray-700 hover:text-blue-500 transition-colors cursor-pointer"
              >
                Search
              </a>
              <a 
                onClick={() => navigate('/recommended')} 
                className="font-medium text-gray-700 hover:text-blue-500 transition-colors cursor-pointer"
              >
                Recommended
              </a>
              {user && (
                <a 
                  onClick={() => navigate('/create-listing')} 
                  className="font-medium text-gray-700 hover:text-blue-500 transition-colors cursor-pointer"
                >
                  Create Listing
                </a>
              )}
              <div className="pt-2 flex items-center justify-between">
                <button className="flex items-center text-gray-700 hover:text-blue-500">
                  <Heart size={20} className="mr-2" />
                  <span>Favorites</span>
                </button>
                <button className="flex items-center text-gray-700 hover:text-blue-500">
                  <User size={20} className="mr-2" />
                  <span>Account</span>
                </button>
              </div>
              {user ? (
                <div className="relative flex items-center space-x-2" ref={profileDropdownRef}>
                  <span className="font-medium text-gray-900">Welcome, {user.email}</span>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded focus:outline-none flex items-center"
                    onClick={() => setIsProfileDropdownOpen((open) => !open)}
                  >
                    Profile
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded shadow-lg z-50">
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { navigate('/profile?section=info'); setIsProfileDropdownOpen(false); }}>My Info</button>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { navigate('/profile?section=saved'); setIsProfileDropdownOpen(false); }}>Saved Properties</button>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { navigate('/profile?section=bookings'); setIsProfileDropdownOpen(false); }}>Bookings</button>
                    </div>
                  )}
                  <Button className="bg-red-600 hover:bg-red-700 ml-2" onClick={logout}>Logout</Button>
                </div>
              ) : (
                <>
                  <Button className="w-full mt-2 bg-red-600 hover:bg-red-700" onClick={() => navigate('/login')}>Login</Button>
                  <Button className="w-full mt-2 bg-red-600 hover:bg-red-700" onClick={() => navigate('/signup')}>Sign Up</Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;