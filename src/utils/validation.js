export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const validateLogin = (login) => {
  return login.length >= 3;
};

export const getValidationErrors = (formData, isSignup = false) => {
  const errors = {};

  if (isSignup) {
    if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
      errors.confirmPassword = 'Passwords do not match';
    }
  } else {
    if (!validateLogin(formData.login)) {
      errors.login = 'Login must be at least 3 characters long';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
  }

  return errors;
};
