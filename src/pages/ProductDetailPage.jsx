import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Image, Badge, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { FaShoppingCart, FaArrowLeft, FaMinusCircle, FaPlusCircle } from 'react-icons/fa';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/helpers';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock_quantity || 1)) {
      setQuantity(value);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    if (quantity < (product?.stock_quantity || 1)) {
      setQuantity(quantity + 1);
    }
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.stock_quantity <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    
    addToCart(product, quantity);
    toast.success(`${product.name} (${quantity}) added to cart!`);
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Product not found'}
        </Alert>
        <Button 
          variant="outline-primary" 
          onClick={() => navigate('/products')}
          className="mt-3"
        >
          <FaArrowLeft className="me-2" /> Back to Products
        </Button>
      </Container>
    );
  }
  
  const getStockLabel = () => {
    if (product.stock_quantity <= 0) {
      return <Badge bg="danger">Out of Stock</Badge>;
    }
    
    if (product.stock_quantity <= 5) {
      return <Badge bg="warning">Low Stock: {product.stock_quantity} left</Badge>;
    }
    
    return <Badge bg="success">In Stock</Badge>;
  };
  
  return (
    <Container className="py-5">
      <Link 
        to="/products" 
        className="d-inline-flex align-items-center text-decoration-none mb-4"
      >
        <FaArrowLeft className="me-2" /> Back to Products
      </Link>
      
      <Row>
        <Col md={6} className="mb-4 mb-md-0">
          <Image 
            src={product.image_url || 'https://via.placeholder.com/600x400?text=Product+Image'} 
            alt={product.name}
            fluid
            className="rounded shadow"
          />
        </Col>
        
        <Col md={6}>
          <h1 className="mb-3">{product.name}</h1>
          
          <div className="d-flex align-items-center mb-3">
            {getStockLabel()}
            
            {product.category && (
              <Link 
                to={`/products?category=${product.category.id}`}
                className="text-decoration-none ms-2"
              >
                <Badge bg="secondary">
                  {product.category.name}
                </Badge>
              </Link>
            )}
            
            {product.is_featured && (
              <Badge bg="primary" className="ms-2">
                Featured
              </Badge>
            )}
          </div>
          
          <h3 className="text-primary mb-4">
            {formatCurrency(product.price)}
          </h3>
          
          <div className="mb-4">
            <p>{product.description}</p>
          </div>
          
          {product.stock_quantity > 0 && (
            <div className="mb-4">
              <Row className="align-items-center">
                <Col xs="auto">
                  <Form.Label className="me-3 mb-0">Quantity:</Form.Label>
                </Col>
                <Col xs={5} sm={4} md={5} lg={4}>
                  <div className="d-flex align-items-center">
                    <Button 
                      variant="outline-secondary" 
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <FaMinusCircle />
                    </Button>
                    
                    <Form.Control
                      type="number"
                      min="1"
                      max={product.stock_quantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="mx-2 text-center"
                    />
                    
                    <Button 
                      variant="outline-secondary" 
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock_quantity}
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <FaPlusCircle />
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          )}
          
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleAddToCart}
              disabled={product.stock_quantity <= 0}
              className="d-flex align-items-center justify-content-center"
            >
              <FaShoppingCart className="me-2" />
              {product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;