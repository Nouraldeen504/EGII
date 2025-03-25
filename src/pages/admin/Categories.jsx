import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { categoryService } from '../../services/categoryService';
import { formatDate } from '../../utils/helpers';
import AdminLayout from '../../components/admin/AdminLayout';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

// Validation schema for category form
const CategorySchema = Yup.object().shape({
  name: Yup.string()
    .required('Category name is required')
    .min(2, 'Name is too short')
    .max(50, 'Name is too long'),
  description: Yup.string()
    .nullable(),
  image_url: Yup.string()
    .nullable()
    .url('Invalid URL format')
});

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle add category
  const handleAddCategory = async (values, { resetForm }) => {
    try {
      setFormSubmitting(true);
      
      // Create new category
      const newCategory = await categoryService.createCategory(values);
      
      // Update categories list
      setCategories([...categories, newCategory]);
      
      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
      
      toast.success(`Category "${newCategory.name}" has been created!`);
    } catch (err) {
      console.error('Error adding category:', err);
      toast.error('Failed to add category. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // Handle edit category
  const handleEditCategory = async (values) => {
    if (!categoryToEdit) return;
    
    try {
      setFormSubmitting(true);
      
      // Update category
      const updatedCategory = await categoryService.updateCategory(categoryToEdit.id, values);
      
      // Update categories list
      setCategories(categories.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      ));
      
      // Close modal and reset
      setShowEditModal(false);
      setCategoryToEdit(null);
      
      toast.success(`Category "${updatedCategory.name}" has been updated!`);
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error('Failed to update category. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // Prepare for category deletion
  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteError(null);
    setShowDeleteModal(true);
  };
  
  // Handle category deletion
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      setFormSubmitting(true);
      setDeleteError(null);
      
      await categoryService.deleteCategory(categoryToDelete.id);
      
      // Update categories list
      setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
      
      // Close modal and reset
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      
      toast.success(`Category "${categoryToDelete.name}" has been deleted!`);
    } catch (err) {
      console.error('Error deleting category:', err);
      setDeleteError(err.message || 'Failed to delete category. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // Open edit modal with category data
  const openEditModal = (category) => {
    setCategoryToEdit(category);
    setShowEditModal(true);
  };
  
  // Render category form (used for both add and edit)
  const renderCategoryForm = (initialValues, onSubmit, title) => (
    <Formik
      initialValues={initialValues}
      validationSchema={CategorySchema}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, handleChange, handleBlur, values, touched, errors }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          
          <Modal.Body>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.name && !!errors.name}
                placeholder="Enter category name"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={values.description || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.description && !!errors.description}
                placeholder="Enter category description"
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="image_url">
              <Form.Label>Image URL (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="image_url"
                value={values.image_url || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.image_url && !!errors.image_url}
                placeholder="Enter image URL"
              />
              <Form.Control.Feedback type="invalid">
                {errors.image_url}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Enter a URL for the category image.
              </Form.Text>
            </Form.Group>
            
            {values.image_url && (
              <div className="text-center mb-3">
                <img 
                  src={values.image_url} 
                  alt="Category Preview" 
                  className="img-thumbnail"
                  style={{ maxHeight: '150px', objectFit: 'contain' }}
                />
              </div>
            )}
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              title === 'Add Category' ? setShowAddModal(false) : setShowEditModal(false);
            }}>
              <FaTimes className="me-1" /> Cancel
            </Button>
            
            <Button 
              variant="primary" 
              type="submit"
              disabled={formSubmitting}
              className="d-flex align-items-center"
            >
              {formSubmitting ? (
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
                  <FaSave className="me-1" /> Save
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Formik>
  );
  
  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Categories</h1>
          <Button 
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="d-flex align-items-center"
          >
            <FaPlus className="me-2" /> Add Category
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading categories...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : categories.length === 0 ? (
          <Alert variant="info">
            No categories found. Add your first category!
          </Alert>
        ) : (
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '80px' }}>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.id}>
                      <td>
                        {category.image_url ? (
                          <img 
                            src={category.image_url} 
                            alt={category.name}
                            width="50"
                            height="50"
                            className="rounded"
                          />
                        ) : (
                          <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                            <span className="text-muted small">No img</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-bold">{category.name}</div>
                        <div className="text-muted small">{category.id.substring(0, 8)}</div>
                      </td>
                      <td>
                        {category.description ? 
                          (category.description.length > 80 ? 
                            `${category.description.substring(0, 80)}...` : 
                            category.description
                          ) : 
                          <span className="text-muted fst-italic">No description</span>
                        }
                      </td>
                      <td>{formatDate(category.created_at)}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => openEditModal(category)}
                            className="me-2 d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <FaEdit />
                          </Button>
                          
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => confirmDelete(category)}
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
        )}
        
        {/* Add Category Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          {renderCategoryForm(
            { name: '', description: '', image_url: '' },
            handleAddCategory,
            'Add Category'
          )}
        </Modal>
        
        {/* Edit Category Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          {categoryToEdit && renderCategoryForm(
            {
              name: categoryToEdit.name,
              description: categoryToEdit.description || '',
              image_url: categoryToEdit.image_url || ''
            },
            handleEditCategory,
            'Edit Category'
          )}
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {categoryToDelete && (
              <>
                <p>Are you sure you want to delete the following category?</p>
                <div className="d-flex align-items-center mb-3">
                  {categoryToDelete.image_url ? (
                    <img 
                      src={categoryToDelete.image_url} 
                      alt={categoryToDelete.name}
                      width="50"
                      height="50"
                      className="rounded me-3"
                    />
                  ) : (
                    <div className="bg-light rounded d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                      <span className="text-muted small">No img</span>
                    </div>
                  )}
                  <div>
                    <div className="fw-bold">{categoryToDelete.name}</div>
                    <div className="text-muted small">ID: {categoryToDelete.id.substring(0, 8)}</div>
                  </div>
                </div>
                
                {deleteError ? (
                  <Alert variant="danger">
                    {deleteError}
                  </Alert>
                ) : (
                  <Alert variant="warning">
                    <FaExclamationTriangle className="me-2" />
                    This action cannot be undone. Deleting a category that has associated products is not allowed.
                  </Alert>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteCategory}
              disabled={formSubmitting}
            >
              {formSubmitting ? 'Deleting...' : 'Delete Category'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
};

export default AdminCategories;