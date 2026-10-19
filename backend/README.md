# SB Invoices — Node.js & Hostinger MySQL Backend

This is the dedicated backend server and MySQL database for **SB Invoices Management**, configured for **Hostinger SQL / MySQL**.

---

## 📁 Architecture Overview

```
backend/
├── db/
│   └── db.js            # Hostinger MySQL connection pool (mysql2) & auto-migration
├── routes/
│   ├── authRoutes.js     # User login & staff credentials
│   ├── invoiceRoutes.js  # Tax invoices CRUD & anti-tamper cancellation
│   ├── clientRoutes.js   # Client directory
│   ├── paymentRoutes.js  # Payment tracking & reconciliation
│   ├── serviceRoutes.js  # Services & pricing catalog
│   ├── settingsRoutes.js # Company, bank & invoice rules
│   └── auditRoutes.js    # Immutable audit trail
├── .env                 # Environment variables (Hostinger MySQL credentials)
├── package.json         # Dependencies (Express, mysql2, cors, dotenv)
├── schema.sql           # MySQL database schema (compatible with Hostinger phpMyAdmin)
└── server.js            # Express server entry point (Port 5000)
```

---

## 🌐 Hostinger MySQL Setup Guide

### 1. Create MySQL Database in Hostinger hPanel
1. Log in to your **Hostinger Control Panel (hPanel)**.
2. Go to **Databases** → **MySQL Databases**.
3. Create a new MySQL database and user:
   - **MySQL Database Name**: e.g., `u123456789_invoices`
   - **MySQL Username**: e.g., `u123456789_admin`
   - **Password**: Choose a secure password
4. Note down the database name, username, and password.

### 2. Enable Remote MySQL (If running backend locally or from external cloud)
By default, Hostinger protects MySQL databases from external connections.
1. In Hostinger hPanel, search for **Remote MySQL** (under **Databases**).
2. Under **IP (IPv4 or IPv6)**:
   - Enter your current public IP address (or `%` to allow connections from any host / cloud server).
3. Select your database name from the dropdown.
4. Click **Create**.
5. Note the **MySQL Host IP / Hostname** shown in Hostinger (e.g., `srvXXX.hstgr.io` or Hostinger Server IP).

### 3. Configure `backend/.env`
Open `backend/.env` and update with your Hostinger database details:

```env
PORT=5000
NODE_ENV=development

DB_HOST=srvXXX.hstgr.io          # Or your Hostinger server IP (or 'localhost' if hosted on Hostinger)
DB_PORT=3306                     # Standard MySQL port
DB_USER=u123456789_admin         # Your Hostinger MySQL username
DB_PASSWORD=your_mysql_password  # Your Hostinger MySQL password
DB_NAME=u123456789_invoices      # Your Hostinger MySQL database name
DB_SSL=false

CORS_ORIGIN=http://localhost:5173
```

---

## 🚀 Running the Backend

### 1. Install Dependencies
Open a terminal in the `backend` folder and run:
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
npm run dev
```

The server will automatically:
- Connect to your Hostinger MySQL database.
- Execute `schema.sql` to create all tables and indexes.
- Seed default compliant business data for **SB**.
- Listen at: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`

---

## 🗄️ Optional: Manual Import via phpMyAdmin
If you prefer creating the tables directly via phpMyAdmin:
1. In Hostinger hPanel, go to **Databases** → **phpMyAdmin** and click **Enter phpMyAdmin** next to your database.
2. Click the **Import** tab at the top.
3. Choose the `backend/schema.sql` file and click **Go**.
