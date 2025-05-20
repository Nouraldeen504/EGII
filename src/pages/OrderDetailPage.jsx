import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaShoppingBag } from 'react-icons/fa';
import { orderService } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDate, formatOrderNumber, getOrderStatusLabel, getOrderStatusColorClass } from '../utils/helpers';
import { useSettings } from '../contexts/SettingsContext';
import { getPaymentMethodLabel } from '../utils/helpers';

const OrderDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if coming from checkout success
  const isCheckoutSuccess = location.state?.fromCheckout || false;
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch order with user ID for security
        const data = await orderService.getOrderById(id, user.id);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrderDetails();
    } else {
      navigate('/login', { state: { from: location } });
    }
  }, [id, user, navigate, location]);
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error || !order) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Order not found'}
        </Alert>
        <Button 
          as={Link} 
          to="/orders" 
          variant="primary"
          className="mt-3"
        >
          <FaArrowLeft className="me-2" /> Back to Orders
        </Button>
      </Container>
    );
  }
  
  // Calculate totals
  const subtotal = order.order_items.reduce(
    (sum, item) => sum + (item.price_at_purchase * item.quantity), 
    0
  );
  
  // Simplified shipping cost (in a real app, this would be stored with the order)
  const shippingCost = subtotal > 100 ? 0 : 10;
  
  // Tax calculation (in a real app, this would be stored with the order)
  const taxRate = 0.07;
  const taxAmount = subtotal * taxRate;
  
  return (
    <Container className="py-5">
      {isCheckoutSuccess && (
        <Alert variant="success" className="mb-4">
          <Alert.Heading>Order Placed Successfully!</Alert.Heading>
          <p>Thank you for your purchase. We've received your order and will process it right away.</p>
          <p className="mb-0">A confirmation email has been sent to your email address.</p>
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Order Details</h1>
        <Button 
          as={Link} 
          to="/orders" 
          variant="outline-primary"
          className="d-flex align-items-center"
        >
          <FaArrowLeft className="me-2" /> Back to Orders
        </Button>
      </div>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Order #{formatOrderNumber(order.id)}</h3>
              <Badge className={getOrderStatusColorClass(order.status)}>
                {getOrderStatusLabel(order.status)}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Order Information</h5>
                  <p className="mb-1"><strong>Date:</strong> {formatDate(order.created_at)}</p>
                  <p className="mb-1"><strong>Payment Method:</strong> {getPaymentMethodLabel(order.payment_method)}</p>
                  <p className="mb-1"><strong>Payment Status:</strong> {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}</p>
                  <p className="mb-0"><strong>Order Status:</strong> {getOrderStatusLabel(order.status)}</p>
                </Col>
                
                <Col md={6}>
                  <h5>Shipping Address</h5>
                  <p className="mb-1">{order.shipping_address.street}</p>
                  <p className="mb-1">
                    {order.shipping_address.city}, {order.shipping_address.country}
                  </p>
                </Col>
              </Row>
              
              <h5 className="mb-3">Order Items</h5>
              <Table responsive borderless className="align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-center">Price</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={item.product.image_url || 'https://via.placeholder.com/50x50?text=Product'} 
                            alt={item.product.name}
                            width={50}
                            height={50}
                            className="me-3 rounded"
                          />
                          <span>{item.product.name}</span>
                        </div>
                      </td>
                      <td className="text-center">{formatCurrency(item.price_at_purchase, settings?.currency)}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">{formatCurrency(item.price_at_purchase * item.quantity, settings?.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-4">Order Summary</h4>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal, settings?.currency)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost, settings?.currency)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (7%):</span>
                <span>{formatCurrency(taxAmount, settings?.currency)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-0">
                <span className="h5">Total:</span>
                <span className="h5 text-primary">{formatCurrency(order.total_amount, settings?.currency)}</span>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaShoppingBag className="text-primary me-2" />
                <h5 className="mb-0">Need Help?</h5>
              </div>
              <p className="small mb-3">
                If you have any questions about your order, please contact our customer support team.
              </p>
              <Button 
                as={Link} 
                to="/contact" 
                variant="outline-primary" 
                className="w-100"
              >
                Contact Support
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};  
export default OrderDetailPage;