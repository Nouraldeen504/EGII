import { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Table, Form, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaCreditCard, FaArrowLeft, FaStore } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/helpers';
import { toast } from 'react-toastify';

const CartPage = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleQuantityChange = (id, value) => {
    const quantity = parseInt(value);
    if (quantity > 0) {
      setIsUpdating(true);
      updateQuantity(id, quantity);
      setTimeout(() => setIsUpdating(false), 500);
    }
  };
  
  const handleRemoveItem = (item) => {
    removeFromCart(item.id);
    toast.success(`${item.name} removed from cart`);
  };
  
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.info('Your cart has been cleared');
    }
  };
  
  const handleProceedToCheckout = () => {
    if (!user) {
      toast.info('Please sign in to proceed to checkout');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    
    navigate('/checkout');
  };
  
  if (cartItems.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="text-center p-4 shadow">
              <div className="mb-4">
                <FaShoppingCart size={50} className="text-secondary" />
              </div>
              <Card.Title as="h2" className="mb-4">Your Cart is Empty</Card.Title>
              <Card.Text className="mb-4">
                Looks like you haven't added any products to your cart yet.
              </Card.Text>
              <Button 
                as={Link} 
                to="/products" 
                variant="primary" 
                size="lg"
                className="d-flex align-items-center justify-content-center mx-auto"
                style={{ maxWidth: '250px' }}
              >
                <FaStore className="me-2" /> Continue Shopping
              </Button>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <h1 className="mb-4">Shopping Cart</h1>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Table responsive borderless className="align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Product</th>
                    <th style={{ width: '20%' }}>Price</th>
                    <th style={{ width: '20%' }}>Quantity</th>
                    <th style={{ width: '10%' }}>Total</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Image 
                            src={item.image_url || 'https://via.placeholder.com/60x60?text=Product'} 
                            alt={item.name}
                            width={60}
                            height={60}
                            className="me-3 rounded"
                          />
                          <Link 
                            to={`/products/${item.id}`}
                            className="text-decoration-none text-dark fw-bold"
                          >
                            {item.name}
                          </Link>
                        </div>
                      </td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          style={{ maxWidth: '80px' }}
                        />
                      </td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                      <td className="text-end">
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleRemoveItem(item)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <div className="d-flex justify-content-between mt-3">
                <Button 
                  as={Link} 
                  to="/products" 
                  variant="outline-primary"
                  className="d-flex align-items-center"
                >
                  <FaArrowLeft className="me-2" /> Continue Shopping
                </Button>
                
                <Button 
                  variant="outline-danger" 
                  onClick={handleClearCart}
                  className="d-flex align-items-center"
                >
                  <FaTrash className="me-2" /> Clear Cart
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="mb-4">Order Summary</h3>
              
              {isUpdating && (
                <Alert variant="info">Updating cart...</Alert>
              )}
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span className="fw-bold">{formatCurrency(cartTotal)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span className="fw-bold">Calculated at checkout</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-4">
                <span className="h5">Total:</span>
                <span className="h5 text-primary">{formatCurrency(cartTotal)}</span>
              </div>
              
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100 d-flex align-items-center justify-content-center mb-3"
                onClick={handleProceedToCheckout}
              >
                <FaCreditCard className="me-2" /> Proceed to Checkout
              </Button>
              
              <p className="text-muted small text-center mb-0">
                Taxes and shipping calculated at checkout
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;