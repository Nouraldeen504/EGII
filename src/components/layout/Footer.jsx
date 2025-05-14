import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useSettings } from '../../contexts/SettingsContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col lg={3} md={6} sm={12} className="mb-4">
            <h5>{settings?.store_name || 'Our Shop'}</h5>
            <p>Your one-stop shop for all your needs. Quality products at affordable prices.</p>
            <div className="d-flex mt-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="me-3">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="me-3">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="me-3">
                <FaInstagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin size={20} />
              </a>
            </div>
          </Col>
          <Col lg={3} md={6} sm={12} className="mb-4">
            <h5>Quick Links</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </Col>
          <Col lg={3} md={6} sm={12} className="mb-4">
            <h5>Customer Service</h5>
            <ul>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/shipping">Shipping & Returns</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </Col>
          <Col lg={3} md={6} sm={12} className="mb-4">
            <h5>Contact Us</h5>
            <ul>
              <li>
                <FaMapMarkerAlt className="me-2" /> 
                {settings?.store_adderss || 'Tripoli, Libya'}
              </li>
              <li>
                <FaPhone className="me-2" /> 
                {settings?.store_phone || ''}
              </li>
              <li>
                <FaEnvelope className="me-2" /> 
                {settings?.store_email || ''}
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="mt-4 mb-4" style={{ backgroundColor: '#6c757d', opacity: 0.2 }} />
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {currentYear} {settings?.store_name || 'Our Shop'}. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;