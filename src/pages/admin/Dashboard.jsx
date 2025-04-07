import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaShoppingCart, FaUsers, FaExclamationTriangle, FaDollarSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { profileService } from '../../services/profileService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    orders: {
      total: 0,
      today: 0,
      pending: 0
    },
    revenue: {
      total: 0,
      today: 0
    },
    users: {
      total: 0,
      new: 0
    }
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch order statistics
        const orderStats = await orderService.getOrderStats();
        
        // Fetch user statistics
        const userStats = await profileService.getUserStats();
        
        // Fetch low stock products
        const lowStock = await productService.getLowStockProducts(5);
        
        // Fetch recent orders
        const { data: allOrders } = await orderService.getAllOrders({
          sortBy: 'created_at:desc',
          limit: 5
        });
        
        setStatistics({
          orders: {
            total: orderStats.totalOrders,
            today: orderStats.todayOrders,
            pending: orderStats.pendingOrders
          },
          revenue: {
            total: orderStats.totalRevenue,
            today: orderStats.todayRevenue
          },
          users: {
            total: userStats.totalUsers,
            new: userStats.newUsers
          }
        });
        
        setRecentOrders(allOrders || []);
        setLowStockProducts(lowStock || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const getDailyChange = (today, total) => {
    if (total === 0) return 0;
    // This is a simplified way to estimate daily change
    // In a real app, you'd compare to yesterday's data
    const avgDaily = total / 30; // Assume 30 day month
    return ((today - avgDaily) / avgDaily) * 100;
  };
  
  const revenueChange = getDailyChange(statistics.revenue.today, statistics.revenue.total);
  const ordersChange = getDailyChange(statistics.orders.today, statistics.orders.total);
  
  if (loading) {
    return (
      <AdminLayout>
        <Container className="py-4 text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading dashboard data...</p>
        </Container>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout>
        <Container className="py-4">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <h1 className="mb-4">Dashboard</h1>
        
        {/* Stats Cards */}
        <Row className="mb-4">
          <Col xl={3} md={6} className="mb-4 mb-xl-0">
            <Card className="stats-card h-100 revenue">
              <Card.Body>
                <Row>
                  <Col>
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">{formatCurrency(statistics.revenue.total)}</div>
                    <div className="d-flex align-items-center mt-2">
                      <div className={revenueChange >= 0 ? 'text-success' : 'text-danger'}>
                        {revenueChange >= 0 ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                        {Math.abs(revenueChange).toFixed(1)}%
                      </div>
                      <div className="text-muted ms-2">vs. avg day</div>
                    </div>
                  </Col>
                  <Col xs="auto">
                    <div className="stat-icon text-success">
                      <FaDollarSign />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} md={6} className="mb-4 mb-xl-0">
            <Card className="stats-card h-100 orders">
              <Card.Body>
                <Row>
                  <Col>
                    <div className="stat-label">Total Orders</div>
                    <div className="stat-value">{statistics.orders.total}</div>
                    <div className="d-flex align-items-center mt-2">
                      <div className={ordersChange >= 0 ? 'text-success' : 'text-danger'}>
                        {ordersChange >= 0 ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                        {Math.abs(ordersChange).toFixed(1)}%
                      </div>
                      <div className="text-muted ms-2">vs. avg day</div>
                    </div>
                  </Col>
                  <Col xs="auto">
                    <div className="stat-icon text-warning">
                      <FaShoppingCart />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} md={6} className="mb-4 mb-xl-0">
            <Card className="stats-card h-100 products">
              <Card.Body>
                <Row>
                  <Col>
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{statistics.users.total}</div>
                    <div className="mt-2">
                      <span className="text-success">{statistics.users.new}</span>
                      <span className="text-muted ms-2">new this month</span>
                    </div>
                  </Col>
                  <Col xs="auto">
                    <div className="stat-icon text-primary">
                      <FaUsers />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} md={6}>
            <Card className="stats-card h-100 alerts">
              <Card.Body>
                <Row>
                  <Col>
                    <div className="stat-label">Pending Orders</div>
                    <div className="stat-value">{statistics.orders.pending}</div>
                    <div className="mt-2">
                      <span className="text-warning">{lowStockProducts.length}</span>
                      <span className="text-muted ms-2">low stock alerts</span>
                    </div>
                  </Col>
                  <Col xs="auto">
                    <div className="stat-icon text-danger">
                      <FaExclamationTriangle />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row>
          <Col xl={8} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Recent Orders</h5>
              </Card.Header>
              <Card.Body>
                {recentOrders.length === 0 ? (
                  <Alert variant="info">No recent orders found.</Alert>
                ) : (
                  <Table responsive className="table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.id}>
                          <td>
                            <Link to={`/admin/orders/${order.id}`}>
                              #{order.id.substring(0, 8)}
                            </Link>
                          </td>
                          <td>{order.user_full_name || 'Unknown'}</td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>{formatCurrency(order.total_amount)}</td>
                          <td>
                            <span className={`badge status-${order.status}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                
                <div className="text-end mt-3">
                  <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">
                    View All Orders
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={4}>
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Low Stock Alerts</h5>
              </Card.Header>
              <Card.Body>
                {lowStockProducts.length === 0 ? (
                  <Alert variant="success">All products are well stocked!</Alert>
                ) : (
                  <Table responsive className="table-hover">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map(product => (
                        <tr key={product.id}>
                          <td>
                            <Link to={`/admin/products/edit/${product.id}`}>
                              {product.name}
                            </Link>
                          </td>
                          <td>
                            <span className={product.stock_quantity <= 0 ? 'text-danger' : 'text-warning'}>
                              {product.stock_quantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                
                <div className="text-end mt-3">
                  <Link to="/admin/products" className="btn btn-sm btn-outline-primary">
                    Manage Inventory
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;