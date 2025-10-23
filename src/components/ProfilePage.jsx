import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

// Note: useNavigate is imported but not used for navigation in this single file component environment.
// It is kept for completeness based on the original code structure.
// In a real application, you would use it for navigation.

// --- Icon Definitions (Using Lucide-like paths for better clarity) ---
const Icon = ({ path, className = "w-6 h-6", ...props }) => (
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

// Icons used in the page (using simple, recognizable paths)
const UserIcon = (props) => (
    <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" {...props} />
);
const BagIcon = (props) => (
    <Icon path="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" {...props} />
);
const SearchIcon = (props) => (
    <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" {...props} />
);
const CameraIcon = (props) => (
    <Icon path="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z" {...props} />
);
const ArrowLeftIcon = (props) => (
    <Icon path="M15 19l-7-7 7-7" {...props} />
);
const HomeIcon = (props) => (
    <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" {...props} />
);
const CheckCircleIcon = (props) => (
    <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" {...props} />
);


const ProfilePage = () => {
    // useNavigate is typically used with react-router-dom, included for original code structure
    const navigate = useNavigate();

    const [selectedTab, setSelectedTab] = useState('To Pay');
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' }); // for non-alert messages

    // Placeholder state for user details (as per wireframe)
    const [profile, setProfile] = useState({
        username: 'FightingGearsFan',
        email: 'user@example.com',
        fullname: 'John Doe',
        phone: '123-456-7890',
        gender: 'Male',
    });

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (event) => {
        setUploadMessage({ text: '', type: '' });
        const file = event.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB check
                setUploadMessage({ text: 'Error: File size must be less than 1 MB.', type: 'error' });
                return;
            }
            setSelectedImage(URL.createObjectURL(file));
            setUploadMessage({ text: 'Profile image updated successfully.', type: 'success' });
        }
    };

    const handleSave = () => {
        // Mock save function
        console.log('Profile saved:', profile);
        setUploadMessage({ text: 'Profile details saved!', type: 'success' });
        setTimeout(() => setUploadMessage({ text: '', type: '' }), 3000);
    };

    const purchaseData = {
        'To Pay': [
            { name: 'VENUM V3.10 Gloves (Size M)', status: 'CASH ON DELIVERY', price: '₱1,500' },
            { name: 'VENUM V4.10 Headgear (Red)', status: 'PAID', price: '₱2,800' }
        ],
        'To Ship': [
            { name: 'VENUM V3.10 Shorts (L)', status: 'WAITING FOR PICKUP', price: '₱1,200' },
            { name: 'VENUM V4.10 Shoes (US 10)', status: 'SHIP', price: '₱3,500' }
        ],
        'To Receive': [
            { name: 'VENUM V3.10 Handwraps', status: 'SHIPPED', price: '₱500' },
            { name: 'VENUM V4.10 Focus Mitts', status: 'IN TRANSIT', price: '₱2,200' }
        ],
        'Completed': [
            { name: 'VENUM V4.10 T-Shirt (XL)', status: 'RECEIVED', price: '₱900' }
        ],
        'Cancelled': [
            { name: 'VENUM V4.10 Handwraps', status: 'RETURN TO SENDER', price: '₱500' }
        ]
    };

    const tabs = ['To Pay', 'To Ship', 'To Receive', 'Completed', 'Cancelled'];

    // Utility component for the purchase item buttons (Receive/Cancel)
    const ActionButton = ({ label, onClick, style = 'primary' }) => {
        const baseStyle = "px-3 py-1 text-xs font-bold rounded-lg transition-colors shadow-sm min-w-[70px]";
        let specificStyle;

        if (style === 'primary') {
            specificStyle = "bg-black text-white hover:bg-gray-800";
        } else if (style === 'secondary') {
            specificStyle = "bg-white text-black border border-gray-300 hover:bg-gray-100";
        }

        return (
            <button
                onClick={onClick}
                className={`${baseStyle} ${specificStyle}`}
            >
                {label}
            </button>
        );
    };

    return (
        // Consistent background color from Marketplace
        <div className="min-h-screen bg-white-100 font-sans">
            
            {/* Header - Black Background (Consistent with Marketplace) */}
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

            {/* Main Content Area - Centered, slightly wider for profile fields */}
            <div className="max-w-4xl mx-auto pb-20 p-4 sm:p-6"> 
                
                {/* Notification Message */}
                {uploadMessage.text && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center ${
                        uploadMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">{uploadMessage.text}</span>
                    </div>
                )}


                {/* Profile Details Section */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 mt-4 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        
                        {/* Avatar & Upload */}
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300 shadow-inner">
                                        {selectedImage ? (
                                            <img 
                                                src={selectedImage} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="w-16 h-16 text-gray-500" />
                                        )}
                                    </div>
                                    {/* Camera Icon Overlay */}
                                    <label htmlFor="image-upload" className="absolute bottom-0 right-0 bg-black rounded-full p-2 cursor-pointer hover:bg-gray-700 transition-colors shadow-lg ring-2 ring-white">
                                        <CameraIcon className="w-5 h-5 text-white" />
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <label 
                                    htmlFor="image-upload" 
                                    className="mt-4 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer shadow-md"
                                >
                                    SELECT IMAGE
                                </label>
                                <p className="text-xs text-gray-500 mt-1">Maximum 1 MB</p>
                            </div>
                            
                            {/* Input Fields Grid */}
                            <div className="flex-1 w-full sm:w-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    
                                    {/* Username */}
                                    <div className="col-span-1">
                                        <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                                        <input 
                                            type="text" 
                                            id="username"
                                            name="username"
                                            value={profile.username}
                                            onChange={handleProfileChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black transition-colors"
                                            placeholder="Enter username"
                                        />
                                    </div>

                                    {/* Email Address */}
                                    <div className="col-span-1">
                                        <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            id="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleProfileChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black transition-colors"
                                            placeholder="Enter email"
                                        />
                                    </div>

                                    {/* Fullname */}
                                    <div className="col-span-full">
                                        <label htmlFor="fullname" className="block text-xs font-medium text-gray-700 mb-1">Fullname</label>
                                        <input 
                                            type="text" 
                                            id="fullname"
                                            name="fullname"
                                            value={profile.fullname}
                                            onChange={handleProfileChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black transition-colors"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div className="col-span-1">
                                        <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            id="phone"
                                            name="phone"
                                            value={profile.phone}
                                            onChange={handleProfileChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black transition-colors"
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                                        <div className="flex items-center space-x-4 h-10">
                                            <label className="flex items-center text-sm text-gray-700">
                                                <input 
                                                    type="radio" 
                                                    name="gender" 
                                                    value="Male" 
                                                    checked={profile.gender === 'Male'} 
                                                    onChange={handleProfileChange}
                                                    className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                                                />
                                                <span className="ml-2">Male</span>
                                            </label>
                                            <label className="flex items-center text-sm text-gray-700">
                                                <input 
                                                    type="radio" 
                                                    name="gender" 
                                                    value="Female" 
                                                    checked={profile.gender === 'Female'} 
                                                    onChange={handleProfileChange}
                                                    className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                                                />
                                                <span className="ml-2">Female</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end mt-6">
                                    <button 
                                        onClick={handleSave}
                                        className="bg-black text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-md"
                                    >
                                        SAVE
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Purchase Section */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 mt-6 overflow-hidden">
                    
                    {/* Section Header */}
                    <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
                        <h2 className="text-xl font-bold text-black">My Purchase</h2>
                    </div>

                    {/* Tabs - Horizontal Scroll on Mobile, Black Active State */}
                    <div className="border-b border-gray-200 overflow-x-auto">
                        <div className="flex min-w-max">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`flex-1 px-4 py-3 text-sm font-semibold whitespace-nowrap min-w-[20%] transition-colors ${
                                        selectedTab === tab
                                            ? 'text-black border-b-2 border-black' // Active Black
                                            : 'text-gray-500 hover:text-black'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Purchase Items */}
                    <div className="p-4 sm:p-6">
                        {purchaseData[selectedTab].map((item, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-xl p-4 mb-3 last:mb-0 border border-gray-200"
                            >
                                <div className="flex justify-between items-start flex-col sm:flex-row sm:items-center">
                                    <div className="mb-2 sm:mb-0">
                                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                        <p className="text-xs text-gray-600 mt-0.5">Total: {item.price}</p>
                                        <p className={`text-sm mt-1 font-medium ${
                                            item.status.includes('PAID') || item.status.includes('RECEIVED') || item.status.includes('SHIPPED')
                                                ? 'text-green-600' 
                                                : item.status.includes('CANCELLED') || item.status.includes('RETURN') || item.status.includes('PICKUP')
                                                ? 'text-orange-600' // Use orange for actions needed/pending
                                                : 'text-gray-600'
                                        }`}>
                                            Status: {item.status}
                                        </p>
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                        {selectedTab === 'To Receive' ? (
                                            <>
                                                <ActionButton label="RECEIVE" onClick={() => console.log('Receive:', item.name)} style="primary" />
                                                <ActionButton label="CANCEL" onClick={() => console.log('Cancel:', item.name)} style="secondary" />
                                            </>
                                        ) : selectedTab === 'To Pay' ? (
                                            <ActionButton label="PAY NOW" onClick={() => console.log('Pay Now:', item.name)} style="primary" />
                                        ) : (
                                            <button className="text-black text-sm font-medium hover:text-gray-700 transition-colors p-2">
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {purchaseData[selectedTab].length === 0 && (
                            <div className="text-center py-8">
                                <BagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No purchases found in this tab.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer - Mobile Navigation Bar (Fixed at the bottom, black active state) */}
             <footer className="bg-black text-white py-6 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm md:text-base">© 2024 Fighting Gears. All rights reserved.</p>
        </div>
      </footer>
        </div>
    );
};

export default ProfilePage;
