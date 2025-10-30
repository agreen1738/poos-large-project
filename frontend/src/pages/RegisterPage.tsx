import { useState } from 'react';
import authService from '../services/authService';
import './RegisterPage.css';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Send all 6 required fields to match backend
    const registerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    };

    console.log('Sending registration data:', registerData);
    console.log('Number of fields:', Object.keys(registerData).length);

    try {
      // Use authService to register
      await authService.register(registerData);
      
      alert('Registration successful! Please check your email to verify your account before logging in.');
      window.location.href = '/';
    } catch (error: any) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Wealth Tracker</h1>
        <p className="subtitle">Create Your Account</p>
        
        <form className="register-form" onSubmit={handleSubmit}>
          {/* First Name */}
          <div className="form-field">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              className={errors.firstName ? 'error shake' : ''}
            />
            {errors.firstName && (
              <span className="error-message">{errors.firstName}</span>
            )}
          </div>

          {/* Last Name */}
          <div className="form-field">
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              className={errors.lastName ? 'error shake' : ''}
            />
            {errors.lastName && (
              <span className="error-message">{errors.lastName}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-field">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error shake' : ''}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* Phone */}
          <div className="form-field">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className={errors.phone ? 'error shake' : ''}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-field">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error shake' : ''}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-field">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? 'error shake' : ''}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-link">
          <p>Already have an account? <a href="/">Login here</a></p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;