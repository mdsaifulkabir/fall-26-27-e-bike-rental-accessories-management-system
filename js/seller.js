/* =====================================================================
   seller.js  -  Everything the Seller can do (seller.html)
   ---------------------------------------------------------------------
   Overview : Total products, Total stock, Total orders, Total sales
   Feature 1: Product Listing Management (CRUD + Search)
   Feature 2: Stock Management (Read + Update + Search + Low-stock alert)
   Feature 3: Customer Order Management (Read + Update + Delete + Search)
   ===================================================================== */

const sections = ["overviewSection", "productsSection", "stockSection", "ordersSection"];

let editProductIndex = -1;
const LOW_STOCK_LIMIT = 5;

const productFields = ["prodName", "prodCategory", "prodPrice", "prodStock", "prodDesc"];

function renderSellerOverview() {
    let totalStock = 0;
    let lowStockCount = 0;
    for (const p of accessories) {
        totalStock += p.stock;
        if (p.stock <= LOW_STOCK_LIMIT) {
            lowStockCount++;
        }
    }

    let activeOrders = 0;
    let totalSales = 0;
    for (const o of orders) {
        if (o.status !== "Cancelled") {
            activeOrders++;
            totalSales += o.totalPrice;
        }
    }

    document.getElementById("statProducts").innerHTML = accessories.length;
    document.getElementById("statStock").innerHTML = totalStock;
    document.getElementById("statLowStock").innerHTML = lowStockCount;
    document.getElementById("statOrders").innerHTML = activeOrders;
    document.getElementById("statTotalSales").innerHTML = totalSales + " Tk";
}


function renderProducts() {
    let keyword = document.getElementById("prodSearch").value;
    let categoryFilter = document.getElementById("prodCategoryFilter").value;

    let rows = "";
    let shown = 0;

    for (let i = 0; i < accessories.length; i++) {
        let p = accessories[i];
        let matchesKeyword = containsText(p.name, keyword) || containsText(p.description, keyword) ||
            containsText(p.id, keyword);
        let matchesCat = (categoryFilter === "All" || p.category === categoryFilter);

        if (matchesKeyword && matchesCat) {
            rows += "<tr>" +
                "<td>" + p.id + "</td>" +
                "<td><strong>" + p.name + "</strong><br><span class='hint'>" + p.description + "</span></td>" +
                "<td>" + p.category + "</td>" +
                "<td>" + p.price + " Tk</td>" +
                "<td>" + p.stock + "</td>" +
                "<td>" +
                "<button type='button' class='btn btn-small' onclick='editProduct(" + i + ")'>Edit</button>" +
                "<button type='button' class='btn btn-small btn-danger' onclick='deleteProduct(" + i + ")'>Delete</button>" +
                "</td>" +
                "</tr>";
            shown++;
        }
    }

    if (shown === 0) {
        rows = "<tr><td colspan='6' class='empty-row'>No products match your search.</td></tr>";
    }

    document.getElementById("prodTableBody").innerHTML = rows;
    document.getElementById("prodCount").innerHTML = "Showing " + shown + " of " + accessories.length + " products";
}

function saveProduct() {
    let name = document.getElementById("prodName").value.trim();
    let category = document.getElementById("prodCategory").value;
    let priceText = document.getElementById("prodPrice").value;
    let stockText = document.getElementById("prodStock").value;
    let desc = document.getElementById("prodDesc").value.trim();

    let price = Number(priceText);
    let stock = Number(stockText);
    let isValid = true;
    clearErrors(productFields);

    if (name.length < 3) {
        showError("prodName", "Product name must be at least 3 characters.");
        isValid = false;
    }
    if (category === "") {
        showError("prodCategory", "Please choose a category.");
        isValid = false;
    }
    if (priceText === "" || price < 10 || price > 50000) {
        showError("prodPrice", "Price must be between 10 and 50000 Tk.");
        isValid = false;
    }
    if (stockText === "" || stock < 0 || stock > 500) {
        showError("prodStock", "Stock must be between 0 and 500.");
        isValid = false;
    }
    if (desc.length < 5) {
        showError("prodDesc", "Enter a short product description.");
        isValid = false;
    }

    if (isValid === false) {
        return false;
    }

    if (editProductIndex === -1) {
        let newProd = {
            id: nextId("AC", accessories), sellerId: "U-007", name: name, category: category,
            price: price, stock: stock, description: desc
        };
        accessories.push(newProd);
        showMessage("prodMessage", "Product <strong>" + name + "</strong> (" + newProd.id + ") added.", "success");
    } else {
        let p = accessories[editProductIndex];
        p.name = name;
        p.category = category;
        p.price = price;
        p.stock = stock;
        p.description = desc;
        showMessage("prodMessage", "Product <strong>" + name + "</strong> updated.", "success");
    }

    resetProductForm();
    renderProducts();
    renderStock();
    renderSellerOverview();
    return false;
}

function editProduct(index) {
    let p = accessories[index];
    editProductIndex = index;

    document.getElementById("prodName").value = p.name;
    document.getElementById("prodCategory").value = p.category;
    document.getElementById("prodPrice").value = p.price;
    document.getElementById("prodStock").value = p.stock;
    document.getElementById("prodDesc").value = p.description;

    document.getElementById("prodFormTitle").innerHTML = "Edit Product " + p.id;
    document.getElementById("prodSaveButton").value = "Update Product";
    hideMessage("prodMessage");
}

function deleteProduct(index) {
    let p = accessories[index];
    accessories = removeAt(accessories, index);
    showMessage("prodMessage", "Product <strong>" + p.name + "</strong> was deleted.", "info");
    resetProductForm();
    renderProducts();
    renderStock();
    renderSellerOverview();
}

