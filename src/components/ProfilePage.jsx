import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Icon Definitions
const Icon = ({ path, className = "w-6 h-6", ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
);

const UserIcon = (props) => <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" {...props} />;
const BagIcon = (props) => <Icon path="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" {...props} />;
const CameraIcon = (props) => <Icon path="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z" {...props} />;
const CheckCircleIcon = (props) => <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" {...props} />;

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        phone: '',
        gender: 'Male',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' });
    const [selectedTab, setSelectedTab] = useState('Order History');
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchOrders();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setFormData({
                    username: data.username || '',
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    gender: data.gender || 'Male',
                });
                setProfileImage(data.avatar_url || null);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items(
                        *,
                        products(name, image)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            setUploadMessage({ text: 'Error: File size must be less than 1 MB.', type: 'error' });
            return;
        }

        try {
            setUploadMessage({ text: 'Uploading...', type: 'success' });

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            if (profileImage) {
                const oldFileName = profileImage.split('/').pop();
                await supabase.storage.from('avatars').remove([`${user.id}/${oldFileName}`]);
            }

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setProfileImage(publicUrl);
            setUploadMessage({ text: 'Profile image updated successfully!', type: 'success' });
            setTimeout(() => setUploadMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadMessage({ text: 'Error uploading image', type: 'error' });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    username: formData.username,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    gender: formData.gender,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            setUploadMessage({ text: 'Profile saved successfully!', type: 'success' });
            setTimeout(() => setUploadMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Error saving profile:', error);
            setUploadMessage({ text: 'Error saving profile', type: 'error' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // UPDATED TABS: Payment History, Order History, Completed, Cancelled
    const tabs = ['Payment History', 'Order History', 'Completed', 'Cancelled'];

    // Organize orders by tab
    const ordersByTab = {
        'Payment History': orders.filter(o => o.payment_status === 'paid'),
        'Order History': orders.filter(o => 
            o.status === 'confirmed' || 
            o.status === 'processing' || 
            o.status === 'shipped'
        ),
        'Completed': orders.filter(o => o.status === 'delivered'),
        'Cancelled': orders.filter(o => o.status === 'cancelled' || o.status === 'refunded')
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-700', text: 'PENDING' },
            confirmed: { color: 'bg-blue-100 text-blue-700', text: 'CONFIRMED' },
            processing: { color: 'bg-purple-100 text-purple-700', text: 'PROCESSING' },
            shipped: { color: 'bg-indigo-100 text-indigo-700', text: 'SHIPPED' },
            delivered: { color: 'bg-green-100 text-green-700', text: 'DELIVERED' },
            cancelled: { color: 'bg-red-100 text-red-700', text: 'CANCELLED' },
            refunded: { color: 'bg-gray-100 text-gray-700', text: 'REFUNDED' }
        };
        return badges[status] || badges.pending;
    };

    const getPaymentBadge = (paymentStatus) => {
        const badges = {
            pending: { color: 'bg-orange-100 text-orange-700', text: 'UNPAID' },
            paid: { color: 'bg-green-100 text-green-700', text: 'PAID' },
            failed: { color: 'bg-red-100 text-red-700', text: 'FAILED' },
            refunded: { color: 'bg-blue-100 text-blue-700', text: 'REFUNDED' }
        };
        return badges[paymentStatus] || badges.pending;
    };

    const renderOrderItem = (order) => {
        const firstItem = order.order_items?.[0];
        const itemCount = order.order_items?.length || 0;
        const statusBadge = getStatusBadge(order.status);
        const paymentBadge = getPaymentBadge(order.payment_status);

        return (
            <div key={order.id} className="bg-gray-50 rounded-xl p-4 mb-3 last:mb-0 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                            Order #{order.order_number}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.created_at).toLocaleDateString('en-PH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                            {statusBadge.text}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentBadge.color}`}>
                            {paymentBadge.text}
                        </span>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center space-x-3 mb-2">
                        {firstItem?.products?.image && (
                            <img 
                                src={firstItem.products.image} 
                                alt={firstItem.products.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                {firstItem?.products?.name || 'Product'}
                            </p>
                            {itemCount > 1 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    +{itemCount - 1} more item{itemCount > 2 ? 's' : ''}
                                </p>
                            )}
                            <p className="text-sm font-bold text-black mt-1">
                                Total: ₱{order.total_amount?.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-3 text-xs text-gray-600 space-y-1">
                        <p>💳 Payment: {order.payment_method === 'stripe' ? 'Credit/Debit Card' : 'Cash on Delivery'}</p>
                        <p>📦 Items: {itemCount} item{itemCount > 1 ? 's' : ''}</p>
                        {order.shipping_address?.address && (
                            <p className="truncate">📍 Ship to: {order.shipping_address.address}</p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                    {order.status === 'shipped' && (
                        <button 
                            className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            onClick={() => alert('Track Order: ' + order.order_number)}
                        >
                            Track Order
                        </button>
                    )}
                    <button 
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                        onClick={() => alert('View Details: ' + order.order_number)}
                    >
                        View Details
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Header - Black Background */}
            <header className="bg-black text-white py-4 px-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/')}
                        className="text-white hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                        <h1 className="text-lg font-semibold">Welcome to Fighting Gears</h1>
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <img src="/logos/boxing.png" alt="Gloves" className="w-6 h-6" />
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

            <div className="max-w-4xl mx-auto pb-20 p-4 sm:p-6">
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
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300 shadow-inner">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-16 h-16 text-gray-500" />
                                        )}
                                    </div>
                                    <label htmlFor="image-upload" className="absolute bottom-0 right-0 bg-black rounded-full p-2 cursor-pointer hover:bg-gray-700 transition-colors shadow-lg ring-2 ring-white">
                                        <CameraIcon className="w-5 h-5 text-white" />
                                        <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                </div>
                                <label htmlFor="image-upload" className="mt-4 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer shadow-md">
                                    SELECT IMAGE
                                </label>
                                <p className="text-xs text-gray-500 mt-1">Maximum 1 MB</p>
                            </div>
                            
                            <div className="flex-1 w-full sm:w-auto">
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                                            <input 
                                                type="text" 
                                                id="username" 
                                                name="username" 
                                                value={formData.username} 
                                                onChange={handleInputChange} 
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black transition-colors" 
                                                placeholder="Enter username" 
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                                            <input 
                                                type="email" 
                                                value={user?.email || ''} 
                                                disabled 
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed" 
                                            />
                                        </div>

                                        <div className="col-span-full">
                                            <label htmlFor="full_name" className="block text-xs font-medium text-gray-700 mb-1">Fullname</label>
                                            <input 
                                                type="text" 
                                                id="full_name" 
                                                name="full_name" 
                                                value={formData.full_name} 
                                                onChange={handleInputChange} 
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black transition-colors" 
                                                placeholder="Enter your full name" 
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input 
                                                type="tel" 
                                                id="phone" 
                                                name="phone" 
                                                value={formData.phone} 
                                                onChange={handleInputChange} 
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-black focus:border-black transition-colors" 
                                                placeholder="Enter phone number" 
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                                            <div className="flex items-center space-x-4 h-10">
                                                <label className="flex items-center text-sm text-gray-700">
                                                    <input 
                                                        type="radio" 
                                                        name="gender" 
                                                        value="Male" 
                                                        checked={formData.gender === 'Male'} 
                                                        onChange={handleInputChange}
                                                        className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                                                    />
                                                    <span className="ml-2">Male</span>
                                                </label>
                                                <label className="flex items-center text-sm text-gray-700">
                                                    <input 
                                                        type="radio" 
                                                        name="gender" 
                                                        value="Female" 
                                                        checked={formData.gender === 'Female'} 
                                                        onChange={handleInputChange}
                                                        className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                                                    />
                                                    <span className="ml-2">Female</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-6">
                                        <button 
                                            type="submit"
                                            className="bg-black text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-md"
                                        >
                                            SAVE
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Orders Section - UPDATED TABS */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 mt-6 overflow-hidden">
                    <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
                        <h2 className="text-xl font-bold text-black">My Orders</h2>
                    </div>

                    <div className="border-b border-gray-200 overflow-x-auto">
                        <div className="flex min-w-max">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`flex-1 px-4 py-3 text-sm font-semibold whitespace-nowrap min-w-[25%] transition-colors ${
                                        selectedTab === tab ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {ordersByTab[selectedTab].length === 0 ? (
                            <div className="text-center py-8">
                                <BagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No orders found in {selectedTab}.</p>
                            </div>
                        ) : (
                            ordersByTab[selectedTab].map(renderOrderItem)
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-black text-white py-6 sm:py-8 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-xs sm:text-sm md:text-base">© 2024 Fighting Gears. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default ProfilePage;