import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaCreditCard, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/helpers';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { notificationService } from '../services/notificationService';
import { toast } from 'react-toastify';

// Schema for shipping and payment information
const CheckoutSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  address: Yup.string()
    .required('Address is required'),
  city: Yup.string()
    .required('City is required'),
  state: Yup.string()
    .required('State is required'),
  postalCode: Yup.string()
    .required('Postal code is required'),
  country: Yup.string()
    .required('Country is required'),
  paymentMethod: Yup.string()
    .required('Please select a payment method')
});

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [stockError, setStockError] = useState(null);
  const [stockChecked, setStockChecked] = useState(false);
  
  // States for payment processing (would be integrated with Stripe/PayPal)
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  // Shipping and tax calculation (simplified)
  const shippingCost = cartTotal > 100 ? 0 : 10;
  const taxRate = 0.07; // 7%
  const taxAmount = cartTotal * taxRate;
  const orderTotal = cartTotal + shippingCost + taxAmount;
  
  // Check if cart is empty or redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    
    // Check stock availability when page loads
    const verifyStock = async () => {
      try {
        setLoading(true);
        const { allInStock, items } = await productService.checkProductsStock(cartItems);
        
        if (!allInStock) {
          const outOfStockItems = items.filter(item => !item.inStock);
          setStockError(
            `Some items in your cart are not available in the requested quantity: ${
              outOfStockItems.map(item => `${item.name} (Requested: ${item.requested}, Available: ${item.available})`).join(', ')
            }`
          );
        }
        
        setStockChecked(true);
      } catch (error) {
        console.error('Error checking stock:', error);
        setStockError('Failed to verify product availability. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyStock();
  }, [user, cartItems, navigate]);
  
  // Initial values from user profile if available
  const getInitialValues = () => {
    const initialValues = {
      fullName: userProfile?.full_name || '',
      email: user?.email || '',
      address: userProfile?.address?.street || '',
      city: userProfile?.address?.city || '',
      state: userProfile?.address?.state || '',
      postalCode: userProfile?.address?.postal_code || '',
      country: userProfile?.address?.country || 'US',
      paymentMethod: 'credit_card',
      saveInfo: true
    };
    
    return initialValues;
  };
  
  // Handle form submission and order creation
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      // First, check stock one more time before finalizing order
      const { allInStock } = await productService.checkProductsStock(cartItems);
      
      if (!allInStock) {
        setStockError('Some items are no longer available in the requested quantity. Please review your cart.');
        navigate('/cart');
        return;
      }
      
      // Process payment (in a real app, this would communicate with Stripe/PayPal)
      setProcessingPayment(true);
      
      // Simulate payment processing (would be replaced with actual payment gateway)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Payment successful, create order
      const shippingAddress = {
        street: values.address,
        city: values.city,
        state: values.state,
        postal_code: values.postalCode,
        country: values.country
      };
      
      const orderData = {
        userId: user.id,
        totalAmount: orderTotal,
        shippingAddress,
        paymentIntentId: 'mock_payment_id_' + Date.now(), // Would come from payment gateway
        paymentStatus: 'paid' // In a real app, this would depend on the payment gateway response
      };
      
      // Create order
      const { orderId } = await orderService.createOrder(orderData, cartItems);
      
      // Send order confirmation emails
      await notificationService.sendOrderConfirmation(orderId, user.email);
      await notificationService.sendAdminOrderNotification(orderId);
      
      // If user chose to save their info, update profile
      if (values.saveInfo) {
        // Update profile with shipping address (optional)
        // This would be implemented in a real app
      }
      
      // Clear cart and redirect to success page
      clearCart();
      
      toast.success('Order placed successfully!');
      navigate(`/orders/${orderId}`, { state: { fromCheckout: true } });
      
    } catch (error) {
      console.error('Error processing order:', error);
      setErrors({ submit: 'Failed to process your order. Please try again.' });
      setPaymentError('There was a problem processing your payment. Please try again.');
    } finally {
      setProcessingPayment(false);
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Verifying product availability...</p>
      </Container>
    );
  }
  
  if (stockError && stockChecked) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Stock Availability Issue</Alert.Heading>
          <p>{stockError}</p>
          <Button 
            as={Link} 
            to="/cart" 
            variant="primary"
            className="mt-3"
          >
            Return to Cart
          </Button>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <h1 className="mb-4">Checkout</h1>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h3 className="mb-4">Shipping & Payment Information</h3>
              
              <Formik
                initialValues={getInitialValues()}
                validationSchema={CheckoutSchema}
                onSubmit={handleSubmit}
              >
                {({ handleSubmit, handleChange, handleBlur, values, touched, errors, isSubmitting }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="fullName">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="fullName"
                            value={values.fullName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.fullName && !!errors.fullName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.fullName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.email && !!errors.email}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3" controlId="address">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.address && !!errors.address}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.address}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Row>
                      <Col md={5}>
                        <Form.Group className="mb-3" controlId="city">
                          <Form.Label>City</Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={values.city}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.city && !!errors.city}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.city}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={3}>
                        <Form.Group className="mb-3" controlId="state">
                          <Form.Label>State</Form.Label>
                          <Form.Control
                            type="text"
                            name="state"
                            value={values.state}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.state && !!errors.state}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.state}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={4}>
                        <Form.Group className="mb-3" controlId="postalCode">
                          <Form.Label>Postal Code</Form.Label>
                          <Form.Control
                            type="text"
                            name="postalCode"
                            value={values.postalCode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.postalCode && !!errors.postalCode}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.postalCode}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-4" controlId="country">
                      <Form.Label>Country</Form.Label>
                      <Form.Select
                        name="country"
                        value={values.country}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.country && !!errors.country}
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.country}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <hr className="my-4" />
                    
                    <h4 className="mb-3">Payment Method</h4>
                    
                    <div className="mb-3">
                      <Form.Check
                        type="radio"
                        id="credit_card"
                        name="paymentMethod"
                        value="credit_card"
                        label="Credit Card"
                        checked={values.paymentMethod === 'credit_card'}
                        onChange={handleChange}
                        isInvalid={touched.paymentMethod && !!errors.paymentMethod}
                        className="mb-2"
                      />
                      
                      <Form.Check
                        type="radio"
                        id="paypal"
                        name="paymentMethod"
                        value="paypal"
                        label="PayPal"
                        checked={values.paymentMethod === 'paypal'}
                        onChange={handleChange}
                        isInvalid={touched.paymentMethod && !!errors.paymentMethod}
                      />
                      
                      <Form.Control.Feedback type="invalid">
                        {errors.paymentMethod}
                      </Form.Control.Feedback>
                    </div>
                    
                    {values.paymentMethod === 'credit_card' && (
                      <div className="mb-3 p-3 bg-light rounded">
                        <p className="mb-2">
                          <small>
                            <em>In a real application, credit card fields would be securely integrated here.</em>
                          </small>
                        </p>
                        <p className="mb-0">
                          <small>
                            <em>For demo purposes, we're simulating payment processing.</em>
                          </small>
                        </p>
                      </div>
                    )}
                    
                    {values.paymentMethod === 'paypal' && (
                      <div className="mb-3 p-3 bg-light rounded">
                        <p className="mb-0">
                          <small>
                            <em>In a real application, PayPal integration would be here.</em>
                          </small>
                        </p>
                      </div>
                    )}
                    
                    {paymentError && (
                      <Alert variant="danger" className="mb-4">
                        {paymentError}
                      </Alert>
                    )}
                    
                    <Form.Group className="mb-4">
                      <Form.Check
                        type="checkbox"
                        id="saveInfo"
                        name="saveInfo"
                        label="Save this information for next time"
                        checked={values.saveInfo}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    
                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        size="lg"
                        disabled={isSubmitting || processingPayment}
                        className="d-flex align-items-center justify-content-center"
                      >
                        {processingPayment ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <FaCreditCard className="me-2" /> 
                            Place Order - {formatCurrency(orderTotal)}
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        as={Link} 
                        to="/cart" 
                        variant="outline-secondary"
                        disabled={isSubmitting || processingPayment}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <FaArrowLeft className="me-2" /> Back to Cart
                      </Button>
                    </div>
                    
                    {errors.submit && (
                      <Alert variant="danger" className="mt-3">
                        {errors.submit}
                      </Alert>
                    )}
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h3 className="mb-4">Order Summary</h3>
              
              <div className="mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="d-flex justify-content-between mb-2">
                    <div>
                      <span className="fw-bold">{item.quantity}x</span> {item.name}
                    </div>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (7%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-0">
                <span className="h5">Total:</span>
                <span className="h5 text-primary">{formatCurrency(orderTotal)}</span>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaShoppingBag className="text-primary me-2" />
                <h5 className="mb-0">Shipping Policy</h5>
              </div>
              <p className="small mb-0">
                Orders over $100 qualify for free shipping. All orders are typically processed and shipped within 1-2 business days. Delivery usually takes 3-5 business days depending on your location.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;