import { useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { productService } from '../../services/productService';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductForm from '../../components/admin/ProductForm';

const AddProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create the new product
      const newProduct = await productService.createProduct(values);
      
      toast.success(`Product "${newProduct.name}" has been created!`);
      navigate('/admin/products');
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product. Please try again.');
      toast.error('Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
              <h1 className="mb-0">Add New Product</h1>
            </div>
          </Col>
        </Row>
        
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        <ProductForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Container>
    </AdminLayout>
  );
};

export default AddProduct;