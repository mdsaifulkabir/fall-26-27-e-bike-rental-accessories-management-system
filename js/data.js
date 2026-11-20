/* =====================================================================
   data.js  -  Sample data for the whole system
   ---------------------------------------------------------------------
   Every list is an ARRAY OF OBJECTS.
   IMPORTANT (frontend only):
   This data lives in the browser's memory. When you reload a page or
   move to another page, it starts again from these values.
   When the backend (procedural PHP + MySQLi) is built later, these
   arrays will be replaced by data from the MySQL database.
   ===================================================================== */

// ---------- Users of the system (used by Login, Register, Admin) ----------
// role: "Admin", "Customer", "Station Manager", "Seller"
// status: "Active", "Pending", "Blocked"
let users = [
  { id: "U-001", name: "Rifat Hasan",    username: "admin",    password: "admin1234",    email: "admin@voltcycle.com",    phone: "01711000001", role: "Admin",           status: "Active" },

  { id: "U-002", name: "Rahim Uddin",    username: "customer", password: "customer123",  email: "rahim@mail.com",         phone: "01711000002", role: "Customer",        status: "Active",
    nid: "1999123456789", licenseNo: "DL-45210", address: "Mirpur 10, Dhaka" },
  { id: "U-003", name: "Nadia Rahman",   username: "nadia",    password: "nadia1234",    email: "nadia@mail.com",         phone: "01711000003", role: "Customer",        status: "Active",
    nid: "2001987654321", licenseNo: "DL-88321", address: "Banani, Dhaka" },
  { id: "U-004", name: "Tanvir Ahmed",   username: "tanvir",   password: "tanvir123",    email: "tanvir@mail.com",        phone: "01711000004", role: "Customer",        status: "Blocked",
    nid: "1998456123789", licenseNo: "DL-11092", address: "Uttara, Dhaka" },

  { id: "U-005", name: "Sadia Akter",    username: "manager",  password: "manager123",   email: "sadia@voltcycle.com",    phone: "01711000005", role: "Station Manager", status: "Active",
    employeeId: "MGR-1001", assignedStation: "Kuratoli Hub", experience: 4 },
  { id: "U-006", name: "Jamal Uddin",    username: "jamal",    password: "jamal1234",    email: "jamal@voltcycle.com",    phone: "01711000006", role: "Station Manager", status: "Pending",
    employeeId: "MGR-1002", assignedStation: "Dhanmondi Hub", experience: 2 },

  { id: "U-007", name: "Farhana Kabir",  username: "seller",   password: "seller123",    email: "farhana@shop.com",       phone: "01711000007", role: "Seller",          status: "Active",
    shopName: "EcoGear BD", tradeLicense: "TL-78901", businessAddress: "Bashundhara R/A, Dhaka" },
  { id: "U-008", name: "Imran Hossain",  username: "imran",    password: "imran1234",    email: "imran@shop.com",         phone: "01898765432", role: "Seller",          status: "Active",
    shopName: "RideSafe Accessories", tradeLicense: "TL-65432", businessAddress: "Gulshan 2, Dhaka" }
];

// ---------- Bike Stations (used by Station Manager, Customer, Home) ----------
let stations = [
  { id: "S-101", name: "Kuratoli Hub",    location: "Kuril Flyover, Dhaka", capacity: 15, managerName: "Sadia Akter" },
  { id: "S-102", name: "Banani Point",    location: "Road 11, Banani",      capacity: 12, managerName: "Sadia Akter" },
  { id: "S-103", name: "Dhanmondi Lake",  location: "Road 27, Dhanmondi",   capacity: 10, managerName: "Jamal Uddin" },
  { id: "S-104", name: "Uttara Sector 7", location: "Jashimuddin Road",     capacity: 14, managerName: "Sadia Akter" }
];

// ---------- E-Bikes (used by Station Manager, Customer, Admin, Home) ----------
// status: "Available", "Rented", "Unavailable"
let bikes = [
  { id: "EB-101", model: "VoltX City 250",    brand: "VoltCycle", station: "Kuratoli Hub",    battery: 95, hourlyRate: 80,  status: "Available" },
  { id: "EB-102", model: "EcoCruiser Pro",    brand: "GreenRide", station: "Kuratoli Hub",    battery: 88, hourlyRate: 100, status: "Rented" },
  { id: "EB-103", model: "UrbanSpark S1",     brand: "VoltCycle", station: "Banani Point",    battery: 92, hourlyRate: 90,  status: "Available" },
  { id: "EB-104", model: "TrailBolt 500",     brand: "BoltMotion",station: "Banani Point",    battery: 40, hourlyRate: 120, status: "Unavailable" },
  { id: "EB-105", model: "MetroGlide Lite",   brand: "GreenRide", station: "Dhanmondi Lake",  battery: 98, hourlyRate: 75,  status: "Available" },
  { id: "EB-106", model: "VoltX City 250",    brand: "VoltCycle", station: "Dhanmondi Lake",  battery: 82, hourlyRate: 80,  status: "Rented" },
  { id: "EB-107", model: "EcoCruiser Pro",    brand: "GreenRide", station: "Uttara Sector 7", battery: 90, hourlyRate: 100, status: "Available" },
  { id: "EB-108", model: "CityZip Mini",      brand: "ZipMove",   station: "Uttara Sector 7", battery: 15, hourlyRate: 70,  status: "Unavailable" }
];

