import React, { useState, useEffect } from 'react';
import {
  Container, Card, Form, Button, Row, Col, Table, Pagination,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function AdminProductForm() {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [form, setForm] = useState({ name: '', rate: '', type: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const products = await window.electron.getProducts();
      setAvailableProducts(products.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('❌ Failed to fetch products', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.rate) {
      alert('Name and Rate are required');
      return;
    }

    try {
      let result;
      if (editIndex !== null) {
        result = await window.electron.invoke('update-product', form);
        if (result.success) {
          alert('✅ Product updated successfully!');
        } else {
          alert('❌ Failed to update product');
        }
      } else {
        result = await window.electron.invoke('add-product', form);
        if (result.success) {
          alert('✅ Product added successfully!');
        } else {
          alert('❌ Failed to add product');
        }
      }

      setForm({ name: '', rate: '', type: '' });
      setEditIndex(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert('❌ Error occurred');
    }
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditIndex(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure to delete "${product.name}"?`)) return;

    try {
      const result = await window.electron.invoke('delete-product', product);
      if (result.success) {
        alert('🗑️ Product deleted!');
        fetchProducts();
      } else {
        alert('❌ Failed to delete product');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Error during deletion');
    }
  };

  // Pagination
  const totalPages = Math.ceil(availableProducts.length / pageSize);
  const paginatedProducts = availableProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Container className="py-5">
      <Card className="p-4 shadow rounded-4 mb-4">
        <h3 className="mb-4 text-primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          {editIndex !== null ? 'Update Product' : 'Add New Product'}
        </h3>

        <Form onSubmit={handleSubmit}>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                name="name"
                placeholder="e.g., White Marble"
                value={form.name}
                onChange={handleChange}
                required
                disabled={editIndex !== null} // prevent changing name during update
              />
            </Col>
            <Col md={3}>
              <Form.Label>Rate per ft² (₨)</Form.Label>
              <Form.Control
                name="rate"
                type="number"
                value={form.rate}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={3}>
              <Form.Label>Type (optional)</Form.Label>
              <Form.Control
                name="type"
                placeholder="e.g., SLF, Premium"
                value={form.type}
                onChange={handleChange}
              />
            </Col>
            <Col md={2}>
              <Button type="submit" variant={editIndex !== null ? 'warning' : 'success'} className="w-100">
                {editIndex !== null ? 'Update' : 'Add'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card className="p-4 shadow-sm rounded-4">
        <h5 className="mb-3 text-dark">📦 Product List</h5>
        {availableProducts.length === 0 ? (
          <p>No products added yet.</p>
        ) : (
          <>
            <Table striped bordered hover responsive className="text-center">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Rate (₨)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p, index) => (
                  <tr key={index}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.type || '—'}</td>
                    <td>{p.rate}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(p)}
                      >
                        <FontAwesomeIcon icon={faEdit} /> 
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(p)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> 
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination Controls */}
            <Pagination className="justify-content-center">
              {[...Array(totalPages).keys()].map((page) => (
                <Pagination.Item
                  key={page + 1}
                  active={currentPage === page + 1}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  {page + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </>
        )}
      </Card>
    </Container>
  );
}
