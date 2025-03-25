import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaKey, FaShoppingBag } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import { formatPhoneNumber, validatePasswordStrength } from '../utils/helpers';
import { toast } from 'react-toastify';

// Schema for profile information
const ProfileSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required'),
  phone: Yup.string()
    .matches(/^[0-9]+$/, 'Phone number can only contain digits')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number can\'t be longer than 15 digits'),
  address: Yup.string()
    .required('Address is required'),
  city: Yup.string()
    .required('City is required'),
  state: Yup.string()
    .required('State is required'),
  postalCode: Yup.string()
    .required('Postal code is required'),
  country: Yup.string()
    .required('Country is required')
});

// Schema for password change
const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters long'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const ProfilePage = () => {
  const { user, userProfile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  if (!user || !userProfile) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          Please sign in to view your profile.
        </Alert>
        <Button 
          as={Link} 
          to="/login" 
          variant="primary"
          className="mt-3"
        >
          Sign In
        </Button>
      </Container>
    );
  }
  
  // Get initial values for profile form
  const getProfileInitialValues = () => {
    return {
      fullName: userProfile.full_name || '',
      email: user.email || '',
      phone: userProfile.phone_number || '',
      address: userProfile.address?.street || '',
      city: userProfile.address?.city || '',
      state: userProfile.address?.state || '',
      postalCode: userProfile.address?.postal_code || '',
      country: userProfile.address?.country || 'US'
    };
  };
  
  // Handle profile update
  const handleProfileUpdate = async (values, { setSubmitting, setErrors }) => {
    try {
      setUpdateSuccess(false);
      
      const updatedProfile = {
        full_name: values.fullName,
        phone_number: values.phone,
        address: {
          street: values.address,
          city: values.city,
          state: values.state,
          postal_code: values.postalCode,
          country: values.country
        },
        updated_at: new Date()
      };
      
      await profileService.updateProfile(user.id, updatedProfile);
      
      setUpdateSuccess(true);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (values, { setSubmitting, setErrors, resetForm }) => {
    try {
      setPasswordSuccess(false);
      setPasswordError(null);
      
      // Check password strength
      const passwordCheck = validatePasswordStrength(values.newPassword);
      if (!passwordCheck.isValid) {
        setPasswordError(passwordCheck.message);
        return;
      }
      
      // In a real application, this would call the Supabase Auth API
      // For demo purposes, we're just showing success
      
      // Uncomment for a real implementation:
      /*
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      });
      
      if (error) {
        throw error;
      }
      */
      
      setPasswordSuccess(true);
      resetForm();
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to change password. Please ensure your current password is correct.');
      toast.error('Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
    toast.info('You have been signed out');
  };
  
  return (
    <Container className="py-5">
      <h1 className="mb-4">My Profile</h1>
      
      <Row>
        <Col md={3} className="mb-4 mb-md-0">
          <Card className="shadow-sm mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto" style={{ width: '80px', height: '80px' }}>
                  <FaUser size={30} />
                </div>
              </div>
              <h4>{userProfile.full_name}</h4>
              <p className="text-muted mb-0">{user.email}</p>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  as={Link} 
                  to="/orders" 
                  variant="outline-primary"
                  className="d-flex align-items-center justify-content-center"
                >
                  <FaShoppingBag className="me-2" /> My Orders
                </Button>
                
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout}
                  className="d-flex align-items-center justify-content-center"
                >
                  <FaKey className="me-2" /> Logout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={9}>
          <Card className="shadow-sm">
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="profile" title="Profile Information">
                  <Formik
                    initialValues={getProfileInitialValues()}
                    validationSchema={ProfileSchema}
                    onSubmit={handleProfileUpdate}
                  >
                    {({ handleSubmit, handleChange, handleBlur, values, touched, errors, isSubmitting }) => (
                      <Form noValidate onSubmit={handleSubmit}>
                        {updateSuccess && (
                          <Alert variant="success" className="mb-4">
                            Your profile has been updated successfully!
                          </Alert>
                        )}
                        
                        {errors.submit && (
                          <Alert variant="danger" className="mb-4">
                            {errors.submit}
                          </Alert>
                        )}
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3" controlId="fullName">
                              <Form.Label>Full Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="fullName"
                                value={values.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.fullName && !!errors.fullName}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.fullName}
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
                                disabled
                                readOnly
                              />
                              <Form.Text className="text-muted">
                                Email cannot be changed
                              </Form.Text>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Form.Group className="mb-3" controlId="phone">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={values.phone}
                            onChange={(e) => {
                              // Allow only digits
                              const value = e.target.value.replace(/\D/g, '');
                              handleChange({
                                target: {
                                  name: 'phone',
                                  value
                                }
                              });
                            }}
                            onBlur={handleBlur}
                            isInvalid={touched.phone && !!errors.phone}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.phone}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <h5 className="mt-4 mb-3">Shipping Address</h5>
                        
                        <Form.Group className="mb-3" controlId="address">
                          <Form.Label>Street Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="address"
                            value={values.address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.address && !!errors.address}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.address}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Row>
                          <Col md={5}>
                            <Form.Group className="mb-3" controlId="city">
                              <Form.Label>City</Form.Label>
                              <Form.Control
                                type="text"
                                name="city"
                                value={values.city}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.city && !!errors.city}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.city}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          
                          <Col md={3}>
                            <Form.Group className="mb-3" controlId="state">
                              <Form.Label>State</Form.Label>
                              <Form.Control
                                type="text"
                                name="state"
                                value={values.state}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.state && !!errors.state}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.state}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          
                          <Col md={4}>
                            <Form.Group className="mb-3" controlId="postalCode">
                              <Form.Label>Postal Code</Form.Label>
                              <Form.Control
                                type="text"
                                name="postalCode"
                                value={values.postalCode}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.postalCode && !!errors.postalCode}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.postalCode}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Form.Group className="mb-4" controlId="country">
                          <Form.Label>Country</Form.Label>
                          <Form.Select
                            name="country"
                            value={values.country}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.country && !!errors.country}
                          >
                            <option value="">Select Country</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.country}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <div className="d-grid">
                          <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Updating...' : 'Update Profile'}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </Tab>
                
                <Tab eventKey="password" title="Change Password">
                  <Formik
                    initialValues={{
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    }}
                    validationSchema={PasswordSchema}
                    onSubmit={handlePasswordChange}
                  >
                    {({ handleSubmit, handleChange, handleBlur, values, touched, errors, isSubmitting }) => (
                      <Form noValidate onSubmit={handleSubmit}>
                        {passwordSuccess && (
                          <Alert variant="success" className="mb-4">
                            Your password has been changed successfully!
                          </Alert>
                        )}
                        
                        {passwordError && (
                          <Alert variant="danger" className="mb-4">
                            {passwordError}
                          </Alert>
                        )}
                        
                        <Form.Group className="mb-3" controlId="currentPassword">
                          <Form.Label>Current Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="currentPassword"
                            value={values.currentPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.currentPassword && !!errors.currentPassword}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.currentPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3" controlId="newPassword">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="newPassword"
                            value={values.newPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.newPassword && !!errors.newPassword}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.newPassword}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-4" controlId="confirmPassword">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <div className="d-grid">
                          <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Changing Password...' : 'Change Password'}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;