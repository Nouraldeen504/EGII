import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaShippingFast, FaCreditCard, FaHeadset, FaUndo } from 'react-icons/fa';
import ProductCard from '../components/products/ProductCard';
import { productService } from '../services/productService';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency } from '../utils/helpers';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { settings, isloading } = useSettings();
  
  
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await productService.getFeaturedProducts(8);
        setFeaturedProducts(data);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedProducts();
  }, []);
  
  if (isloading) return <div>Loading store information...</div>;

  return (
    <div>
      {/* Hero Carousel */}
      <Carousel fade>
        <Carousel.Item>
          <div
            className="d-block w-100 bg-primary"
            style={{ height: '500px' }}
          >
            <Container className="h-100 d-flex align-items-center">
              <div className="text-white">
                <h1 className="display-4 fw-bold">Welcome to {settings?.store_name || 'Our Shop'}</h1>
                <p className="lead">Your one-stop shop for all your needs. Quality products at affordable prices.</p>
                <Button 
                  as={Link} 
                  to="/products" 
                  variant="light" 
                  size="lg"
                  className="mt-3"
                >
                  Shop Now <FaArrowRight className="ms-2" />
                </Button>
              </div>
            </Container>
          </div>
        </Carousel.Item>
        
        <Carousel.Item>
          <div
            className="d-block w-100 bg-success"
            style={{ height: '500px' }}
          >
            <Container className="h-100 d-flex align-items-center">
              <div className="text-white">
                <h1 className="display-4 fw-bold">Summer Sale</h1>
                <p className="lead">Enjoy up to 50% off on selected items. Limited time offer!</p>
                <Button 
                  as={Link} 
                  to="/products" 
                  variant="light" 
                  size="lg"
                  className="mt-3"
                >
                  View Deals <FaArrowRight className="ms-2" />
                </Button>
              </div>
            </Container>
          </div>
        </Carousel.Item>
        
        <Carousel.Item>
          <div
            className="d-block w-100 bg-dark"
            style={{ height: '500px' }}
          >
            <Container className="h-100 d-flex align-items-center">
              <div className="text-white">
                <h1 className="display-4 fw-bold">New Arrivals</h1>
                <p className="lead">Check out our latest products and be the first to get them!</p>
                <Button 
                  as={Link} 
                  to="/products" 
                  variant="light" 
                  size="lg"
                  className="mt-3"
                >
                  Explore <FaArrowRight className="ms-2" />
                </Button>
              </div>
            </Container>
          </div>
        </Carousel.Item>
      </Carousel>
      
      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row>
            <Col md={3} className="mb-4 mb-md-0">
              <Card className="h-100 border-0 shadow-sm text-center">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="mb-3 text-primary">
                    <FaShippingFast size={40} />
                  </div>
                  <Card.Title>Free Shipping</Card.Title>
                  <Card.Text>
                    On orders above {formatCurrency(settings?.free_shipping_threshold, settings?.currency)}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} className="mb-4 mb-md-0">
              <Card className="h-100 border-0 shadow-sm text-center">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="mb-3 text-primary">
                    <FaCreditCard size={40} />
                  </div>
                  <Card.Title>Secure Payment</Card.Title>
                  <Card.Text>
                    100% secure payment
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3} className="mb-4 mb-md-0">
              <Card className="h-100 border-0 shadow-sm text-center">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="mb-3 text-primary">
                    <FaHeadset size={40} />
                  </div>
                  <Card.Title>24/7 Support</Card.Title>
                  <Card.Text>
                    Dedicated support
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm text-center">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="mb-3 text-primary">
                    <FaUndo size={40} />
                  </div>
                  <Card.Title>Easy Returns</Card.Title>
                  <Card.Text>
                    30 day return policy
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Featured Products Section */}
      <section className="py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Featured Products</h2>
            <Button 
              as={Link} 
              to="/products" 
              variant="outline-primary"
              className="d-flex align-items-center"
            >
              View All <FaArrowRight className="ms-2" />
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : featuredProducts.length === 0 ? (
            <Alert variant="info">
              No featured products available at the moment.
            </Alert>
          ) : (
            <Row>
              {featuredProducts.map(product => (
                <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>
    </div>
  );
};

export default HomePage;