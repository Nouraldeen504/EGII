import { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBoxOpen, 
  FaListAlt, 
  FaShoppingCart, 
  FaUser,
  FaUsers, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaHome
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const AdminLayout = ({ children }) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if admin, otherwise redirect
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
      toast.error('You do not have access to the admin panel.');
      return;
    }
  }, [user, isAdmin, navigate, location]);
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
    toast.info('You have been signed out');
  };
  
  const closeSidebarIfMobile = () => {
    if (isMobile) {
      setShowSidebar(false);
    }
  };
  
  if (!user || !isAdmin) {
    return null;
  }
  
  return (
    <div className="admin-layout d-flex">
      {/* Sidebar */}
      <div 
        className={`admin-sidebar bg-dark text-white ${showSidebar ? 'd-flex' : 'd-none'}`} 
        style={{ 
          width: isMobile ? '100%' : '250px', 
          position: isMobile ? 'fixed' : 'sticky',
          height: isMobile ? '100%' : '100vh',
          top: 0,
          zIndex: 1030,
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        {isMobile && (
          <Offcanvas 
            show={showSidebar} 
            onHide={() => setShowSidebar(false)}
            className="bg-dark text-white"
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title>Admin Panel</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <AdminSidebarContent 
                location={location} 
                onNavigate={closeSidebarIfMobile} 
                onLogout={handleLogout}
              />
            </Offcanvas.Body>
          </Offcanvas>
        )}
        
        {!isMobile && (
          <AdminSidebarContent 
            location={location} 
            onNavigate={closeSidebarIfMobile}
            onLogout={handleLogout}
          />
        )}
      </div>
      
      {/* Main Content */}
      <div className="admin-content flex-grow-1">
        <Navbar bg="white" expand={false} className="shadow-sm mb-4">
          <Container fluid>
            {isMobile && (
              <Button 
                variant="outline-dark" 
                onClick={() => setShowSidebar(true)}
                className="me-2"
              >
                <FaBars />
              </Button>
            )}
            
            <Navbar.Brand as={Link} to="/admin" className="me-auto">
              Optech Admin
            </Navbar.Brand>
            
            <Link to="/" className="btn btn-outline-primary me-2">
              <FaHome /> View Store
            </Link>
            <Link to="/profile" className="btn btn-outline-primary me-2">
              <FaUser /> Profile
            </Link>
{/*             
            <Button 
              variant="outline-danger" 
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Logout
            </Button> */}
          </Container>
        </Navbar>
        
        <div className="admin-main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Sidebar content component
const AdminSidebarContent = ({ location, onNavigate, onLogout }) => {
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <>
      <div className="p-3 border-bottom">
        <h4 className="mb-0">Admin Panel</h4>
        <p className="text-white-50 small mb-0">Manage your store</p>
      </div>
      
      <Nav className="flex-column p-3">
        <Nav.Link 
          as={Link} 
          to="/admin" 
          className={`d-flex align-items-center ${isActive('/admin') ? 'active' : ''}`}
          onClick={onNavigate}
        >
          <FaTachometerAlt className="me-2" /> Dashboard
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/products" 
          className={`d-flex align-items-center ${isActive('/admin/products') ? 'active' : ''}`}
          onClick={onNavigate}
        >
          <FaBoxOpen className="me-2" /> Products
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/categories" 
          className={`d-flex align-items-center ${isActive('/admin/categories') ? 'active' : ''}`}
          onClick={onNavigate}
        >
          <FaListAlt className="me-2" /> Categories
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/orders" 
          className={`d-flex align-items-center ${isActive('/admin/orders') ? 'active' : ''}`}
          onClick={onNavigate}
        >
          <FaShoppingCart className="me-2" /> Orders
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/users" 
          className={`d-flex align-items-center ${isActive('/admin/users') ? 'active' : ''}`}
          onClick={onNavigate}
        >
          <FaUsers className="me-2" /> Users
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/settings" 
          className={`d-flex align-items-center ${isActive('/admin/settings') ? 'active' : ''}`}
          onClick={onNavigate}
        >
          <FaCog className="me-2" /> Settings
        </Nav.Link>
      </Nav>
      
      <div className="mt-auto p-3 border-top">
        <Button 
          variant="outline-light" 
          onClick={onLogout}
          className="w-100 d-flex align-items-center justify-content-center"
        >
          <FaSignOutAlt className="me-2" /> Sign Out
        </Button>
      </div>
    </>
  );
};

export default AdminLayout;