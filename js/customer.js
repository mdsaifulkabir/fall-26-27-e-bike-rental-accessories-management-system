/* =====================================================================
   customer.js  -  Everything the Customer can do (customer.html)
   ---------------------------------------------------------------------
   Overview : Total bookings, Completed rides, Accessories purchased
   Feature 1: E-Bike Booking (CRUD + Search)
   Feature 2: Ride Management & Fare Calculation (CRUD + Search)
   Feature 3: Accessories Purchase (CRUD + Search)
   ===================================================================== */

const sections = ["overviewSection", "bookingSection", "ridesSection", "accessoriesSection"];

const currentCustomerId = "U-002";
const currentCustomerName = "Rahim Uddin";

let editBookingIndex = -1;
let editRideIndex = -1;
let editOrderIndex = -1;

const bookingFields = ["bookStation", "bookBike", "bookDate", "bookTime", "bookHours"];
const rideFields = ["rideBikeModel", "rideStation", "rideDate", "rideHours", "rideRate", "rideLateHours"];
const orderFields = ["orderProduct", "orderQty"];

/* =====================================================================
   DASHBOARD OVERVIEW
   ===================================================================== */
function renderCustomerOverview() {
  let myBookings = 0;
  let activeBookings = 0;
  for (const b of bookings) {
    if (b.customerId === currentCustomerId) {
      myBookings++;
      if (b.status === "Confirmed") {
        activeBookings++;
      }
    }
  }

  let completedRides = 0;
  let totalFareSpent = 0;
  for (const r of rides) {
    if (r.customerId === currentCustomerId) {
      if (r.status === "Completed") {
        completedRides++;
      }
      totalFareSpent += r.totalFare;
    }
  }

  let myOrders = 0;
  let accessorySpent = 0;
  for (const o of orders) {
    if (o.customerId === currentCustomerId && o.status !== "Cancelled") {
      myOrders++;
      accessorySpent += o.totalPrice;
    }
  }

  document.getElementById("statMyBookings").innerHTML = myBookings;
  document.getElementById("statActiveBookings").innerHTML = activeBookings;
  document.getElementById("statCompletedRides").innerHTML = completedRides;
  document.getElementById("statMyAccessories").innerHTML = myOrders;
  document.getElementById("statTotalSpent").innerHTML = (totalFareSpent + accessorySpent) + " Tk";
}

/* =====================================================================
   FEATURE 1: E-BIKE BOOKING (CRUD + SEARCH)
   ===================================================================== */
function fillStationOptions() {
  let select = document.getElementById("bookStation");
  let rideSelect = document.getElementById("rideStation");
  select.innerHTML = "<option value=''>-- Select Station --</option>";
  rideSelect.innerHTML = "<option value=''>-- Select Station --</option>";

  for (const station of stations) {
    let opt1 = document.createElement("option");
    opt1.value = station.name;
    opt1.innerHTML = station.name + " (" + station.location + ")";
    select.appendChild(opt1);

    let opt2 = document.createElement("option");
    opt2.value = station.name;
    opt2.innerHTML = station.name;
    rideSelect.appendChild(opt2);
  }
}

function fillAvailableBikes() {
  let station = document.getElementById("bookStation").value;
  let select = document.getElementById("bookBike");
  select.innerHTML = "<option value=''>-- Select Available E-Bike --</option>";

  for (const bike of bikes) {
    let matchesStation = (station === "" || bike.station === station);
    if (matchesStation && (bike.status === "Available" || editBookingIndex !== -1)) {
      let opt = document.createElement("option");
      opt.value = bike.id;
      opt.innerHTML = bike.model + " (" + bike.hourlyRate + " Tk/hr - " + bike.battery + "% battery)";
      select.appendChild(opt);
    }
  }
}

