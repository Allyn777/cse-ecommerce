import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel slides data
  const slides = [
    {
      id: 1,
      title: "VENUM GLOVES",
      subtitle: "Best Deal Online on Combat Equipment",
      offer: "UP to 80% OFF",
      image: "/logos/venum-gloves.png",
      brand: "Venum"
    },
    {
      id: 2,
      title: "EVERLAST PUNCHING MITS",
      subtitle: "Best Deal Online on Combat Equipment",
      offer: "UP to 70% OFF",
      image: "/logos/everlastmits0.png",
      brand: "Everlast"
    },
    {
      id: 3,
      title: "TWINS SHIN GUARD",
      subtitle: "Best Deal Online on Combat Equipment",
      offer: "UP to 75% OFF",
      image: "/logos/twinshpd.png",
      brand: "Twins Special"
    },
    {
      id: 4,
      title: "HAYABUSA MOUTH GUARD",
      subtitle: "Best Deal Online on Combat Equipment",
      offer: "UP to 65% OFF",
      image: "/logos/hayabusam.png",
      brand: "Hayabusa"
    },
    {
      id: 5,
      title: "WESING PUNCHING BAG",
      subtitle: "Best Deal Online on Combat Equipment",
      offer: "UP to 60% OFF",
      image: "/logos/wesingbag0.png",
      brand: "Wesing"
    }
  ];

  // Brand logos data
  const brands = [
    { id: 1, name: "Venum", image: "/logos/venum.jpeg" },
    { id: 2, name: "Everlast", image: "/logos/everlast.jpeg" },
    { id: 3, name: "Twins Special", image: "/logos/twins.jpeg" },
    { id: 4, name: "Hayabusa", image: "/logos/hayabusa.jpeg" },
    { id: 5, name: "Wesing", image: "/logos/wesing.jpeg" },
  ];

  // Service features data
  const services = [
    {
      icon: "📦",
      title: "FASTED DELIVERY",
      description: "Delivery in 24/H"
    },
    {
      icon: "🏆",
      title: "24 HOURS RETURN",
      description: "100% money-back guarantee"
    },
    {
      icon: "💳",
      title: "SECURE PAYMENT",
      description: "Your money is safe"
    },
    {
      icon: "🎧",
      title: "SUPPORT 24/7",
      description: "Live contact/message"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/login')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold">Welcome to Fighting Gears</h1>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm"><img src="/logos/boxing.png" alt="Gloves" className="w-6 h-6" /></span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/marketplace')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Banner Carousel */}
      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="hero-banner bg-black rounded-2xl p-6 md:p-8 lg:p-12 relative overflow-hidden">
            {/* Curved Design Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16 opacity-10 curved-element"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full transform translate-x-12 translate-y-12 opacity-10 curved-element"></div>
            <div className="absolute top-1/2 right-0 w-40 h-40 bg-white rounded-full transform translate-x-20 -translate-y-20 opacity-5 curved-element"></div>
            
            {/* Navigation Arrows */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-black hover:bg-gray-200 rounded-full p-2 transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-black hover:bg-gray-200 rounded-full p-2 transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="flex flex-col lg:flex-row items-center justify-between">
              {/* Left Content */}
              <div className="flex-1 mb-8 lg:mb-0 lg:pr-8">
                <p className="text-gray-400 text-sm md:text-base mb-2">{slides[currentSlide].subtitle}</p>
                <h2 className="hero-title text-3xl md:text-5xl lg:text-6xl font-bold mb-4">{slides[currentSlide].title}</h2>
                <p className="text-lg md:text-xl mb-6">{slides[currentSlide].offer}</p>
                
                <button 
                  onClick={() => navigate('/marketplace')}
                  className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors mb-6"
                >
                  Shop Now
                </button>
                
                {/* Pagination Dots */}
                <div className="flex space-x-2">
                  {slides.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full pagination-dot cursor-pointer ${
                        index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-gray-500'
                      }`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Right Content - Product Image */}
              <div className="flex-1 flex justify-center lg:justify-end">
                <div className="relative">
                  <img
                    src={slides[currentSlide].image}
                    alt={`${slides[currentSlide].brand} Equipment`}
                    className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain carousel-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="service-grid grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {services.map((service, index) => (
              <div key={index} className="text-center p-4 md:p-6 relative">
                <div className="text-3xl md:text-4xl mb-3">{service.icon}</div>
                <h3 className="font-bold text-sm md:text-base mb-2 text-black">{service.title}</h3>
                <p className="text-xs md:text-sm text-gray-600">{service.description}</p>
                
                {/* Vertical divider */}
                {index < services.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-16 bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop By Brands */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-8">SHOP BY BRANDS</h2>
          
          <div className="brand-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 md:p-6 cursor-pointer hover-lift"
                onClick={() => navigate('/marketplace')}
              >
                <div className="aspect-square flex items-center justify-center mb-3">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-center text-sm md:text-base font-semibold text-black">{brand.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm md:text-base">© 2024 Fighting Gears. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;