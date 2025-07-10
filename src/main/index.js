import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
const path = require('path');
const Database = require('better-sqlite3');

let db; // Global DB instance

// ✅ Create the browser window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// ✅ Initialize everything once app is ready
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  const dbPath = path.join(app.getPath('userData'), 'marble-factory.db');
  db = new Database(dbPath);
  console.log('✅ SQLite DB connected at:', dbPath);
db = new Database(dbPath);
db.pragma('foreign_keys = ON'); // ✅ Add this line

  //  Create tables
  db.prepare(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    contact TEXT,
    received REAL,
    total REAL,
    remaining REAL,
    created_at TEXT,
    paid REAL,
    dues REAL
  )
`).run();


  db.prepare(`
    CREATE TABLE IF NOT EXISTS order_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    description TEXT,
    type TEXT,
    length REAL,
    width REAL,
    rate REAL,
    discount REAL,
    feet REAL,
    total REAL,
    FOREIGN KEY(customer_id) REFERENCES customers(id)
    )
  `).run();

  db.prepare(
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rate REAL NOT NULL,
    type TEXT,
    is_active INTEGER DEFAULT 1
  )`
).run(); // ✅ this was missing

  
  // ✅ IPC handler
  ipcMain.handle('save-invoice', (event, payload) => {
    const { customer, products } = payload;

    const insertCustomer = db.prepare(`
      INSERT INTO customers (name, contact, received, total, remaining, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    const customerResult = insertCustomer.run(
      customer.name,
      customer.contact,
      customer.received,
      customer.total,
      customer.remaining
    );
    const customerId = customerResult.lastInsertRowid;

    const insertProduct = db.prepare(`
      INSERT INTO order_products (customer_id, description, type, length, width, rate, discount, feet, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((products) => {
      for (const p of products) {
        insertProduct.run(
          customerId,
          p.description,
          p.type,
          p.length,
          p.width,
          p.rate,
          p.discount,
          p.feet,
          p.total
        );
      }
    });

    insertMany(products);
    return { success: true, customerId };
    
  });

  // 🪟 Create window and shortcuts
  createWindow();
  


  // Handle request from renderer
ipcMain.handle('get-users', (event, searchName) => {
  const stmt = searchName
    ? db.prepare('SELECT * FROM customers WHERE name LIKE ?')
    : db.prepare('SELECT * FROM customers');

  const rows = searchName ? stmt.all(`%${searchName}%`) : stmt.all();
  return rows;
});

// ------------------
// add product by admin
ipcMain.handle('add-product', (event, product) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO products (name, rate, type)
      VALUES (?, ?, ?)
    `);
    stmt.run(product.name, product.rate, product.type);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
});

// ipcMain.handle('get-products', () => {
//   const stmt = db.prepare('SELECT name, type, rate FROM products');
//   const all = stmt.all();
//   return all;
// });
ipcMain.handle("get-products", async () => {
  try {
    const products = db.prepare("SELECT * FROM products").all();
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
});
//-----------------------



  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
