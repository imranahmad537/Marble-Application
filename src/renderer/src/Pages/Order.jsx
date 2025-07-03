import React, { useEffect, useState } from 'react';

export default function Order() {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customer, setCustomer] = useState({
    id: '',
    name: '',
    contact: '',
    type: '',
    address: '',
  });

  const [newCustomer, setNewCustomer] = useState({ id: '', name: '', contact: '', type: '', address: '' });

  const [orderItems, setOrderItems] = useState([
    { description: '', width: '', length: '', qty: '', type: '', feet: 0, rate: '', amount: 0 },
  ]);

  const [summary, setSummary] = useState({
    advance: 0,
    received: 0,
    total: 0,
    closing: 0,
    notes: '',
  });

  const [orderDate, setOrderDate] = useState('');
  const [orderTime, setOrderTime] = useState('');

  useEffect(() => {
    const now = new Date();
    setOrderDate(now.toISOString().split('T')[0]);
    setOrderTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  useEffect(() => {
    const total = orderItems.reduce((sum, item) => sum + item.amount, 0);
    const closing = total - (parseFloat(summary.advance) || 0) - (parseFloat(summary.received) || 0);
    setSummary(prev => ({ ...prev, total, closing }));
  }, [orderItems, summary.advance, summary.received]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;

    const item = newItems[index];
    const width = parseFloat(item.width) || 0;
    const length = parseFloat(item.length) || 0;
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;

    let feet = 0;
    switch (item.type) {
      case 'sft': feet = width * length * qty; break;
      case 'stair top':
      case 'self':
      case 'farma':
      case '6inch': feet = width * qty; break;
      case 'rft': feet = length * qty; break;
      default: feet = 0;
    }

    newItems[index].feet = feet;
    newItems[index].amount = feet * rate;

    const last = newItems.length - 1;
    const lastItem = newItems[last];
    if (
      index === last &&
      lastItem.description &&
      lastItem.width &&
      lastItem.length &&
      lastItem.qty &&
      lastItem.type &&
      lastItem.rate
    ) {
      newItems.push({
        description: '', width: '', length: '', qty: '', type: '', feet: 0, rate: '', amount: 0
      });
    }

    setOrderItems(newItems);
  };

  const deleteItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const saveNewCustomer = () => {
    setCustomer({ ...newCustomer });
    setNewCustomer({ id: '', name: '', contact: '', type: '', address: '' });
    setShowCustomerModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
    <div className="bg-blue-50 p-2 rounded text-xs">
  <div className="flex justify-between items-start mb-1">
    <h2 className="text-sm font-semibold text-blue-700">Customer Details</h2>
    <button
      onClick={() => setShowCustomerModal(true)}
      className="bg-blue-600 text-white px-2 text-xs rounded hover:bg-blue-700 h-5"
    >
      + Add Customer
    </button>
  </div>
  
  {/* Customer Name */}
  <div className="flex items-center w-full">
    <label className="text-gray-700 w-16 mr-1">Name</label>
    <input 
      value={customer.name} 
      readOnly 
      className="border px-1 flex-1 max-w-md text-xs h-5" 
    />
  </div>
  
  {/* Contact No */}
  <div className="flex items-center w-full mt-0.5">
    <label className="text-gray-700 w-16 mr-1">Contact</label>
    <input 
      value={customer.contact} 
      readOnly 
      className="border  px-1 flex-1 max-w-xs text-xs h-5" 
    />
  </div>
  
  {/* Date */}
  <div className="flex items-center w-full mt-0.5">
    <label className="text-gray-700 w-16 mr-1">Date</label>
    <input 
      type="date" 
      value={orderDate} 
      onChange={e => setOrderDate(e.target.value)} 
      className="border px-1 flex-1 max-w-xs text-xs h-5" 
    />
  </div>
  
  {/* Time */}
  <div className="flex items-center w-full mt-0.5">
    <label className="text-gray-700 w-16 mr-1">Time</label>
    <input 
      type="text" 
      value={orderTime} 
      readOnly 
      className="border p-0.5 px-1 flex-1 max-w-xs text-xs h-6" 
    />
  </div>
  
  {/* Customer Type */}
  <div className="flex items-center w-full mt-0.5">
    <label className="text-gray-700 w-16 mr-1">Type</label>
    <input 
      value={customer.type} 
      readOnly 
      className="border  px-1 flex-1 max-w-md text-xs h-5" 
    />
  </div>
  
  {/* Address */}
  <div className="flex items-center w-full mt-0.5">
    <label className="text-gray-700 w-16 mr-1">Address</label>
    <input 
      value={customer.address} 
      readOnly 
      className="border px-1 flex-1 text-xs h-5" 
    />
  </div>
</div>

      {/* Top Section */}
      {/* <div className="bg-blue-50 p-4 rounded text-xs">
        <h2 className="text-sm font-semibold mb-2 text-blue-700">Customer Details</h2>
        <div className="grid grid-cols-12 gap-2">
          <label className="col-span-2 text-right text-gray-700">Customer Name</label>
          <input value={customer.name} readOnly className="col-span-4 border p-[4px] px-2" />

          <label className="col-span-2 text-right text-gray-700">Contact No</label>
          <input value={customer.contact} readOnly className="col-span-4 border p-[4px] px-2" />

          <label className="col-span-2 text-right text-gray-700">Customer Type</label>
          <input value={customer.type} readOnly className="col-span-4 border p-[4px] px-2" />

          <label className="col-span-2 text-right text-gray-700">Address</label>
          <input value={customer.address} readOnly className="col-span-10 border p-[4px] px-2" />

          <label className="col-span-2 text-right text-gray-700">Date</label>
          <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className="col-span-4 border p-[4px] px-2" />

          <label className="col-span-2 text-right text-gray-700">Time</label>
          <input type="text" value={orderTime} readOnly className="col-span-4 border p-[4px] px-2" />
        </div>
        <div className="mt-2">
          <button
            onClick={() => setShowCustomerModal(true)}
            className="bg-blue-600 text-white px-3 py-1 w-fit text-xs"
          >
            + Add Customer
          </button>
        </div>
      </div> */}

      {/* Order Items Table */}
     <div className="bg-whitey overflow-y-auto p-2 border border-black rounded  text-xs flex-1">

        <h2 className="text-sm font-semibold mb-2 text-gray-700">Order Items</h2>
        <table className="min-w-full text-center">
          <thead className="bg-gray-100 text-[11px]">
            <tr>
              <th>Description</th>
              <th>Width</th>
              <th>Length</th>
              <th>Qty</th>
              <th>Type</th>
              <th>Feet</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Del</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td><input className="w-full border p-1 text-xs" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} /></td>
                <td><input className="w-full border p-1 text-xs" value={item.width} onChange={e => handleItemChange(index, 'width', e.target.value)} /></td>
                <td><input className="w-full border p-1 text-xs" value={item.length} onChange={e => handleItemChange(index, 'length', e.target.value)} /></td>
                <td><input className="w-full border p-1 text-xs" value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)} /></td>
                <td>
                  <select className="w-full border p-1 text-xs" value={item.type} onChange={e => handleItemChange(index, 'type', e.target.value)}>
                    <option value="">Select</option>
                    <option value="sft">SFT</option>
                    <option value="stair top">Stair Top</option>
                    <option value="self">Self</option>
                    <option value="farma">Farma</option>
                    <option value="6inch">6inch</option>
                    <option value="rft">RFT</option>
                  </select>
                </td>
                <td>{item.feet.toFixed(2)}</td>
                <td><input className="w-full border p-1 text-xs" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} /></td>
                <td>{item.amount.toFixed(2)}</td>
                <td>
  {index === 0 ? (
    <button
      onClick={() => {
        const newItems = [...orderItems];
        newItems[0] = {
          description: '',
          width: '',
          length: '',
          qty: '',
          type: '',
          feet: 0,
          rate: '',
          amount: 0
        };
        setOrderItems(newItems);
      }}
      className="text-blue-500"
      title="Clear First Row"
    >
      ⟳
    </button>
  ) : (
    <button
      onClick={() => deleteItem(index)}
      className="text-red-500"
      title="Delete Row"
    >
      ✖
    </button>
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-yellow-50 px-4 py-2 text-xs sticky bottom-1">
        <div className="w-full md:w-1/2 mb-2 md:mb-0">
          <h2 className="text-sm font-semibold text-yellow-700 mb-1">Order Notes</h2>
          <textarea
            rows={3}
            placeholder="Notes..."
            className="w-full border p-[6px] text-xs resize-none"
            onChange={e => setSummary({ ...summary, notes: e.target.value })}
          />
        </div>

        <div className="w-full md:w-1/3">
          <h2 className="text-sm font-semibold text-yellow-700 mb-1">Summary</h2>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-gray-600">Advance</label>
              <input type="number" className="border p-[4px] w-2/3" value={summary.advance} onChange={e => setSummary({ ...summary, advance: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-gray-600">Received</label>
              <input type="number" className="border p-[4px] w-2/3" value={summary.received} onChange={e => setSummary({ ...summary, received: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-gray-600">Total</label>
              <input type="text" className="border p-[4px] w-2/3 bg-gray-100" readOnly value={summary.total.toFixed(2)} />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-gray-600">Closing</label>
              <input type="text" className="border p-[4px] w-2/3 bg-gray-100" readOnly value={summary.closing.toFixed(2)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button className="bg-blue-600 text-white px-3 py-[2px] text-xs">Save</button>
            <button className="bg-gray-400 px-3 py-[2px] text-xs">Cancel</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow-md w-full max-w-md">
            <h3 className="text-sm font-semibold mb-2">Add New Customer</h3>
            <div className="space-y-2 text-xs">
              <input className="w-full border p-1" placeholder="Customer ID" value={newCustomer.id} onChange={e => setNewCustomer({ ...newCustomer, id: e.target.value })} />
              <input className="w-full border p-1" placeholder="Customer Name" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
              <input className="w-full border p-1" placeholder="Contact No" value={newCustomer.contact} onChange={e => setNewCustomer({ ...newCustomer, contact: e.target.value })} />
              <select className="w-full border p-1" value={newCustomer.type} onChange={e => setNewCustomer({ ...newCustomer, type: e.target.value })}>
                <option value="">Select Type</option>
                <option value="regular">Regular</option>
                <option value="commercial">Commercial</option>
                <option value="market">Market</option>
                <option value="other">Other</option>
              </select>
              <input className="w-full border p-1" placeholder="Address" value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} />
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button onClick={() => setShowCustomerModal(false)} className="bg-gray-400 px-3 py-[2px] text-xs">Cancel</button>
              <button onClick={saveNewCustomer} className="bg-blue-600 text-white px-3 py-[2px] text-xs">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
