# Fighting Gears E-commerce Admin System

## 🎯 Overview

Your Fighting Gears e-commerce application now has both **User View** and **Admin View** with full CRUD functionality!

## 📋 Current Features

### ✅ User View
- **Landing Page**: Logo carousel with loading animation
- **Homepage**: Hero banner, service highlights, brand showcase
- **Marketplace**: Browse categories, product grids (Gloves, Punch Mits, Mouthguard, Shin Guard, Punching Bag)
- **Authentication**: Login/Signup with Supabase
- **Responsive Design**: Works on mobile, tablet, and desktop

### ✅ Admin View
- **Admin Dashboard**: Complete product management interface
- **CRUD Operations**: Create, Read, Update, Delete products
- **Product Management**: Add/edit products with categories, brands, pricing, stock
- **Admin Authentication**: Separate admin login system
- **Role-based Access**: Admin-only access to management features

## 🚀 Setup Instructions

### 1. Database Setup

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run the database schema** from `database-schema.sql`:

```sql
-- This will create all necessary tables and policies
-- Copy and paste the entire content of database-schema.sql
```

### 2. Create Admin User

**Option 1: Create Admin User in Supabase Dashboard**
1. **Go to Supabase Dashboard** → **Authentication** → **Users**
2. **Click "Add User"**
3. **Email**: `admin@fightinggears.com`
4. **Password**: Set your admin password
5. **Auto Confirm**: Yes
6. **Click "Create User"**

**Option 2: Run SQL Query (if user already exists)**
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@fightinggears.com');
```

### 3. Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🔐 Access Points

### User Access
- **Login**: `/login` (same login for everyone)
- **User Dashboard**: `/home` (after login as regular user)
- **Marketplace**: `/marketplace`

### Admin Access
- **Login**: `/login` (same login page)
- **Admin Dashboard**: `/admin` (after login as admin user)

## 🛠️ Admin Features

### Product Management
- **View All Products**: Table view with product details
- **Add New Product**: Modal form with validation
- **Edit Product**: Click edit button to modify existing products
- **Delete Product**: Remove products with confirmation
- **Categories**: Gloves, Punch Mits, Mouthguard, Shin Guard, Punching Bag
- **Brands**: Venum, Everlast, Twins Special, Hayabusa, Wesing

### Admin Dashboard Tabs
- **Products**: Full CRUD operations
- **Orders**: Coming soon (placeholder)
- **Users**: Coming soon (placeholder)

## 📱 Responsive Design

Both user and admin interfaces are fully responsive:
- **Mobile**: Optimized layouts and touch interactions
- **Tablet**: Medium-sized layouts with good spacing
- **Desktop**: Full-featured interfaces with optimal spacing

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level security
- **Role-based Access**: Admin vs user permissions
- **Authentication**: Supabase Auth integration
- **Protected Routes**: Automatic redirects based on user role

## 🎨 Design System

- **Color Scheme**: Black and white with gray accents
- **Typography**: Clean, modern fonts
- **Components**: Consistent button styles, forms, and layouts
- **Animations**: Smooth transitions and hover effects

## 🚀 Next Steps

### Immediate
1. **Set up your Supabase database** using the provided schema
2. **Create your admin user** and assign admin role
3. **Test both user and admin flows**

### Future Enhancements
1. **Order Management**: Complete order processing system
2. **User Management**: Admin user management interface
3. **Inventory Tracking**: Stock management and alerts
4. **Analytics Dashboard**: Sales and user analytics
5. **File Upload**: Product image upload functionality

## 🐛 Troubleshooting

### Common Issues

1. **"Access denied" on admin login**
   - Make sure user has `role = 'admin'` in `user_profiles` table

2. **Products not loading**
   - Check if `products` table exists and has data
   - Verify RLS policies are set up correctly

3. **Authentication errors**
   - Verify Supabase environment variables
   - Check Supabase project settings

### Debug Mode

Add to your `.env` file:
```env
VITE_SUPABASE_DEBUG=true
```

## 📞 Support

Your Fighting Gears e-commerce system is now ready for both users and admins! The admin can manage products while users can browse and shop. Both interfaces are fully responsive and secure.

**Happy coding!** 🥊
