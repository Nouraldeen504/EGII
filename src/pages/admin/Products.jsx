import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Pagination, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaSyncAlt, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { formatCurrency, formatDate, truncateText } from '../../utils/helpers';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import { useSettings } from '../../contexts/SettingsContext';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const { settings } = useSettings();
  const productsPerPage = 10;
  
  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sort: 'created_at:desc',
    minPrice: '',
    maxPrice: '',
  });
  
  // State for product deletion
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare filter object for API
        const apiFilters = {
          categoryId: filters.category,
          search: filters.search,
          sortBy: filters.sort,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          page: currentPage,
          limit: productsPerPage
        };
        console.log('Fetching products with filters:', apiFilters);
        
        // Fetch products with filters
        const { data, count } = await productService.getAllProducts(apiFilters);
        setProducts(data);
        setTotalProducts(count);
        
        // Fetch categories for filter dropdown
        const categoriesData = await categoryService.getAllCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters, currentPage]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle category filter change
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, category: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, sort: value }));
    setCurrentPage(1); // Reset to first page when sort changes
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      sort: 'created_at:desc',
      minPrice: '',
      maxPrice: ''
    });
    setCurrentPage(1);
  };
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the page
    window.scrollTo(0, 0);
  };
  
  // Prepare for product deletion
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };
  
  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      setDeleting(true);
      await productService.deleteProduct(productToDelete.id);
      
      // Update local state to remove the deleted product
      setProducts(products.filter(p => p.id !== productToDelete.id));
      
      toast.success(`Product "${productToDelete.name}" has been deleted.`);
      
      // Close modal and reset
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setDeleting(false);
    }
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  
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
    for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page++) {
      if (page === 1 || page === totalPages) continue;
      
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
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
    <AdminLayout>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Products</h1>
          <Button 
            as={Link} 
            to="/admin/products/add" 
            variant="primary"
            className="d-flex align-items-center"
          >
            <FaPlus className="me-2" /> Add Product
          </Button>
        </div>
        
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col lg={5} md={6}>
                <Form onSubmit={handleSearch}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={handleSearchChange}
                    />
                    <Button variant="primary" type="submit">
                      <FaSearch />
                    </Button>
                  </InputGroup>
                </Form>
              </Col>
              
              <Col lg={3} md={6}>
                <Form.Select
                  value={filters.category}
                  onChange={handleCategoryChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              
              <Col lg={3} md={6}>
                <Form.Select
                  value={filters.sort}
                  onChange={handleSortChange}
                >
                  <option value="created_at:desc">Newest First</option>
                  <option value="created_at:asc">Oldest First</option>
                  <option value="name:asc">Name: A-Z</option>
                  <option value="name:desc">Name: Z-A</option>
                  <option value="price:asc">Price: Low to High</option>
                  <option value="price:desc">Price: High to Low</option>
                  <option value="stock_quantity:asc">Stock: Low to High</option>
                  <option value="stock_quantity:desc">Stock: High to Low</option>
                </Form.Select>
              </Col>
              
              <Col lg={1} md={6} className="d-flex justify-content-end">
                <Button 
                  variant="outline-secondary" 
                  onClick={resetFilters}
                  className="w-100 d-flex align-items-center justify-content-center"
                >
                  <FaSyncAlt />
                </Button>
              </Col>
              <Col lg={3} md={6}>
                <InputGroup>
                  <Form.Control
                    placeholder="Min price"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  />
                  <Form.Control
                    placeholder="Max price"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  />
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading products...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : products.length === 0 ? (
          <Alert variant="info">
            No products found. {filters.search || filters.category ? 'Try adjusting your filters.' : 'Add your first product!'}
          </Alert>
        ) : (
          <>
            <Card className="shadow-sm mb-4">
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td style={{ width: '80px' }}>
                          <img 
                            src={product.image_url || 'https://via.placeholder.com/50x50?text=No+Image'} 
                            alt={product.name}
                            width="50"
                            height="50"
                            className="rounded"
                          />
                        </td>
                        <td>
                          <div className="fw-bold">{truncateText(product.name, 40)}</div>
                          <div className="text-muted small">{product.id.substring(0, 8)}</div>
                        </td>
                        <td>
                          {product.category ? (
                            <Badge bg="secondary">{product.category.name}</Badge>
                          ) : (
                            <span className="text-muted">Uncategorized</span>
                          )}
                        </td>
                        <td>{formatCurrency(product.price, settings?.currency)}</td>
                        <td>
                          {product.stock_quantity <= 0 ? (
                            <Badge bg="danger">Out of Stock</Badge>
                          ) : product.stock_quantity <= 5 ? (
                            <Badge bg="warning" text="dark">{product.stock_quantity} left</Badge>
                          ) : (
                            product.stock_quantity
                          )}
                        </td>
                        <td>
                          {product.is_active ? (
                            <Badge bg="success">Active</Badge>
                          ) : (
                            <Badge bg="secondary">Inactive</Badge>
                          )}
                          {product.is_featured && (
                            <Badge bg="primary" className="ms-1">Featured</Badge>
                          )}
                        </td>
                        <td>{formatDate(product.created_at)}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end">
                            <Button 
                              as={Link}
                              to={`/admin/products/edit/${product.id}`}
                              variant="outline-primary" 
                              size="sm"
                              className="me-2 d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                            >
                              <FaEdit />
                            </Button>
                            
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => confirmDelete(product)}
                              className="d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px' }}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
            
            <div className="d-flex justify-content-between align-items-center">
              <div>
                Showing {products.length} of {totalProducts} products
              </div>
              {renderPagination()}
            </div>
          </>
        )}
        
        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {productToDelete && (
              <>
                <p>Are you sure you want to delete the following product?</p>
                <div className="d-flex align-items-center mb-3">
                  <img 
                    src={productToDelete.image_url || 'https://via.placeholder.com/50x50?text=No+Image'} 
                    alt={productToDelete.name}
                    width="50"
                    height="50"
                    className="rounded me-3"
                  />
                  <div>
                    <div className="fw-bold">{productToDelete.name}</div>
                    <div className="text-muted small">ID: {productToDelete.id.substring(0, 8)}</div>
                  </div>
                </div>
                <Alert variant="warning">
                  <FaExclamationTriangle className="me-2" />
                  This action cannot be undone.
                </Alert>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteProduct}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Product'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
};

export default AdminProducts;