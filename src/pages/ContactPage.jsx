import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { notificationService } from '../services/notificationService';
import { toast } from 'react-toastify';

// Schema for contact form validation
const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name is too short'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  subject: Yup.string()
    .required('Subject is required')
    .min(5, 'Subject is too short'),
  message: Yup.string()
    .required('Message is required')
    .min(20, 'Please provide more details in your message')
});

const ContactPage = () => {
  const [formSuccess, setFormSuccess] = useState(false);
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // In a real application, this would send the form data to a server
      // For demo purposes, we'll just simulate a success response
      
      await notificationService.sendContactFormNotification(values);
      
      setFormSuccess(true);
      resetForm();
      toast.success('Thank you! Your message has been sent successfully.');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast.error('Failed to send your message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <h1 className="mb-4">Contact Us</h1>
          <p className="lead">
            We'd love to hear from you! Whether you have a question about our products, 
            need help with an order, or want to provide feedback, our team is here to assist you.
          </p>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8} className="mb-5 mb-lg-0">
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="mb-4">Get in Touch</h2>
              
              {formSuccess && (
                <Alert variant="success" className="mb-4">
                  Thank you for your message! We'll get back to you as soon as possible.
                </Alert>
              )}
              
              <Formik
                initialValues={{ name: '', email: '', subject: '', message: '' }}
                validationSchema={ContactSchema}
                onSubmit={handleSubmit}
              >
                {({ handleSubmit, handleChange, handleBlur, values, touched, errors, isSubmitting }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="name">
                          <Form.Label>Your Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.name && !!errors.name}
                            placeholder="Enter your name"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.email && !!errors.email}
                            placeholder="Enter your email"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3" controlId="subject">
                      <Form.Label>Subject</Form.Label>
                      <Form.Control
                        type="text"
                        name="subject"
                        value={values.subject}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.subject && !!errors.subject}
                        placeholder="What is your message about?"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.subject}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-4" controlId="message">
                      <Form.Label>Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        name="message"
                        value={values.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.message && !!errors.message}
                        placeholder="Please provide details about your inquiry..."
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <div className="d-grid">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body className="p-4">
              <h3 className="mb-4">Contact Information</h3>
              
              <div className="d-flex mb-4">
                <div className="me-3 text-primary">
                  <FaMapMarkerAlt size={24} />
                </div>
                <div>
                  <h5 className="mb-1">Address</h5>
                  <p className="mb-0">
                    123 Commerce Street<br />
                    Suite 100<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                </div>
              </div>
              
              <div className="d-flex mb-4">
                <div className="me-3 text-primary">
                  <FaPhone size={24} />
                </div>
                <div>
                  <h5 className="mb-1">Phone</h5>
                  <p className="mb-0">
                    <a href="tel:+11234567890" className="text-decoration-none">
                      +1 (123) 456-7890
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="d-flex mb-4">
                <div className="me-3 text-primary">
                  <FaEnvelope size={24} />
                </div>
                <div>
                  <h5 className="mb-1">Email</h5>
                  <p className="mb-0">
                    <a href="mailto:info@shopease.com" className="text-decoration-none">
                      info@shopease.com
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="d-flex">
                <div className="me-3 text-primary">
                  <FaClock size={24} />
                </div>
                <div>
                  <h5 className="mb-1">Business Hours</h5>
                  <p className="mb-0">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm bg-light">
            <Card.Body className="p-4">
              <h3 className="mb-3">Customer Support</h3>
              <p className="mb-0">
                Our customer support team is available Monday through Friday from 9:00 AM to 6:00 PM Eastern Time to assist you with any questions or concerns.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-5">
        <Col>
          <h3 className="mb-4">Frequently Asked Questions</h3>
          
          <div className="mb-4">
            <h5>What payment methods do you accept?</h5>
            <p>
              We accept all major credit cards, including Visa, MasterCard, American Express, and Discover. We also accept PayPal for secure online payments.
            </p>
          </div>
          
          <div className="mb-4">
            <h5>How long does shipping take?</h5>
            <p>
              Standard shipping typically takes 3-5 business days, depending on your location. Expedited shipping options are available at checkout for faster delivery.
            </p>
          </div>
          
          <div className="mb-4">
            <h5>What is your return policy?</h5>
            <p>
              We offer a 30-day return policy for most items. Products must be in their original condition with all packaging and tags intact. Please visit our Returns page for more information.
            </p>
          </div>
          
          <div>
            <h5>Do you ship internationally?</h5>
            <p>
              Yes, we ship to most countries worldwide. International shipping times and fees vary depending on the destination. Additional customs fees may apply.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactPage;