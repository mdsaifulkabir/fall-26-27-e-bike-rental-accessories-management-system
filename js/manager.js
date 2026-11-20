/* =====================================================================
   manager.js  -  Everything the Station Manager can do (manager.html)
   ---------------------------------------------------------------------
   Overview : Total bikes, Available, Rented, Unavailable
   Feature 1: Station Information Management (CRUD + Search)
   Feature 2: Bike Status Management (CRUD + Search)
   Feature 3: Station Availability Monitoring (Read + Search)
   ===================================================================== */

const sections = ["overviewSection", "stationsSection", "bikesSection", "availabilitySection"];

let editStationIndex = -1;
let editBikeIndex = -1;

const stationFields = ["stationName", "stationLocation", "stationCapacity", "stationManagerName"];
const bikeFields = ["bikeModel", "bikeBrand", "bikeStation", "bikeBattery", "bikeRate"];

/* =====================================================================
   DASHBOARD OVERVIEW
   ===================================================================== */
function renderManagerOverview() {
  let available = 0;
  let rented = 0;
  let unavailable = 0;

  for (const bike of bikes) {
    if (bike.status === "Available") { available++; }
    else if (bike.status === "Rented") { rented++; }
    else { unavailable++; }
  }

  document.getElementById("statTotalBikes").innerHTML = bikes.length;
  document.getElementById("statAvailable").innerHTML = available;
  document.getElementById("statRented").innerHTML = rented;
  document.getElementById("statUnavailable").innerHTML = unavailable;
  document.getElementById("statTotalStations").innerHTML = stations.length;
}

/* =====================================================================
   FEATURE 1: STATION INFORMATION MANAGEMENT (CRUD + SEARCH)
   ===================================================================== */
