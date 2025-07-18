
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  getProducts: () => ipcRenderer.invoke('get-products'),
  saveFullInvoice: (payload) => ipcRenderer.invoke('full-customer-invoice', payload),
  savePartialInvoice: (payload) => ipcRenderer.invoke('partial-customer-invoice', payload),

  updateProduct: (product) => ipcRenderer.invoke('update-product', product),
  deleteProduct: (product) => ipcRenderer.invoke('delete-product', product),
//   getFullInvoices: () => ipcRenderer.invoke("get-all-full-invoices"),
// getPartialInvoices: () => ipcRenderer.invoke("get-all-partial-invoices"),
getFullCustomerDetails: () => ipcRenderer.invoke('get-full-customer-details'),
  getPartialCustomerDetails: () => ipcRenderer.invoke('get-partial-customer-details'),
  getCustomerOrderInvoice: () => ipcRenderer.invoke('get-customer-order-invoice')


});



// const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("electron", {
//   // saveInvoice: (data) => ipcRenderer.invoke("save-invoice", data),
//   // getUsers: (name) => ipcRenderer.invoke("get-users", name),
//   // getProducts: () => ipcRenderer.invoke("get-products"),
//   // saveFullInvoice: (payload) => ipcRenderer.invoke("save-full-invoice", payload),
//   // savePartialInvoice: (payload) => ipcRenderer.invoke("save-partial-invoice", payload),
//   getProducts: () => ipcRenderer.invoke("get-products"),
//   saveFullInvoice: (payload) => ipcRenderer.invoke("save-full-invoice", payload),
//   savePartialInvoice: (payload) => ipcRenderer.invoke("save-partial-invoice", payload)
// });

