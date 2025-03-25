import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { productService } from '../../services/productService';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductForm from '../../components/admin/ProductForm';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Update the product
      const updatedProduct = await productService.updateProduct(id, values);
      
      toast.success(`Product "${updatedProduct.name}" has been updated!`);
      navigate('/admin/products');
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product. Please try again.');
      toast.error('Failed to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <Container fluid className="py-4 text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading product details...</p>
        </Container>
      </AdminLayout>
    );
  }
  
  if (error && !product) {
    return (
      <AdminLayout>
        <Container fluid className="py-4">
          <Alert variant="danger">{error}</Alert>
          <Link 
            to="/admin/products" 
            className="btn btn-primary mt-3"
          >
            Back to Products
          </Link>
        </Container>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center">
              <Link 
                to="/admin/products" 
                className="btn btn-outline-secondary me-3"
                title="Back to Products"
              >
                <FaArrowLeft />
              </Link>
              <h1 className="mb-0">Edit Product</h1>
            </div>
          </Col>
        </Row>
        
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        <ProductForm 
          product={product}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Container>
    </AdminLayout>
  );
};

export default EditProduct;