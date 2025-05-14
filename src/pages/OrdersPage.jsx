import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaShoppingBag } from 'react-icons/fa';
import { orderService } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency, formatDate, formatOrderNumber, getOrderStatusLabel, getOrderStatusColorClass } from '../utils/helpers';

const OrdersPage = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user) {
          navigate('/login', { state: { from: { pathname: '/orders' } } });
          return;
        }
        
        const data = await orderService.getUserOrders(user.id);
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user, navigate]);
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  
  if (orders.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="text-center p-4 shadow">
              <div className="mb-4">
                <FaShoppingBag size={50} className="text-secondary" />
              </div>
              <Card.Title as="h2" className="mb-4">No Orders Yet</Card.Title>
              <Card.Text className="mb-4">
                You haven't placed any orders yet. Start shopping to place your first order!
              </Card.Text>
              <Button 
                as={Link} 
                to="/products" 
                variant="primary" 
                size="lg"
                className="d-flex align-items-center justify-content-center mx-auto"
                style={{ maxWidth: '250px' }}
              >
                Start Shopping
              </Button>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <h1 className="mb-4">My Orders</h1>
      
      <Card className="shadow-sm">
        <Card.Body>
          <Table responsive className="align-middle">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>
                    <Link 
                      to={`/orders/${order.id}`}
                      className="text-decoration-none"
                    >
                      {formatOrderNumber(order.id)}
                    </Link>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>{formatCurrency(order.total_amount, settings?.currency)}</td>
                  <td>
                    <Badge className={getOrderStatusColorClass(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button 
                      as={Link}
                      to={`/orders/${order.id}`}
                      variant="outline-primary" 
                      size="sm"
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <FaEye />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrdersPage;