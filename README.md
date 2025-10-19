# CSE E-commerce Login/Signup UI

A responsive React application with Tailwind CSS featuring login and signup forms with a martial arts equipment product display.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Form Validation**: Real-time validation with error messages
- **Modern UI**: Dark theme with clean, professional design
- **Interactive Forms**: Login and signup with smooth transitions
- **Product Display**: Martial arts equipment showcase
- **Accessibility**: Proper form labels and keyboard navigation

## Components

### Login Component (`src/components/Login.jsx`)
- Login form with username/email and password fields
- "Forgot Password" link
- Form validation with error states
- Loading states during submission
- Switch to signup functionality

### Signup Component (`src/components/Signup.jsx`)
- Account creation form with email and password fields
- Password confirmation validation
- Privacy notice for email usage
- Form validation with error states
- Loading states during submission
- Switch to login functionality

### Product Display (`src/components/ProductDisplay.jsx`)
- Martial arts equipment showcase
- WESING brand mockup
- Responsive grid layout
- Hover effects for better interactivity

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Customization

### Adding Authentication Logic

To connect real authentication, update the form submission handlers in both components:

```javascript
// In Login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  const validationErrors = getValidationErrors(formData, false);
  setErrors(validationErrors);
  
  if (Object.keys(validationErrors).length === 0) {
    try {
      // Replace with your authentication API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        // Handle successful login
        console.log('Login successful');
      } else {
        // Handle login error
        setErrors({ general: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    }
  }
  
  setIsSubmitting(false);
};
```

### Styling Customization

The app uses Tailwind CSS classes. Key customization points:

- **Colors**: Modify the color scheme by changing Tailwind classes
- **Spacing**: Adjust padding and margins using Tailwind spacing utilities
- **Typography**: Update font sizes and weights using Tailwind typography classes
- **Layout**: Modify the responsive breakpoints and grid layouts

### Form Validation

Validation rules are defined in `src/utils/validation.js`:

```javascript
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};
```

### Adding New Form Fields

1. Update the `formData` state in the component
2. Add the input field to the JSX
3. Update validation rules in `validation.js`
4. Handle the input change in `handleInputChange`

## Mobile Responsiveness

The application is fully responsive with the following breakpoints:

- **Mobile**: `< 768px` - Single column layout
- **Tablet**: `768px - 1024px` - Optimized spacing
- **Desktop**: `> 1024px` - Two-column layout with side-by-side forms and product display

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies Used

- **React 19** - UI library
- **Tailwind CSS 4** - Styling framework
- **Vite** - Build tool and development server
- **ESLint** - Code linting

## Project Structure

```
src/
├── components/
│   ├── Login.jsx          # Login form component
│   ├── Signup.jsx         # Signup form component
│   └── ProductDisplay.jsx # Product showcase component
├── utils/
│   └── validation.js      # Form validation utilities
├── App.jsx                # Main application component
├── main.jsx              # Application entry point
└── index.css             # Global styles and Tailwind imports
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.