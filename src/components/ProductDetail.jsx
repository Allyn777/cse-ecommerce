import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductDetail = () => {
  const navigate = useNavigate();

  // State to manage the selected product size
  const [selectedSize, setSelectedSize] = useState('10 OZ');
  
  // Product Data (Hardcoded to match the image content, with colors removed)
  const productData = {
    name: 'VENUM BOXING GLOVES',
    price: '₱2,599.00',
    description: 'Enhance your endurance, strength and sparring skills with this high-energy impact dispersing Thai-style training glove. The internal hand compartment offers a secure, snug fit without sacrificing comfort. Layers of high-density molded foam keep hands protected during heavy sparring and bag workout sessions. Rigid wrap-around hook & loop closure supports wrist.',
    image: '/logos/venum-gloves.png', // Assuming you have a specific detail image
    sizes: ['10 OZ', '12 OZ', '14 OZ', '16 OZ'],
  };

  const { name, price, description, sizes } = productData;

  // The ColorDot component and related state/data have been removed.

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header - Copied from Marketplace for consistency */}
      {/* Header */}
<header className="bg-black text-white py-2 sm:py-3 md:py-4 px-3 sm:px-6 md:px-8 relative">
  <div className="max-w-7xl mx-auto flex items-center justify-between relative">

    {/* Back Button */}
    <button 
      onClick={() => navigate('/marketplace')}
      className="text-white hover:text-gray-300 transition-colors p-2 sm:p-3 rounded-full"
    >
      <svg className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    {/* Centered Title + Logo */}
    <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 space-x-1 sm:space-x-2 md:space-x-3">
      <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold whitespace-nowrap">
        Welcome to Fighting Gears
      </h1>
      <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center">
        <img src="/logos/boxing.png" alt="Gloves" className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-7 lg:h-7" />
      </div>
    </div>

    {/* Forward Button */}
    <button 
      onClick={() => navigate('/marketplace')}
      className="text-white hover:text-gray-300 transition-colors p-2 sm:p-3 rounded-full"
    >
      <svg className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>

  </div>
</header>


      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        {/* Mobile/Tablet Back Button & Title */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-700 hover:text-black transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7m4 14l7-7-7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-black">View Item</h2>
          <div className="w-6 h-6"></div> {/* Placeholder for alignment */}
        </div>

        {/* Desktop Title (Visible on larger screens) */}
        <h2 className="hidden md:block text-2xl sm:text-3xl font-bold text-black mb-8">View Item</h2>

        {/* Product Detail Container: Responsive Two-Column Layout */}
        <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12 border border-gray-200 p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
          
          {/* Left Column: Image Gallery */}
          <div className="mb-6 md:mb-0 relative border border-gray-200 rounded-lg p-4 sm:p-6 flex items-center justify-center">
            {/* Image Placeholder (replace with actual carousel/image) */}
            <img 
              src={productData.image || '/logos/venum-gloves.png'} 
              alt={name} 
              className="max-w-full h-auto object-contain max-h-[400px]"
            />
            {/* Image Navigation Arrows (Placeholder) */}
            <button className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-colors">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-colors">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* The Color Selector Div has been removed from here. */}
          </div>

          {/* Right Column: Product Details & Actions */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">{name}</h1>
            <p className="text-xl sm:text-2xl font-bold text-black border-b border-gray-200 pb-4 mb-4">{price}</p>

            {/* Size Selection */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 sm:px-4 py-1 border rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-700 hover:border-black hover:text-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-gray-200 pb-4 mb-4 flex-grow">
              <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
            </div>

            {/* Add to Cart Button (Mobile/Tablet fixed placement) */}
            <div className="fixed inset-x-0 bottom-0 md:static bg-white md:bg-transparent p-4 md:p-0 shadow-lg md:shadow-none border-t md:border-t-0 border-gray-200 z-10">
              <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-base font-semibold uppercase">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Copied from Marketplace for consistency */}
      <footer className="bg-black text-white py-6 sm:py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm md:text-base">© 2024 Fighting Gears. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;