"use strict";
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  saveInvoice: (data) => ipcRenderer.invoke("save-invoice", data)
});
