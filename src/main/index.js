import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const path = require('path')
const Database = require('better-sqlite3')

let db

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  const dbPath = path.join(app.getPath('userData'), 'marble-factory.db')
  db = new Database(dbPath)
  db.pragma('foreign_keys = ON')

  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS full_customer_invoice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    created_at TEXT
  )
`
  ).run()

  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS partial_customer_invoice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    cnic TEXT,
    contact TEXT,
    created_at TEXT
  )
`
  ).run()

  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS order_invoice_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    customer_type TEXT,
    description TEXT,
    type TEXT,
    feet REAL,
    rate REAL,
    discount REAL,
    total REAL
  )
`
  ).run()
  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rate REAL NOT NULL,
    type TEXT
  )
`
  ).run()
  // FOREIGN KEY(invoice_id) REFERENCES full_customer_invoice(id)

  function saveOrderInvoice(payload, type) {
    let invoiceId

    if (type === 'full') {
      const insertInvoice = db.prepare(`
      INSERT INTO full_customer_invoice (name, created_at)
      VALUES (?, ?)
    `)
      const result = insertInvoice.run(
        payload.name || null, // Customer Name
        new Date().toISOString() // Created Date
      )

      invoiceId = result.lastInsertRowid
    } else if (type === 'partial') {
      const insertInvoice = db.prepare(`
      INSERT INTO partial_customer_invoice (name, cnic, contact, created_at)
      VALUES (?, ?, ?, ?)
    `)
      const result = insertInvoice.run(
         payload.name || null,  
        payload.cnic || null,
        payload.contact || null,
        new Date().toISOString()
      )
      invoiceId = result.lastInsertRowid
    }

    const insertProduct = db.prepare(`
    INSERT INTO order_invoice_products (
      invoice_id, customer_type, description, type, feet, rate, discount, total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

    const insertMany = db.transaction((products) => {
      for (const p of products) {
        insertProduct.run(
          invoiceId,
          type,
          p.description,
          p.type,
          parseFloat(p.feet),
          parseFloat(p.rate),
          parseFloat(p.discount || 0),
          parseFloat(p.total)
        )
      }
    })

    insertMany(payload.products)
  }

  ipcMain.handle('full-customer-invoice', (event, payload) => {
    try {
      saveOrderInvoice(payload, 'full')
      return { success: true }
    } catch (error) {
      console.error('Error saving full order invoice:', error)
      return { success: false }
    }
  })

  ipcMain.handle('partial-customer-invoice', (event, payload) => {
    try {
      saveOrderInvoice(payload, 'partial')
      return { success: true }
    } catch (error) {
      console.error('Error saving partial order invoice:', error)
      return { success: false }
    }
  })

  //------------------
  // Full Customer Details with Products
  ipcMain.handle('get-full-customer-details', () => {
    const customers = db.prepare(`SELECT * FROM full_customer_invoice`).all()

    customers.forEach((customer) => {
      const products = db
        .prepare(
          `
      SELECT * FROM order_invoice_products
      WHERE invoice_id = ? AND customer_type = 'full'
    `
        )
        .all(customer.id)

      customer.products = products
    })

    return customers
  })

  // Partial Customer Details with Products
  ipcMain.handle('get-partial-customer-details', () => {
    const customers = db.prepare(`SELECT * FROM partial_customer_invoice`).all()

    customers.forEach((customer) => {
      const products = db
        .prepare(
          `
      SELECT * FROM order_invoice_products
      WHERE invoice_id = ? AND customer_type = 'partial'
    `
        )
        .all(customer.id)

      customer.products = products
    })

    return customers
  })
ipcMain.handle('get-customer-order-invoice', () => {
  const fullOrder = db.prepare(`
    SELECT 
      p.*, 
      COALESCE(f.name, par.name) AS customer_name
    FROM order_invoice_products p
    LEFT JOIN full_customer_invoice f ON p.invoice_id = f.id AND p.customer_type = 'full'
    LEFT JOIN partial_customer_invoice par ON p.invoice_id = par.id AND p.customer_type = 'partial'
  `).all();
  
  return fullOrder;
});


  // ipcMain.handle('get-all-full-invoices', () => {
  //   const invoices = db.prepare(`
  //     SELECT * FROM full_customer_invoice
  //   `).all();
  //   return invoices;
  // });

  // ipcMain.handle('get-all-partial-invoices', () => {
  //   const invoices = db.prepare(`
  //     SELECT * FROM partial_customer_invoice
  //   `).all();
  //   return invoices;
  // });

  //--------------------------------------------------------------------------------

  // IPC HANDLERS:
  ipcMain.handle('get-products', () => {
    try {
      return db.prepare('SELECT * FROM products').all()
    } catch (error) {
      return []
    }
  })

  ipcMain.handle('add-product', (event, product) => {
    try {
      db.prepare(`INSERT INTO products (name, rate, type) VALUES (?, ?, ?)`).run(
        product.name,
        parseFloat(product.rate),
        product.type || null
      )
      return { success: true }
    } catch (error) {
      console.error('Error adding product:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('update-product', (event, product) => {
    try {
      db.prepare(`UPDATE products SET rate = ?, type = ? WHERE name = ?`).run(
        parseFloat(product.rate),
        product.type || null,
        product.name
      )
      return { success: true }
    } catch (error) {
      console.error('Error updating product:', error)
      return { success: false }
    }
  })

  ipcMain.handle('delete-product', (event, product) => {
    try {
      db.prepare(`DELETE FROM products WHERE name = ?`).run(product.name)
      return { success: true }
    } catch (error) {
      console.error('Error deleting product:', error)

      return { success: false, error: error.message }
    }
  })

  createWindow()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// import { app, shell, BrowserWindow, ipcMain } from 'electron';
// import { join } from 'path';
// import { electronApp, optimizer, is } from '@electron-toolkit/utils';
// import icon from '../../resources/icon.png?asset';
// const path = require('path');
// const Database = require('better-sqlite3');

// let db; // Global DB instance

// // ✅ Create the browser window
// function createWindow() {
//   const mainWindow = new BrowserWindow({
//     width: 900,
//     height: 670,
//     show: false,
//     autoHideMenuBar: true,
//     ...(process.platform === 'linux' ? { icon } : {}),
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   });

//   mainWindow.on('ready-to-show', () => mainWindow.show());

//   mainWindow.webContents.setWindowOpenHandler((details) => {
//     shell.openExternal(details.url);
//     return { action: 'deny' };
//   });

//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
//   } else {
//     mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
//   }
// }

// // ✅ Initialize everything once app is ready
// app.whenReady().then(() => {
//   electronApp.setAppUserModelId('com.electron');

//   const dbPath = path.join(app.getPath('userData'), 'marble-factory.db');
//   db = new Database(dbPath);
//   console.log('✅ SQLite DB connected at:', dbPath);

// db.pragma('foreign_keys = ON'); // ✅ Add this line

// db.prepare(`
//   CREATE TABLE IF NOT EXISTS customers (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT,
//     contact TEXT,
//     received REAL,
//     total REAL,
//     remaining REAL,
//     created_at TEXT,
//     paid REAL,
//     dues REAL,
//     customer_type TEXT DEFAULT 'credit' -- 'walk-in' or 'credit'
//   )
// `).run();

// //   //  Create tables
// //   db.prepare(`
// //   CREATE TABLE IF NOT EXISTS customers (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     name TEXT,
// //     contact TEXT,
// //     received REAL,
// //     total REAL,
// //     remaining REAL,
// //     created_at TEXT,
// //     paid REAL,
// //     dues REAL
// //   )
// // `).run();

//   db.prepare(`
//     CREATE TABLE IF NOT EXISTS order_products (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//     customer_id INTEGER,
//     description TEXT,
//     type TEXT,
//     length REAL,
//     width REAL,
//     rate REAL,
//     discount REAL,
//     feet REAL,
//     total REAL,
//     FOREIGN KEY(customer_id) REFERENCES customers(id)
//     )
//   `).run();

//   db.prepare(
//   `CREATE TABLE IF NOT EXISTS products (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     rate REAL NOT NULL,
//     type TEXT,
//     is_active INTEGER DEFAULT 1
//   )`
// ).run(); // ✅ this was missing

//   // ✅ IPC handler
//   ipcMain.handle('save-invoice', (event, payload) => {
//     const { customer, products } = payload;

//     // const insertCustomer = db.prepare(`
//     //   INSERT INTO customers (name, contact, received, total, remaining, created_at)
//     //   VALUES (?, ?, ?, ?, ?, datetime('now'))
//     // `);
// const insertCustomer = db.prepare(`
//   INSERT INTO customers
//   (name, contact, received, total, remaining, created_at, customer_type)
//   VALUES (?, ?, ?, ?, ?, datetime('now'), ?)
// `);

// const result = insertCustomer.run(
//   customer.name,
//   customer.contact,
//   customer.received,
//   customer.total,
//   customer.remaining,
//   customer.customer_type
// );

//     // const customerResult = insertCustomer.run(
//     //   customer.name,
//     //   customer.contact,
//     //   customer.received,
//     //   customer.total,
//     //   customer.remaining
//     // );
//     const customerId = customerResult.lastInsertRowid;

//     const insertProduct = db.prepare(`
//       INSERT INTO order_products (customer_id, description, type, length, width, rate, discount, feet, total)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `);
//     const insertMany = db.transaction((products) => {
//       for (const p of products) {
//         insertProduct.run(
//           customerId,
//           p.description,
//           p.type,
//           p.length,
//           p.width,
//           p.rate,
//           p.discount,
//           p.feet,
//           p.total
//         );
//       }
//     });

//     insertMany(products);
//     return { success: true, customerId };

//   });

//   // 🪟 Create window and shortcuts
//   createWindow();

//   // Handle request from renderer
// ipcMain.handle('get-users', (event, searchName) => {
//   const stmt = searchName
//     ? db.prepare('SELECT * FROM customers WHERE name LIKE ?')
//     : db.prepare('SELECT * FROM customers');

//   const rows = searchName ? stmt.all(`%${searchName}%`) : stmt.all();
//   return rows;
// });

// // ------------------
// // add product by admin
// ipcMain.handle('add-product', (event, product) => {
//   try {
//     const stmt = db.prepare(`
//       INSERT INTO products (name, rate, type)
//       VALUES (?, ?, ?)
//     `);
//     stmt.run(product.name, product.rate, product.type);
//     return { success: true };
//   } catch (err) {
//     console.error(err);
//     return { success: false };
//   }
// });

// // ipcMain.handle('get-products', () => {
// //   const stmt = db.prepare('SELECT name, type, rate FROM products');
// //   const all = stmt.all();
// //   return all;
// // });
// ipcMain.handle("get-products", async () => {
//   try {
//     const products = db.prepare("SELECT * FROM products").all();
//     return products;
//   } catch (error) {
//     console.error("Failed to fetch products:", error);
//     return [];
//   }
// });
// //-----------------------

// // update product
// ipcMain.handle('update-product', (event, product) => {
//   try {
//     const stmt = db.prepare(`UPDATE products SET rate = ?, type = ? WHERE name = ?`);
//     const result = stmt.run(product.rate, product.type || null, product.name);
//     return { success: result.changes > 0 };
//   } catch (err) {
//     console.error("Update failed", err);
//     return { success: false };
//   }
// });
//  //---------------------------

//  // delete product
//  ipcMain.handle('delete-product', (event, product) => {
//   try {
//     const stmt = db.prepare(`DELETE FROM products WHERE name = ?`);
//     const result = stmt.run(product.name);
//     return { success: result.changes > 0 };
//   } catch (err) {
//     console.error("Delete failed", err);
//     return { success: false };
//   }
// });
// //-------------------------

// // full and partial customer

// // Create tables if not exist
// db.prepare(`
//   CREATE TABLE IF NOT EXISTS full_invoices (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     description TEXT,
//     type TEXT,
//     feet REAL,
//     rate REAL,
//     discount REAL,
//     total REAL,
//     created_at TEXT
//   )
// `).run();

// db.prepare(`
//   CREATE TABLE IF NOT EXISTS partial_invoices (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     description TEXT,
//     type TEXT,
//     feet REAL,
//     rate REAL,
//     discount REAL,
//     total REAL,
//     contact TEXT,
//     cnic TEXT,
//     created_at TEXT
//   )
// `).run();

// function saveFullInvoice(invoice) {
//   const stmt = db.prepare(`
//     INSERT INTO full_invoices (description, type, feet, rate, discount, total, created_at)
//     VALUES (@description, @type, @feet, @rate, @discount, @total, @created_at)
//   `);

//   const now = new Date().toISOString();
//   invoice.products.forEach(product => {
//     stmt.run({
//       ...product,
//       created_at: now
//     });
//   });
// }

// function savePartialInvoice(invoice) {
//   const stmt = db.prepare(`
//     INSERT INTO partial_invoices (description, type, feet, rate, discount, total, contact, cnic, created_at)
//     VALUES (@description, @type, @feet, @rate, @discount, @total, @contact, @cnic, @created_at)
//   `);

//   const now = new Date().toISOString();
//   invoice.products.forEach(product => {
//     stmt.run({
//       ...product,
//       contact: invoice.contact,
//       cnic: invoice.cnic,
//       created_at: now
//     });
//   });
// }

// function getProducts() {
//   return db.prepare(`SELECT * FROM products`).all();
// }

// module.exports = {
//   saveFullInvoice,
//   savePartialInvoice,
//   getProducts,
// };

// ipcMain.handle("save-full-invoice", (event, payload) => {
//   try {
//     saveFullInvoice(payload);
//     return { success: true };
//   } catch (err) {
//     console.error("❌ Failed to save full invoice:", err);
//     return { success: false };
//   }
// });

// ipcMain.handle("save-partial-invoice", (event, payload) => {
//   try {
//     savePartialInvoice(payload);
//     return { success: true };
//   } catch (err) {
//     console.error("❌ Failed to save partial invoice:", err);
//     return { success: false };
//   }
// });

// //-------------------

//   app.on('browser-window-created', (_, window) => {
//     optimizer.watchWindowShortcuts(window);
//   });

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });

// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });
