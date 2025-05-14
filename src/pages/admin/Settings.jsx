import { useState, useEffect  } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab, Badge} from 'react-bootstrap';
import { FaSave, FaEnvelope, FaStore, FaTruck, FaCreditCard } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import { getSettings, updateSettings } from '../../services/settingsService';

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
  const [loading, setLoading] = useState(true);
  const [initialStoreSettings, setInitialStoreSettings] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    currency: 'USD',
    enableTaxes: false,
    taxRate: 0,
    freeShippingThreshold: 0,
    standardShippingRate: 0,
    expressShippingRate: 0,
    enableInternationalShipping: false,
    internationalShippingRate: 0,
    enableCreditCard: false,
    enablePaypal: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalClientId: ''
  });
  
  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        setInitialStoreSettings(settings);
        console.log(settings);
      } catch (error) {
        toast.error('Failed to load settings: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Handle store settings submission
  const handleStoreSettingsSubmit = async (values, { setSubmitting }) => {
    try {
      await updateSettings({
        ...values,
        // Ensure we don't overwrite other settings when updating a specific tab
        freeShippingThreshold: initialStoreSettings.freeShippingThreshold,
        standardShippingRate: initialStoreSettings.standardShippingRate,
        expressShippingRate: initialStoreSettings.expressShippingRate,
        enableInternationalShipping: initialStoreSettings.enableInternationalShipping,
        internationalShippingRate: initialStoreSettings.internationalShippingRate,
        enableCreditCard: initialStoreSettings.enableCreditCard,
        enablePaypal: initialStoreSettings.enablePaypal,
        stripePublicKey: initialStoreSettings.stripePublicKey,
        stripeSecretKey: initialStoreSettings.stripeSecretKey,
        paypalClientId: initialStoreSettings.paypalClientId
      });
      
      setInitialStoreSettings(prev => ({ ...prev, ...values }));
      setSaveSuccess(true);
      toast.success('Store settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Handle shipping settings submission
  const handleShippingSettingsSubmit = async (values, { setSubmitting }) => {
    try {
      await updateSettings({
        ...initialStoreSettings,
        ...values
      });
      
      setInitialStoreSettings(prev => ({ ...prev, ...values }));
      setSaveSuccess(true);
      toast.success('Shipping settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };
  
  // Handle payment settings submission
  const handlePaymentSettingsSubmit = async (values, { setSubmitting }) => {
    try {
      await updateSettings({
        ...initialStoreSettings,
        ...values
      });
      
      setInitialStoreSettings(prev => ({ ...prev, ...values }));
      setSaveSuccess(true);
      toast.success('Payment settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <h1 className="mb-4">Store Settings</h1>
          <Alert variant="info">Loading settings...</Alert>
        </Container>
      </AdminLayout>
    );
  }
  
  if (!initialStoreSettings) {
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <h1 className="mb-4">Store Settings</h1>
          <Alert variant="danger">Failed to load settings</Alert>
        </Container>
      </AdminLayout>
    );
  }

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
                  initialValues={initialStoreSettings}
                  validationSchema={StoreSettingsSchema}
                  onSubmit={handleStoreSettingsSubmit}
                  enableReinitialize
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
                              <option value="LYD">LYD - Libyan Dinar</option>
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
                  initialValues={initialStoreSettings}
                  validationSchema={ShippingSettingsSchema}
                  onSubmit={handleShippingSettingsSubmit}
                  enableReinitialize
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
                  initialValues={initialStoreSettings}
                  validationSchema={PaymentSettingsSchema}
                  onSubmit={handlePaymentSettingsSubmit}
                  enableReinitialize
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