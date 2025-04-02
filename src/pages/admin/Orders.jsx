import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Dropdown, Badge, Pagination, Alert, Spinner, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaSyncAlt, FaEye, FaTruck, FaCheck, FaTimes, FaBan } from 'react-icons/fa';
import { orderService } from '../../services/orderService';
import { notificationService } from '../../services/notificationService';
import { formatCurrency, formatDate, formatOrderNumber, getOrderStatusLabel, getOrderStatusColorClass } from '../../utils/helpers';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 10;
  
  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sort: 'created_at:desc'
  });
  
  // State for order status update
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare filter object for API
        const apiFilters = {
          ...filters,
          page: currentPage,
          limit: ordersPerPage
        };
        
        // Fetch orders with filters
        const { data, count } = await orderService.getAllOrders(apiFilters);
        setOrders(data);
        setTotalOrders(count);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [filters, currentPage]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle status filter change
  const handleStatusChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, status: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, sort: value }));
    setCurrentPage(1); // Reset to first page when sort changes
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      sort: 'created_at:desc'
    });
    setCurrentPage(1);
  };
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the page
    window.scrollTo(0, 0);
  };
  
  // Open status update modal
  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };
  
  // Handle order status update
  const handleUpdateStatus = async () => {
    if (!selectedOrder || selectedOrder.status === newStatus) {
      setShowStatusModal(false);
      return;
    }
    
    try {
      setUpdating(true);
      
      // Update order status
      const updatedOrder = await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      
      // Update orders list
      setOrders(orders.map(order => 
        order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order
      ));
      
      // Send notification to customer about status change
      await notificationService.sendOrderStatusUpdate(
        updatedOrder.id, 
        updatedOrder.status,
        selectedOrder.user.email
      );
      
      toast.success(`Order status updated to ${getOrderStatusLabel(newStatus)}!`);
      
      // Close modal and reset
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  
  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    let items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );
    
    // First page
    items.push(
      <Pagination.Item
        key={1}
        active={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        1
      </Pagination.Item>
    );
    
    // Ellipsis if needed
    if (currentPage > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
    }
    
    // Pages around current page
    for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page++) {
      if (page === 1 || page === totalPages) continue;
      
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }
    
    // Ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
    }
    
    // Last page if more than one page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    
    return <Pagination>{items}</Pagination>;
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
        <h1 className="mb-4">Orders</h1>
        
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col lg={5} md={6}>
                <Form onSubmit={handleSearch}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Search by order ID or customer email..."
                      value={filters.search}
                      onChange={handleSearchChange}
                    />
                    <Button variant="primary" type="submit">
                      <FaSearch />
                    </Button>
                  </InputGroup>
                </Form>
              </Col>
              
              <Col lg={3} md={6}>
                <Form.Select
                  value={filters.status}
                  onChange={handleStatusChange}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipping">Shipping</option>
                  <option value="delivered">Delivered</option>
                  <option value="canceled">Canceled</option>
                </Form.Select>
              </Col>
              
              <Col lg={3} md={6}>
                <Form.Select
                  value={filters.sort}
                  onChange={handleSortChange}
                >
                  <option value="created_at:desc">Newest First</option>
                  <option value="created_at:asc">Oldest First</option>
                  <option value="total_amount:desc">Amount: High to Low</option>
                  <option value="total_amount:asc">Amount: Low to High</option>
                </Form.Select>
              </Col>
              
              <Col lg={1} md={6} className="d-flex justify-content-end">
                <Button 
                  variant="outline-secondary" 
                  onClick={resetFilters}
                  className="w-100 d-flex align-items-center justify-content-center"
                >
                  <FaSyncAlt />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading orders...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : orders.length === 0 ? (
          <Alert variant="info">
            No orders found. {filters.search || filters.status ? 'Try adjusting your filters.' : ''}
          </Alert>
        ) : (
          <>
            <Card className="shadow-sm mb-4">
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <Link to={`/admin/orders/${order.id}`} className="text-decoration-none">
                            {formatOrderNumber(order.id)}
                          </Link>
                        </td>
                        <td>{order.user?.full_name || 'Unknown'}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>{formatCurrency(order.total_amount)}</td>
                        <td>
                          <Badge className={getOrderStatusColorClass(order.status)}>
                            {getStatusIcon(order.status)} {getOrderStatusLabel(order.status)}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={order.payment_status === 'paid' ? 'success' : 'warning'}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end">
                            <Dropdown className="me-2">
                              <Dropdown.Toggle 
                                variant="outline-primary" 
                                size="sm"
                                id={`dropdown-${order.id}`}
                              >
                                Update Status
                              </Dropdown.Toggle>
                              
                              <Dropdown.Menu>
                                <Dropdown.Item 
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setNewStatus('pending');
                                    setShowStatusModal(true);
                                  }}
                                  active={order.status === 'pending'}
                                >
                                  Pending
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setNewStatus('processing');
                                    setShowStatusModal(true);
                                  }}
                                  active={order.status === 'processing'}
                                >
                                  Processing
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setNewStatus('shipping');
                                    setShowStatusModal(true);
                                  }}
                                  active={order.status === 'shipping'}
                                >
                                  Shipping
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setNewStatus('delivered');
                                    setShowStatusModal(true);
                                  }}
                                  active={order.status === 'delivered'}
                                >
                                  Delivered
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setNewStatus('canceled');
                                    setShowStatusModal(true);
                                  }}
                                  active={order.status === 'canceled'}
                                  className="text-danger"
                                >
                                  Canceled
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            
                            <Button 
                              as={Link}
                              to={`/admin/orders/${order.id}`}
                              variant="outline-secondary" 
                              size="sm"
                              className="d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                            >
                              <FaEye />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
            
            <div className="d-flex justify-content-between align-items-center">
              <div>
                Showing {orders.length} of {totalOrders} orders
              </div>
              {renderPagination()}
            </div>
          </>
        )}
        
        {/* Status Update Confirmation Modal */}
        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Order Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <p>
                  Are you sure you want to change the status of order <strong>{formatOrderNumber(selectedOrder.id)}</strong> from{' '}
                  <Badge className={getOrderStatusColorClass(selectedOrder.status)}>
                    {getOrderStatusLabel(selectedOrder.status)}
                  </Badge>{' '}
                  to{' '}
                  <Badge className={getOrderStatusColorClass(newStatus)}>
                    {getOrderStatusLabel(newStatus)}
                  </Badge>?
                </p>
                
                <Alert variant="info">
                  This will notify the customer via email about the status change.
                </Alert>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              <FaTimes className="me-1" /> Cancel
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

export default AdminOrders;