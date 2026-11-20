/* =====================================================================
   register.js  -  Registration for Customer, Station Manager, Seller
   ---------------------------------------------------------------------
   Admins are created only from the Admin dashboard (admin.html).
   Station Managers start as "Pending" until an Admin approves them.
   ===================================================================== */

const commonFields = ["fullName", "email", "phone", "gender",
                      "newUsername", "newPassword", "confirmPassword"];

const customerFields = ["nid", "licenseNo", "customerAddress"];
const managerFields = ["employeeId", "assignedStation", "experience"];
const sellerFields = ["shopName", "tradeLicense", "businessAddress"];

function showTypeFields() {
  let type = getRadioValue("userType");

  document.getElementById("formBody").style.display = (type === "") ? "none" : "block";

  document.getElementById("customerFields").style.display = (type === "Customer") ? "block" : "none";
  document.getElementById("managerFields").style.display = (type === "Station Manager") ? "block" : "none";
  document.getElementById("sellerFields").style.display = (type === "Seller") ? "block" : "none";

  document.getElementById("typeCardCustomer").className = (type === "Customer") ? "type-option selected" : "type-option";
  document.getElementById("typeCardManager").className = (type === "Station Manager") ? "type-option selected" : "type-option";
  document.getElementById("typeCardSeller").className = (type === "Seller") ? "type-option selected" : "type-option";

  if (type !== "") {
    document.getElementById("registerButton").value = "Create " + type + " Account";
  }

  clearAllRegisterErrors();
}

function validateRegister() {
  let type = getRadioValue("userType");
  clearAllRegisterErrors();

  if (type === "") {
    showError("userType", "Please choose the type of account.");
    return false;
  }

  let commonOk = validateCommon();
  let typeOk = false;

  switch (type) {
    case "Customer":
      typeOk = validateCustomer();
      break;
    case "Station Manager":
      typeOk = validateManager();
      break;
    case "Seller":
      typeOk = validateSeller();
      break;
  }

  if (!(commonOk && typeOk)) {
    showMessage("registerMessage", "Please fix the fields marked in red.", "error");
    return false;
  }

  let newUser = {
    id: nextId("U", users),
    name: document.getElementById("fullName").value.trim(),
    username: document.getElementById("newUsername").value.trim(),
    password: document.getElementById("newPassword").value,
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    gender: getRadioValue("gender"),
    role: type,
    status: "Active"
  };

  if (type === "Customer") {
    newUser.nid = document.getElementById("nid").value.trim();
    newUser.licenseNo = document.getElementById("licenseNo").value.trim();
    newUser.address = document.getElementById("customerAddress").value.trim();
  } else if (type === "Station Manager") {
    newUser.employeeId = document.getElementById("employeeId").value.trim().toUpperCase();
    newUser.assignedStation = document.getElementById("assignedStation").value;
    newUser.experience = Number(document.getElementById("experience").value);
    newUser.status = "Pending";
  } else {
    newUser.shopName = document.getElementById("shopName").value.trim();
    newUser.tradeLicense = document.getElementById("tradeLicense").value.trim().toUpperCase();
    newUser.businessAddress = document.getElementById("businessAddress").value.trim();
  }

  users.push(newUser);
  console.log("New user:", newUser);

  let text = "Welcome, <strong>" + newUser.name + "</strong>! Your " + type.toLowerCase() +
             " account was created (user id " + newUser.id + "). ";
  if (newUser.status === "Pending") {
    text += "An admin will review your details; you can log in after approval.";
  } else {
    text += "<a href='login.html'>Log in now</a>.";
  }
  text += "<br><span class='hint'>Frontend version: data stays in browser memory until reload.</span>";
  showMessage("registerMessage", text, "success");

  document.getElementById("registerForm").reset();
  resetRegisterForm();
  return false;
}

function validateCommon() {
  let isValid = true;
  let fullName = document.getElementById("fullName").value.trim();
  let email = document.getElementById("email").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let username = document.getElementById("newUsername").value.trim();
  let password = document.getElementById("newPassword").value;
  let confirmPassword = document.getElementById("confirmPassword").value;

  if (fullName.length < 3) {
    showError("fullName", "Full name must be at least 3 characters.");
    isValid = false;
  }

  if (isEmpty(email)) {
    showError("email", "Email is required.");
    isValid = false;
  } else if (isValidEmail(email) === false) {
    showError("email", "Please enter a valid email address.");
    isValid = false;
  } else if (isTaken("email", email)) {
    showError("email", "An account with this email already exists.");
    isValid = false;
  }

  if (isDigitsOnly(phone) === false || phone.length !== 11 || phone.slice(0, 2) !== "01") {
    showError("phone", "Phone must be 11 digits and start with 01.");
    isValid = false;
  }

  if (getRadioValue("gender") === "") {
    showError("gender", "Please select an option.");
    isValid = false;
  }

  if (username.length < 4) {
    showError("newUsername", "Username must be at least 4 characters.");
    isValid = false;
  } else if (username.indexOf(" ") !== -1) {
    showError("newUsername", "Username cannot contain spaces.");
    isValid = false;
  } else if (isTaken("username", username)) {
    showError("newUsername", "This username is already taken.");
    isValid = false;
  }

  if (password.length < 8) {
    showError("newPassword", "Password must be at least 8 characters.");
    isValid = false;
  } else if (hasDigit(password) === false) {
    showError("newPassword", "Password must contain at least one digit.");
    isValid = false;
  }

  if (confirmPassword === "" || confirmPassword !== password) {
    showError("confirmPassword", "Password and Confirm Password must match.");
    isValid = false;
  }

  return isValid;
}

