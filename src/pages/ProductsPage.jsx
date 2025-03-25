import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductList from '../components/products/ProductList';
import ProductFilter from '../components/products/ProductFilter';
import { parseQueryParams } from '../utils/helpers';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  
  const location = useLocation();
  const queryParams = parseQueryParams();
  
  // Filters from URL params
  const {
    category: categoryId,
    search,
    sort: sortBy,
    min_price: minPrice,
    max_price: maxPrice,
    page
  } = queryParams;
  
  // Fetch all categories for the filter component
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Not setting an error here as we still want to show products
      }
    };
    
    fetchCategories();
  }, []);
  
  // Effect for handling page changes from URL
  useEffect(() => {
    if (page) {
      setCurrentPage(parseInt(page));
    }
  }, [page]);
  
  // Fetch products based on filters and pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters = {
          categoryId,
          search,
          sortBy,
          minPrice,
          maxPrice,
          page: currentPage,
          limit: productsPerPage
        };
        
        const { data, count } = await productService.getAllProducts(filters);
        
        setProducts(data);
        setTotalProducts(count);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [categoryId, search, sortBy, minPrice, maxPrice, currentPage]);
  
  return (
    <Container className="py-5">
      <h1 className="mb-4">Products</h1>
      
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      
      <Row>
        <Col>
          <ProductFilter 
            categories={categories}
            initialFilters={queryParams}
            currentPage={currentPage}
          />
        </Col>
      </Row>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : products.length === 0 ? (
        <Alert variant="info" className="mt-4">
          No products found. Try adjusting your filters.
        </Alert>
      ) : (
        <ProductList 
          products={products}
          totalProducts={totalProducts}
          currentPage={currentPage}
          productsPerPage={productsPerPage}
          queryParams={queryParams}
        />
      )}
    </Container>
  );
};

export default ProductsPage;