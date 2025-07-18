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

  const [productCustomerType, setProductCustomerType] = useState('full');

  const [partialCustomerDetails, setPartialCustomerDetails] = useState({
    contact: '',
    cnic: ''
  });

  const [availableProducts, setAvailableProducts] = useState([]);
  const [marbleOptions, setMarbleOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  const [feet, setFeet] = useState(0);
  const [total, setTotal] = useState(0);
  const [productList, setProductList] = useState([]);
  const [received, setReceived] = useState('');
  const [fullInvoices, setFullInvoices] = useState([]);
  const [partialInvoices, setPartialInvoices] = useState([]);

  const printContainerRef = useRef();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await window.electron.getProducts();
        products.sort((a, b) => a.name.localeCompare(b.name));
        setAvailableProducts(products);

        const uniqueNames = [...new Set(products.map((p) => p.name))];
        const uniqueTypes = [...new Set(products.map((p) => p.type))];

        setMarbleOptions(uniqueNames.map(name => ({ label: name, value: name })));
        setTypeOptions(uniqueTypes.map(type => ({ label: type, value: type })));
      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
      }
    };

    fetchProducts();
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const full = await window.electron.getAllFullInvoices();
      const partial = await window.electron.getAllPartialInvoices();
      setFullInvoices(full);
      setPartialInvoices(partial);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };

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

  const handleSelectChange = (selected, field) => {
    const value = selected ? selected.value : '';
    const updated = { ...product, [field]: value };

    const match = availableProducts.find(p =>
      p.name === (field === 'description' ? value : updated.description) &&
      p.type === (field === 'type' ? value : updated.type)
    );
    if (match) {
      updated.rate = match.rate.toString();
    }

    setProduct(updated);
  };

  const addProduct = () => {
    if (!product.description || !product.length || !product.width || !product.rate) {
      alert('Please fill all required product fields.');
      return;
    }

    if (productCustomerType === 'partial') {
  if (!partialCustomerDetails.contact || !partialCustomerDetails.cnic) {
    alert("⚠️ Please provide CNIC and Contact for partial customer.");
    return;
  }
}

    const newItem = {

      ...product,
      customerType: productCustomerType,
      contact: productCustomerType === 'partial' ? partialCustomerDetails.contact : '',
      cnic: productCustomerType === 'partial' ? partialCustomerDetails.cnic : '',
      feet: feet.toFixed(2),
      total: total.toFixed(2),
    };

    setProductList([...productList, newItem]);
    setProduct({ description: '', type: '', length: '', width: '', rate: '', discount: '' });
    // setPartialCustomerDetails({ contact: '', cnic: '' });
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

  const grandTotal = productList.reduce((sum, item) => sum + parseFloat(item.total), 0);
  const remaining = grandTotal - parseFloat(received || 0);

  return (
    <Container fluid className="py-4 px-3" style={{ maxHeight: '100vh', overflow: 'auto' }}>
      {/* Product Form Section */}
      <Card className="shadow-sm rounded-4 p-3 mb-4">
        <Card.Title className="fs-4 text-success">➕ Add Marble Product</Card.Title>
        <Form>
          <Row className="mb-2">
              <Col md={3}>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="contact"
                    value={partialCustomerDetails.contact}
                    onChange={(e) => setPartialCustomerDetails({ ...partialCustomerDetails, contact: e.target.value })}
                    placeholder="Name"
                  />
                </Col>
            <Col md={2}>
              <Form.Label>Customer Type</Form.Label>
              <Form.Select
                value={productCustomerType}
                onChange={(e) => setProductCustomerType(e.target.value)}
              >
                <option value="full">Full</option>
                <option value="partial">Partial</option>
              </Form.Select>
            </Col>

            {productCustomerType === 'partial' && (
              <>
                <Col md={3}>
                  <Form.Label>CNIC</Form.Label>
                  <Form.Control
                    name="cnic"
                    value={partialCustomerDetails.cnic}
                    onChange={(e) => setPartialCustomerDetails({ ...partialCustomerDetails, cnic: e.target.value })}
                    placeholder="e.g. 35201-xxxxxxx-x"
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Contact</Form.Label>
                  <Form.Control
                    name="contact"
                    value={partialCustomerDetails.contact}
                    onChange={(e) => setPartialCustomerDetails({ ...partialCustomerDetails, contact: e.target.value })}
                    placeholder="Enter contact number"
                  />
                </Col>
              </>
            )}

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

      {/* Product List Section */}
      {productList.length > 0 && (
        <Card className="shadow-sm rounded-4 p-3 mb-4">
          <Card.Title className="fs-5">🧾 Added Products</Card.Title>
          <Table bordered hover responsive size="sm" className="text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>ft²</th>
                <th>Rate</th>
                <th>Total (₨)</th>
                {productCustomerType === 'partial' && <th>Contact</th>}
                {productCustomerType === 'partial' && <th>CNIC</th>}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.description}</td>
                  <td>{item.type}</td>
                  <td>{item.feet}</td>
                  <td>{item.rate}</td>
                  <td>{item.total}</td>
                  {item.customerType === 'partial' && <td>{item.contact}</td>}
                  {item.customerType === 'partial' && <td>{item.cnic}</td>}
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deleteProduct(index)}
                    >
                      🗑️
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="text-end mb-4">
            <Button
              variant="primary"
              onClick={async () => {
                if (productList.length === 0) {
                  alert("⚠️ Please add at least one product.");
                  return;
                }

                const payload = {
                  products: productList,
                  ...(productCustomerType === 'partial' && {
                    contact: partialCustomerDetails.contact,
                    cnic: partialCustomerDetails.cnic,
                  })
                };

                try {
                  if (productCustomerType === 'full') {
                    await window.electron.saveFullInvoice(payload);
                  } else {
                    await window.electron.savePartialInvoice(payload);
                  }

                  alert("✅ Order invoice saved to database.");
                  setProductList([]);
                  fetchInvoices();
                } catch (err) {
                  console.error(err);
                  alert("❌ Failed to save order invoice.");
                }
              }}
            >
              💾 Finalize & Save
            </Button>
          </div>
        </Card>
      )}

      {/* Saved Invoices Section */}
      <Card className="shadow-sm rounded-4 p-3 mb-4">
        <Card.Title className="fs-5">📄 Saved Invoices</Card.Title>

       <Table bordered hover responsive size="sm" className="text-center">
  <thead className="table-dark">
    <tr>
      <th>#</th>
      <th>Description</th>
      <th>Type</th>
      <th>ft²</th>
      <th>Rate</th>
      <th>Total (₨)</th>
      {productCustomerType === 'partial' && <th>Contact</th>}
      {productCustomerType === 'partial' && <th>CNIC</th>}
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {productList.map((item, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.description}</td>
        <td>{item.type}</td>
        <td>{item.feet}</td>
        <td>{item.rate}</td>
        <td>{item.total}</td>
        {productCustomerType === 'partial' && <td>{item.contact}</td>}
        {productCustomerType === 'partial' && <td>{item.cnic}</td>}
        <td>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => deleteProduct(index)}
          >
            🗑️
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>

      </Card>
    </Container>
  );
}


// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Container, Row, Col, Form, Card, Button, Table
// } from 'react-bootstrap';
// import { useReactToPrint } from 'react-to-print';
// import Select from 'react-select';

// export default function MarbleSaleApp() {
//   const [product, setProduct] = useState({
//     description: '',
//     type: '',
//     length: '',
//     width: '',
//     rate: '',
//     discount: '',
//   });

//   const [productCustomerType, setProductCustomerType] = useState('full');

//   const [partialCustomerDetails, setPartialCustomerDetails] = useState({
//     contact: '',
//     cnic: ''
//   });

//   const [availableProducts, setAvailableProducts] = useState([]);
//   const [marbleOptions, setMarbleOptions] = useState([]);
//   const [typeOptions, setTypeOptions] = useState([]);

//   const [feet, setFeet] = useState(0);
//   const [total, setTotal] = useState(0);
//   const [productList, setProductList] = useState([]);
//   const [received, setReceived] = useState('');
//   const printContainerRef = useRef();

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const products = await window.electron.getProducts();
//         products.sort((a, b) => a.name.localeCompare(b.name));
//         setAvailableProducts(products);

//         const uniqueNames = [...new Set(products.map((p) => p.name))];
//         const uniqueTypes = [...new Set(products.map((p) => p.type))];

//         setMarbleOptions(uniqueNames.map(name => ({ label: name, value: name })));
//         setTypeOptions(uniqueTypes.map(type => ({ label: type, value: type })));
//       } catch (err) {
//         console.error("❌ Failed to fetch products:", err);
//       }
//     };

//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     const { length, width } = product;
//     const calcFeet = parseFloat(length) * parseFloat(width);
//     setFeet(isNaN(calcFeet) ? 0 : calcFeet);
//   }, [product.length, product.width]);

//   useEffect(() => {
//     const { rate, discount } = product;
//     const amount = feet * parseFloat(rate);
//     const discounted = amount - parseFloat(discount || 0);
//     setTotal(isNaN(discounted) ? 0 : discounted);
//   }, [feet, product.rate, product.discount]);

//   const handleProductChange = (e) => {
//     setProduct({ ...product, [e.target.name]: e.target.value });
//   };

//   const handleSelectChange = (selected, field) => {
//     const value = selected ? selected.value : '';
//     const updated = { ...product, [field]: value };

//     const match = availableProducts.find(p =>
//       p.name === (field === 'description' ? value : updated.description) &&
//       p.type === (field === 'type' ? value : updated.type)
//     );
//     if (match) {
//       updated.rate = match.rate.toString();
//     }

//     setProduct(updated);
//   };

//   const addProduct = () => {
//     if (!product.description || !product.length || !product.width || !product.rate) {
//       alert('Please fill all required product fields.');
//       return;
//     }

