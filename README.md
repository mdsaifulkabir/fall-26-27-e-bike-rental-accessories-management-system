# VoltCycle — E-Bike Rental & Accessories Management System (Frontend Version)

CSC 3215: Web Technologies project (Fall 2026-27 · Group 09). A web-based system for renting electric bikes, monitoring station availability, and purchasing riding accessories—built with separate HTML pages, one external CSS file, external JavaScript files, JS form validation, and DOM manipulation. The procedural PHP + MySQLi backend will be added later.

## Group Members & Modules

| Name | Student ID | Role / Module |
| :--- | :--- | :--- |
| **Md. Saiful Kabir** *(Group Leader)* | 23-53874-3 | Home, Login & Admin Dashboard |
| **Rifatul Islam Ratul** | 23-53822-3 | Customer Dashboard |
| **Faisal Ahmed** | 23-53695-3 | Register & Station Manager Dashboard |
| **Zinia Ferdous** | 23-55582-3 | Seller Dashboard |

## How to run

Open `index.html` in Chrome or Firefox (double-click it, or use VS Code's Live Server).

Everyone uses the **same login page** (`login.html`) with just a username (or email) and password. The role stored in the account decides which dashboard opens.

| Role | Username | Password |
| :--- | :--- | :--- |
| Admin | `admin` | `admin1234` |
| Customer | `customer` | `customer123` |
| Station Manager | `manager` | `manager123` |
| Seller | `seller` | `seller123` |
| Station Manager waiting for approval | `jamal` | `jamal1234` (login is refused until an admin approves) |

The login page also has **"Use"** buttons that fill these in automatically.

## Registration and accounts

* **One registration page (`register.html`)** for Customers, Station Managers, and Sellers. Step 1 asks for the type of user; JavaScript then shows the common fields plus only that type's fieldset (`element.style.display`):
  * **Customer:** National ID (10/13/17 digits), Driving/Student ID, address
  * **Station Manager:** Employee ID (`MGR-1001`), preferred station, years of experience
  * **Seller:** Shop name, trade license number, business address
* New **station managers** start as *Pending*; an admin approves them in *Manage Users*.
* **Admins are not on the public page.** An existing admin adds new admins from *Manage Users*.

> **Frontend only:** all data lives in JavaScript arrays of objects (`js/data.js`). Changes work while you stay on a page, and reset when the page reloads or you move to another page. This is expected until the backend stores the data in a MySQL database.

## Folder structure (HTML / CSS / JS separation)

```text
fall-26-27-e-bike-rental-accessories-management-system/
├── index.html       Home page: live e-bike search, who it is for, how it works, hours
├── login.html       ONE login page for all four user types
├── register.html    ONE registration page; fields change with the user type
├── admin.html       Admin dashboard
├── customer.html    Customer dashboard
├── manager.html     Station Manager dashboard
├── seller.html      Seller dashboard
├── README.md        Project overview and documentation
├── css/
│   └── style.css    ONE external style sheet linked from every page
├── images/
│   └── image.jpg    Background image for hero and login pages
├── doc/
│   └── CO3_*.docx   Individual CO3 evaluation forms
└── js/
    ├── data.js      Sample data: arrays of objects (users, stations, bikes, bookings, rides, accessories, orders, rentalRules, activityLog)
    ├── common.js    Shared helpers: showSection, showError, validation, containsText, nextId, removeAt, renderPublicFleet
    ├── home.js      Home page fleet search
    ├── login.js     validateLogin() + switch on role
    ├── register.js  showTypeFields() + validateRegister()
    ├── admin.js     Admin features
    ├── customer.js  Customer features
    ├── manager.js   Station Manager features
    └── seller.js    Seller features
```

Every page loads its scripts at the end of `<body>` in this order: `data.js` → `common.js` → the page's own script.

## Features by user

Every user has a **Dashboard Overview**, **CRUD + Search**, and **3 unique features** that do not overlap.

| User | CRUD + Search on | Unique feature 1 | Unique feature 2 | Unique feature 3 |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | User accounts of all four roles, incl. adding admins and approving pending managers | **Dashboard Overview** — live counts of users, pending approvals, bikes, bookings, sales & bar charts | **Rental Rules & Pricing Management** — add, edit, delete & search hourly rental rates and late fees | **Activity Log** — scrolling notice board, keyword search, type filter (`switch`), clear log |
| **Customer** | E-bike bookings, ride records, and accessory orders | **E-Bike Booking** — filter available bikes by station (`createElement`), book, edit & cancel | **Ride Management & Fare Calculation** — calculate ride fare from duration, hourly rate & late hours | **Accessories Purchase** — browse accessories, live total preview, place, edit & cancel orders |
| **Station Manager** | Stations (name, location, capacity, manager) & E-bikes (model, brand, battery, rate, status) | **Station Information Management** — add, edit, delete & search city e-bike hubs | **Bike Status Management** — update bike status (*Available*, *Rented*, *Unavailable*) and battery | **Station Availability Monitoring** — live station-wise count of available, rented & unavailable bikes |
| **Seller** | Accessory product listings & customer orders | **Product Listing Management** — add, edit, delete & search accessories by category | **Stock Management** — inline quantity update, stock search & low-stock alerts (`<= 5`) | **Customer Order Management** — search orders, update status (*Pending*, *Shipped*, *Delivered*, *Cancelled*) & delete |
