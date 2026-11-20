/* =====================================================================
   admin.js  -  Everything the Admin can do (admin.html)
   ---------------------------------------------------------------------
   Overview : Dashboard Overview (total users, bikes, bookings, sales)
   Feature 1: Manage Users (CRUD + Search + Create Admin accounts)
   Feature 2: Rental Rules & Pricing Management (CRUD + Search)
   Feature 3: Activity Log (View + Search + Filter)
   ===================================================================== */

const sections = ["overviewSection", "usersSection", "rulesSection", "logSection"];

let editUserIndex = -1;
let editRuleIndex = -1;

const ruleFields = ["ruleTitle", "ruleHourly", "ruleLateFee", "ruleMaxHours", "ruleDesc"];

function addLog(type, message) {
  activityLog.push({ time: nowString(), user: "admin", type: type, message: message });
}

/* =====================================================================
   DASHBOARD OVERVIEW
   ===================================================================== */
function renderOverview() {
  let activeUsers = 0;
  let pendingUsers = 0;
  let roleCounts = { Admin: 0, Customer: 0, "Station Manager": 0, Seller: 0 };

  for (const user of users) {
    if (user.status === "Active") {
      activeUsers++;
    } else if (user.status === "Pending") {
      pendingUsers++;
    }
    if (roleCounts[user.role] !== undefined) {
      roleCounts[user.role]++;
    }
  }

  let availableBikes = 0;
  for (const bike of bikes) {
    if (bike.status === "Available") {
      availableBikes++;
    }
  }

  let totalSales = 0;
  for (const order of orders) {
    if (order.status !== "Cancelled") {
      totalSales += order.totalPrice;
    }
  }

  // Monthly booking counts (Oct vs Nov 2026)
  let octBookings = 0;
  let novBookings = 0;
  for (const booking of bookings) {
    if (booking.date.slice(0, 7) === "2026-10") {
      octBookings++;
    } else if (booking.date.slice(0, 7) === "2026-11") {
      novBookings++;
    }
  }

  document.getElementById("statUsers").innerHTML = users.length;
  document.getElementById("statPending").innerHTML = pendingUsers;
  document.getElementById("statBikes").innerHTML = bikes.length;
  document.getElementById("statAvailableBikes").innerHTML = availableBikes;
  document.getElementById("statBookings").innerHTML = bookings.length;
  document.getElementById("statSales").innerHTML = totalSales + " Tk";
  document.getElementById("statMonthly").innerHTML = novBookings;
  document.getElementById("reportTime").innerHTML = "Updated at " + nowString();

  let roleNames = ["Admin", "Customer", "Station Manager", "Seller"];
  let roleTotals = [roleCounts.Admin, roleCounts.Customer, roleCounts["Station Manager"], roleCounts.Seller];
  drawBarChart("roleChart", roleNames, roleTotals, users.length);

  let monthNames = ["October 2026", "November 2026"];
  let monthTotals = [octBookings, novBookings];
  drawBarChart("monthlyChart", monthNames, monthTotals, bookings.length);
}

function drawBarChart(chartId, names, counts, total) {
  let html = "";
  for (let i = 0; i < names.length; i++) {
    let percent = 0;
    if (total > 0) {
      percent = Math.round(counts[i] / total * 100);
    }
    html += "<div class='bar-row'>" +
              "<div class='bar-label'>" + names[i] + "</div>" +
              "<div class='bar-track'><div class='bar-fill' style='width:" + percent + "%'></div></div>" +
              "<div class='bar-value'>" + counts[i] + "</div>" +
            "</div>";
  }
  document.getElementById(chartId).innerHTML = html;
}

/* =====================================================================
   FEATURE 1: MANAGE USERS (CRUD + SEARCH)
   ===================================================================== */
