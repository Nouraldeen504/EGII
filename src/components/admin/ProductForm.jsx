import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaTimes, FaUpload, FaImage, FaDollarSign, FaBoxOpen } from 'react-icons/fa';
import { categoryService } from '../../services/categoryService';
import { toast } from 'react-toastify';

// Validation schema for product form
const ProductSchema = Yup.object().shape({
  name: Yup.string()
    .required('Product name is required')
    .min(3, 'Name is too short')
    .max(100, 'Name is too long'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description is too short'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive')
    .test(
      'is-decimal',
      'Price can have at most 2 decimal places',
      value => !value || /^\d+(\.\d{1,2})?$/.test(value.toString())
    ),
  stock_quantity: Yup.number()
    .required('Stock quantity is required')
    .integer('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative'),
  category_id: Yup.string()
    .nullable(),
  is_featured: Yup.boolean(),
  is_active: Yup.boolean(),
  image_url: Yup.string()
    .nullable()
    .url('Invalid URL format')
});

const ProductForm = ({ product, onSubmit, isSubmitting }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize form with product data or defaults
  const initialValues = {
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock_quantity: product?.stock_quantity || 0,
    category_id: product?.category_id || '',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active !== undefined ? product.is_active : true,
    image_url: product?.image_url || ''
  };
  
  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try refreshing the page.');
        toast.error('Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle form submission
  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting product form:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading form...</p>
      </div>
    );
  }
  
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={ProductSchema}
      onSubmit={handleFormSubmit}
    >
      {({ handleSubmit, handleChange, handleBlur, setFieldValue, values, touched, errors }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Row>
            <Col lg={8}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <h5 className="mb-4">Product Information</h5>
                  
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.name && !!errors.name}
                      placeholder="Enter product name"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3" controlId="description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.description && !!errors.description}
                      placeholder="Enter product description"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="price">
                        <Form.Label>Price</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaDollarSign /></InputGroup.Text>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            value={values.price}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.price && !!errors.price}
                            placeholder="0.00"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.price}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="stock_quantity">
                        <Form.Label>Stock Quantity</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaBoxOpen /></InputGroup.Text>
                          <Form.Control
                            type="number"
                            min="0"
                            step="1"
                            name="stock_quantity"
                            value={values.stock_quantity}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.stock_quantity && !!errors.stock_quantity}
                            placeholder="0"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.stock_quantity}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3" controlId="category_id">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category_id"
                      value={values.category_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.category_id && !!errors.category_id}
                    >
                      <option value="">Select Category (Optional)</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.category_id}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <h5 className="mb-4">Product Image</h5>
                  
                  <div className="text-center mb-3">
                    {values.image_url ? (
                      <img 
                        src={values.image_url} 
                        alt="Product Preview" 
                        className="img-thumbnail mb-3"
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center mb-3" style={{ height: '200px' }}>
                        <FaImage size={50} className="text-secondary" />
                      </div>
                    )}
                  </div>
                  
                  <Form.Group className="mb-3" controlId="image_url">
                    <Form.Label>Image URL</Form.Label>
                    <Form.Control
                      type="text"
                      name="image_url"
                      value={values.image_url}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.image_url && !!errors.image_url}
                      placeholder="Enter image URL"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.image_url}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Enter a URL for the product image. In a real application, you would also have an image upload option.
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <h5 className="mb-4">Product Status</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="is_active"
                      label="Product is active"
                      name="is_active"
                      checked={values.is_active}
                      onChange={handleChange}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted">
                      Inactive products are not visible to customers.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group>
                    <Form.Check
                      type="switch"
                      id="is_featured"
                      label="Featured product"
                      name="is_featured"
                      checked={values.is_featured}
                      onChange={handleChange}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted">
                      Featured products are displayed on the homepage.
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isSubmitting}
                  className="d-flex align-items-center justify-content-center"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" /> Save Product
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  as="a"
                  href="/admin/products"
                  className="d-flex align-items-center justify-content-center"
                >
                  <FaTimes className="me-2" /> Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default ProductForm;