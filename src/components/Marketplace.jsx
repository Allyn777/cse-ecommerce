import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Marketplace = () => {
  const navigate = useNavigate();

  // Categories data
  const categories = [
    {
      id: 1,
      name: "Gloves",
      icon: "🥊",
      image: "/logos/venum-gloves.png"
    },
    {
      id: 2,
      name: "Punch Mits",
      icon: "👊",
      image: "/logos/everlastmits0.png"
    },
    {
      id: 3,
      name: "Mouth Guard",
      icon: "🦷",
      image: "/logos/hayabusam.png"
    },
    {
      id: 4,
      name: "Shin Guard",
      icon: "🦵",
      image: "/logos/twinshpd.png"
    },
    {
      id: 5,
      name: "Punching Bag",
      icon: "🎯",
      image: "/logos/wesingbag0.png"
    }
  ];

  // Gloves products data
  const glovesProducts = [
    { id: 1, name: "Venum Gloves", image: "/logos/venum-gloves.png", price: "$89.99" },
    { id: 2, name: "Everlast Gloves", image: "/logos/everlast.jpeg", price: "$79.99" },
    { id: 3, name: "Twins Gloves", image: "/logos/twins.jpeg", price: "$95.99" },
    { id: 4, name: "Hayabusa Gloves", image: "/logos/hayabusa.jpeg", price: "$119.99" },
    { id: 5, name: "Wesing Gloves", image: "/logos/wesing.jpeg", price: "$69.99" },
    { id: 6, name: "Venum Pro Gloves", image: "/logos/venum-gloves.png", price: "$149.99" },
    { id: 7, name: "Everlast Elite", image: "/logos/everlast.jpeg", price: "$129.99" }
  ];

  // Punch Mits products data
  const punchMitsProducts = [
    { id: 1, name: "Venum Punch Mits", image: "/logos/everlastmits0.png", price: "$45.99" },
    { id: 2, name: "Everlast Punch Mits", image: "/logos/everlastmits0.png", price: "$39.99" },
    { id: 3, name: "Twins Punch Mits", image: "/logos/everlastmits0.png", price: "$52.99" },
    { id: 4, name: "Hayabusa Punch Mits", image: "/logos/everlastmits0.png", price: "$65.99" },
    { id: 5, name: "Wesing Punch Mits", image: "/logos/everlastmits0.png", price: "$35.99" },
    { id: 6, name: "Venum Pro Punch Mits", image: "/logos/everlastmits0.png", price: "$79.99" },
    { id: 7, name: "Everlast Elite Punch Mits", image: "/logos/everlastmits0.png", price: "$69.99" }
  ];

  // Mouthguard products data
  const mouthguardProducts = [
    { id: 1, name: "Venum Mouthguard", image: "/logos/hayabusam.png", price: "$24.99" },
    { id: 2, name: "Everlast Mouthguard", image: "/logos/hayabusam.png", price: "$19.99" },
    { id: 3, name: "Twins Mouthguard", image: "/logos/hayabusam.png", price: "$29.99" },
    { id: 4, name: "Hayabusa Mouthguard", image: "/logos/hayabusam.png", price: "$34.99" },
    { id: 5, name: "Wesing Mouthguard", image: "/logos/hayabusam.png", price: "$16.99" },
    { id: 6, name: "Venum Pro Mouthguard", image: "/logos/hayabusam.png", price: "$44.99" },
    { id: 7, name: "Everlast Elite Mouthguard", image: "/logos/hayabusam.png", price: "$39.99" }
  ];

  // Shin Guard products data
  const shinGuardProducts = [
    { id: 1, name: "Venum Shin Guard", image: "/logos/twinshpd.png", price: "$89.99" },
    { id: 2, name: "Everlast Shin Guard", image: "/logos/twinshpd.png", price: "$79.99" },
    { id: 3, name: "Twins Shin Guard", image: "/logos/twinshpd.png", price: "$95.99" },
    { id: 4, name: "Hayabusa Shin Guard", image: "/logos/twinshpd.png", price: "$109.99" },
    { id: 5, name: "Wesing Shin Guard", image: "/logos/twinshpd.png", price: "$69.99" },
    { id: 6, name: "Venum Pro Shin Guard", image: "/logos/twinshpd.png", price: "$129.99" },
    { id: 7, name: "Everlast Elite Shin Guard", image: "/logos/twinshpd.png", price: "$119.99" }
  ];

  // Punching Bag products data
  const punchingBagProducts = [
    { id: 1, name: "Venum Punching Bag", image: "/logos/wesingbag0.png", price: "$149.99" },
    { id: 2, name: "Everlast Punching Bag", image: "/logos/wesingbag0.png", price: "$129.99" },
    { id: 3, name: "Twins Punching Bag", image: "/logos/wesingbag0.png", price: "$169.99" },
    { id: 4, name: "Hayabusa Punching Bag", image: "/logos/wesingbag0.png", price: "$189.99" },
    { id: 5, name: "Wesing Punching Bag", image: "/logos/wesingbag0.png", price: "$119.99" },
    { id: 6, name: "Venum Pro Punching Bag", image: "/logos/wesingbag0.png", price: "$229.99" },
    { id: 7, name: "Everlast Elite Punching Bag", image: "/logos/wesingbag0.png", price: "$199.99" }
  ];

  // Product Card Component for consistent layout
  const ProductCard = ({ product }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="aspect-square flex items-center justify-center mb-3 flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <div className="flex-grow flex flex-col">
        <h3 className="text-xs sm:text-sm font-semibold text-black mb-2 line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 flex-shrink-0">{product.price}</p>
        <button className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm mt-auto">
          Buy now
        </button>
      </div>
    </div>
  );

  return (
     <div className="min-h-screen bg-white">
  {/* Header */}
  <header className="bg-black text-white py-4 px-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      {/* Back Arrow */}
      <button 
        onClick={() => navigate('/home')}
        className="text-white hover:text-gray-300 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Centered Title + Logo */}
      <div className="flex items-center justify-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-base sm:text-lg font-semibold">Welcome to Fighting Gears</h1>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-black font-bold text-xs sm:text-sm">
            <img src="/logos/boxing.png" alt="Gloves" className="w-4 h-4 sm:w-6 sm:h-6" />
          </span>
        </div>
      </div>
    </div>
  </header>


      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 py-3 sm:py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-gray-700 font-medium text-sm sm:text-base">Sign up</span>
            </div>
            <span className="text-gray-700 font-medium text-sm sm:text-base">Sales & Offers</span>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-normal">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full sm:w-64 md:w-80 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
             <button 
      className="relative p-2 text-gray-600 hover:text-black transition-colors"
      onClick={() => navigate('/wishlists')}
    >
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
      </svg>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center">+</div>
    </button>
          </div>
        </div>
      </nav>

      {/* Browse By Category */}
      <section className="py-8 sm:py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 sm:mb-8">Browse By Category</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer hover-lift"
                onClick={() => navigate('/ProductDetail')}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-black">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gloves Section */}
      <section className="py-6 sm:py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">Gloves</h2>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button className="bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm">
                View all
              </button>
              <button className="text-gray-600 hover:text-black transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
            {glovesProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Punch Mits Section */}
      <section className="py-6 sm:py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">Punch Mits</h2>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button className="bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm">
                View all
              </button>
              <button className="text-gray-600 hover:text-black transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
            {punchMitsProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Mouthguard Section */}
      <section className="py-6 sm:py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">Mouthguard</h2>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button className="bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm">
                View all
              </button>
              <button className="text-gray-600 hover:text-black transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
            {mouthguardProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Shin Guard Section */}
      <section className="py-6 sm:py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">Shin Guard</h2>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button className="bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm">
                View all
              </button>
              <button className="text-gray-600 hover:text-black transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
            {shinGuardProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Punching Bag Section */}
      <section className="py-6 sm:py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">Punching Bag</h2>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button className="bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm">
                View all
              </button>
              <button className="text-gray-600 hover:text-black transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
            {punchingBagProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-6 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm md:text-base">© 2024 Fighting Gears. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Marketplace;