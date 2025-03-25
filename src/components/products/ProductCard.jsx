import { Link } from 'react-router-dom';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency, truncateText } from '../../utils/helpers';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    if (product.stock_quantity <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const getStockBadge = () => {
    if (product.stock_quantity <= 0) {
      return <Badge bg="danger">Out of Stock</Badge>;
    }
    
    if (product.stock_quantity <= 5) {
      return <Badge bg="warning">Low Stock</Badge>;
    }
    
    return <Badge bg="success">In Stock</Badge>;
  };

  return (
    <Card className="product-card h-100">
      <Link to={`/products/${product.id}`}>
        <Card.Img 
          variant="top" 
          src={product.image_url || 'https://via.placeholder.com/300x200?text=Product+Image'}
          alt={product.name}
        />
      </Link>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Link 
            to={`/products/${product.id}`} 
            className="text-decoration-none text-dark"
          >
            <Card.Title>{truncateText(product.name, 40)}</Card.Title>
          </Link>
          {product.is_featured && (
            <Badge bg="primary">Featured</Badge>
          )}
        </div>
        
        {product.category && (
          <Link 
            to={`/products?category=${product.category.id}`}
            className="text-decoration-none"
          >
            <Badge bg="secondary" className="mb-2">
              {product.category.name}
            </Badge>
          </Link>
        )}
        
        <Card.Text>{truncateText(product.description, 80)}</Card.Text>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="price">{formatCurrency(product.price)}</span>
            {getStockBadge()}
          </div>
          
          <Button 
            variant="primary" 
            className="w-100 d-flex align-items-center justify-content-center"
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
          >
            <FaShoppingCart className="me-2" />
            Add to Cart
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;