function validateCustomer() {
  let isValid = true;
  let nid = document.getElementById("nid").value.trim();
  let licenseNo = document.getElementById("licenseNo").value.trim();
  let address = document.getElementById("customerAddress").value.trim();

  let goodLength = (nid.length === 10 || nid.length === 13 || nid.length === 17);
  if (isDigitsOnly(nid) === false || goodLength === false) {
    showError("nid", "NID must be 10, 13 or 17 digits.");
    isValid = false;
  }

  if (licenseNo.length < 4) {
    showError("licenseNo", "Enter a valid license or student ID number.");
    isValid = false;
  }

  if (address.length < 8) {
    showError("customerAddress", "Please write your address (at least 8 characters).");
    isValid = false;
  }

  return isValid;
}

function validateManager() {
  let isValid = true;
  let employeeId = document.getElementById("employeeId").value.trim().toUpperCase();
  let station = document.getElementById("assignedStation").value;
  let experienceText = document.getElementById("experience").value;
  let experience = Number(experienceText);

  if (employeeId.length !== 8 || employeeId.slice(0, 4) !== "MGR-" || isDigitsOnly(employeeId.slice(4)) === false) {
    showError("employeeId", "Use the format MGR-1001.");
    isValid = false;
  }

  if (station === "") {
    showError("assignedStation", "Please select a station.");
    isValid = false;
  }

  if (experienceText === "" || experience < 0 || experience > 40) {
    showError("experience", "Enter a number from 0 to 40.");
    isValid = false;
  }

  return isValid;
}

function validateSeller() {
  let isValid = true;
  let shopName = document.getElementById("shopName").value.trim();
  let tradeLicense = document.getElementById("tradeLicense").value.trim();
  let businessAddress = document.getElementById("businessAddress").value.trim();

  if (shopName.length < 3) {
    showError("shopName", "Shop name must be at least 3 characters.");
    isValid = false;
  }

  if (tradeLicense.length < 4) {
    showError("tradeLicense", "Enter a valid trade license number.");
    isValid = false;
  }

  if (businessAddress.length < 8) {
    showError("businessAddress", "Please write your business address.");
    isValid = false;
  }

  return isValid;
}

function isTaken(property, value) {
  for (const user of users) {
    if (user[property] !== undefined && String(user[property]).toLowerCase() === value.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function hasDigit(text) {
  let digits = "0123456789";
  for (let i = 0; i < text.length; i++) {
    if (digits.indexOf(text[i]) !== -1) {
      return true;
    }
  }
  return false;
}

function showPasswordStrength() {
  let password = document.getElementById("newPassword").value;
  let text = document.getElementById("strengthText");
  let score = 0;

  if (password.length >= 8) { score++; }
  if (password.length >= 12) { score++; }
  if (hasDigit(password)) { score++; }
  if (password.toLowerCase() !== password) { score++; }

  if (password === "") {
    text.innerHTML = "";
  } else if (score <= 1) {
    text.innerHTML = "Strength: weak";
    text.style.color = "#C62828";
  } else if (score <= 2) {
    text.innerHTML = "Strength: fair";
    text.style.color = "#EF6C00";
  } else {
    text.innerHTML = "Strength: strong";
    text.style.color = "#2E7D32";
  }
}

function toggleRegisterButton() {
  document.getElementById("registerButton").disabled = !document.getElementById("terms").checked;
}

function clearAllRegisterErrors() {
  clearError("userType");
  clearErrors(commonFields);
  clearErrors(customerFields);
  clearErrors(managerFields);
  clearErrors(sellerFields);
}

function resetRegisterForm() {
  clearAllRegisterErrors();
  document.getElementById("formBody").style.display = "none";
  document.getElementById("typeCardCustomer").className = "type-option";
  document.getElementById("typeCardManager").className = "type-option";
  document.getElementById("typeCardSeller").className = "type-option";
  document.getElementById("registerButton").disabled = true;
  document.getElementById("registerButton").value = "Create Account";
  document.getElementById("strengthText").innerHTML = "";
}