function renderUsers() {
  let keyword = document.getElementById("userSearch").value;
  let roleFilter = document.getElementById("userRoleFilter").value;
  let statusFilter = document.getElementById("userStatusFilter").value;

  let rows = "";
  let shown = 0;

  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    let matchesKeyword = containsText(user.name, keyword) || containsText(user.username, keyword) ||
                         containsText(user.email, keyword) || containsText(user.id, keyword);
    let matchesRole = (roleFilter === "All" || user.role === roleFilter);
    let matchesStatus = (statusFilter === "All" || user.status === statusFilter);

    if (matchesKeyword && matchesRole && matchesStatus) {
      let statusColor = "red";
      let approveButton = "";
      if (user.status === "Active") {
        statusColor = "green";
      } else if (user.status === "Pending") {
        statusColor = "orange";
        approveButton = "<button type='button' class='btn btn-small btn-success' onclick='approveUser(" + i + ")'>Approve</button>";
      }

      let roleClass = "customer";
      if (user.role === "Admin") { roleClass = "admin"; }
      else if (user.role === "Station Manager") { roleClass = "manager"; }
      else if (user.role === "Seller") { roleClass = "seller"; }

      rows += "<tr>" +
                "<td>" + user.id + "</td>" +
                "<td><strong>" + user.name + "</strong><br><span class='hint'>" + user.email + "</span></td>" +
                "<td>" + user.username + "</td>" +
                "<td><span class='badge " + roleClass + "'>" + user.role + "</span></td>" +
                "<td><span class='badge " + statusColor + "'>" + user.status + "</span></td>" +
                "<td>" +
                  approveButton +
                  "<button type='button' class='btn btn-small' onclick='editUser(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteUser(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No users match your search.</td></tr>";
  }

  document.getElementById("userTableBody").innerHTML = rows;
  document.getElementById("userCount").innerHTML = "Showing " + shown + " of " + users.length + " users";
}

