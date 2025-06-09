import React from 'react';
import { Search } from 'lucide-react';
import Button from './ui/Button';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[85vh] min-h-[600px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg" 
          alt="Modern living room" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-gray-900/30"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect Home with <span className="text-blue-400">Smart</span> Recommendations
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Our AI-powered platform finds your ideal rental based on your unique preferences and lifestyle needs
          </p>
          
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Enter city, neighborhood, or address"
                  className="w-full h-12 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <Button size="lg" className="md:w-auto w-full">
                Find Properties
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                San Francisco
              </span>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Berkeley
              </span>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Oakland
              </span>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Palo Alto
              </span>
            </div>
          </div>
          
          <div className="mt-8 flex items-center text-white text-sm">
            <span className="mr-4">Trusted by 10,000+ renters</span>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">A</div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">B</div>
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">C</div>
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">D</div>
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center">+</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;