// ---------- E-Bike Bookings (used by Customer, Admin) ----------
// status: "Confirmed", "Completed", "Cancelled"
let bookings = [
  { id: "BK-101", customerId: "U-002", customerName: "Rahim Uddin", bikeId: "EB-102", bikeModel: "EcoCruiser Pro", station: "Kuratoli Hub",   date: "2026-11-18", time: "10:00", hours: 2, status: "Confirmed" },
  { id: "BK-102", customerId: "U-002", customerName: "Rahim Uddin", bikeId: "EB-101", bikeModel: "VoltX City 250", station: "Kuratoli Hub",   date: "2026-11-10", time: "14:00", hours: 3, status: "Completed" },
  { id: "BK-103", customerId: "U-003", customerName: "Nadia Rahman",bikeId: "EB-106", bikeModel: "VoltX City 250", station: "Dhanmondi Lake", date: "2026-11-19", time: "09:30", hours: 2, status: "Confirmed" },
  { id: "BK-104", customerId: "U-002", customerName: "Rahim Uddin", bikeId: "EB-105", bikeModel: "MetroGlide Lite",station: "Dhanmondi Lake", date: "2026-10-28", time: "16:00", hours: 1, status: "Completed" }
];

// ---------- Ride Records & Fare Calculation (used by Customer) ----------
let rides = [
  { id: "RD-101", customerId: "U-002", bikeModel: "VoltX City 250",  station: "Kuratoli Hub",   date: "2026-11-10", durationHours: 3, hourlyRate: 80, lateHours: 0, totalFare: 240, status: "Completed" },
  { id: "RD-102", customerId: "U-002", bikeModel: "MetroGlide Lite", station: "Dhanmondi Lake", date: "2026-10-28", durationHours: 2, hourlyRate: 75, lateHours: 1, totalFare: 200, status: "Completed" },
  { id: "RD-103", customerId: "U-002", bikeModel: "EcoCruiser Pro",  station: "Kuratoli Hub",   date: "2026-11-18", durationHours: 2, hourlyRate: 100, lateHours: 0, totalFare: 200, status: "Ongoing" }
];

// ---------- Accessories & Products (used by Seller, Customer) ----------
let accessories = [
  { id: "AC-101", sellerId: "U-007", name: "Smart Safety Helmet",   category: "Safety",      price: 1200, stock: 18, description: "Lightweight ventilated helmet with rear LED." },
  { id: "AC-102", sellerId: "U-007", name: "Waterproof Phone Mount",category: "Gadgets",     price: 550,  stock: 4,  description: "360-degree handlebar phone holder." },
  { id: "AC-103", sellerId: "U-007", name: "Heavy-Duty U-Lock",     category: "Security",    price: 850,  stock: 12, description: "Hardened steel anti-theft bike lock." },
  { id: "AC-104", sellerId: "U-007", name: "USB Rechargeable Light",category: "Lighting",    price: 450,  stock: 3,  description: "Front and rear waterproof LED light set." },
  { id: "AC-105", sellerId: "U-008", name: "Padded Riding Gloves",  category: "Apparel",     price: 380,  stock: 25, description: "Anti-slip breathable half-finger gloves." },
  { id: "AC-106", sellerId: "U-007", name: "Fast Portable Charger", category: "Power",       price: 2200, stock: 5,  description: "Compact 48V e-bike travel charger." }
];

// ---------- Customer Accessory Orders (used by Customer, Seller, Admin) ----------
// status: "Pending", "Shipped", "Delivered", "Cancelled"
let orders = [
  { id: "OR-101", customerId: "U-002", customerName: "Rahim Uddin",  productId: "AC-101", productName: "Smart Safety Helmet",    quantity: 1, unitPrice: 1200, totalPrice: 1200, date: "2026-11-12", status: "Delivered" },
  { id: "OR-102", customerId: "U-002", customerName: "Rahim Uddin",  productId: "AC-102", productName: "Waterproof Phone Mount", quantity: 2, unitPrice: 550,  totalPrice: 1100, date: "2026-11-18", status: "Pending" },
  { id: "OR-103", customerId: "U-003", customerName: "Nadia Rahman", productId: "AC-103", productName: "Heavy-Duty U-Lock",      quantity: 1, unitPrice: 850,  totalPrice: 850,  date: "2026-11-17", status: "Shipped" }
];

// ---------- Rental Rules & Pricing (set by Admin, used by Customer) ----------
let rentalRules = [
  { id: "RL-101", title: "Standard Hourly Rental",   hourlyPrice: 80,  lateFeePerHour: 50, maxHours: 8,  description: "Applies to standard city e-bikes across all hubs." },
  { id: "RL-102", title: "Premium Cruiser Rate",     hourlyPrice: 100, lateFeePerHour: 70, maxHours: 10, description: "Applies to long-range cruiser e-bikes." },
  { id: "RL-103", title: "Weekend Discount Rule",    hourlyPrice: 70,  lateFeePerHour: 40, maxHours: 12, description: "Reduced hourly rate on Fridays and Saturdays." }
];

// ---------- Activity Log (used by Admin) ----------
let activityLog = [
  { time: "2026-11-15 09:15", user: "admin",    type: "User",     message: "Created station manager account for Sadia Akter" },
  { time: "2026-11-16 11:30", user: "manager",  type: "Bike",     message: "Added new e-bike VoltX City 250 (EB-101) at Kuratoli Hub" },
  { time: "2026-11-17 14:20", user: "seller",   type: "Product",  message: "Updated stock for Waterproof Phone Mount (AC-102)" },
  { time: "2026-11-18 10:05", user: "customer", type: "Booking",  message: "Booked EcoCruiser Pro (EB-102) for 2 hours" },
  { time: "2026-11-18 16:40", user: "admin",    type: "Security", message: "Blocked account of Tanvir Ahmed (unpaid late fee)" },
  { time: "2026-11-19 08:50", user: "admin",    type: "Rules",    message: "Updated Standard Hourly Rental late fee to 50 Tk/hour" }
];
