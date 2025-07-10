// src/Pages/AdminProductForm.jsx
import React, { useState, useEffect } from 'react'
import { Container, Card, Form, Button } from 'react-bootstrap'

export default function AdminProductForm() {
  const [availableProducts, setAvailableProducts] = useState([])
  const [form, setForm] = useState({ name: '', rate: '', type: '' })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await window.electron.getProducts()
        setAvailableProducts(products)
      } catch (err) {
        console.error('Failed to fetch products', err)
      }
    }

    fetchProducts()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.name || !form.rate) {
    alert('Name and Rate are required');
    return;
  }

  try {
    const result = await window.electron.invoke('add-product', form);
    if (result.success) {
      alert('✅ Product added successfully!');
      setForm({ name: '', rate: '', type: '' });

      // 🔄 Fetch and sort the updated product list
      const updatedProducts = await window.electron.getProducts();
      const sortedProducts = updatedProducts.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setAvailableProducts(sortedProducts);
    } else {
      alert('❌ Failed to add product');
    }
  } catch (error) {
    console.error(error);
    alert('❌ Error occurred');
  }
};


  return (
    <Container className="py-5">
      <Card className="p-4 shadow rounded-4">
        <h3 className="mb-4 text-primary">➕ Add New Product</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              name="name"
              placeholder="e.g., White Marble"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rate per ft² (₨)</Form.Label>
            <Form.Control
              name="rate"
              type="number"
              value={form.rate}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type (optional)</Form.Label>
            <Form.Control
              name="type"
              placeholder="e.g., SLF, Premium"
              value={form.type}
              onChange={handleChange}
            />
          </Form.Group>

          <Button type="submit" variant="success">
            Add Product
          </Button>
        </Form>
        {availableProducts.length > 0 && (
  <Card className="mt-4 p-3 shadow-sm">
    <h5>📦 Existing Products</h5>
    <ul className="mb-0">
      {availableProducts.map((p, i) => (
        <li key={i}>
          {p.name} - {p.type || '—'} — <strong>₨{p.rate}</strong>
        </li>
      ))}
    </ul>
  </Card>
)}

      </Card>
    </Container>
  )
}