function renderBookings() {
  let keyword = document.getElementById("bookingSearch").value;
  let statusFilter = document.getElementById("bookingStatusFilter").value;

  let rows = "";
  let shown = 0;
  let mine = 0;

  for (let i = 0; i < bookings.length; i++) {
    let b = bookings[i];
    if (b.customerId !== currentCustomerId) {
      continue;
    }
    mine++;

    let matchesKeyword = containsText(b.bikeModel, keyword) || containsText(b.station, keyword) ||
                         containsText(b.id, keyword);
    let matchesStatus = (statusFilter === "All" || b.status === statusFilter);

    if (matchesKeyword && matchesStatus) {
      let badgeColor = "orange";
      if (b.status === "Confirmed") { badgeColor = "green"; }
      else if (b.status === "Completed") { badgeColor = "blue"; }
      else if (b.status === "Cancelled") { badgeColor = "red"; }

      let actions = "&mdash;";
      if (b.status === "Confirmed") {
        actions = "<button type='button' class='btn btn-small' onclick='editBooking(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='cancelBooking(" + i + ")'>Cancel</button>";
      }

      rows += "<tr>" +
                "<td>" + b.id + "</td>" +
                "<td><strong>" + b.bikeModel + "</strong><br><span class='hint'>" + b.station + "</span></td>" +
                "<td>" + b.date + " at " + b.time + "</td>" +
                "<td>" + b.hours + " hr(s)</td>" +
                "<td><span class='badge " + badgeColor + "'>" + b.status + "</span></td>" +
                "<td>" + actions + "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No bookings match your search.</td></tr>";
  }

  document.getElementById("bookingTableBody").innerHTML = rows;
  document.getElementById("bookingCount").innerHTML = "Showing " + shown + " of " + mine + " bookings";
}

function saveBooking() {
  let station = document.getElementById("bookStation").value;
  let bikeId = document.getElementById("bookBike").value;
  let date = document.getElementById("bookDate").value;
  let time = document.getElementById("bookTime").value;
  let hoursText = document.getElementById("bookHours").value;
  let hours = Number(hoursText);

  let isValid = true;
  clearErrors(bookingFields);

  if (station === "") {
    showError("bookStation", "Please select a station.");
    isValid = false;
  }

  if (bikeId === "") {
    showError("bookBike", "Please select an e-bike.");
    isValid = false;
  }

  if (date === "") {
    showError("bookDate", "Please select a date.");
    isValid = false;
  }

  if (time === "") {
    showError("bookTime", "Please select a start time.");
    isValid = false;
  }

  if (hoursText === "" || hours < 1 || hours > 12) {
    showError("bookHours", "Duration must be between 1 and 12 hours.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let bike = bikes[findIndexById(bikes, bikeId)];

  if (editBookingIndex === -1) {
    let newBooking = {
      id: nextId("BK", bookings),
      customerId: currentCustomerId,
      customerName: currentCustomerName,
      bikeId: bike.id,
      bikeModel: bike.model,
      station: station,
      date: date,
      time: time,
      hours: hours,
      status: "Confirmed"
    };
    bookings.push(newBooking);
    bike.status = "Rented";
    showMessage("bookingMessage", "Booking <strong>" + newBooking.id + "</strong> confirmed for " + bike.model + ".", "success");
  } else {
    let b = bookings[editBookingIndex];
    b.station = station;
    b.bikeId = bike.id;
    b.bikeModel = bike.model;
    b.date = date;
    b.time = time;
    b.hours = hours;
    showMessage("bookingMessage", "Booking <strong>" + b.id + "</strong> was updated.", "success");
  }

  resetBookingForm();
  fillAvailableBikes();
  renderBookings();
  renderCustomerOverview();
  return false;
}

function editBooking(index) {
  let b = bookings[index];
  editBookingIndex = index;

  document.getElementById("bookStation").value = b.station;
  fillAvailableBikes();
  document.getElementById("bookBike").value = b.bikeId;
  document.getElementById("bookDate").value = b.date;
  document.getElementById("bookTime").value = b.time;
  document.getElementById("bookHours").value = b.hours;

  document.getElementById("bookingFormTitle").innerHTML = "Edit Booking " + b.id;
  document.getElementById("bookingSaveButton").value = "Update Booking";
  hideMessage("bookingMessage");
}

function cancelBooking(index) {
  let b = bookings[index];
  b.status = "Cancelled";
  let bikeIdx = findIndexById(bikes, b.bikeId);
  if (bikeIdx !== -1) {
    bikes[bikeIdx].status = "Available";
  }
  showMessage("bookingMessage", "Booking <strong>" + b.id + "</strong> was cancelled.", "info");
  resetBookingForm();
  fillAvailableBikes();
  renderBookings();
  renderCustomerOverview();
}

function resetBookingForm() {
  editBookingIndex = -1;
  document.getElementById("bookingForm").reset();
  clearErrors(bookingFields);
  document.getElementById("bookDate").value = todayString();
  document.getElementById("bookingFormTitle").innerHTML = "Book an E-Bike";
  document.getElementById("bookingSaveButton").value = "Confirm Booking";
}

/* =====================================================================
   FEATURE 2: RIDE MANAGEMENT & FARE CALCULATION (CRUD + SEARCH)
   ===================================================================== */
function previewRideFare() {
  let hours = Number(document.getElementById("rideHours").value);
  let rate = Number(document.getElementById("rideRate").value);
  let lateHours = Number(document.getElementById("rideLateHours").value);
  let lateFeeRate = rentalRules.length > 0 ? rentalRules[0].lateFeePerHour : 50;

  if (hours <= 0 || rate <= 0) {
    document.getElementById("farePreviewBox").innerHTML = "Enter ride duration and hourly rate to calculate fare.";
    return 0;
  }

  let baseFare = hours * rate;
  let lateFee = lateHours * lateFeeRate;
  let total = baseFare + lateFee;

  document.getElementById("farePreviewBox").innerHTML =
    "<p>Base Fare: " + hours + " hr(s) x " + rate + " Tk = <strong>" + baseFare + " Tk</strong></p>" +
    "<p>Late Fee: " + lateHours + " hr(s) x " + lateFeeRate + " Tk = <strong>" + lateFee + " Tk</strong></p>" +
    "<p>Total Ride Fare: <span class='big'>" + total + " Tk</span></p>";
  return total;
}

function renderRides() {
  let keyword = document.getElementById("rideSearch").value;
  let rows = "";
  let shown = 0;
  let mine = 0;

  for (let i = 0; i < rides.length; i++) {
    let r = rides[i];
    if (r.customerId !== currentCustomerId) {
      continue;
    }
    mine++;

    let matchesKeyword = containsText(r.bikeModel, keyword) || containsText(r.station, keyword) ||
                         containsText(r.id, keyword);

    if (matchesKeyword) {
      let badgeColor = r.status === "Completed" ? "green" : "orange";
      rows += "<tr>" +
                "<td>" + r.id + "</td>" +
                "<td><strong>" + r.bikeModel + "</strong><br><span class='hint'>" + r.station + "</span></td>" +
                "<td>" + r.date + "</td>" +
                "<td>" + r.durationHours + " hr(s)</td>" +
                "<td><strong>" + r.totalFare + " Tk</strong></td>" +
                "<td><span class='badge " + badgeColor + "'>" + r.status + "</span></td>" +
                "<td>" +
                  "<button type='button' class='btn btn-small' onclick='editRide(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteRide(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>No ride records match your search.</td></tr>";
  }

  document.getElementById("rideTableBody").innerHTML = rows;
  document.getElementById("rideCount").innerHTML = "Showing " + shown + " of " + mine + " rides";
}

function saveRide() {
  let bikeModel = document.getElementById("rideBikeModel").value.trim();
  let station = document.getElementById("rideStation").value;
  let date = document.getElementById("rideDate").value;
  let hoursText = document.getElementById("rideHours").value;
  let rateText = document.getElementById("rideRate").value;
  let lateText = document.getElementById("rideLateHours").value;
  let status = document.getElementById("rideStatus").value;

  let hours = Number(hoursText);
  let rate = Number(rateText);
  let lateHours = Number(lateText);

  let isValid = true;
  clearErrors(rideFields);

  if (bikeModel.length < 3) {
    showError("rideBikeModel", "Enter e-bike model name.");
    isValid = false;
  }
  if (station === "") {
    showError("rideStation", "Select a station.");
    isValid = false;
  }
  if (date === "") {
    showError("rideDate", "Select ride date.");
    isValid = false;
  }
  if (hoursText === "" || hours < 1 || hours > 24) {
    showError("rideHours", "Duration must be 1 to 24 hours.");
    isValid = false;
  }
  if (rateText === "" || rate < 10) {
    showError("rideRate", "Hourly rate must be at least 10 Tk.");
    isValid = false;
  }
  if (lateText === "" || lateHours < 0) {
    showError("rideLateHours", "Late hours cannot be negative.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let totalFare = previewRideFare();

  if (editRideIndex === -1) {
    let newRide = {
      id: nextId("RD", rides),
      customerId: currentCustomerId,
      bikeModel: bikeModel,
      station: station,
      date: date,
      durationHours: hours,
      hourlyRate: rate,
      lateHours: lateHours,
      totalFare: totalFare,
      status: status
    };
    rides.push(newRide);
    showMessage("rideMessage", "Ride record <strong>" + newRide.id + "</strong> saved. Fare: " + totalFare + " Tk.", "success");
  } else {
    let r = rides[editRideIndex];
    r.bikeModel = bikeModel;
    r.station = station;
    r.date = date;
    r.durationHours = hours;
    r.hourlyRate = rate;
    r.lateHours = lateHours;
    r.totalFare = totalFare;
    r.status = status;
    showMessage("rideMessage", "Ride record <strong>" + r.id + "</strong> updated.", "success");
  }

  resetRideForm();
  renderRides();
  renderCustomerOverview();
  return false;
}

function editRide(index) {
  let r = rides[index];
  editRideIndex = index;

  document.getElementById("rideBikeModel").value = r.bikeModel;
  document.getElementById("rideStation").value = r.station;
  document.getElementById("rideDate").value = r.date;
  document.getElementById("rideHours").value = r.durationHours;
  document.getElementById("rideRate").value = r.hourlyRate;
  document.getElementById("rideLateHours").value = r.lateHours;
  document.getElementById("rideStatus").value = r.status;
  previewRideFare();

  document.getElementById("rideFormTitle").innerHTML = "Edit Ride " + r.id;
  document.getElementById("rideSaveButton").value = "Update Ride";
  hideMessage("rideMessage");
}

function deleteRide(index) {
  let r = rides[index];
  rides = removeAt(rides, index);
  showMessage("rideMessage", "Ride record <strong>" + r.id + "</strong> was deleted.", "info");
  resetRideForm();
  renderRides();
  renderCustomerOverview();
}

function resetRideForm() {
  editRideIndex = -1;
  document.getElementById("rideForm").reset();
  clearErrors(rideFields);
  document.getElementById("rideDate").value = todayString();
  document.getElementById("rideLateHours").value = 0;
  document.getElementById("rideRate").value = rentalRules.length > 0 ? rentalRules[0].hourlyPrice : 80;
  document.getElementById("rideFormTitle").innerHTML = "Log Ride & Calculate Fare";
  document.getElementById("rideSaveButton").value = "Save Ride";
  previewRideFare();
}

/* =====================================================================
   FEATURE 3: ACCESSORIES PURCHASE (CRUD + SEARCH)
   ===================================================================== */
function fillAccessorySelect() {
  let select = document.getElementById("orderProduct");
  select.innerHTML = "<option value=''>-- Select Accessory --</option>";

  for (const item of accessories) {
    if (item.stock > 0 || editOrderIndex !== -1) {
      let opt = document.createElement("option");
      opt.value = item.id;
      opt.innerHTML = item.name + " (" + item.price + " Tk - " + item.stock + " in stock)";
      select.appendChild(opt);
    }
  }
}

function previewOrderTotal() {
  let productId = document.getElementById("orderProduct").value;
  let qty = Number(document.getElementById("orderQty").value);
  let box = document.getElementById("orderPreviewBox");

  if (productId === "" || qty < 1) {
    box.innerHTML = "Select an accessory and quantity to see total price.";
    return;
  }

  let product = accessories[findIndexById(accessories, productId)];
  box.innerHTML = "<p><strong>" + product.name + "</strong> (" + product.category + ")</p>" +
                  "<p>" + product.price + " Tk x " + qty + " = <span class='big'>" + (product.price * qty) + " Tk</span></p>";
}

function renderMyOrders() {
  let keyword = document.getElementById("orderSearch").value;
  let rows = "";
  let shown = 0;
  let mine = 0;

  for (let i = 0; i < orders.length; i++) {
    let o = orders[i];
    if (o.customerId !== currentCustomerId) {
      continue;
    }
    mine++;

    let matchesKeyword = containsText(o.productName, keyword) || containsText(o.id, keyword) ||
                         containsText(o.status, keyword);

    if (matchesKeyword) {
      let badgeColor = "orange";
      if (o.status === "Delivered") { badgeColor = "green"; }
      else if (o.status === "Shipped") { badgeColor = "blue"; }
      else if (o.status === "Cancelled") { badgeColor = "red"; }

      let actions = "&mdash;";
      if (o.status === "Pending") {
        actions = "<button type='button' class='btn btn-small' onclick='editOrder(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='cancelOrder(" + i + ")'>Cancel</button>";
      }

      rows += "<tr>" +
                "<td>" + o.id + "</td>" +
                "<td><strong>" + o.productName + "</strong></td>" +
                "<td>" + o.quantity + "</td>" +
                "<td>" + o.totalPrice + " Tk</td>" +
                "<td>" + o.date + "</td>" +
                "<td><span class='badge " + badgeColor + "'>" + o.status + "</span></td>" +
                "<td>" + actions + "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>No orders match your search.</td></tr>";
  }

  document.getElementById("myOrdersBody").innerHTML = rows;
  document.getElementById("myOrderCount").innerHTML = "Showing " + shown + " of " + mine + " orders";
}

function saveOrder() {
  let productId = document.getElementById("orderProduct").value;
  let qtyText = document.getElementById("orderQty").value;
  let qty = Number(qtyText);

  let isValid = true;
  clearErrors(orderFields);

  if (productId === "") {
    showError("orderProduct", "Please select an accessory.");
    isValid = false;
  }

  if (qtyText === "" || qty < 1 || qty > 20) {
    showError("orderQty", "Quantity must be between 1 and 20.");
    isValid = false;
  }

  if (isValid) {
    let product = accessories[findIndexById(accessories, productId)];
    if (qty > product.stock && editOrderIndex === -1) {
      showError("orderQty", "Only " + product.stock + " available in stock.");
      isValid = false;
    }
  }

  if (isValid === false) {
    return false;
  }

  let product = accessories[findIndexById(accessories, productId)];

  if (editOrderIndex === -1) {
    let newOrder = {
      id: nextId("OR", orders),
      customerId: currentCustomerId,
      customerName: currentCustomerName,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: product.price,
      totalPrice: product.price * qty,
      date: todayString(),
      status: "Pending"
    };
    orders.push(newOrder);
    product.stock -= qty;
    showMessage("orderMessage", "Order <strong>" + newOrder.id + "</strong> placed for " + product.name + ".", "success");
  } else {
    let o = orders[editOrderIndex];
    o.productId = product.id;
    o.productName = product.name;
    o.quantity = qty;
    o.unitPrice = product.price;
    o.totalPrice = product.price * qty;
    showMessage("orderMessage", "Order <strong>" + o.id + "</strong> updated.", "success");
  }

  resetOrderForm();
  fillAccessorySelect();
  renderMyOrders();
  renderCustomerOverview();
  return false;
}

function editOrder(index) {
  let o = orders[index];
  editOrderIndex = index;
  fillAccessorySelect();

  document.getElementById("orderProduct").value = o.productId;
  document.getElementById("orderQty").value = o.quantity;
  previewOrderTotal();

  document.getElementById("orderFormTitle").innerHTML = "Edit Order " + o.id;
  document.getElementById("orderSaveButton").value = "Update Order";
  hideMessage("orderMessage");
}

function cancelOrder(index) {
  let o = orders[index];
  o.status = "Cancelled";
  let pIdx = findIndexById(accessories, o.productId);
  if (pIdx !== -1) {
    accessories[pIdx].stock += o.quantity;
  }
  showMessage("orderMessage", "Order <strong>" + o.id + "</strong> was cancelled.", "info");
  resetOrderForm();
  fillAccessorySelect();
  renderMyOrders();
  renderCustomerOverview();
}

function resetOrderForm() {
  editOrderIndex = -1;
  document.getElementById("orderForm").reset();
  clearErrors(orderFields);
  document.getElementById("orderQty").value = 1;
  document.getElementById("orderFormTitle").innerHTML = "Order Accessories";
  document.getElementById("orderSaveButton").value = "Place Order";
  previewOrderTotal();
}

/* =====================================================================
   START
   ===================================================================== */
fillStationOptions();
fillAvailableBikes();
fillAccessorySelect();
resetBookingForm();
resetRideForm();
resetOrderForm();
renderCustomerOverview();
renderBookings();
renderRides();
renderMyOrders();
showSection("overviewSection");
