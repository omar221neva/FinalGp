import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center">
          <div className="px-5 py-2">
            <Link
              to="/about"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              About Us
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link
              to="/privacy"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Privacy Policy
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link
              to="/terms"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Terms of Service
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link
              to="/contact"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Contact Us
            </Link>
          </div>
        </nav>
        <div className="mt-8 text-center">
          <p className="text-base text-gray-400">
            &copy; {new Date().getFullYear()} Bolt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;