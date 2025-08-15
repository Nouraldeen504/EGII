import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaTimes, FaFilePdf, FaUpload, FaImage, FaDollarSign, FaBoxOpen } from 'react-icons/fa';
import { supabase } from '../../services/supabase';
import { categoryService } from '../../services/categoryService';
import { toast } from 'react-toastify';

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
  category_id: Yup.string().nullable(),
  is_featured: Yup.boolean(),
  is_active: Yup.boolean(),
  image_url: Yup.string()
    .nullable()
    .test(
      'is-url-or-file',
      'Either upload an image or provide a valid URL',
      function(value) {
        if (this.parent.image_file || (value && value.startsWith('blob:'))) return true;
        return !value || Yup.string().url().isValidSync(value);
      }
    )
});

const ProductForm = ({ product, onSubmit, isSubmitting }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [attributes, setAttributes] = useState(product?.attributes || []);

  // Category-to-attribute mapping (example)
  const categoryAttributes = {
    'MPO': ['Length', 'Mode', 'Connector', 'Fiber Count'],
    'Indoor Fiber Patch Cords': ['Length', 'Mode', 'Connector'],
    'Outdoor Fiber Patch Cords': ['Length', 'Mode', 'Connector'],
    'SFPs': ['Subtype'],
  };
  
  const initialValues = {
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock_quantity: product?.stock_quantity || 0,
    category_id: product?.category_id || '',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active !== undefined ? product.is_active : true,
    image_url: product?.image_url || '',
    datasheet_url: product?.datasheet_url || ''
  };

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

  useEffect(() => {
    const fetchAttributes = async () => {
      if (product?.id) {
        const attrs = await productService.getProductAttributes(product.id);
        setAttributes(attrs);
      }
    };
    fetchAttributes();
  }, [product]);

  const handleUpload = async (file) => {
    if (!file) return null;
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      let imageUrl = values.image_url;
      let datasheetUrl = values.datasheet_url;

      // If a new file was selected, upload it
      if (selectedFile && values.image_url.startsWith('blob:')) {
        imageUrl = await handleUpload(selectedFile);
        if (!imageUrl) return; // Stop if upload failed
      }
      
      // Prepare data without the file object
      const dataToSubmit = {
        ...values,
        attributes,
        image_url: imageUrl,
        datasheet_url: datasheetUrl
      };
      delete dataToSubmit.image_file;
      delete dataToSubmit.datasheet_file;

      await onSubmit(dataToSubmit);
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
      {({ handleSubmit, handleChange, handleBlur, setFieldValue, values, touched, errors, isSubmitting: formikIsSubmitting }) => {
        const handleFileChange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          if (file.size > 5 * 1024 * 1024) {
            toast.error('File size too large (max 5MB)');
            return;
          }
          
          setSelectedFile(file);
          const previewUrl = URL.createObjectURL(file);
          setFieldValue('image_url', previewUrl);
          setFieldValue('image_file', file.name);
          
          // Auto-upload the file
          try {
            const imageUrl = await handleUpload(file);
            if (imageUrl) {
              setFieldValue('image_url', imageUrl);
            }
          } catch (error) {
            setFieldValue('image_url', '');
            setFieldValue('image_file', null);
          }
        };

        // Determine fields
        const selectedCategory = categories.find(cat => cat.id === values.category_id);
        const attributeFields = selectedCategory
          ? categoryAttributes[selectedCategory.name] || []
          : [];

        return (
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
                    {/* --- ATTRIBUTE FIELDS HERE --- */}
                    {attributeFields.length > 0 && (
                      <>
                        <h6 className="mt-4">Product Attributes</h6>
                        {attributeFields.map(attrName => (
                          <Form.Group key={attrName} className="mb-3" controlId={`attr_${attrName}`}>
                            <Form.Label>{attrName}</Form.Label>
                            <Form.Control
                              type="text"
                              value={attributes.find(a => a.attribute_name === attrName)?.attribute_value || ''}
                              onChange={e => {
                                const value = e.target.value;
                                setAttributes(prev =>
                                  [
                                    ...prev.filter(a => a.attribute_name !== attrName),
                                    { attribute_name: attrName, attribute_value: value }
                                  ]
                                );
                              }}
                              placeholder={`Enter ${attrName}`}
                            />
                          </Form.Group>
                        ))}
                      </>
                    )}
                    {/* --- END ATTRIBUTE FIELDS --- */}
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
                          src={values.image_url.startsWith('blob:') ? values.image_url : `${values.image_url}?t=${Date.now()}`}
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
                    
                    <Form.Group className="mb-3" controlId="image_file">
                      <Form.Label>Upload Image</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      <Form.Text className="text-muted">
                        {uploading ? `Uploading... ${uploadProgress}%` : "Upload a product image (JPEG, PNG, etc.)"}
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="image_url">
                      <Form.Label>Or Image URL</Form.Label>
                      <Form.Control
                        type="text"
                        name="image_url"
                        value={values.image_url}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.image_url && !!errors.image_url}
                        placeholder="Enter image URL"
                        disabled={uploading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.image_url}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Card.Body>
                </Card>
                <Card className="shadow-sm mb-4">
                  <Card.Body>
                    <h5 className="mb-4">Product Datasheet</h5>
                    
                    {values.datasheet_url && (
                      <div className="mb-3">
                        <a 
                          href={values.datasheet_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="d-flex align-items-center gap-2 text-primary"
                        >
                          <FaFilePdf /> View Current Datasheet
                        </a>
                      </div>
                    )}
                    
                    <Form.Group className="mb-3" controlId="datasheet_file">
                      <Form.Label>Upload New Datasheet</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error('File size too large (max 10MB)');
                            return;
                          }
                          
                          try {
                            setUploading(true);
                            
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${Math.random()}.${fileExt}`;
                            const filePath = `product-datasheets/${fileName}`;
                            
                            const { error } = await supabase.storage
                              .from('product-datasheets')
                              .upload(filePath, file, {
                                cacheControl: '3600',
                                upsert: false,
                                contentType: file.type,
                              });
                            
                            if (error) throw error;
                            
                            const { data: { publicUrl } } = supabase.storage
                              .from('product-datasheets')
                              .getPublicUrl(filePath);
                            
                            setFieldValue('datasheet_url', publicUrl);
                          } catch (error) {
                            console.error('Datasheet upload error:', error);
                            toast.error('Datasheet upload failed');
                            setFieldValue('datasheet_url', '');
                          } finally {
                            setUploading(false);
                          }
                        }}
                        disabled={uploading}
                      />
                      <Form.Text className="text-muted">
                        Upload product datasheet (PDF, DOC, XLS, etc.)
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="datasheet_url">
                      <Form.Label>Or Datasheet URL</Form.Label>
                      <Form.Control
                        type="text"
                        name="datasheet_url"
                        value={values.datasheet_url}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.datasheet_url && !!errors.datasheet_url}
                        placeholder="Enter datasheet URL"
                        disabled={uploading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.datasheet_url}
                      </Form.Control.Feedback>
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
                    disabled={formikIsSubmitting || uploading}
                    className="d-flex align-items-center justify-content-center"
                  >
                    {formikIsSubmitting || uploading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        {uploading ? `Uploading...` : 'Saving...'}
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
        );
      }}
    </Formik>
  );
};

export default ProductForm;