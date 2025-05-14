
// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  export const formatDate = (dateString, options = {}) => {
    const date = new Date(dateString);
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('en-US', mergedOptions).format(date);
  };
  
  // Truncate text
  export const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };
  
  // Generate order number display format
  export const formatOrderNumber = (orderId) => {
    // Extract first 8 characters if it's a UUID
    const shortId = orderId.slice(0, 8).toUpperCase();
    return `ORD-${shortId}`;
  };
  
  // Validate email format
  export const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Format phone number
  export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return phoneNumber;
  };
  
  // Calculate average rating
  export const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  // Get humanized order status
  export const getOrderStatusLabel = (status) => {
    const statusMap = {
      pending: 'Pending',
      processing: 'Processing',
      shipping: 'Shipped',
      delivered: 'Delivered',
      canceled: 'Canceled'
    };
    
    return statusMap[status] || status;
  };
  
  // Get order status color class
  export const getOrderStatusColorClass = (status) => {
    const statusColorMap = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipping: 'status-shipping',
      delivered: 'status-delivered',
      canceled: 'status-canceled'
    };
    
    return statusColorMap[status] || '';
  };
  
  // Validate password strength
  export const validatePasswordStrength = (password) => {
    if (!password) return { isValid: false, message: 'Password is required' };
    
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    // Check for at least one digit
    if (!/\d/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }
    
    return { isValid: true, message: 'Password is strong' };
  };
  
  // Parse URL query parameters
  export const parseQueryParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const params = {};
    
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    
    return params;
  };
  
  // Build URL query string from parameters
  export const buildQueryString = (params) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  };

  export const PAYMENT_METHODS = {
    credit_card: 'Credit Card',
    paypal: 'PayPal',
    stripe: 'Stripe',
    cod: 'Cash on Delivery',
    crypto: 'Cryptocurrency',
    bank_transfer: 'Bank Transfer'
  };
  
  export const getPaymentMethodLabel = (method) => {
    return PAYMENT_METHODS[method] || method;
  };