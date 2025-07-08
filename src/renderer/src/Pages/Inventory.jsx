import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Row, Col, Form, Card, Button, Table
} from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import Select from 'react-select';

export default function MarbleSaleApp() {
  const [product, setProduct] = useState({
    description: '',
    type: '',
    length: '',
    width: '',
    rate: '',
    discount: '',
  });

  const [customer, setCustomer] = useState({
    name: '',
    contact: '',
  });

  const [feet, setFeet] = useState(0);
  const [total, setTotal] = useState(0);
  const [productList, setProductList] = useState([]);
  const [received, setReceived] = useState('');
  const printContainerRef = useRef();

  const marbleOptions = [
    { label: 'Black Granite', value: 'Black Granite' },
    { label: 'White Marble', value: 'White Marble' },
    { label: 'Green Marble', value: 'Green Marble' },
    { label: 'Imported Onyx', value: 'Imported Onyx' },
    { label: 'Botticino Classic', value: 'Botticino Classic' }
  ];

  const typeOptions = [
    { label: 'SLF', value: 'SLF' },
    { label: 'Tier 1', value: 'Tier 1' },
    { label: 'Tier 2', value: 'Tier 2' },
    { label: 'Premium', value: 'Premium' }
  ];

  useEffect(() => {
    const { length, width } = product;
    const calcFeet = parseFloat(length) * parseFloat(width);
    setFeet(isNaN(calcFeet) ? 0 : calcFeet);
  }, [product.length, product.width]);

  useEffect(() => {
    const { rate, discount } = product;
    const amount = feet * parseFloat(rate);
    const discounted = amount - parseFloat(discount || 0);
    setTotal(isNaN(discounted) ? 0 : discounted);
  }, [feet, product.rate, product.discount]);

  const handleProductChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleCustomerChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selected, field) => {
    setProduct({ ...product, [field]: selected ? selected.value : '' });
  };

  const addProduct = () => {
    if (!product.description || !product.length || !product.width || !product.rate) {
      alert('Please fill all required product fields.');
      return;
    }

    const newItem = {
      ...product,
      feet: feet.toFixed(2),
      total: total.toFixed(2),
    };

    setProductList([...productList, newItem]);
    setProduct({ description: '', type: '', length: '', width: '', rate: '', discount: '' });
    setFeet(0);
    setTotal(0);
  };

  const deleteProduct = (indexToDelete) => {
    const updatedList = productList.filter((_, index) => index !== indexToDelete);
    setProductList(updatedList);
  };

  const handlePrint = useReactToPrint({
    content: () => printContainerRef.current,
  });

  const finalizeAndSave = async () => {
    const grandTotal = productList.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const remaining = grandTotal - parseFloat(received || 0);

    if (!customer.name || !customer.contact || productList.length === 0) {
      alert("Please enter customer details and add at least one product.");
      return;
    }

    const payload = {
      customer: {
        ...customer,
        received: parseFloat(received || 0),
        total: grandTotal,
        remaining: remaining
      },
      products: productList
    };

    try {
    const result = await window.electron.saveInvoice(payload);


      alert("Invoice saved successfully with ID: " + result.customerId);
        // Clear all inputs after successful save
    setCustomer({ name: '', contact: '', address: '' }); // or your actual fields
    setReceived('');
    setProductList([]);
    setProduct({
      description: '',
      type: '',
      length: '',
      width: '',
      rate: '',
      discount: '',
    });

    // ✅ Optional: scroll to top or focus
    window.scrollTo(0, 0);
    } catch (err) {
      alert("Failed to save invoice.");
      console.error(err);
    }
  };

  const grandTotal = productList.reduce((sum, item) => sum + parseFloat(item.total), 0);
  const remaining = grandTotal - parseFloat(received || 0);

  return (
    <Container fluid className="py-4 px-3" style={{ maxHeight: '100vh', overflow: 'auto' }}>
      {/* CUSTOMER INFO SECTION */}
      <Card className="shadow-sm rounded-4 p-3 mb-4">
        <Card.Title className="fs-4 text-primary">👤 Customer Information</Card.Title>
        <Row className="mb-2">
          <Col md={4}>
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={customer.name}
              onChange={handleCustomerChange}
              placeholder="Enter customer name"
            />
          </Col>
          <Col md={4}>
            <Form.Label>Contact</Form.Label>
            <Form.Control
              name="contact"
              value={customer.contact}
              onChange={handleCustomerChange}
              placeholder="Enter contact number"
            />
          </Col>
        </Row>
      </Card>

      {/* ADD PRODUCT SECTION */}
      <Card className="shadow-sm rounded-4 p-3 mb-4">
        <Card.Title className="fs-4 text-success">➕ Add Marble Product</Card.Title>
        <Form>
          <Row className="mb-2">
            <Col md={4}>
              <Form.Label>Description</Form.Label>
              <Select
                options={marbleOptions}
                value={marbleOptions.find(opt => opt.value === product.description)}
                onChange={(selected) => handleSelectChange(selected, 'description')}
                placeholder="Select Marble"
                isClearable
              />
            </Col>
            <Col md={2}>
              <Form.Label>Type</Form.Label>
              <Select
                options={typeOptions}
                value={typeOptions.find(opt => opt.value === product.type)}
                onChange={(selected) => handleSelectChange(selected, 'type')}
                placeholder="Select Type"
                isClearable
              />
            </Col>
            <Col md={2}>
              <Form.Label>Length (ft)</Form.Label>
              <Form.Control
                name="length"
                type="number"
                value={product.length}
                onChange={handleProductChange}
              />
            </Col>
            <Col md={2}>
              <Form.Label>Width (ft)</Form.Label>
              <Form.Control
                name="width"
                type="number"
                value={product.width}
                onChange={handleProductChange}
              />
            </Col>
            <Col md={2}>
              <Form.Label>Rate per ft² (₨)</Form.Label>
              <Form.Control
                name="rate"
                type="number"
                value={product.rate}
                onChange={handleProductChange}
              />
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={3}>
              <Form.Label>Discount (₨)</Form.Label>
              <Form.Control
                name="discount"
                type="number"
                value={product.discount}
                onChange={handleProductChange}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Total ft²</Form.Label>
              <Form.Control value={feet.toFixed(2)} readOnly />
            </Col>
            <Col md={3}>
              <Form.Label>Total Amount (₨)</Form.Label>
              <Form.Control value={total.toFixed(2)} readOnly className="text-success fw-bold" />
            </Col>
          </Row>
          <div className="text-end">
            <Button onClick={addProduct} variant="success">Add Product</Button>
          </div>
        </Form>
      </Card>

      {/* PRODUCT LIST TABLE + PAYMENT SUMMARY */}
      {productList.length > 0 && (
        <div ref={printContainerRef} className="print-area">
          <Card className="shadow-sm rounded-4 p-3 mb-4">
            <div className="text-center mb-4 d-none d-print-block">
              <h4 className="fw-bold mb-1">🏢 Marble Factory</h4>
              <p className="mb-0">Main GT Road, Lahore</p>
              <p>📞 Contact: 0300-1234567</p>
              <hr />
              <h5 className="fw-bold">🧾 Invoice</h5>
            </div>

            <Table bordered hover responsive size="sm" className="text-center">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Length</th>
                  <th>Width</th>
                  <th>ft²</th>
                  <th>Rate</th>
                  <th>Discount</th>
                  <th>Total (₨)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {productList.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.description}</td>
                    <td>{item.type}</td>
                    <td>{item.length}</td>
                    <td>{item.width}</td>
                    <td>{item.feet}</td>
                    <td>{item.rate}</td>
                    <td>{item.discount}</td>
                    <td><strong>{item.total}</strong></td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteProduct(index)}
                      >
                        🗑️ Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* PAYMENT SUMMARY */}
            <div className="d-flex justify-content-end">
              <div className="bg-light p-3 rounded-3 mt-3 w-100 w-md-50">
                <Row className="mb-2">
                  <Col md={12} className="text-end">
                    <div><strong>🧮 Grand Total:</strong> <span className="text-success fs-5">₨ {grandTotal.toFixed(2)}</span></div>
                    <div className="mt-2">
                      <Form.Label>Received Payment (₨)</Form.Label>
                     <div>
                       <Form.Control
                        type="number"
                        placeholder="e.g. 12000"
                        value={received}
                        onChange={(e) => setReceived(e.target.value)}
                      />
                     </div>
                    </div>
                    <div className="mt-2">
                      <strong>💰 Remaining Payment:</strong>{' '}
                      <span className={`fs-5 ${remaining > 0 ? 'text-danger' : 'text-success'}`}>
                        ₨ {remaining.toFixed(2)}
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* PRINT & SAVE BUTTONS */}
      {productList.length > 0 && (
        <div className="text-end mb-5">
          <Button onClick={finalizeAndSave} variant="success" className="me-2">💾 Finalize & Save</Button>
          <Button onClick={handlePrint} variant="primary">🖨️ Print Invoice</Button>
        </div>
      )}
    </Container>
  );
}
