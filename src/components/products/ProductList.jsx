import { Row, Col, Pagination } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductCard from './ProductCard';
import { buildQueryString } from '../../utils/helpers';

const ProductList = ({ products, totalProducts, currentPage, productsPerPage, queryParams }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    // Update URL with new page number
    const newParams = { ...queryParams, page: pageNumber };
    navigate(`${location.pathname}${buildQueryString(newParams)}`);
    
    // Scroll to top on page change
    window.scrollTo(0, 0);
  };
  
  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    let items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );
    
    // First page
    items.push(
      <Pagination.Item
        key={1}
        active={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        1
      </Pagination.Item>
    );
    
    // Ellipsis if needed
    if (currentPage > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
    }
    
    // Pages around current page
    for (let number = Math.max(2, currentPage - 1); number <= Math.min(totalPages - 1, currentPage + 1); number++) {
      if (number === 1 || number === totalPages) continue; // Skip first and last pages as they're added separately
      
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    
    // Ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
    }
    
    // Last page if more than one page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    
    return <Pagination>{items}</Pagination>;
  };
  
  return (
    <>
      <Row className="mt-4">
        {products.map(product => (
          <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
      
      <Row className="mt-4 mb-5">
        <Col className="d-flex justify-content-between align-items-center">
          <div className="text-muted">
            Showing {products.length} of {totalProducts} products
          </div>
          <div>{renderPagination()}</div>
        </Col>
      </Row>
    </>
  );
};

export default ProductList;