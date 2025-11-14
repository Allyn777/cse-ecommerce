import { useNavigate } from 'react-router-dom';
import React from 'react';

// --- Icon Definitions (No changes) ---
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

// --- Product Item Component (Made more responsive) ---
const ProductItem = ({ image, name, brand, options, price, quantity, subtotal }) => (
  <>
    {/* Voucher/Brand Row */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <span className="text-xs font-semibold text-gray-900">{brand}</span>
            <div className="flex items-center text-red-600 space-x-1">
                <TagIcon className="w-3 h-3 text-red-600" />
                <span className="text-xs">Brand Voucher</span>
                <span className="font-bold">-P29</span>
            </div>
        </div>
        <button className="text-white bg-black hover:bg-gray-800 text-xs px-2 py-1 rounded-md transition-colors self-start sm:self-center">
            SELECT VOUCHER
        </button>
    </div>
    
    {/* Product Details Grid */}
    <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center text-sm border-t border-gray-200 pt-3">
        {/* Product Image and Details */}
        <div className="col-span-8 sm:col-span-6 flex items-center space-x-3">
            <div className="w-14 h-14 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    [Image]
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{options}</p>
                <div className="flex space-x-2 text-xs text-gray-600 mt-1 sm:hidden">
                    <span>{price}</span>
                    <span>x {quantity}</span>
                </div>
            </div>
        </div>
        
        {/* Unit Price (Tablet/Desktop Only) */}
        <div className="col-span-2 text-center hidden sm:block">
            <p className="text-gray-900">{price}</p>
        </div>
        
        {/* Quantity (Tablet/Desktop Only) */}
        <div className="col-span-2 text-center hidden sm:block">
            <p className="text-gray-900">{quantity}</p>
        </div>

        {/* Item Subtotal */}
        <div className="col-span-4 sm:col-span-2 text-right">
            <p className="sm:hidden text-xs text-gray-500 mb-1">Subtotal</p>
            <p className="font-semibold text-black text-sm sm:text-base">{subtotal}</p>
        </div>
    </div>
  </>
);

// --- Main Component (Fixed responsiveness) ---
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header - UNCHANGED */}
            <header className="bg-black text-white py-4 px-4 shadow-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/marketplace')}
                        className="text-white hover:text-gray-300 transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center space-x-2">
                        <h1 className="text-lg font-semibold truncate">Welcome to Fighting Gears</h1>
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-black font-bold text-sm">
                               <img src="/logos/boxing.png" alt="Gloves" className="w-6 h-6" />
                            </span>
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

            {/* Main Content Area - Made more responsive */}
            <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-grow">    
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-6">ECE | Check out</h2>

                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    
                    {/* 1. Delivery Address */}
                    <section className="p-4 sm:p-6 border-b-4 border-dashed border-red-300">
                        <div className="flex items-center space-x-2 text-red-600 mb-3">
                            <LocationIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="text-sm flex-1 min-w-0 pr-4">
                                <p className="text-gray-900 font-semibold mb-1 text-sm sm:text-base">
                                    {deliveryAddress.name} | {deliveryAddress.phone}
                                </p>
                                <p className="text-gray-600 break-words text-xs sm:text-sm">
                                    {deliveryAddress.address}
                                </p>
                            </div>
                            <button className="text-black hover:text-gray-700 transition-colors flex-shrink-0 mt-0.5 sm:mt-0">
                                <span className='hidden sm:inline text-sm font-medium'>CHANGE</span>
                                <EditIcon className="w-5 h-5 sm:hidden" />
                            </button>
                        </div>
                    </section>
                    
                    {/* 2. Products Ordered & Shipping/Payment */}
                    <div className="p-4 sm:p-6">
                        
                        {/* Products Header (Tablet/Desktop Only) */}
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
                            
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <label htmlFor="seller-message" className="text-sm font-medium text-gray-600 block mb-2">
                                    Message for seller:
                                </label>
                                <input
                                    id="seller-message"
                                    type="text"
                                    placeholder="Optional: Leave a message for the seller"
                                    className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
                                />
                            </div>
                        </section>
                        
                        {/* Shipping Block */}
                        <section className="mt-6 pt-6 border-t border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping</h2>
                            {/* Shipping Option Row */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                                <div className="flex items-center space-x-2">
                                    <TruckIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-700 flex-shrink-0">Shipping Option:</span>
                                    <span className="text-sm text-black font-semibold truncate">Door to Door Delivery</span>
                                </div>
                                <button className="text-black bg-white border border-black text-xs px-3 py-2.5 rounded font-medium hover:bg-gray-100 transition-colors w-full sm:w-auto">
                                    CHANGE
                                </button>
                            </div>
                            
                            {/* Guarantee/Estimated Arrival */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600 border border-green-200 bg-green-50 p-3 rounded-lg gap-2">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.111a9.96 9.96 0 00-6.108-2.678A9.957 9.957 0 0012 2c-5.405 0-9.845 4.38-9.963 9.774-.117 5.394 4.195 9.873 9.47 10.245C17.75 22.388 22 17.848 22 12a10.015 10.015 0 00-3.382-7.889z" />
                                    </svg>
                                    <span className="font-semibold text-green-700 text-sm">Guaranteed to get by 23-24 Oct</span>
                                </div>
                                <span className="text-xs text-gray-500 underline cursor-pointer hover:text-gray-900 flex-shrink-0 text-right">
                                    Self Pick Up
                                </span>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                                <button className="text-black bg-white border border-black text-xs px-3 py-2.5 rounded font-medium hover:bg-gray-100 transition-colors">
                                    CHANGE
                                </button>
                            </div>
                            {/* Payment method line */}
                            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <span className="font-semibold text-sm text-gray-900">CASH ON DELIVERY</span>
                                <div className='flex space-x-2'>
                                    <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">Visa</span>
                                    <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">Mastercard</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 3. Order Summary & Final Action */}
                    <section className="p-4 sm:p-6 bg-gray-100 rounded-b-lg border-t border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Merchandise Subtotal</span>
                                <span className="font-medium">{summary.merchandiseSubtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping Subtotal</span>
                                <span className="font-medium">{summary.shippingSubtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Voucher Discount</span>
                                <span className="text-green-600 font-medium">- {summary.voucherDiscount}</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-gray-300 pt-4">
                            <span className="text-lg font-bold text-gray-900">Total Payment:</span>
                            <span className="text-xl sm:text-2xl font-bold text-black">{summary.totalPayment}</span>
                        </div>
                        
                        {/* Place Order Button */}
                        <div className="pt-6 flex justify-end">
                            <button className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-black text-white py-3 px-6 rounded-lg font-bold text-base hover:bg-gray-800 transition-colors duration-200 shadow-lg">
                                PLACE ORDER
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer - UNCHANGED */}
            <footer className="bg-black text-white py-6 sm:py-8 px-4 mt-8">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-xs sm:text-sm md:text-base">© 2024 Fighting Gears. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default FightingGearsOrder;