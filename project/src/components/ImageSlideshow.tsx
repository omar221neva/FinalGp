import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface ImageSlideProps {
  images: string[];
  interval?: number;
}

const ImageSlideshow: React.FC<ImageSlideProps> = ({ images, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [isTransitioning, setIsTransitioning] = useState(false);

  const preloadImage = useCallback((index: number) => {
    if (!loadedImages.has(index)) {
      const img = new Image();
      img.src = images[index];
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, index]));
      };
    }
  }, [images, loadedImages]);

  useEffect(() => {
    // Preload next and previous images
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    preloadImage(nextIndex);
    preloadImage(prevIndex);

    const timer = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, images.length, interval, preloadImage]);

  const goToSlide = useCallback((index: number) => {
    if (index !== currentIndex && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 1000); // Match transition duration
      preloadImage(index);
    }
  }, [currentIndex, isTransitioning, preloadImage]);

  const goToPrevious = useCallback(() => {
    if (!isTransitioning) {
      const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      goToSlide(newIndex);
    }
  }, [currentIndex, images.length, isTransitioning, goToSlide]);

  const goToNext = useCallback(() => {
    if (!isTransitioning) {
      const newIndex = (currentIndex + 1) % images.length;
      goToSlide(newIndex);
    }
  }, [currentIndex, images.length, isTransitioning, goToSlide]);

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-gray-900">
      {/* Slides */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            {loadedImages.has(index) && (
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40" />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-red-600' : 'bg-white bg-opacity-50 hover:bg-opacity-75'}`}
          />
        ))}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
        <div className="max-w-4xl">
          <h1 className="text-5xl font-bold mb-6">Find Your Dream Home</h1>
          <p className="text-xl mb-8">Discover the perfect property that matches your lifestyle</p>
          <button className="bg-red-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-red-700 transition-colors">
            Start Your Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSlideshow;