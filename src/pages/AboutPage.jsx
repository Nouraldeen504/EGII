import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import { FaUsers, FaHandshake, FaClipboardCheck, FaStar } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <h1 className="mb-4">About ShopEase</h1>
          <p className="lead">
            ShopEase is your trusted online marketplace, offering a wide range of quality products at competitive prices.
          </p>
          <p>
            Founded in 2023, we've quickly grown to become one of the leading e-commerce platforms, focusing on customer satisfaction, quality products, and an enjoyable shopping experience.
          </p>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col md={6} className="mb-4 mb-md-0">
          <Image 
            src="https://via.placeholder.com/600x400?text=Our+Store" 
            alt="Our Store" 
            fluid 
            rounded 
            className="shadow"
          />
        </Col>
        <Col md={6}>
          <h2 className="mb-3">Our Story</h2>
          <p>
            ShopEase was born from a simple idea: make online shopping easy, enjoyable, and accessible to everyone. Our founders, experienced in e-commerce and customer service, identified common pain points in online shopping and set out to create a better experience.
          </p>
          <p>
            What started as a small online store has grown into a comprehensive marketplace, but our core values remain the same. We believe in quality, transparency, and putting our customers first in everything we do.
          </p>
          <p>
            Today, we offer thousands of products across multiple categories, serving customers worldwide with our commitment to excellence and customer satisfaction.
          </p>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">Our Mission & Values</h2>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="mb-3 text-primary">
                <FaUsers size={40} />
              </div>
              <Card.Title>Customer First</Card.Title>
              <Card.Text>
                We prioritize customer satisfaction in every decision we make. Our goal is to exceed your expectations at every touchpoint.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="mb-3 text-primary">
                <FaClipboardCheck size={40} />
              </div>
              <Card.Title>Quality Assurance</Card.Title>
              <Card.Text>
                We carefully select and verify all products on our platform to ensure they meet our high standards for quality and value.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="mb-3 text-primary">
                <FaHandshake size={40} />
              </div>
              <Card.Title>Transparency</Card.Title>
              <Card.Text>
                We believe in honest communication, fair pricing, and clear policies. No hidden fees or complicated terms.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="mb-3 text-primary">
                <FaStar size={40} />
              </div>
              <Card.Title>Innovation</Card.Title>
              <Card.Text>
                We continuously improve our platform and processes to provide the best possible shopping experience.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col>
          <h2 className="mb-4">Our Team</h2>
          <p>
            Behind ShopEase is a diverse and dedicated team of professionals passionate about e-commerce and customer experience. From our product curators and tech experts to our customer service representatives and logistics specialists, each member plays a vital role in making ShopEase what it is today.
          </p>
          <p>
            We're united by our commitment to excellence and our belief that online shopping should be easy, secure, and enjoyable for everyone.
          </p>
        </Col>
      </Row>
      
      <Row>
        <Col md={4} className="mb-4 mb-md-0">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h4 className="mb-3">100,000+</h4>
              <p className="mb-0">Happy customers served worldwide</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4 mb-md-0">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h4 className="mb-3">5,000+</h4>
              <p className="mb-0">Quality products available</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h4 className="mb-3">50+</h4>
              <p className="mb-0">Countries we ship to</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;