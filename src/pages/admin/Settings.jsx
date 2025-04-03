import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab, Badge} from 'react-bootstrap';
import { FaSave, FaEnvelope, FaStore, FaTruck, FaCreditCard } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';

// Validation schema for store settings
const StoreSettingsSchema = Yup.object().shape({
  storeName: Yup.string()
    .required('Store name is required')
    .min(2, 'Store name is too short'),
  storeEmail: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  storePhone: Yup.string()
    .required('Phone number is required'),
  storeAddress: Yup.string()
    .required('Address is required'),
  currency: Yup.string()
    .required('Currency is required')
});

// Validation schema for shipping settings
const ShippingSettingsSchema = Yup.object().shape({
  freeShippingThreshold: Yup.number()
    .required('Free shipping threshold is required')
    .min(0, 'Must be a positive number'),
  standardShippingRate: Yup.number()
    .required('Standard shipping rate is required')
    .min(0, 'Must be a positive number'),
  expressShippingRate: Yup.number()
    .required('Express shipping rate is required')
    .min(0, 'Must be a positive number')
});

// Validation schema for payment settings
const PaymentSettingsSchema = Yup.object().shape({
  stripePublicKey: Yup.string()
    .required('Stripe public key is required'),
  stripeSecretKey: Yup.string()
    .required('Stripe secret key is required'),
  paypalClientId: Yup.string()
    .required('PayPal client ID is required')
});

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Store settings initial values (would come from database in a real app)
  const storeSettings = {
    storeName: 'ShopEase',
    storeEmail: 'info@shopease.com',
    storePhone: '123-456-7890',
    storeAddress: '123 Commerce St, New York, NY 10001, USA',
    currency: 'USD',
    enableTaxes: true,
    taxRate: 7
  };
  
  // Shipping settings initial values
  const shippingSettings = {
    freeShippingThreshold: 100,
    standardShippingRate: 10,
    expressShippingRate: 25,
    enableInternationalShipping: true,
    internationalShippingRate: 30
  };
  
  // Payment settings initial values
  const paymentSettings = {
    enableCreditCard: true,
    enablePaypal: true,
    stripePublicKey: 'pk_test_your_stripe_public_key',
    stripeSecretKey: 'sk_test_your_stripe_secret_key',
    paypalClientId: 'your_paypal_client_id'
  };
  
  // Handle store settings submission
  const handleStoreSettingsSubmit = (values, { setSubmitting }) => {
    // In a real app, this would save to the database
    setTimeout(() => {
      console.log('Store settings saved:', values);
      setSaveSuccess(true);
      toast.success('Store settings saved successfully!');
      setSubmitting(false);
      
      // Reset success message after a delay
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };
  
  // Handle shipping settings submission
  const handleShippingSettingsSubmit = (values, { setSubmitting }) => {
    // In a real app, this would save to the database
    setTimeout(() => {
      console.log('Shipping settings saved:', values);
      setSaveSuccess(true);
      toast.success('Shipping settings saved successfully!');
      setSubmitting(false);
      
      // Reset success message after a delay
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };
  
  // Handle payment settings submission
  const handlePaymentSettingsSubmit = (values, { setSubmitting }) => {
    // In a real app, this would save to the database
    setTimeout(() => {
      console.log('Payment settings saved:', values);
      setSaveSuccess(true);
      toast.success('Payment settings saved successfully!');
      setSubmitting(false);
      
      // Reset success message after a delay
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };
  
  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <h1 className="mb-4">Store Settings</h1>
        
        {saveSuccess && (
          <Alert variant="success" className="mb-4">
            Settings saved successfully!
          </Alert>
        )}
        
        <Card className="shadow-sm">
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
            >
              <Tab eventKey="store" title="General Settings">
                <Formik
                  initialValues={storeSettings}
                  validationSchema={StoreSettingsSchema}
                  onSubmit={handleStoreSettingsSubmit}
                >
                  {({ handleSubmit, handleChange, handleBlur, values, touched, errors, isSubmitting }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="storeName">
                            <Form.Label>Store Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="storeName"
                              value={values.storeName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.storeName && !!errors.storeName}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.storeName}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="currency">
                            <Form.Label>Currency</Form.Label>
                            <Form.Select
                              name="currency"
                              value={values.currency}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.currency && !!errors.currency}
                            >
                              <option value="USD">USD - US Dollar</option>
                              <option value="EUR">EUR - Euro</option>
                              <option value="GBP">GBP - British Pound</option>
                              <option value="CAD">CAD - Canadian Dollar</option>
                              <option value="AUD">AUD - Australian Dollar</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {errors.currency}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Form.Group className="mb-3" controlId="storeEmail">
                        <Form.Label>Store Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="storeEmail"
                          value={values.storeEmail}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.storeEmail && !!errors.storeEmail}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.storeEmail}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="storePhone">
                        <Form.Label>Store Phone</Form.Label>
                        <Form.Control
                          type="text"
                          name="storePhone"
                          value={values.storePhone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.storePhone && !!errors.storePhone}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.storePhone}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="storeAddress">
                        <Form.Label>Store Address</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="storeAddress"
                          value={values.storeAddress}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.storeAddress && !!errors.storeAddress}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.storeAddress}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="switch"
                          id="enableTaxes"
                          label="Enable Taxes"
                          name="enableTaxes"
                          checked={values.enableTaxes}
                          onChange={handleChange}
                        />
                      </Form.Group>
                      
                      {values.enableTaxes && (
                        <Form.Group className="mb-3" controlId="taxRate">
                          <Form.Label>Tax Rate (%)</Form.Label>
                          <Form.Control
                            type="number"
                            name="taxRate"
                            value={values.taxRate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            step="0.1"
                            min="0"
                          />
                        </Form.Group>
                      )}
                      
                      <div className="d-grid">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={isSubmitting}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <FaSave className="me-2" /> 
                          {isSubmitting ? 'Saving...' : 'Save Settings'}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Tab>
              
              <Tab eventKey="shipping" title="Shipping Settings">
                <Formik
                  initialValues={shippingSettings}
                  validationSchema={ShippingSettingsSchema}
                  onSubmit={handleShippingSettingsSubmit}
                >
                  {({ handleSubmit, handleChange, handleBlur, values, touched, errors, isSubmitting }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="freeShippingThreshold">
                            <Form.Label>Free Shipping Threshold</Form.Label>
                            <Form.Control
                              type="number"
                              name="freeShippingThreshold"
                              value={values.freeShippingThreshold}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.freeShippingThreshold && !!errors.freeShippingThreshold}
                              min="0"
                              step="0.01"
                            />
                            <Form.Text className="text-muted">
                              Orders above this amount qualify for free shipping
                            </Form.Text>
                            <Form.Control.Feedback type="invalid">
                              {errors.freeShippingThreshold}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="standardShippingRate">
                            <Form.Label>Standard Shipping Rate</Form.Label>
                            <Form.Control
                              type="number"
                              name="standardShippingRate"
                              value={values.standardShippingRate}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.standardShippingRate && !!errors.standardShippingRate}
                              min="0"
                              step="0.01"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.standardShippingRate}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="expressShippingRate">
                            <Form.Label>Express Shipping Rate</Form.Label>
                            <Form.Control
                              type="number"
                              name="expressShippingRate"
                              value={values.expressShippingRate}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.expressShippingRate && !!errors.expressShippingRate}
                              min="0"
                              step="0.01"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.expressShippingRate}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="switch"
                              id="enableInternationalShipping"
                              label="Enable International Shipping"
                              name="enableInternationalShipping"
                              checked={values.enableInternationalShipping}
                              onChange={handleChange}
                              className="mb-2"
                            />
                            
                            {values.enableInternationalShipping && (
                              <Form.Control
                                type="number"
                                name="internationalShippingRate"
                                value={values.internationalShippingRate}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="International Shipping Rate"
                              />
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <div className="d-grid">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={isSubmitting}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <FaTruck className="me-2" /> 
                          {isSubmitting ? 'Saving...' : 'Save Shipping Settings'}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Tab>
              
              <Tab eventKey="payment" title="Payment Settings">
                <Formik
                  initialValues={paymentSettings}
                  validationSchema={PaymentSettingsSchema}
                  onSubmit={handlePaymentSettingsSubmit}
                >
                  {({ handleSubmit, handleChange, handleBlur, values, touched, errors, isSubmitting }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <Form.Check
                          type="switch"
                          id="enableCreditCard"
                          label="Enable Credit Card Payments"
                          name="enableCreditCard"
                          checked={values.enableCreditCard}
                          onChange={handleChange}
                          className="mb-2"
                        />
                        
                        <Form.Check
                          type="switch"
                          id="enablePaypal"
                          label="Enable PayPal Payments"
                          name="enablePaypal"
                          checked={values.enablePaypal}
                          onChange={handleChange}
                        />
                      </div>
                      
                      {values.enableCreditCard && (
                        <div className="border-top pt-3 mb-3">
                          <h5 className="mb-3">Stripe Settings</h5>
                          
                          <Form.Group className="mb-3" controlId="stripePublicKey">
                            <Form.Label>Stripe Public Key</Form.Label>
                            <Form.Control
                              type="text"
                              name="stripePublicKey"
                              value={values.stripePublicKey}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.stripePublicKey && !!errors.stripePublicKey}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.stripePublicKey}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <Form.Group className="mb-3" controlId="stripeSecretKey">
                            <Form.Label>Stripe Secret Key</Form.Label>
                            <Form.Control
                              type="password"
                              name="stripeSecretKey"
                              value={values.stripeSecretKey}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.stripeSecretKey && !!errors.stripeSecretKey}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.stripeSecretKey}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      )}
                      
                      {values.enablePaypal && (
                        <div className="border-top pt-3 mb-3">
                          <h5 className="mb-3">PayPal Settings</h5>
                          
                          <Form.Group className="mb-3" controlId="paypalClientId">
                            <Form.Label>PayPal Client ID</Form.Label>
                            <Form.Control
                              type="text"
                              name="paypalClientId"
                              value={values.paypalClientId}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.paypalClientId && !!errors.paypalClientId}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.paypalClientId}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      )}
                      
                      <div className="d-grid">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={isSubmitting}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <FaCreditCard className="me-2" /> 
                          {isSubmitting ? 'Saving...' : 'Save Payment Settings'}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Tab>
              
              <Tab eventKey="email" title="Email Settings">
                <Alert variant="info" className="mb-4">
                  <FaEnvelope className="me-2" />
                  Email settings are configured through Supabase Edge Functions. 
                  You would need to update your Edge Functions to customize email templates.
                </Alert>
                
                <div className="border p-3 rounded mb-4">
                  <h5>Available Email Templates</h5>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Order Confirmation
                      <Badge bg="success">Active</Badge>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Order Status Update
                      <Badge bg="success">Active</Badge>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Low Stock Alert
                      <Badge bg="success">Active</Badge>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Welcome Email
                      <Badge bg="secondary">Not Configured</Badge>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Password Reset
                      <Badge bg="success">Active</Badge>
                    </li>
                  </ul>
                </div>
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    disabled={true}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <FaEnvelope className="me-2" /> Edit Email Templates
                  </Button>
                  <Form.Text className="text-muted text-center mt-2">
                    Email template editing is not available in this demo.
                  </Form.Text>
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default AdminSettings;