function renderStations() {
  let keyword = document.getElementById("stationSearch").value;
  let rows = "";
  let shown = 0;

  for (let i = 0; i < stations.length; i++) {
    let s = stations[i];
    let matchesKeyword = containsText(s.name, keyword) || containsText(s.location, keyword) ||
                         containsText(s.id, keyword);

    if (matchesKeyword) {
      rows += "<tr>" +
                "<td>" + s.id + "</td>" +
                "<td><strong>" + s.name + "</strong></td>" +
                "<td>" + s.location + "</td>" +
                "<td>" + s.capacity + " docks</td>" +
                "<td>" + s.managerName + "</td>" +
                "<td>" +
                  "<button type='button' class='btn btn-small' onclick='editStation(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteStation(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No stations match your search.</td></tr>";
  }

  document.getElementById("stationTableBody").innerHTML = rows;
  document.getElementById("stationCount").innerHTML = "Showing " + shown + " of " + stations.length + " stations";
}

function saveStation() {
  let name = document.getElementById("stationName").value.trim();
  let location = document.getElementById("stationLocation").value.trim();
  let capacityText = document.getElementById("stationCapacity").value;
  let managerName = document.getElementById("stationManagerName").value.trim();

  let capacity = Number(capacityText);
  let isValid = true;
  clearErrors(stationFields);

  if (name.length < 3) {
    showError("stationName", "Station name must be at least 3 characters.");
    isValid = false;
  }
  if (location.length < 5) {
    showError("stationLocation", "Location must be at least 5 characters.");
    isValid = false;
  }
  if (capacityText === "" || capacity < 2 || capacity > 100) {
    showError("stationCapacity", "Capacity must be between 2 and 100.");
    isValid = false;
  }
  if (managerName.length < 3) {
    showError("stationManagerName", "Manager name must be at least 3 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  if (editStationIndex === -1) {
    let newStation = { id: nextId("S", stations), name: name, location: location,
                       capacity: capacity, managerName: managerName };
    stations.push(newStation);
    showMessage("stationMessage", "Station <strong>" + name + "</strong> was added.", "success");
  } else {
    let s = stations[editStationIndex];
    s.name = name;
    s.location = location;
    s.capacity = capacity;
    s.managerName = managerName;
    showMessage("stationMessage", "Station <strong>" + name + "</strong> was updated.", "success");
  }

  resetStationForm();
  fillBikeStationDropdown();
  renderStations();
  renderAvailability();
  renderManagerOverview();
  return false;
}

function editStation(index) {
  let s = stations[index];
  editStationIndex = index;

  document.getElementById("stationName").value = s.name;
  document.getElementById("stationLocation").value = s.location;
  document.getElementById("stationCapacity").value = s.capacity;
  document.getElementById("stationManagerName").value = s.managerName;

  document.getElementById("stationFormTitle").innerHTML = "Edit Station " + s.id;
  document.getElementById("stationSaveButton").value = "Update Station";
  hideMessage("stationMessage");
}

function deleteStation(index) {
  let s = stations[index];
  stations = removeAt(stations, index);
  showMessage("stationMessage", "Station <strong>" + s.name + "</strong> was deleted.", "info");
  resetStationForm();
  fillBikeStationDropdown();
  renderStations();
  renderAvailability();
  renderManagerOverview();
}

function resetStationForm() {
  editStationIndex = -1;
  document.getElementById("stationForm").reset();
  clearErrors(stationFields);
  document.getElementById("stationFormTitle").innerHTML = "Add New Station";
  document.getElementById("stationSaveButton").value = "Add Station";
}

/* =====================================================================
   FEATURE 2: BIKE STATUS MANAGEMENT (CRUD + SEARCH)
   ===================================================================== */
function fillBikeStationDropdown() {
  let select = document.getElementById("bikeStation");
  select.innerHTML = "<option value=''>-- Select Station --</option>";
  for (const s of stations) {
    let opt = document.createElement("option");
    opt.value = s.name;
    opt.innerHTML = s.name;
    select.appendChild(opt);
  }
}

function renderBikes() {
  let keyword = document.getElementById("bikeSearch").value;
  let statusFilter = document.getElementById("bikeStatusFilter").value;

  let rows = "";
  let shown = 0;

  for (let i = 0; i < bikes.length; i++) {
    let b = bikes[i];
    let matchesKeyword = containsText(b.model, keyword) || containsText(b.brand, keyword) ||
                         containsText(b.station, keyword) || containsText(b.id, keyword);
    let matchesStatus = (statusFilter === "All" || b.status === statusFilter);

    if (matchesKeyword && matchesStatus) {
      let badgeColor = "red";
      if (b.status === "Available") { badgeColor = "green"; }
      else if (b.status === "Rented") { badgeColor = "orange"; }

      rows += "<tr>" +
                "<td>" + b.id + "</td>" +
                "<td><strong>" + b.model + "</strong><br><span class='hint'>" + b.brand + "</span></td>" +
                "<td>" + b.station + "</td>" +
                "<td>" + b.battery + "%</td>" +
                "<td>" + b.hourlyRate + " Tk/hr</td>" +
                "<td><span class='badge " + badgeColor + "'>" + b.status + "</span></td>" +
                "<td>" +
                  "<button type='button' class='btn btn-small' onclick='editBike(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteBike(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>No bikes match your search.</td></tr>";
  }

  document.getElementById("bikeTableBody").innerHTML = rows;
  document.getElementById("bikeCount").innerHTML = "Showing " + shown + " of " + bikes.length + " bikes";
}

function saveBike() {
  let model = document.getElementById("bikeModel").value.trim();
  let brand = document.getElementById("bikeBrand").value.trim();
  let station = document.getElementById("bikeStation").value;
  let batteryText = document.getElementById("bikeBattery").value;
  let rateText = document.getElementById("bikeRate").value;
  let status = getRadioValue("bikeStatus");

  let battery = Number(batteryText);
  let rate = Number(rateText);
  let isValid = true;
  clearErrors(bikeFields);

  if (model.length < 3) {
    showError("bikeModel", "Model name must be at least 3 characters.");
    isValid = false;
  }
  if (brand.length < 2) {
    showError("bikeBrand", "Brand must be at least 2 characters.");
    isValid = false;
  }
  if (station === "") {
    showError("bikeStation", "Please select a station.");
    isValid = false;
  }
  if (batteryText === "" || battery < 0 || battery > 100) {
    showError("bikeBattery", "Battery must be 0 to 100%.");
    isValid = false;
  }
  if (rateText === "" || rate < 10 || rate > 1000) {
    showError("bikeRate", "Hourly rate must be 10 to 1000 Tk.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  if (editBikeIndex === -1) {
    let newBike = { id: nextId("EB", bikes), model: model, brand: brand, station: station,
                    battery: battery, hourlyRate: rate, status: status };
    bikes.push(newBike);
    showMessage("bikeMessage", "E-Bike <strong>" + model + "</strong> (" + newBike.id + ") was added.", "success");
  } else {
    let b = bikes[editBikeIndex];
    b.model = model;
    b.brand = brand;
    b.station = station;
    b.battery = battery;
    b.hourlyRate = rate;
    b.status = status;
    showMessage("bikeMessage", "E-Bike <strong>" + model + "</strong> was updated.", "success");
  }

  resetBikeForm();
  renderBikes();
  renderAvailability();
  renderManagerOverview();
  return false;
}

function editBike(index) {
  let b = bikes[index];
  editBikeIndex = index;

  document.getElementById("bikeModel").value = b.model;
  document.getElementById("bikeBrand").value = b.brand;
  document.getElementById("bikeStation").value = b.station;
  document.getElementById("bikeBattery").value = b.battery;
  document.getElementById("bikeRate").value = b.hourlyRate;
  setRadioValue("bikeStatus", b.status);

  document.getElementById("bikeFormTitle").innerHTML = "Edit E-Bike " + b.id;
  document.getElementById("bikeSaveButton").value = "Update E-Bike";
  hideMessage("bikeMessage");
}

function deleteBike(index) {
  let b = bikes[index];
  if (b.status === "Rented") {
    showMessage("bikeMessage", "<strong>" + b.model + "</strong> is currently rented and cannot be deleted.", "error");
    return;
  }
  bikes = removeAt(bikes, index);
  showMessage("bikeMessage", "E-Bike <strong>" + b.model + "</strong> was deleted.", "info");
  resetBikeForm();
  renderBikes();
  renderAvailability();
  renderManagerOverview();
}

function resetBikeForm() {
  editBikeIndex = -1;
  document.getElementById("bikeForm").reset();
  clearErrors(bikeFields);
  document.getElementById("bikeFormTitle").innerHTML = "Add New E-Bike";
  document.getElementById("bikeSaveButton").value = "Add E-Bike";
}

/* =====================================================================
   FEATURE 3: STATION AVAILABILITY MONITORING (READ + SEARCH)
   ===================================================================== */
function renderAvailability() {
  let keyword = document.getElementById("availabilitySearch").value;
  let rows = "";
  let shown = 0;

  for (const s of stations) {
    if (!containsText(s.name, keyword) && !containsText(s.location, keyword)) {
      continue;
    }

    let total = 0;
    let available = 0;
    let rented = 0;
    let unavailable = 0;

    for (const b of bikes) {
      if (b.station === s.name) {
        total++;
        if (b.status === "Available") { available++; }
        else if (b.status === "Rented") { rented++; }
        else { unavailable++; }
      }
    }

    rows += "<tr>" +
              "<td>" + s.id + "</td>" +
              "<td><strong>" + s.name + "</strong><br><span class='hint'>" + s.location + "</span></td>" +
              "<td>" + total + " / " + s.capacity + "</td>" +
              "<td><span class='badge green'>" + available + "</span></td>" +
              "<td><span class='badge orange'>" + rented + "</span></td>" +
              "<td><span class='badge red'>" + unavailable + "</span></td>" +
            "</tr>";
    shown++;
  }

  if (shown === 0) {
    rows = "<tr><td colspan='6' class='empty-row'>No stations match your search.</td></tr>";
  }

  document.getElementById("availabilityBody").innerHTML = rows;
  document.getElementById("availabilityCount").innerHTML = "Showing " + shown + " of " + stations.length + " stations";
}

/* =====================================================================
   START
   ===================================================================== */
fillBikeStationDropdown();
renderManagerOverview();
renderStations();
renderBikes();
renderAvailability();
showSection("overviewSection");
