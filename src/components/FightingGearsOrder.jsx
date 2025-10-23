import { useNavigate } from 'react-router-dom';
import React from 'react';

// --- Icon Definitions ---
const Icon = ({ path, className = "w-5 h-5", ...props }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const LocationIcon = (props) => (
  <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM12 13a3 3 0 100-6 3 3 0 000 6z" {...props} />
);
const TruckIcon = (props) => (
  <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414l-1.414 1.414M15 12h2.5L16 11l-2-3-4 5h-1" {...props} />
);
const TagIcon = (props) => (
  <Icon path="M7 7h.01M7 3h.01M3 7h.01M3 3h.01M17 3h.01M21 7h.01M21 3h.01M17 21h.01M21 17h.01M14 21h.01M10 21h.01M3 17h.01M7 21h.01M21 13h.01M3 13h.01M21 10h.01M3 10h.01M7 17h.01M17 7h.01M10 3h.01M14 3h.01" {...props} />
);
const EditIcon = (props) => (
  <Icon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L15.232 5.232z" {...props} />
);
const ArrowLeftIcon = (props) => (
  <Icon path="M10 19l-7-7m0 0l7-7m-7 7h18" {...props} />
);

// --- Product Item Component ---
const ProductItem = ({ image, name, brand, options, price, quantity, subtotal }) => (
  <>
    {/* Voucher/Brand Row (Mobile & Desktop) */}
    <div className="flex items-center justify-between text-sm py-2">
        <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-900">{brand}</span>
            <div className="flex items-center text-red-600 space-x-1">
                <TagIcon className="w-3 h-3 text-red-600" />
                <span className="text-xs">Brand Voucher</span>
                <span className="font-bold">-P29</span>
                <button className="text-white bg-black hover:bg-gray-800 text-xs px-2 py-1 rounded-md ml-2 transition-colors">
                    SELECT VOUCHER
                </button>
            </div>
        </div>
    </div>
    
    {/* Product Details Grid (Desktop Table Layout) */}
    <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center text-sm border-t border-gray-200 pt-3">
        {/* Product Image and Details (Col 1-6 on Mobile, 1-5 on Desktop) */}
        <div className="col-span-6 flex items-center space-x-3">
            <div className="w-14 h-14 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                {/* Image Placeholder */}
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    [Image]
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{options}</p>
            </div>
        </div>
        
        {/* Unit Price (Desktop Only) */}
        <div className="col-span-2 text-center hidden sm:block">
            <p className="text-gray-900">{price}</p>
        </div>
        
        {/* Quantity (Desktop Only) */}
        <div className="col-span-2 text-center hidden sm:block">
            <p className="text-gray-900">{quantity}</p>
        </div>

        {/* Item Subtotal (Col 6 on Mobile, Col 3 on Desktop) */}
        <div className="col-span-6 sm:col-span-2 text-right">
            <p className="sm:hidden text-xs text-gray-500">Subtotal</p>
            <p className="font-semibold text-black">{subtotal}</p>
        </div>
    </div>
  </>
);

// --- Main Component ---
const FightingGearsOrder = () => {
    const navigate = useNavigate();

    // Fictional data
    const product = {
        name: "Hayabusa T3 LX Boxing Gloves",
        brand: "Hayabusa",
        options: "Black, 12oz",
        price: "P2,599.00",
        quantity: "1",
        subtotal: "P2,599.00"
    };

    const deliveryAddress = {
        name: "Allyn Marc C. Dumapias",
        phone: "09552016070",
        address: "Purok 21 Fuentes Zone 9, Maria Cristina, Iligan City, Lanao Del Norte 9200",
    };
    
    const summary = {
        merchandiseSubtotal: "P2,599.00",
        shippingSubtotal: "P150.00",
        voucherDiscount: "P29.00",
        totalPayment: "P2,720.00"
    };

    return (
        // Main page background color is very light gray (bg-gray-50)
        <div className="min-h-screen bg-white-50 flex flex-col">
            
           {/* Header */}
      <header className="bg-black text-white py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/marketplace')}
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
            onClick={() => navigate('/wishlists')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

            

            {/* Main Content Area */}

            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex-grow">    
                {/* Main Card - White background, shadow */}                
                                <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">ECE | Check out</h2>

<div className="w-[50rem] h-[auto] bg-white rounded-lg shadow-lg border border-black-300">
               


                    {/* 1. Delivery Address */}
                    <section className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
                            <button className="text-black hover:text-gray-700 transition-colors">
                                <EditIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-sm">
                            <p className="text-gray-900 font-semibold mb-1">
                                Name: {deliveryAddress.name} | Phone Number: {deliveryAddress.phone}
                            </p>
                            <p className="text-gray-600">
                                Address: {deliveryAddress.address}
                            </p>
                        </div>
                    </section>
                    
                    {/* 2. Products Ordered & Shipping/Payment */}
                    <div className="p-4 sm:p-6">
                        {/* Products Header (Desktop/Tablet Only) */}
                        <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4 text-xs sm:text-sm text-gray-500 font-medium pb-2 border-b border-gray-100">
                            <span className="col-span-6">PRODUCT</span>
                            <span className="col-span-2 text-center">UNIT PRICE</span>
                            <span className="col-span-2 text-center">QTY</span>
                            <span className="col-span-2 text-right">ITEM SUBTOTAL</span>
                        </div>

                        {/* Products Ordered */}
                        <section className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 sm:hidden">Products Ordered</h2>
                            <ProductItem {...product} />
                            
                            <div className="mt-4 pt-2 border-t border-gray-200">
                                <span className="text-sm font-medium text-gray-600">Message for seller:</span>
                                <input
                                    type="text"
                                    placeholder="Optional: Leave a message for the seller"
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
                                />
                            </div>
                        </section>
                        
                        {/* Shipping Block */}
                        <section className="mt-6 pt-4 border-t border-gray-200">
                            {/* Shipping Option Row */}
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center space-x-2">
                                    <TruckIcon className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">Shipping Option:</span>
                                    <span className="text-sm text-black font-semibold">Door to Door Delivery</span>
                                </div>
                                <button className="text-black bg-white border border-black text-xs px-3 py-1.5 rounded font-medium hover:bg-gray-100 transition-colors">
                                    CHANGE
                                </button>
                            </div>
                            
                            {/* Guarantee/Estimated Arrival */}
                            <div className="flex items-center justify-between text-sm text-gray-600 border border-green-200 bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.111a9.96 9.96 0 00-6.108-2.678A9.957 9.957 0 0012 2c-5.405 0-9.845 4.38-9.963 9.774-.117 5.394 4.195 9.873 9.47 10.245C17.75 22.388 22 17.848 22 12a10.015 10.015 0 00-3.382-7.889z" />
                                    </svg>
                                    <span className="font-semibold text-green-700">Guaranteed to get by 23-24 Oct</span>
                                </div>
                                <span className="text-xs text-gray-500 underline cursor-pointer hover:text-gray-900">Self Pick Up</span>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                                <button className="text-black bg-white border border-black text-xs px-3 py-1.5 rounded font-medium hover:bg-gray-100 transition-colors">
                                    CHANGE
                                </button>
                            </div>
                            <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <span className="font-semibold text-sm text-gray-900">CASH ON DELIVERY</span>
                                {/* Placeholder for payment logos */}
                                <div className='flex space-x-2'>
                                    <span className="text-xs text-gray-600">Visa</span>
                                    <span className="text-xs text-gray-600">Mastercard</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 3. Order Summary & Final Action - Light gray background for contrast */}
                    <section className="p-4 sm:p-6 bg-gray-50 rounded-b-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Merchandise Subtotal</span>
                                <span>{summary.merchandiseSubtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping Subtotal</span>
                                <span>{summary.shippingSubtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Voucher Discount</span>
                                <span className="text-green-600 font-medium">- {summary.voucherDiscount}</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-gray-300 pt-4 mt-4">
                            <span className="text-lg font-bold text-gray-900">Total Payment:</span>
                            <span className="text-2xl font-bold text-black-600">{summary.totalPayment}</span>
                        </div>
                        
                        {/* Place Order Button - Responsive size adjustment */}
                        <div className="pt-4 flex justify-end">
                            <button className="w-full sm:w-auto bg-black text-white py-1 px-8 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-800 transition-colors duration-200 shadow-lg">
                                PLACE ORDER
                            </button>
                        </div>
                    </section>

                </div>
            </main>

            {/* Footer - Solid Black Bar */}
            {/* Footer */}
      <footer className="bg-black text-white py-6 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm md:text-base">© 2024 Fighting Gears. All rights reserved.</p>
        </div>
      </footer>
        </div>
    );
};

export default FightingGearsOrder;