function saveUser() {
  let name = document.getElementById("userName").value.trim();
  let username = document.getElementById("userUsername").value.trim();
  let email = document.getElementById("userEmail").value.trim();
  let password = document.getElementById("userPassword").value;
  let role = document.getElementById("userRole").value;
  let status = getRadioValue("userStatus");

  let isValid = true;
  clearErrors(["userName", "userUsername", "userEmail", "userPassword", "userRole"]);

  if (name.length < 3) {
    showError("userName", "Name must be at least 3 characters.");
    isValid = false;
  }

  if (username.length < 4) {
    showError("userUsername", "Username must be at least 4 characters.");
    isValid = false;
  } else if (usernameUsedByOther(username)) {
    showError("userUsername", "Another user already has this username.");
    isValid = false;
  }

  if (isValidEmail(email) === false) {
    showError("userEmail", "Please enter a valid email address.");
    isValid = false;
  }

  if (password.length < 8) {
    showError("userPassword", "Password must be at least 8 characters.");
    isValid = false;
  }

  if (role === "") {
    showError("userRole", "Please choose a role.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  if (editUserIndex === -1) {
    let newUser = { id: nextId("U", users), name: name, username: username, email: email,
                    password: password, phone: "01700000000", role: role, status: status };
    users.push(newUser);
    addLog("User", "Created " + role.toLowerCase() + " account for " + name);
    showMessage("userMessage", "User <strong>" + name + "</strong> was added with id " + newUser.id + ".", "success");
  } else {
    let user = users[editUserIndex];
    if (user.status !== status) {
      addLog("Security", "Changed status to " + status + " for " + name);
    }
    user.name = name;
    user.username = username;
    user.email = email;
    user.password = password;
    user.role = role;
    user.status = status;
    addLog("User", "Updated account " + user.id + " (" + name + ")");
    showMessage("userMessage", "User <strong>" + name + "</strong> was updated.", "success");
  }

  resetUserForm();
  renderUsers();
  renderOverview();
  return false;
}

function usernameUsedByOther(username) {
  for (let i = 0; i < users.length; i++) {
    if (i !== editUserIndex && users[i].username.toLowerCase() === username.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function editUser(index) {
  let user = users[index];
  editUserIndex = index;

  document.getElementById("userName").value = user.name;
  document.getElementById("userUsername").value = user.username;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userPassword").value = user.password;
  document.getElementById("userRole").value = user.role;
  setRadioValue("userStatus", user.status);

  document.getElementById("userFormTitle").innerHTML = "Edit User " + user.id;
  document.getElementById("userSaveButton").value = "Update User";
  hideMessage("userMessage");
}

function deleteUser(index) {
  let user = users[index];
  if (user.id === "U-001") {
    showMessage("userMessage", "You cannot delete your own admin account.", "error");
    return;
  }

  users = removeAt(users, index);
  addLog("User", "Deleted account " + user.id + " (" + user.name + ")");
  showMessage("userMessage", "User <strong>" + user.name + "</strong> was deleted.", "info");
  resetUserForm();
  renderUsers();
  renderOverview();
}

function approveUser(index) {
  let user = users[index];
  user.status = "Active";
  addLog("Security", "Approved " + user.role.toLowerCase() + " account of " + user.name);
  showMessage("userMessage", "<strong>" + user.name + "</strong> was approved and can now log in.", "success");
  renderUsers();
  renderOverview();
}

function resetUserForm() {
  editUserIndex = -1;
  document.getElementById("userForm").reset();
  clearErrors(["userName", "userUsername", "userEmail", "userPassword", "userRole"]);
  document.getElementById("userFormTitle").innerHTML = "Add New User";
  document.getElementById("userSaveButton").value = "Add User";
}

/* =====================================================================
   FEATURE 2: RENTAL RULES & PRICING MANAGEMENT (CRUD + SEARCH)
   ===================================================================== */
function renderRules() {
  let keyword = document.getElementById("ruleSearch").value;
  let rows = "";
  let shown = 0;

  for (let i = 0; i < rentalRules.length; i++) {
    let rule = rentalRules[i];
    let matchesKeyword = containsText(rule.title, keyword) || containsText(rule.description, keyword) ||
                         containsText(rule.id, keyword);

    if (matchesKeyword) {
      rows += "<tr>" +
                "<td>" + rule.id + "</td>" +
                "<td><strong>" + rule.title + "</strong><br><span class='hint'>" + rule.description + "</span></td>" +
                "<td>" + rule.hourlyPrice + " Tk/hr</td>" +
                "<td>" + rule.lateFeePerHour + " Tk/hr</td>" +
                "<td>" + rule.maxHours + " hrs</td>" +
                "<td>" +
                  "<button type='button' class='btn btn-small' onclick='editRule(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteRule(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No rental rules match your search.</td></tr>";
  }

  document.getElementById("ruleTableBody").innerHTML = rows;
  document.getElementById("ruleCount").innerHTML = "Showing " + shown + " of " + rentalRules.length + " rules";
}

function saveRule() {
  let title = document.getElementById("ruleTitle").value.trim();
  let hourlyText = document.getElementById("ruleHourly").value;
  let lateFeeText = document.getElementById("ruleLateFee").value;
  let maxHoursText = document.getElementById("ruleMaxHours").value;
  let desc = document.getElementById("ruleDesc").value.trim();

  let hourly = Number(hourlyText);
  let lateFee = Number(lateFeeText);
  let maxHours = Number(maxHoursText);

  let isValid = true;
  clearErrors(ruleFields);

  if (title.length < 3) {
    showError("ruleTitle", "Rule title must be at least 3 characters.");
    isValid = false;
  }

  if (hourlyText === "" || hourly < 10 || hourly > 1000) {
    showError("ruleHourly", "Enter hourly price between 10 and 1000 Tk.");
    isValid = false;
  }

  if (lateFeeText === "" || lateFee < 0 || lateFee > 500) {
    showError("ruleLateFee", "Enter late fee between 0 and 500 Tk.");
    isValid = false;
  }

  if (maxHoursText === "" || maxHours < 1 || maxHours > 48) {
    showError("ruleMaxHours", "Enter max hours between 1 and 48.");
    isValid = false;
  }

  if (desc.length < 5) {
    showError("ruleDesc", "Please enter a short description.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  if (editRuleIndex === -1) {
    let newRule = { id: nextId("RL", rentalRules), title: title, hourlyPrice: hourly,
                    lateFeePerHour: lateFee, maxHours: maxHours, description: desc };
    rentalRules.push(newRule);
    addLog("Rules", "Added rental rule: " + title + " (" + hourly + " Tk/hr)");
    showMessage("rulesMessage", "Rental rule <strong>" + title + "</strong> was added.", "success");
  } else {
    let rule = rentalRules[editRuleIndex];
    rule.title = title;
    rule.hourlyPrice = hourly;
    rule.lateFeePerHour = lateFee;
    rule.maxHours = maxHours;
    rule.description = desc;
    addLog("Rules", "Updated rental rule " + rule.id + ": " + title);
    showMessage("rulesMessage", "Rental rule <strong>" + title + "</strong> was updated.", "success");
  }

  resetRuleForm();
  renderRules();
  return false;
}

function editRule(index) {
  let rule = rentalRules[index];
  editRuleIndex = index;

  document.getElementById("ruleTitle").value = rule.title;
  document.getElementById("ruleHourly").value = rule.hourlyPrice;
  document.getElementById("ruleLateFee").value = rule.lateFeePerHour;
  document.getElementById("ruleMaxHours").value = rule.maxHours;
  document.getElementById("ruleDesc").value = rule.description;

  document.getElementById("ruleFormTitle").innerHTML = "Edit Rule " + rule.id;
  document.getElementById("ruleSaveButton").value = "Update Rule";
  hideMessage("rulesMessage");
}

function deleteRule(index) {
  let rule = rentalRules[index];
  rentalRules = removeAt(rentalRules, index);
  addLog("Rules", "Deleted rental rule " + rule.id + " (" + rule.title + ")");
  showMessage("rulesMessage", "Rule <strong>" + rule.title + "</strong> was deleted.", "info");
  resetRuleForm();
  renderRules();
}

function resetRuleForm() {
  editRuleIndex = -1;
  document.getElementById("ruleForm").reset();
  clearErrors(ruleFields);
  document.getElementById("ruleFormTitle").innerHTML = "Add New Rental Rule";
  document.getElementById("ruleSaveButton").value = "Add Rule";
}

/* =====================================================================
   FEATURE 3: ACTIVITY LOG MONITOR (VIEW + SEARCH)
   ===================================================================== */
function getLogColor(type) {
  switch (type) {
    case "User":     return "#1565C0";
    case "Bike":     return "#2E7D32";
    case "Product":  return "#EF6C00";
    case "Booking":  return "#0F766E";
    case "Security": return "#C62828";
    case "Rules":    return "#663399";
    default:         return "#6C757D";
  }
}

function renderLog() {
  let keyword = document.getElementById("logSearch").value;
  let typeFilter = document.getElementById("logTypeFilter").value;
  let board = document.getElementById("logBoard");

  board.innerHTML = "";
  let shown = 0;

  for (let i = activityLog.length - 1; i >= 0; i--) {
    let entry = activityLog[i];
    let matchesKeyword = containsText(entry.message, keyword) || containsText(entry.user, keyword);
    let matchesType = (typeFilter === "All" || entry.type === typeFilter);

    if (matchesKeyword && matchesType) {
      let item = document.createElement("div");
      item.className = "log-item";
      item.style.borderLeftColor = getLogColor(entry.type);
      item.innerHTML = "<span class='log-time'>" + entry.time + " &middot; " + entry.user + "</span><br>" +
                       "<span class='badge' style='background-color:" + getLogColor(entry.type) + "'>" +
                       entry.type + "</span> " + entry.message;
      board.appendChild(item);
      shown++;
    }
  }

  if (shown === 0) {
    board.innerHTML = "<p class='empty-row'>No activity records match your search.</p>";
  }
  document.getElementById("logCount").innerHTML = shown + " entries shown";
}

function clearLog() {
  activityLog = [];
  addLog("Security", "Activity log was cleared by admin");
  renderLog();
}

/* =====================================================================
   START
   ===================================================================== */
renderOverview();
renderUsers();
renderRules();
renderLog();
showSection("overviewSection");

document.getElementById("nav-overviewSection").addEventListener("click", renderOverview);
document.getElementById("nav-logSection").addEventListener("click", renderLog);
