"use strict";
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  saveInvoice: (data) => ipcRenderer.invoke("save-invoice", data),
  getUsers: (name) => ipcRenderer.invoke("get-users", name),
  getProducts: () => ipcRenderer.invoke("get-products"), // ✅ ADD THIS
  invoke: (channel, data) => ipcRenderer.invoke(channel, data), // optional general use
});
