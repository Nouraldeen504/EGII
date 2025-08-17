import { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Card, InputGroup } from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes, FaSyncAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildQueryString } from '../../utils/helpers';

const ProductFilter = ({ categories, initialFilters = {}, currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showFilters, setShowFilters] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [categoryId, setCategoryId] = useState(initialFilters.category || '');
  const [minPrice, setMinPrice] = useState(initialFilters.min_price || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.max_price || '');
  const [sortBy, setSortBy] = useState(initialFilters.sort || 'created_at:desc');
  const [attributeFilters, setAttributeFilters] = useState({});

  const categoryAttributeOptions = {
    'SFPs': {
      'Subtype': [
        'GE-SFP',
        'GE-SFP 85C',
        'BIDI',
        'SFP+',
        'BIDI SFP+',
        'QSFP+ 40G',
        'QSFP28+ 100G',
        'XFP+',
      ]
    },
    'Indoor Fiber Patch Cords': {
      'Mode': ['SingleMode', 'OM2', 'OM3', 'OM4'],
      'Connector': ['LC-LC', 'LC-SC', 'SC-SC'],
      'Length': ['1m', '2m', '3m', '5m', '10m', '15m', '20m', '25m', '30m'],
    },
    'Outdoor Fiber Patch Cords': {
      'Mode': ['SingleMode', 'OM2', 'OM3', 'OM4'],
      'Connector': ['LC-LC'],
      'Length': ['50m', '100m', '150m', '200m', '250m', '300m'],
    },
    'MPO': {
      'Mode': ['SingleMode', 'OM3', 'OM4'],
      'Connector': ['MPO-MPO', 'MPO-LC', 'MPO-SC'],
      'Fiber Count': ['8', '12', '16'],
      'Length': ['5m', '10m', '15m'],
    }
  };
  

  // Get attribute options for selected category
  const selectedCategory = categories.find(cat => cat.id === categoryId);
  const attributeOptions = selectedCategory ? categoryAttributeOptions[selectedCategory.name] || {} : {};

  
  // Check screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };
  
  // Apply all filters and update URL
  const applyFilters = () => {
    const filters = {
      search: searchQuery || undefined,
      category: categoryId || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      sort: sortBy || undefined,
      page: 1 // Reset to page 1 when filters change
    };

    // Add attribute filters as attr_{AttributeName}
    Object.entries(attributeOptions).forEach(([attrName]) => {
      const value = attributeFilters[attrName];
      if (value && value !== "") {
        filters[`attr_${attrName}`] = value;
      }
    });
    
    navigate(`${location.pathname}${buildQueryString(filters)}`);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('created_at:desc');
    setAttributeFilters({});
    navigate(location.pathname);
  };
  
  // Toggle filter visibility on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };


  // Immediate update when category changes
  useEffect(() => {
    setAttributeFilters({});
    applyFilters();
    // eslint-disable-next-line
  }, [categoryId]);

  // Immediate update when any attribute filter changes
  useEffect(() => {
    if (selectedCategory) {
      applyFilters();
    }
    // eslint-disable-next-line
  }, [attributeFilters, minPrice, maxPrice, sortBy]);


  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Form onSubmit={handleSearch}>
          <Row className="align-items-end">
            <Col md={6} lg={5}>
              <InputGroup className="mb-3 mb-md-0">
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="primary" type="submit">
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
            
            <Col md={4} lg={5} className="mb-3 mb-md-0">
              <Form.Select 
                value={sortBy} 
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setTimeout(applyFilters, 0);
                }}
              >
                <option value="created_at:desc">Newest First</option>
                <option value="created_at:asc">Oldest First</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="name:asc">Name: A-Z</option>
                <option value="name:desc">Name: Z-A</option>
              </Form.Select>
            </Col>
            
            <Col md={2} className="d-flex">
              <Button 
                variant="outline-secondary" 
                className="w-100 me-2 d-flex align-items-center justify-content-center"
                onClick={toggleFilters}
              >
                <FaFilter className="me-md-2" /> 
                <span className="d-none d-md-inline">Filters</span>
              </Button>
              
              <Button 
                variant="outline-danger" 
                className="d-flex align-items-center justify-content-center"
                onClick={resetFilters}
                title="Reset Filters"
              >
                <FaSyncAlt />
              </Button>
            </Col>
          </Row>
          
          <div className={`mt-3 ${!showFilters && 'd-none d-md-block'}`}>
            <hr />
            <Row>
              <Col md={4} className="mb-3 mb-md-0">
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select 
                    value={categoryId} 
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setAttributeFilters({});
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={8}>
                <Form.Label>Price Range</Form.Label>
                <Row>
                  <Col xs={5}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="number"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={2} className="text-center d-flex align-items-center justify-content-center">
                    <span>to</span>
                  </Col>
                  <Col xs={5}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* --- ATTRIBUTE FIELDS AS DROPDOWNS --- */}
            {selectedCategory && Object.keys(attributeOptions).length > 0 && (
              <Row>
                {Object.entries(attributeOptions).map(([attrName, options]) => (
                  <Col md={3} key={attrName}>
                    <Form.Group className="mb-3" controlId={`filter_${attrName}`}>
                      <Form.Label>{attrName}</Form.Label>
                      <Form.Select
                        value={attributeFilters[attrName] || ''}
                        onChange={e => {
                          const value = e.target.value;
                          setAttributeFilters(prev => ({
                            ...prev,
                            [attrName]: value
                          }));
                        }}
                      >
                        <option value="">Any</option>
                        {options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            )}
            {/* --- END ATTRIBUTE FIELDS --- */}
            
            <div className="d-flex justify-content-end mt-2">
              <Button 
                variant="primary" 
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ProductFilter;