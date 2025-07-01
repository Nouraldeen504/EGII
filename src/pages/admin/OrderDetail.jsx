import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner, Modal, Form, Dropdown } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTruck, FaCheck, FaBan, FaEnvelope, FaPrint, FaUser, FaMapMarkerAlt, FaPhone, FaExclamationTriangle } from 'react-icons/fa';
import { orderService } from '../../services/orderService';
import { notificationService } from '../../services/notificationService';
import { formatCurrency, formatDate, formatOrderNumber, getOrderStatusLabel, getOrderStatusColorClass, getPaymentMethodLabel  } from '../../utils/helpers';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import { useSettings } from '../../contexts/SettingsContext';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { settings } = useSettings();
  
  // Status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await orderService.getOrderById(id, null, true);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  // Handle status update
  const handleUpdateStatus = async () => {
    if (!order || order.status === newStatus) {
      setShowStatusModal(false);
      return;
    }
    
    try {
      setUpdating(true);
      // Update order status
      const updatedOrder = await orderService.updateOrderStatus(order.id, newStatus);
      const userEmail = await orderService.getUserEmailByOrderId(order.id);
      
      // Update local state
      setOrder({ ...order, status: updatedOrder.status });
      
      // Send notification to customer about status change
      await notificationService.sendOrderStatusUpdate(
        updatedOrder.id, 
        updatedOrder.status,
        userEmail
      );
      
      toast.success(`Order status updated to ${getOrderStatusLabel(newStatus)}!`);
      
      // Close modal and reset
      setShowStatusModal(false);
      setNewStatus('');
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
  // Open status update modal
  const openStatusModal = (status) => {
    setNewStatus(status);
    setShowStatusModal(true);
  };
  
  // Handle email notification
  const sendEmailNotification = async () => {
    try {
      await notificationService.sendOrderStatusUpdate(
        order.id,
        order.status,
        order.user?.email
      );
      
      toast.success('Email notification sent to customer!');
    } catch (err) {
      console.error('Error sending email notification:', err);
      toast.error('Failed to send email notification. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <Container fluid className="py-4 text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading order details...</p>
        </Container>
      </AdminLayout>
    );
  }
  
  if (error || !order) {
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <Alert variant="danger">{error || 'Order not found'}</Alert>
          <Button 
            as={Link} 
            to="/admin/orders" 
            variant="primary"
            className="mt-3"
          >
            <FaArrowLeft className="me-2" /> Back to Orders
          </Button>
        </Container>
      </AdminLayout>
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
  
  // Format address
  const formatAddress = (address) => {
    return `${address.street}, ${address.city}, ${address.country}`;
  };
  
  // Get appropriate icon for status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <span className="text-warning">⏳</span>;
      case 'processing':
        return <FaTruck className="text-primary" />;
      case 'shipping':
        return <FaTruck className="text-info" />;
      case 'delivered':
        return <FaCheck className="text-success" />;
      case 'canceled':
        return <FaBan className="text-danger" />;
      default:
        return null;
    }
  };
  
  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <Link 
              to="/admin/orders" 
              className="btn btn-outline-secondary me-3"
              title="Back to Orders"
            >
              <FaArrowLeft />
            </Link>
            <h1 className="mb-0">
              Order Details: {formatOrderNumber(order.id)}
            </h1>
          </div>
          
          <div>
            <Button 
              variant="outline-primary" 
              className="me-2"
              onClick={sendEmailNotification}
            >
              <FaEnvelope className="me-2" /> Send Email
            </Button>
            
            <Button 
              variant="outline-secondary"
              onClick={() => window.print()}
            >
              <FaPrint className="me-2" /> Print
            </Button>
          </div>
        </div>
        
        <Row>
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Order Summary</h4>
                  <Badge className={getOrderStatusColorClass(order.status)}>
                    {getStatusIcon(order.status)} {getOrderStatusLabel(order.status)}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <Row className="mb-4">
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Order ID:</strong> {formatOrderNumber(order.id)}
                    </div>
                    <div className="mb-3">
                      <strong>Order Date:</strong> {formatDate(order.created_at)}
                    </div>
                    <div>
                      <strong>Payment Status:</strong>{' '}
                      <Badge bg={order.payment_status === 'paid' ? 'success' : 'warning'}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </Badge>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Customer:</strong> {order.user?.full_name || 'Unknown'}
                    </div>
                    <div className="mb-3">
                      <strong>Payment Method:</strong> {getPaymentMethodLabel(order.payment_method)}
                    </div>
                    <div>
                      <strong>Payment ID:</strong> {order.payment_intent_id || 'N/A'}
                    </div>
                  </Col>
                </Row>
                
                <h5 className="mb-3">Order Items</h5>
                <Table responsive className="mb-0">
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
                              src={item.product?.image_url || 'https://via.placeholder.com/50x50?text=Product'} 
                              alt={item.product?.name}
                              width="50"
                              height="50"
                              className="me-3 rounded"
                            />
                            <div>
                              <div className="fw-bold">
                                {item.product?.name || 'Unknown Product'}
                              </div>
                              <div className="text-muted small">
                                {item.product?.id ? `ID: ${item.product?.id.substring(0, 8)}` : ''}
                              </div>
                            </div>
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
            
            <Card className="shadow-sm mb-4 mb-lg-0">
              <Card.Header className="bg-white">
                <h4 className="mb-0">Update Order Status</h4>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  <Button 
                    variant={order.status === 'pending' ? 'warning' : 'outline-warning'} 
                    className="d-flex align-items-center"
                    onClick={() => openStatusModal('pending')}
                    disabled={order.status === 'pending'}
                  >
                    <span className="me-2">⏳</span> Pending
                  </Button>
                  
                  <Button 
                    variant={order.status === 'processing' ? 'primary' : 'outline-primary'} 
                    className="d-flex align-items-center"
                    onClick={() => openStatusModal('processing')}
                    disabled={order.status === 'processing'}
                  >
                    <FaTruck className="me-2" /> Processing
                  </Button>
                  
                  <Button 
                    variant={order.status === 'shipping' ? 'info' : 'outline-info'} 
                    className="d-flex align-items-center"
                    onClick={() => openStatusModal('shipping')}
                    disabled={order.status === 'shipping'}
                  >
                    <FaTruck className="me-2" /> Shipping
                  </Button>
                  
                  <Button 
                    variant={order.status === 'delivered' ? 'success' : 'outline-success'} 
                    className="d-flex align-items-center"
                    onClick={() => openStatusModal('delivered')}
                    disabled={order.status === 'delivered'}
                  >
                    <FaCheck className="me-2" /> Delivered
                  </Button>
                  
                  <Button 
                    variant={order.status === 'canceled' ? 'danger' : 'outline-danger'} 
                    className="d-flex align-items-center"
                    onClick={() => openStatusModal('canceled')}
                    disabled={order.status === 'canceled'}
                  >
                    <FaBan className="me-2" /> Canceled
                  </Button>
                </div>
                
                <div className="mt-3">
                  <Alert variant="info">
                    <FaExclamationTriangle className="me-2" />
                    Changing the order status will automatically send an email notification to the customer.
                  </Alert>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h4 className="mb-0">Customer Information</h4>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3 bg-light rounded-circle p-2">
                    <FaUser size={24} className="text-secondary" />
                  </div>
                  <div>
                    <div className="fw-bold">Customer</div>
                    <div>{order.user?.full_name || 'Unknown'}</div>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3 bg-light rounded-circle p-2">
                    <FaMapMarkerAlt size={24} className="text-secondary" />
                  </div>
                  <div>
                    <div className="fw-bold">Shipping Address</div>
                    <div>{formatAddress(order.shipping_address)}</div>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <div className="me-3 bg-light rounded-circle p-2">
                    <FaPhone size={24} className="text-secondary" />
                  </div>
                  <div>
                    <div className="fw-bold">Contact</div>
                    <div>{order.user?.phone_number || 'Phone number not available'}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h4 className="mb-0">Payment Summary</h4>
              </Card.Header>
              <Card.Body>
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
          </Col>
        </Row>
        
        {/* Status Update Confirmation Modal */}
        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Order Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to change the status of order <strong>{formatOrderNumber(order.id)}</strong> from{' '}
              <Badge className={getOrderStatusColorClass(order.status)}>
                {getOrderStatusLabel(order.status)}
              </Badge>{' '}
              to{' '}
              <Badge className={getOrderStatusColorClass(newStatus)}>
                {getOrderStatusLabel(newStatus)}
              </Badge>?
            </p>
            
            <Alert variant="info">
              This will notify the customer via email about the status change.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpdateStatus}
              disabled={updating}
              className="d-flex align-items-center"
            >
              {updating ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : (
                <>
                  <FaCheck className="me-1" /> Update Status
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
};

export default AdminOrderDetail;