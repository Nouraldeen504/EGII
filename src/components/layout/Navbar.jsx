import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaSignInAlt, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-toastify';

const NavbarComponent = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed out successfully!');
      navigate('/');
    }
    setExpanded(false);
  };

  const collapseNavbar = () => setExpanded(false);

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm py-3" expanded={expanded} onToggle={setExpanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={collapseNavbar}>
          <strong className="text-primary">Optech</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={collapseNavbar}>Home</Nav.Link>
            <Nav.Link as={Link} to="/products" onClick={collapseNavbar}>Products</Nav.Link>
            <Nav.Link as={Link} to="/about" onClick={collapseNavbar}>About</Nav.Link>
            <Nav.Link as={Link} to="/contact" onClick={collapseNavbar}>Contact</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/cart" className="me-3 cart-icon-container" onClick={collapseNavbar}>
              <FaShoppingCart />
              {cartCount > 0 && (
                <Badge pill className="cart-badge">
                  {cartCount}
                </Badge>
              )}
            </Nav.Link>
            
            {user ? (
              <>
                {isAdmin && (
                  <Nav.Link as={Link} to="/admin" className="me-3" onClick={collapseNavbar}>
                    <FaTachometerAlt /> Admin
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to="/profile" className="me-3" onClick={collapseNavbar}>
                  <FaUser /> Profile
                </Nav.Link>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="d-flex align-items-center"
                >
                  <FaSignOutAlt className="me-1" /> Sign Out
                </Button>
              </>
            ) : (
              <Button 
                as={Link}
                to="/login" 
                variant="primary"
                size="sm"
                className="d-flex align-items-center"
                onClick={collapseNavbar}
              >
                <FaSignInAlt className="me-1" /> Sign In
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;