import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
    
  // Added quantity and image placeholder for a realistic wishlist
  const wishlistItems = [
    { id: 1, name: "Venum Boxing Gloves", description: "10oz Gold/Black", price: 2599.00, quantity: 1, inStock: true, image: "/logos/venum-gloves.png" },
    { id: 2, name: "Hayabusa Mouth Guard", description: "Red/White", price: 699.00, quantity: 1, inStock: false, image: "/logos/hayabusam.png" },
    { id: 3, name: "Twins Shin Guard", description: "Blue", price: 1999.00, quantity: 1, inStock: true, image: "/logos/twinshpd.png" },
    { id: 4, name: "Everlast Punch Mits", description: "Black", price: 999.00, quantity: 1, inStock: true, image: "/logos/everlastmits0.png" },
  ];

  const toggleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      // Only select items that are currently in stock
      setSelectedItems(wishlistItems.filter(item => item.inStock).map(item => item.id));
    }
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const deleteSelected = () => {
    // Logic to delete items from the state/API goes here
    console.log('Deleting:', selectedItems);
    setSelectedItems([]); // Clear selection after deletion attempt
  };

  const totalSelectedInStock = selectedItems.filter(id => 
    wishlistItem => wishlistItems.find(item => item.id === id).inStock
  ).length;

  return (
    <div className="min-h-screen bg-white">
  {/* Header */}
  <header className="bg-black text-white py-4 px-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      {/* Back Arrow */}
      <button 
        onClick={() => navigate('/marketplace')}
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



      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">Wishlist</h2>
        </div>
        
        {/* Web/Tablet Table View (lg:block) */}
        <div className="hidden lg:block bg-white border border-gray-300 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="border-b border-gray-300">
                <tr className="text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  <th className="py-4 px-6 w-10">
                    <input
                      
                      checked={selectedItems.length === wishlistItems.filter(i => i.inStock).length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-black rounded"
                    />
                  </th>
                  <th className="py-4 px-6 w-1/2">PRODUCTS</th>
                  <th className="py-4 px-6">PRICE</th>
                  <th className="py-4 px-6">STOCK STATUS</th>
                  <th className="py-4 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 align-top">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        disabled={!item.inStock}
                        className={`w-4 h-4 rounded ${item.inStock ? 'accent-black' : 'text-gray-400'}`}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={item.image || '/logos/placeholder.png'} 
                            alt={item.name} 
                            className="w-full h-full object-contain p-1" 
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">₱{item.price.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block text-xs font-bold ${
                        item.inStock ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => console.log(`Checking out item ${item.id}`)}
                        disabled={!item.inStock}
                        className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors border ${
                          item.inStock
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-white text-gray-500 border-gray-300 cursor-not-allowed'
                        }`}
                      >
                        CHECK OUT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View (hidden on lg and up) */}
        <div className="lg:hidden space-y-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-300 p-4">
              <div className="flex items-start space-x-4">
                <div className="pt-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    disabled={!item.inStock}
                    className={`w-4 h-4 rounded ${item.inStock ? 'accent-black' : 'text-gray-400'}`}
                  />
                </div>
                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={item.image || '/logos/placeholder.png'} 
                    alt={item.name} 
                    className="w-full h-full object-contain p-1" 
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-gray-900 text-base">{item.name}</p>
                  <p className="text-sm text-gray-500 mb-1">{item.description}</p>
                  <p className="font-bold text-lg text-black">₱{item.price.toFixed(2)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-block text-xs font-bold ${
                    item.inStock ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => console.log(`Checking out item ${item.id}`)}
                  disabled={!item.inStock}
                  className={`w-full py-3 text-sm rounded-lg font-medium transition-colors ${
                    item.inStock
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  CHECK OUT
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons Footer (always visible but styled for responsiveness) */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center space-y-4 sm:space-y-0 space-y-reverse">
          
          <div className="flex items-center space-x-6">
            <label className="flex items-center cursor-pointer text-gray-700 font-medium">
              <input
                type="checkbox"
                checked={selectedItems.length === wishlistItems.filter(i => i.inStock).length}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-black rounded mr-2"
              />
              Select All (In Stock)
            </label>
            <button
              onClick={deleteSelected}
              disabled={selectedItems.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedItems.length > 0
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete ({selectedItems.length})
            </button>
          </div>
          
          <button
            onClick={() => console.log('Checking out all selected items')}
            disabled={selectedItems.length === 0 || totalSelectedInStock === 0}
            className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-colors ${
              selectedItems.length > 0 && totalSelectedInStock > 0
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            CHECK OUT ALL ({totalSelectedInStock})
          </button>
        </div>
      </main>

      {/* Footer - Consistent Black Bar from Marketplace */}
      <footer className="bg-black text-white py-6 sm:py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm md:text-base">© 2024 Fighting Gears. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Wishlist;