function resetProductForm() {
    editProductIndex = -1;
    document.getElementById("prodForm").reset();
    clearErrors(productFields);
    document.getElementById("prodFormTitle").innerHTML = "Add New Product";
    document.getElementById("prodSaveButton").value = "Add Product";
}

function renderStock() {
    let keyword = document.getElementById("stockSearch").value;
    let filter = document.getElementById("stockLevelFilter").value;

    let rows = "";
    let shown = 0;

    for (let i = 0; i < accessories.length; i++) {
        let p = accessories[i];
        let isLow = p.stock <= LOW_STOCK_LIMIT;

        let matchesKeyword = containsText(p.name, keyword) || containsText(p.id, keyword);
        let matchesFilter = (filter === "All") || (filter === "Low" && isLow) || (filter === "Ok" && !isLow);

        if (matchesKeyword && matchesFilter) {
            let badge = isLow ? "<span class='badge red'>Low Stock</span>" : "<span class='badge green'>In Stock</span>";

            rows += "<tr>" +
                "<td>" + p.id + "</td>" +
                "<td><strong>" + p.name + "</strong></td>" +
                "<td>" + p.category + "</td>" +
                "<td>" + p.stock + "</td>" +
                "<td>" + badge + "</td>" +
                "<td>" +
                "<input type='number' id='qtyInput-" + i + "' value='" + p.stock + "' min='0' max='500' style='width:80px; display:inline-block;'> " +
                "<button type='button' class='btn btn-small btn-success' onclick='updateStock(" + i + ")'>Save</button>" +
                "</td>" +
                "</tr>";
            shown++;
        }
    }

    if (shown === 0) {
        rows = "<tr><td colspan='6' class='empty-row'>No stock items match your search.</td></tr>";
    }

    document.getElementById("stockTableBody").innerHTML = rows;
    document.getElementById("stockCount").innerHTML = "Showing " + shown + " of " + accessories.length + " items";
}

function updateStock(index) {
    let input = document.getElementById("qtyInput-" + index);
    let newQty = Number(input.value);

    if (input.value === "" || newQty < 0 || newQty > 500) {
        showMessage("stockMessage", "Stock quantity must be between 0 and 500.", "error");
        return;
    }

    accessories[index].stock = newQty;
    showMessage("stockMessage", "Updated stock for <strong>" + accessories[index].name + "</strong> to " + newQty + ".", "success");
    renderStock();
    renderProducts();
    renderSellerOverview();
}

function renderSellerOrders() {
    let keyword = document.getElementById("sellerOrderSearch").value;
    let statusFilter = document.getElementById("sellerOrderStatusFilter").value;

    let rows = "";
    let shown = 0;

    for (let i = 0; i < orders.length; i++) {
        let o = orders[i];
        let matchesKeyword = containsText(o.customerName, keyword) || containsText(o.productName, keyword) ||
            containsText(o.id, keyword);
        let matchesStatus = (statusFilter === "All" || o.status === statusFilter);

        if (matchesKeyword && matchesStatus) {
            let badgeColor = "orange";
            if (o.status === "Delivered") { badgeColor = "green"; }
            else if (o.status === "Shipped") { badgeColor = "blue"; }
            else if (o.status === "Cancelled") { badgeColor = "red"; }

            rows += "<tr>" +
                "<td>" + o.id + "</td>" +
                "<td>" + o.customerName + "</td>" +
                "<td><strong>" + o.productName + "</strong> (x" + o.quantity + ")</td>" +
                "<td>" + o.totalPrice + " Tk</td>" +
                "<td>" + o.date + "</td>" +
                "<td><span class='badge " + badgeColor + "'>" + o.status + "</span></td>" +
                "<td>" +
                "<select id='orderStatusSel-" + i + "' style='width:120px; display:inline-block;'>" +
                "<option value='Pending'" + (o.status === "Pending" ? " selected" : "") + ">Pending</option>" +
                "<option value='Shipped'" + (o.status === "Shipped" ? " selected" : "") + ">Shipped</option>" +
                "<option value='Delivered'" + (o.status === "Delivered" ? " selected" : "") + ">Delivered</option>" +
                "<option value='Cancelled'" + (o.status === "Cancelled" ? " selected" : "") + ">Cancelled</option>" +
                "</select> " +
                "<button type='button' class='btn btn-small btn-success' onclick='updateOrderStatus(" + i + ")'>Update</button> " +
                "<button type='button' class='btn btn-small btn-danger' onclick='deleteSellerOrder(" + i + ")'>Delete</button>" +
                "</td>" +
                "</tr>";
            shown++;
        }
    }

    if (shown === 0) {
        rows = "<tr><td colspan='7' class='empty-row'>No customer orders match your search.</td></tr>";
    }

    document.getElementById("sellerOrderBody").innerHTML = rows;
    document.getElementById("sellerOrderCount").innerHTML = "Showing " + shown + " of " + orders.length + " orders";
}

function updateOrderStatus(index) {
    let newStatus = document.getElementById("orderStatusSel-" + index).value;
    orders[index].status = newStatus;
    showMessage("sellerOrderMessage", "Order <strong>" + orders[index].id + "</strong> marked as <strong>" + newStatus + "</strong>.", "success");
    renderSellerOrders();
    renderSellerOverview();
}

function deleteSellerOrder(index) {
    let o = orders[index];
    orders = removeAt(orders, index);
    showMessage("sellerOrderMessage", "Order <strong>" + o.id + "</strong> was deleted.", "info");
    renderSellerOrders();
    renderSellerOverview();
}

renderSellerOverview();
renderProducts();
renderStock();
renderSellerOrders();
showSection("overviewSection");
