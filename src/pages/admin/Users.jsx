import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Pagination, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaSearch, FaFilter, FaSyncAlt, FaUserPlus, FaUserCog, FaUserTimes, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { profileService } from '../../services/profileService';
import { formatDate, formatPhoneNumber } from '../../utils/helpers';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;
  
  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    isAdmin: '',
    sort: 'created_at:desc'
  });
  
  // State for admin toggling
  const [userToToggle, setUserToToggle] = useState(null);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare filter object for API
        const apiFilters = {
          ...filters,
          isAdmin: filters.isAdmin === 'true' ? true : filters.isAdmin === 'false' ? false : undefined,
          page: currentPage,
          limit: usersPerPage
        };
        
        // Fetch users with filters
        const { data, count } = await profileService.getAllProfiles(apiFilters);
        setUsers(data);
        setTotalUsers(count);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
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
  
  // Handle role filter change
  const handleRoleChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, isAdmin: value }));
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
      isAdmin: '',
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
  
  // Prepare for admin role toggling
  const confirmToggleAdmin = (user) => {
    setUserToToggle(user);
    setShowToggleModal(true);
  };
  
  // Handle admin role toggling
  const handleToggleAdmin = async () => {
    if (!userToToggle) return;
    
    try {
      setUpdating(true);
      
      // Toggle isAdmin status
      const updatedUser = await profileService.toggleAdminStatus(
        userToToggle.id, 
        !userToToggle.is_admin
      );
      
      // Update users list
      setUsers(users.map(user => 
        user.id === updatedUser.id ? { ...user, is_admin: updatedUser.is_admin } : user
      ));
      
      toast.success(
        `${userToToggle.full_name || userToToggle.user.email} is now ${updatedUser.is_admin ? 'an admin' : 'a regular user'}.`
      );
      
      // Close modal and reset
      setShowToggleModal(false);
      setUserToToggle(null);
    } catch (err) {
      console.error('Error toggling admin status:', err);
      toast.error('Failed to update user role. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  
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
  
  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <h1 className="mb-4">Users</h1>
        
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col lg={5} md={6}>
                <Form onSubmit={handleSearch}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Search by name or email..."
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
                  value={filters.isAdmin}
                  onChange={handleRoleChange}
                >
                  <option value="">All Roles</option>
                  <option value="true">Admins Only</option>
                  <option value="false">Regular Users Only</option>
                </Form.Select>
              </Col>
              
              <Col lg={3} md={6}>
                <Form.Select
                  value={filters.sort}
                  onChange={handleSortChange}
                >
                  <option value="created_at:desc">Newest First</option>
                  <option value="created_at:asc">Oldest First</option>
                  <option value="full_name:asc">Name: A-Z</option>
                  <option value="full_name:desc">Name: Z-A</option>
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
            <p className="mt-2">Loading users...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : users.length === 0 ? (
          <Alert variant="info">
            No users found. {filters.search || filters.isAdmin ? 'Try adjusting your filters.' : ''}
          </Alert>
        ) : (
          <>
            <Card className="shadow-sm mb-4">
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="fw-bold">{user.full_name || 'Not provided'}</div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone_number ? formatPhoneNumber(user.phone_number) : 'Not provided'}</td>
                        <td>
                          <Badge bg={user.is_admin ? 'primary' : 'secondary'}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </Badge>
                        </td>
                        <td>{formatDate(user.created_at || user.user?.created_at)}</td>
                        <td className="text-end">
                          <Button 
                            variant={user.is_admin ? 'outline-danger' : 'outline-primary'} 
                            size="sm"
                            onClick={() => confirmToggleAdmin(user)}
                            className="d-flex align-items-center"
                          >
                            {user.is_admin ? (
                              <><FaUserTimes className="me-1" /> Remove Admin</>
                            ) : (
                              <><FaUserCog className="me-1" /> Make Admin</>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
            
            <div className="d-flex justify-content-between align-items-center">
              <div>
                Showing {users.length} of {totalUsers} users
              </div>
              {renderPagination()}
            </div>
          </>
        )}
        
        {/* Admin Role Toggle Confirmation Modal */}
        <Modal show={showToggleModal} onHide={() => setShowToggleModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {userToToggle?.is_admin ? 'Remove Admin Role' : 'Grant Admin Role'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {userToToggle && (
              <>
                <p>
                  Are you sure you want to {userToToggle.is_admin ? 'remove' : 'grant'} admin privileges for{' '}
                  <strong>{userToToggle.full_name || userToToggle.user?.email}</strong>?
                </p>
                
                {userToToggle.is_admin ? (
                  <Alert variant="warning">
                    <FaExclamationTriangle className="me-2" />
                    This user will no longer have administrative privileges and will not be able to access the admin panel.
                  </Alert>
                ) : (
                  <Alert variant="warning">
                    <FaExclamationTriangle className="me-2" />
                    This user will gain administrative privileges and will be able to manage products, orders, categories, and other users.
                  </Alert>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowToggleModal(false)}>
              <FaTimes className="me-1" /> Cancel
            </Button>
            <Button 
              variant={userToToggle?.is_admin ? 'danger' : 'primary'} 
              onClick={handleToggleAdmin}
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
                  <FaCheck className="me-1" /> Confirm
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
};

export default AdminUsers;