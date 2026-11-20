/* =====================================================================
   common.js  -  Helper functions shared by every page
   ---------------------------------------------------------------------
   Loaded after data.js and before each page's own script.
   An external .js file contains only JavaScript, no <script> tags.
   ===================================================================== */

function showSection(sectionId) {
  for (let i = 0; i < sections.length; i++) {
    let section = document.getElementById(sections[i]);
    let navButton = document.getElementById("nav-" + sections[i]);

    if (sections[i] === sectionId) {
      section.style.display = "block";
      navButton.className = "active";
    } else {
      section.style.display = "none";
      navButton.className = "";
    }
  }
}

function showError(fieldId, message) {
  document.getElementById(fieldId + "Error").innerHTML = message;
  let field = document.getElementById(fieldId);
  if (field != null) {
    field.style.border = "2px solid red";
  }
}

function clearError(fieldId) {
  document.getElementById(fieldId + "Error").innerHTML = "";
  let field = document.getElementById(fieldId);
  if (field != null) {
    field.style.border = "";
  }
}

function clearErrors(fieldIds) {
  for (let i = 0; i < fieldIds.length; i++) {
    clearError(fieldIds[i]);
  }
}

function showMessage(boxId, text, type) {
  let box = document.getElementById(boxId);
  box.innerHTML = text;
  box.className = "message " + type;
  box.style.display = "block";
}

function hideMessage(boxId) {
  document.getElementById(boxId).style.display = "none";
}

function isEmpty(value) {
  return value.trim() === "";
}

function isValidEmail(email) {
  let atPosition = email.indexOf("@");
  let dotPosition = email.indexOf(".", atPosition);

  if (atPosition < 1) {
    return false;
  }
  if (dotPosition < atPosition + 2) {
    return false;
  }
  if (dotPosition === email.length - 1) {
    return false;
  }
  return true;
}

function isDigitsOnly(text) {
  if (text.length === 0) {
    return false;
  }
  let digits = "0123456789";
  for (let i = 0; i < text.length; i++) {
    if (digits.indexOf(text[i]) === -1) {
      return false;
    }
  }
  return true;
}

function getRadioValue(groupName) {
  let radios = document.getElementsByName(groupName);
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
  return "";
}

function setRadioValue(groupName, value) {
  let radios = document.getElementsByName(groupName);
  for (let i = 0; i < radios.length; i++) {
    radios[i].checked = (radios[i].value === value);
  }
}

function containsText(text, keyword) {
  return String(text).toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
}

function findIndexById(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return i;
    }
  }
  return -1;
}

function removeAt(list, index) {
  return list.slice(0, index).concat(list.slice(index + 1));
}

function nextId(prefix, list) {
  let biggest = 0;
  let digits = 3;
  for (let i = 0; i < list.length; i++) {
    let numberText = list[i].id.slice(prefix.length + 1);
    digits = numberText.length;
    if (Number(numberText) > biggest) {
      biggest = Number(numberText);
    }
  }
  let newNumber = String(biggest + 1);
  while (newNumber.length < digits) {
    newNumber = "0" + newNumber;
  }
  return prefix + "-" + newNumber;
}

function todayString() {
  let now = new Date();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  if (month < 10) { month = "0" + month; }
  if (day < 10) { day = "0" + day; }
  return now.getFullYear() + "-" + month + "-" + day;
}

function nowString() {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  return todayString() + " " + hours + ":" + minutes;
}

// Public e-bike & station search (used on index.html)
function renderPublicFleet() {
  let keyword = document.getElementById("fleetSearch").value;
  let stationFilter = document.getElementById("fleetStation").value;

  let rows = "";
  let shown = 0;

  for (const bike of bikes) {
    let matchesKeyword = containsText(bike.model, keyword) || containsText(bike.brand, keyword) ||
                         containsText(bike.station, keyword);
    let matchesStation = (stationFilter === "All" || bike.station === stationFilter);

    if (matchesKeyword && matchesStation) {
      let badgeColor = "red";
      if (bike.status === "Available") {
        badgeColor = "green";
      } else if (bike.status === "Rented") {
        badgeColor = "orange";
      }

      rows += "<tr>" +
                "<td><strong>" + bike.model + "</strong></td>" +
                "<td>" + bike.brand + "</td>" +
                "<td>" + bike.station + "</td>" +
                "<td>" + bike.battery + "%</td>" +
                "<td>" + bike.hourlyRate + " Tk/hr</td>" +
                "<td><span class='badge " + badgeColor + "'>" + bike.status + "</span></td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No e-bikes match your search.</td></tr>";
  }

  document.getElementById("fleetBody").innerHTML = rows;
  document.getElementById("fleetCount").innerHTML = shown + " e-bike(s) found";
}