//     if (productCustomerType === 'partial' && (!partialCustomerDetails.contact || !partialCustomerDetails.cnic)) {
//       alert('Please fill CNIC and Contact for partial customer.');
//       return;
//     }

//     const newItem = {
//       ...product,
//       customerType: productCustomerType,
//       contact: partialCustomerDetails.contact,
//       cnic: partialCustomerDetails.cnic,
//       feet: feet.toFixed(2),
//       total: total.toFixed(2),
//     };

//     setProductList([...productList, newItem]);
//     setProduct({ description: '', type: '', length: '', width: '', rate: '', discount: '' });
//     setPartialCustomerDetails({ contact: '', cnic: '' });
//     setFeet(0);
//     setTotal(0);
//   };

//   const deleteProduct = (indexToDelete) => {
//     const updatedList = productList.filter((_, index) => index !== indexToDelete);
//     setProductList(updatedList);
//   };

//   const handlePrint = useReactToPrint({
//     content: () => printContainerRef.current,
//   });

//   const grandTotal = productList.reduce((sum, item) => sum + parseFloat(item.total), 0);
//   const remaining = grandTotal - parseFloat(received || 0);

//   return (
//     <Container fluid className="py-4 px-3" style={{ maxHeight: '100vh', overflow: 'auto' }}>
//       <Card className="shadow-sm rounded-4 p-3 mb-4">
//         <Card.Title className="fs-4 text-success">➕ Add Marble Product</Card.Title>
//         <Form>
//           <Row className="mb-2">
//             <Col md={2}>
//               <Form.Label>Customer Type</Form.Label>
//               <Form.Select
//                 value={productCustomerType}
//                 onChange={(e) => setProductCustomerType(e.target.value)}
//               >
//                 <option value="full">Full</option>
//                 <option value="partial">Partial</option>
//               </Form.Select>
//             </Col>

//             {productCustomerType === 'partial' && (
//               <>
//                 <Col md={3}>
//                   <Form.Label>CNIC</Form.Label>
//                   <Form.Control
//                     name="cnic"
//                     value={partialCustomerDetails.cnic}
//                     onChange={(e) => setPartialCustomerDetails({ ...partialCustomerDetails, cnic: e.target.value })}
//                     placeholder="e.g. 35201-xxxxxxx-x"
//                   />
//                 </Col>
//                 <Col md={3}>
//                   <Form.Label>Contact</Form.Label>
//                   <Form.Control
//                     name="contact"
//                     value={partialCustomerDetails.contact}
//                     onChange={(e) => setPartialCustomerDetails({ ...partialCustomerDetails, contact: e.target.value })}
//                     placeholder="Enter contact number"
//                   />
//                 </Col>
//               </>
//             )}

//             <Col md={4}>
//               <Form.Label>Description</Form.Label>
//               <Select
//                 options={marbleOptions}
//                 value={marbleOptions.find(opt => opt.value === product.description)}
//                 onChange={(selected) => handleSelectChange(selected, 'description')}
//                 placeholder="Select Marble"
//                 isClearable
//               />
//             </Col>

//             <Col md={2}>
//               <Form.Label>Type</Form.Label>
//               <Select
//                 options={typeOptions}
//                 value={typeOptions.find(opt => opt.value === product.type)}
//                 onChange={(selected) => handleSelectChange(selected, 'type')}
//                 placeholder="Select Type"
//                 isClearable
//               />
//             </Col>
//             <Col md={2}>
//               <Form.Label>Length (ft)</Form.Label>
//               <Form.Control
//                 name="length"
//                 type="number"
//                 value={product.length}
//                 onChange={handleProductChange}
//               />
//             </Col>
//             <Col md={2}>
//               <Form.Label>Width (ft)</Form.Label>
//               <Form.Control
//                 name="width"
//                 type="number"
//                 value={product.width}
//                 onChange={handleProductChange}
//               />
//             </Col>
//             <Col md={2}>
//               <Form.Label>Rate per ft² (₨)</Form.Label>
//               <Form.Control
//                 name="rate"
//                 type="number"
//                 value={product.rate}
//                 onChange={handleProductChange}
//               />
//             </Col>
//           </Row>
//           <Row className="mb-2">
//             <Col md={3}>
//               <Form.Label>Discount (₨)</Form.Label>
//               <Form.Control
//                 name="discount"
//                 type="number"
//                 value={product.discount}
//                 onChange={handleProductChange}
//               />
//             </Col>
//             <Col md={3}>
//               <Form.Label>Total ft²</Form.Label>
//               <Form.Control value={feet.toFixed(2)} readOnly />
//             </Col>
//             <Col md={3}>
//               <Form.Label>Total Amount (₨)</Form.Label>
//               <Form.Control value={total.toFixed(2)} readOnly className="text-success fw-bold" />
//             </Col>
//           </Row>
//           <div className="text-end">
//             <Button onClick={addProduct} variant="success">Add Product</Button>
//           </div>
//         </Form>
//       </Card>
//     </Container>
//   );
// }
