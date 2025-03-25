import { use, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect user to the page they were trying to access, or to home
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (values) => {
    try {
      setError('');
      setLoading(true);
      
      const { data, error } = await signIn(values.email, values.password);
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      const { userProfile, profileError } = await fetchUserProfile(data.user.id);
      if (profileError) {
        setError(profileError.message);
        toast.error(profileError.message);
        return;
      }
      
      toast.success('Logged in successfully!');
      if(userProfile.is_admin) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError('Failed to log in. Please try again.');
      toast.error('Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center my-5">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Sign In</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={LoginSchema}
                onSubmit={handleLogin}
              >
                {({ handleSubmit, handleChange, handleBlur, values, touched, errors }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email address</Form.Label>
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

                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && !!errors.password}
                        placeholder="Enter your password"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check 
                        type="checkbox" 
                        id="rememberMe" 
                        label="Remember me" 
                      />
                      <Link to="/forgot-password" className="text-decoration-none">
                        Forgot Password?
                      </Link>
                    </div>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </Form>
                )}
              </Formik>
              
              <div className="text-center mt-4">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Sign Up
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;