import { useEffect, useState } from "react";

function History() {
  const [tab, setTab] = useState("full");
  const [search, setSearch] = useState("");

  const [fullCustomers, setFullCustomers] = useState([]);
  const [partialCustomers, setPartialCustomers] = useState([]);
  const [orderProducts, setOrderProducts] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchFullCustomers();
    fetchPartialCustomers();
    fetchOrderProducts();
    fetchProducts();
  }, []);

  const fetchFullCustomers = async () => {
    const result = await window.electron.getFullCustomerDetails();
    setFullCustomers(result);
  };

  const fetchPartialCustomers = async () => {
    const result = await window.electron.getPartialCustomerDetails();
    setPartialCustomers(result);
  };

  const fetchOrderProducts = async () => {
    const result = await window.electron.getAllOrderInvoiceProducts();
    setOrderProducts(result);
  };

  const fetchProducts = async () => {
    const result = await window.electron.getProducts();
    setProducts(result);
  };

  const handleSearch = (items, fields) => {
    if (!search.trim()) return items;
    return items.filter(item =>
      fields.some(field => item[field]?.toString().toLowerCase().includes(search.toLowerCase()))
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Database History</h2>

      <input
        type="text"
        placeholder="Search by Name, Contact, CNIC..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-1 mb-4 w-64"
      />

      <div className="flex mb-4 space-x-2">
        {["full", "partial", "orders", "products"].map(type => (
          <button
            key={type}
            onClick={() => setTab(type)}
            className={tab === type
              ? "bg-blue-600 text-white px-4 py-1 rounded"
              : "bg-gray-200 px-4 py-1 rounded"}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Full Customers Tab */}
      {tab === "full" && (
        <>
          <h3 className="font-semibold mb-2">Full Customers (Flat Table)</h3>
          <table className="border w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-1">Invoice ID</th>
                <th className="border p-1">Created At</th>
                <th className="border p-1">Description</th>
                <th className="border p-1">Type</th>
                <th className="border p-1">Feet</th>
                <th className="border p-1">Rate</th>
                <th className="border p-1">Discount</th>
                <th className="border p-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {handleSearch(fullCustomers, ["id"]).flatMap(customer =>
                customer.products.map((product, index) => (
                  <tr key={`${customer.id}-${index}`}>
                    <td className="border p-1">{customer.id}</td>
                    <td className="border p-1">{customer.created_at}</td>
                    <td className="border p-1">{product.description}</td>
                    <td className="border p-1">{product.type}</td>
                    <td className="border p-1">{product.feet}</td>
                    <td className="border p-1">{product.rate}</td>
                    <td className="border p-1">{product.discount}</td>
                    <td className="border p-1">{product.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Partial Customers Tab */}
      {tab === "partial" && (
        <>
          <h3 className="font-semibold mb-2">Partial Customers</h3>
          <table className="border w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-1">Invoice ID</th>
                <th className="border p-1">CNIC</th>
                <th className="border p-1">Contact</th>
                <th className="border p-1">Created At</th>
                <th className="border p-1">Description</th>
                <th className="border p-1">Type</th>
                <th className="border p-1">Feet</th>
                <th className="border p-1">Rate</th>
                <th className="border p-1">Discount</th>
                <th className="border p-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {handleSearch(partialCustomers, ["id", "contact", "cnic"]).flatMap(customer =>
                customer.products.map((product, index) => (
                  <tr key={`${customer.id}-${index}`}>
                    <td className="border p-1">{customer.id}</td>
                    <td className="border p-1">{customer.cnic}</td>
                    <td className="border p-1">{customer.contact}</td>
                    <td className="border p-1">{customer.created_at}</td>
                    <td className="border p-1">{product.description}</td>
                    <td className="border p-1">{product.type}</td>
                    <td className="border p-1">{product.feet}</td>
                    <td className="border p-1">{product.rate}</td>
                    <td className="border p-1">{product.discount}</td>
                    <td className="border p-1">{product.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <>
          <h3 className="font-semibold mb-2">All Order Products</h3>
          <table className="border w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-1">Invoice ID</th>
                <th className="border p-1">Customer Type</th>
                <th className="border p-1">Description</th>
                <th className="border p-1">Type</th>
                <th className="border p-1">Feet</th>
                <th className="border p-1">Rate</th>
                <th className="border p-1">Discount</th>
                <th className="border p-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {handleSearch(orderProducts, ["description", "customer_type"]).map(item => (
                <tr key={item.id}>
                  <td className="border p-1">{item.invoice_id}</td>
                  <td className="border p-1">{item.customer_type}</td>
                  <td className="border p-1">{item.description}</td>
                  <td className="border p-1">{item.type}</td>
                  <td className="border p-1">{item.feet}</td>
                  <td className="border p-1">{item.rate}</td>
                  <td className="border p-1">{item.discount}</td>
                  <td className="border p-1">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Products Tab */}
      {tab === "products" && (
        <>
          <h3 className="font-semibold mb-2">Products Table</h3>
          <table className="border w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-1">ID</th>
                <th className="border p-1">Name</th>
                <th className="border p-1">Rate</th>
                <th className="border p-1">Type</th>
              </tr>
            </thead>
            <tbody>
              {handleSearch(products, ["name"]).map(item => (
                <tr key={item.id}>
                  <td className="border p-1">{item.id}</td>
                  <td className="border p-1">{item.name}</td>
                  <td className="border p-1">{item.rate}</td>
                  <td className="border p-1">{item.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default History;
