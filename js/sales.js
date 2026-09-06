document.addEventListener("DOMContentLoaded", () => {

    /*
     * ============================================================
     * AUTHENTICATION
     * ============================================================
     */

    if (!Session.requireRole("MANAGER", "ADMIN")) {
        return;
    }


    /*
     * ============================================================
     * RENDER PAGE
     * ============================================================
     */

    renderSalesPage();


    /*
     * ============================================================
     * STATE
     * ============================================================
     */

    let products = [];

    let customers = [];

    let cart = [];

    let productPage = 0;

    let productSize = 10;

    let productKeyword = "";

    let totalProductPages = 0;


    /*
     * ============================================================
     * ELEMENTS
     * ============================================================
     */

    const productTableBody =
        document.getElementById("productTableBody");

    const customerSelect =
        document.getElementById("customerSelect");

    const productSearch =
        document.getElementById("productSearch");

    const pagination =
        document.getElementById("productPagination");

    const cartBody =
        document.getElementById("cartBody");

    const cartEmpty =
        document.getElementById("cartEmpty");

    const cartCount =
        document.getElementById("cartCount");

    const subtotalElement =
        document.getElementById("subtotal");

    const discountPercentage =
        document.getElementById("discountPercentage");

    const discountAmount =
        document.getElementById("discountAmount");

    const grandTotal =
        document.getElementById("grandTotal");

    const paymentMethod =
        document.getElementById("paymentMethod");

    const amountPaid =
        document.getElementById("amountPaid");

    const amountDue =
        document.getElementById("amountDue");

    const saleNotes =
        document.getElementById("saleNotes");

    const completeSaleButton =
        document.getElementById("completeSaleButton");

    const saleAlert =
        document.getElementById("saleAlert");


    /*
     * ============================================================
     * INITIALIZATION
     * ============================================================
     */

    loadSalesData();


    async function loadSalesData() {

        try {

            await Promise.all([
                loadProducts(),
                loadCustomers()
            ]);

            renderCart();

        } catch (error) {

            console.error(
                "Unable to initialize POS:",
                error
            );

            showAlert(
                "Unable to load POS data.",
                "danger"
            );
        }
    }


    /*
     * ============================================================
     * LOAD PRODUCTS
     * ============================================================
     */

    async function loadProducts() {

        try {

            let endpoint =
                `/products?page=${productPage}&size=${productSize}`;

            if (productKeyword) {

                endpoint =
                    `/products/search?keyword=${encodeURIComponent(
                        productKeyword
                    )}&page=${productPage}&size=${productSize}`;
            }


            console.log(
                "Loading products:",
                endpoint
            );


            const response =
                await API.get(endpoint);


            if (!response.ok) {

                throw new Error(
                    "Unable to load products."
                );
            }


            const data =
                await response.json();


            /*
             * Spring Page response
             */

            products =
                data.content || data;


            totalProductPages =
                data.totalPages ??
                1;


            renderProducts();

            renderPagination();

        } catch (error) {

            console.error(error);

            productTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="text-center text-danger py-4">

                        Unable to load products.

                    </td>
                </tr>
            `;
        }
    }


    /*
     * ============================================================
     * LOAD CUSTOMERS
     * ============================================================
     */

    async function loadCustomers() {

        try {

            const response =
                await API.get(
                    "/customers?page=0&size=100"
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load customers."
                );
            }


            const data =
                await response.json();


            customers =
                data.content || data;


            populateCustomers();

        } catch (error) {

            console.error(error);

            customerSelect.innerHTML = `
                <option value="">
                    Unable to load customers
                </option>
            `;
        }
    }


    /*
     * ============================================================
     * CUSTOMERS
     * ============================================================
     */

    function populateCustomers() {

        customerSelect.innerHTML = `
            <option value="">
                Select customer
            </option>
        `;


        customers.forEach(customer => {

            /*
             * Don't show inactive customers
             */

            if (
                customer.active === false
            ) {
                return;
            }


            const option =
                document.createElement("option");


            option.value =
                customer.id;


            option.textContent =
                `${customer.firstName ?? ""} ${
                    customer.lastName ?? ""
                }${
                    customer.phone
                        ? " — " + customer.phone
                        : ""
                }`;


            customerSelect.appendChild(
                option
            );
        });
    }


    /*
     * ============================================================
     * RENDER PRODUCTS
     * ============================================================
     */

    function renderProducts() {

        if (!products.length) {

            productTableBody.innerHTML = `
                <tr>

                    <td
                        colspan="6"
                        class="text-center py-5">

                        No products found.

                    </td>

                </tr>
            `;

            return;
        }


        productTableBody.innerHTML =
            products.map(product => {

                const stock =
                    Number(
                        product.stock ?? 0
                    );


                const alertStock =
                    Number(
                        product.alertStock ?? 0
                    );


                let badge;


                if (stock <= 0) {

                    badge = `
                        <span class="badge bg-dark">
                            Out of Stock
                        </span>
                    `;

                } else if (
                    stock < alertStock
                ) {

                    badge = `
                        <span class="badge bg-danger">
                            Low Stock
                        </span>
                    `;

                } else {

                    badge = `
                        <span class="badge bg-success">
                            Available
                        </span>
                    `;
                }


                const alreadyInCart =
                    cart.some(
                        item =>
                            item.productId ===
                            product.id
                    );


                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHtml(
                                    product.productName
                                    ?? "-"
                                )}
                            </strong>

                        </td>


                        <td>
                            ${escapeHtml(
                                product.productCategory
                                ?? "-"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                product.unit
                                ?? "-"
                            )}
                        </td>


                        <td>

                            <strong>
                                ${formatMoney(
                                    product.sellingPrice
                                )}
                            </strong>

                        </td>


                        <td>

                            <strong>
                                ${stock}
                            </strong>

                            <div class="mt-1">

                                ${badge}

                            </div>

                        </td>


                        <td class="text-end">

                            <button
                                type="button"
                                class="btn btn-sm btn-primary"
                                onclick="addToCart(${product.id})"
                                ${stock <= 0 || alreadyInCart
                                    ? "disabled"
                                    : ""}>

                                <i
                                    class="bi bi-cart-plus">
                                </i>

                                ${
                                    alreadyInCart
                                        ? "Added"
                                        : "Add"
                                }

                            </button>

                        </td>

                    </tr>

                `;

            }).join("");
    }


    /*
     * ============================================================
     * PAGINATION
     * ============================================================
     */

    function renderPagination() {

        if (totalProductPages <= 1) {

            pagination.innerHTML = "";

            return;
        }


        let html = "";


        /*
         * Previous
         */

        html += `
            <li
                class="page-item ${
                    productPage === 0
                        ? "disabled"
                        : ""
                }">

                <button
                    class="page-link"
                    onclick="changeProductPage(
                        ${productPage - 1}
                    )">

                    Previous

                </button>

            </li>
        `;


        /*
         * Pages
         */

        for (
            let i = 0;
            i < totalProductPages;
            i++
        ) {

            /*
             * Don't display too many buttons
             */

            if (
                i > 4 &&
                i < totalProductPages - 1 &&
                Math.abs(i - productPage) > 1
            ) {

                continue;
            }


            html += `
                <li
                    class="page-item ${
                        i === productPage
                            ? "active"
                            : ""
                    }">

                    <button
                        class="page-link"
                        onclick="changeProductPage(${i})">

                        ${i + 1}

                    </button>

                </li>
            `;
        }


        /*
         * Next
         */

        html += `
            <li
                class="page-item ${
                    productPage >=
                    totalProductPages - 1
                        ? "disabled"
                        : ""
                }">

                <button
                    class="page-link"
                    onclick="changeProductPage(
                        ${productPage + 1}
                    )">

                    Next

                </button>

            </li>
        `;


        pagination.innerHTML =
            html;
    }


    window.changeProductPage =
        function(page) {

            if (
                page < 0 ||
                page >= totalProductPages
            ) {
                return;
            }


            productPage =
                page;


            loadProducts();
        };


    /*
     * ============================================================
     * SEARCH
     * ============================================================
     */

    let searchTimeout;


    productSearch.addEventListener(
        "input",
        () => {

            clearTimeout(
                searchTimeout
            );


            searchTimeout =
                setTimeout(
                    () => {

                        productKeyword =
                            productSearch.value.trim();

                        productPage =
                            0;

                        loadProducts();

                    },
                    350
                );
        }
    );


    /*
     * ============================================================
     * ADD TO CART
     * ============================================================
     */

    window.addToCart =
        function(productId) {

            const product =
                products.find(
                    p =>
                        p.id === productId
                );


            if (!product) {
                return;
            }


            const stock =
                Number(
                    product.stock ?? 0
                );


            if (stock <= 0) {

                showAlert(
                    "This product is out of stock.",
                    "danger"
                );

                return;
            }


            const existing =
                cart.find(
                    item =>
                        item.productId ===
                        productId
                );


            if (existing) {

                if (
                    existing.quantity >=
                    stock
                ) {

                    showAlert(
                        "Quantity exceeds available stock.",
                        "warning"
                    );

                    return;
                }


                existing.quantity++;

            } else {

                cart.push({

                    productId:
                        product.id,

                    productName:
                        product.productName,

                    unit:
                        product.unit,

                    unitPrice:
                        Number(
                            product.sellingPrice
                        ),

                    quantity:
                        1,

                    stock:
                        stock

                });
            }


            renderProducts();

            renderCart();
        };


    /*
     * ============================================================
     * CART
     * ============================================================
     */

    function renderCart() {

        cartCount.textContent =
            cart.reduce(
                (total, item) =>
                    total + item.quantity,
                0
            );


        if (!cart.length) {

            cartEmpty.classList.remove(
                "d-none"
            );

            cartBody.innerHTML = "";

            calculateTotals();

            return;
        }


        cartEmpty.classList.add(
            "d-none"
        );


        cartBody.innerHTML =
            cart.map(
                (item, index) => {

                    const total =
                        item.quantity *
                        item.unitPrice;


                    return `

                        <tr>

                            <td>

                                <strong>
                                    ${escapeHtml(
                                        item.productName
                                    )}
                                </strong>

                                <small
                                    class="d-block text-muted">

                                    ${formatMoney(
                                        item.unitPrice
                                    )}
                                    / ${escapeHtml(
                                        item.unit ?? ""
                                    )}

                                </small>

                            </td>


                            <td
                                style="width:140px">

                                <div
                                    class="input-group
                                           input-group-sm">

                                    <button
                                        type="button"
                                        class="btn btn-outline-secondary"
                                        onclick="changeQuantity(
                                            ${index},
                                            -1
                                        )">

                                        −

                                    </button>


                                    <input
                                        type="number"
                                        class="form-control text-center"
                                        value="${item.quantity}"
                                        min="1"
                                        max="${item.stock}"
                                        onchange="setQuantity(
                                            ${index},
                                            this.value
                                        )">


                                    <button
                                        type="button"
                                        class="btn btn-outline-secondary"
                                        onclick="changeQuantity(
                                            ${index},
                                            1
                                        )">

                                        +

                                    </button>

                                </div>

                            </td>


                            <td class="text-end">

                                <strong>
                                    ${formatMoney(
                                        total
                                    )}
                                </strong>

                            </td>


                            <td
                                class="text-end">

                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-danger"
                                    onclick="removeFromCart(
                                        ${index}
                                    )">

                                    <i
                                        class="bi bi-trash">
                                    </i>

                                </button>

                            </td>

                        </tr>

                    `;

                }
            ).join("");


        calculateTotals();
    }


    /*
     * ============================================================
     * QUANTITY
     * ============================================================
     */

    window.changeQuantity =
        function(index, change) {

            if (!cart[index]) {
                return;
            }


            const newQuantity =
                cart[index].quantity +
                change;


            setQuantity(
                index,
                newQuantity
            );
        };


    window.setQuantity =
        function(index, value) {

            if (!cart[index]) {
                return;
            }


            let quantity =
                Number(value);


            if (!Number.isFinite(quantity)) {
                quantity = 1;
            }


            quantity =
                Math.floor(quantity);


            if (quantity < 1) {
                quantity = 1;
            }


            if (
                quantity >
                cart[index].stock
            ) {

                quantity =
                    cart[index].stock;

                showAlert(
                    "Quantity cannot exceed available stock.",
                    "warning"
                );
            }


            cart[index].quantity =
                quantity;


            renderProducts();

            renderCart();
        };


    /*
     * ============================================================
     * REMOVE
     * ============================================================
     */

    window.removeFromCart =
        function(index) {

            cart.splice(
                index,
                1
            );


            renderProducts();

            renderCart();
        };


    /*
     * ============================================================
     * CALCULATE TOTALS
     * ============================================================
     */

    function calculateTotals() {

        const subtotal =
            cart.reduce(
                (total, item) =>
                    total +
                    item.quantity *
                    item.unitPrice,
                0
            );


        let discountPercent =
            Number(
                discountPercentage.value
            );


        if (
            !Number.isFinite(
                discountPercent
            ) ||
            discountPercent < 0
        ) {

            discountPercent = 0;

        }


        if (
            discountPercent > 100
        ) {

            discountPercent = 100;

            discountPercentage.value =
                100;
        }


        const discount =
            subtotal *
            discountPercent /
            100;


        const total =
            subtotal -
            discount;


        const paid =
            Number(
                amountPaid.value
            ) || 0;


        const due =
            total -
            paid;


        subtotalElement.textContent =
            formatMoney(subtotal);


        discountAmount.textContent =
            formatMoney(discount);


        grandTotal.textContent =
            formatMoney(total);


        amountDue.textContent =
            formatMoney(
                Math.max(
                    due,
                    0
                )
            );
    }


    discountPercentage.addEventListener(
        "input",
        calculateTotals
    );


    amountPaid.addEventListener(
        "input",
        calculateTotals
    );


    /*
     * ============================================================
     * COMPLETE SALE
     * ============================================================
     */

    completeSaleButton.addEventListener(
        "click",
        completeSale
    );


    async function completeSale() {

        hideAlert();


        if (!cart.length) {

            showAlert(
                "Please add at least one product to the cart.",
                "danger"
            );

            return;
        }


        if (!customerSelect.value) {

            showAlert(
                "Please select a customer.",
                "danger"
            );

            return;
        }


        const subtotal =
            cart.reduce(
                (total, item) =>
                    total +
                    item.quantity *
                    item.unitPrice,
                0
            );


        const discountPercent =
            Number(
                discountPercentage.value
            ) || 0;


        const discount =
            subtotal *
            discountPercent /
            100;


        const total =
            subtotal -
            discount;


        const paid =
            Number(
                amountPaid.value
            ) || 0;


        if (paid < 0) {

            showAlert(
                "Invalid payment amount.",
                "danger"
            );

            return;
        }


        const items =
            cart.map(item => ({

                productId:
                    item.productId,

                quantity:
                    item.quantity

            }));


        const data = {

            customerId:
                Number(
                    customerSelect.value
                ),

            items:
                items,

            discountPercentage:
                discountPercent,

            payment: {

                amount:
                    paid,

                paymentMethod:
                    paymentMethod.value,

                reference:
                    "",

                notes:
                    ""

            },

            notes:
                saleNotes.value.trim()

        };


        console.log(
            "Creating sale:",
            data
        );


        completeSaleButton.disabled =
            true;

        completeSaleButton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-1">
            </span>

            Processing...
        `;


        try {

            const response =
                await API.post(
                    "/sales",
                    data
                );


            if (!response.ok) {

                const error =
                    await readApiError(
                        response
                    );


                throw new Error(
                    error
                );
            }


            const sale =
                await response.json();


            console.log(
                "Sale created:",
                sale
            );


            showReceipt(
                sale
            );


            /*
             * Clear POS
             */

            cart = [];

            customerSelect.value =
                "";

            discountPercentage.value =
                "0";

            amountPaid.value =
                "0";

            saleNotes.value =
                "";

            renderCart();

            await loadProducts();


        } catch (error) {

            console.error(
                "Sale creation failed:",
                error
            );


            showAlert(
                error.message ||
                "Unable to complete sale.",
                "danger"
            );

        } finally {

            completeSaleButton.disabled =
                false;

            completeSaleButton.innerHTML = `
                <i class="bi bi-check-circle me-1"></i>
                Complete Sale
            `;
        }
    }


    /*
     * ============================================================
     * RECEIPT
     * ============================================================
     */

    function showReceipt(sale) {

        const receiptModal =
            new bootstrap.Modal(
                document.getElementById(
                    "receiptModal"
                )
            );


        const receiptContent =
            document.getElementById(
                "receiptContent"
            );


        const items =
            sale.items || [];


        receiptContent.innerHTML = `

            <div class="text-center mb-4">

                <h4 class="fw-bold">
                    BON ACCUEIL ENTERPRISE
                </h4>

                <p class="mb-0">
                    SALES RECEIPT
                </p>

                <strong>
                    ${escapeHtml(
                        sale.receiptNumber
                        ?? "-"
                    )}
                </strong>

            </div>


            <div class="mb-3">

                <strong>
                    Customer:
                </strong>

                ${
                    sale.customer
                        ? escapeHtml(
                            `${sale.customer.firstName ?? ""}
                             ${sale.customer.lastName ?? ""}`
                        )
                        : "-"
                }

            </div>


            <table class="table table-sm">

                <thead>

                    <tr>

                        <th>
                            Product
                        </th>

                        <th>
                            Qty
                        </th>

                        <th class="text-end">
                            Total
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        items.map(item => `

                            <tr>

                                <td>
                                    ${escapeHtml(
                                        item.product?.productName
                                        ??
                                        item.productName
                                        ??
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${item.quantity ?? 0}
                                </td>

                                <td class="text-end">

                                    ${formatMoney(
                                        item.totalPrice ??
                                        (
                                            Number(
                                                item.quantity
                                            ) *
                                            Number(
                                                item.unitPrice
                                            )
                                        )
                                    )}

                                </td>

                            </tr>

                        `).join("")
                    }

                </tbody>

            </table>


            <div class="border-top pt-3">

                <div class="d-flex justify-content-between">

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ${formatMoney(
                            sale.subtotal
                        )}
                    </strong>

                </div>


                <div class="d-flex justify-content-between">

                    <span>
                        Discount
                    </span>

                    <strong>
                        ${formatMoney(
                            sale.discountAmount
                        )}
                    </strong>

                </div>


                <div
                    class="d-flex
                           justify-content-between
                           fs-5
                           mt-2">

                    <strong>
                        Total
                    </strong>

                    <strong>
                        ${formatMoney(
                            sale.grandTotal ??
                            sale.totalAmount
                        )}
                    </strong>

                </div>

            </div>

        `;


        receiptModal.show();
    }


    /*
     * ============================================================
     * ALERT
     * ============================================================
     */

    function showAlert(
        message,
        type = "danger"
    ) {

        saleAlert.className =
            `alert alert-${type}`;

        saleAlert.textContent =
            message;
    }


    function hideAlert() {

        saleAlert.className =
            "alert d-none";

        saleAlert.textContent =
            "";
    }


    /*
     * ============================================================
     * API ERROR
     * ============================================================
     */

    async function readApiError(
        response
    ) {

        try {

            const data =
                await response.json();


            return (
                data.message ||
                data.error ||
                "Operation failed."
            );

        } catch {

            return "Operation failed.";
        }
    }


    /*
     * ============================================================
     * MONEY
     * ============================================================
     */

    function formatMoney(
        value
    ) {

        const amount =
            Number(value) || 0;


        return amount.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    }


    /*
     * ============================================================
     * HTML ESCAPE
     * ============================================================
     */

    function escapeHtml(
        value
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value ?? "";


        return div.innerHTML;
    }


    /*
     * ============================================================
     * RENDER SALES PAGE
     * ============================================================
     */

    function renderSalesPage() {

        const pageContent =
            document.getElementById(
                "pageContent"
            );


        if (!pageContent) {

            console.error(
                "pageContent not found."
            );

            return;
        }


        pageContent.innerHTML = `

            <div class="container-fluid py-3">

                <!-- HEADER -->

                <div
                    class="d-flex
                           justify-content-between
                           align-items-center
                           flex-wrap
                           gap-2
                           mb-4">

                    <div>

                        <h2 class="mb-1">
                            Point of Sale
                        </h2>

                        <p class="text-muted mb-0">

                            Create and manage sales

                        </p>

                    </div>

                </div>


                <!-- CUSTOMER -->

                <div class="card shadow-sm border-0 mb-4">

                    <div class="card-body">

                        <div class="row align-items-end">

                            <div class="col-md-6">

                                <label
                                    class="form-label fw-semibold">

                                    Customer

                                </label>

                                <select
                                    id="customerSelect"
                                    class="form-select">

                                    <option value="">
                                        Loading customers...
                                    </option>

                                </select>

                            </div>


                            <div class="col-md-6 mt-3 mt-md-0">

                                <small
                                    class="text-muted">

                                    Select the customer before completing the sale.

                                </small>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="row g-4">


                    <!-- =================================================
                         PRODUCTS
                         ================================================= -->

                    <div class="col-lg-7">

                        <div class="card shadow-sm border-0 h-100">

                            <div class="card-header bg-white">

                                <div
                                    class="d-flex
                                           justify-content-between
                                           align-items-center
                                           flex-wrap
                                           gap-2">

                                    <h5 class="mb-0">

                                        Products

                                    </h5>


                                    <div
                                        style="max-width:300px"
                                        class="w-100">

                                        <div
                                            class="input-group">

                                            <span
                                                class="input-group-text">

                                                <i
                                                    class="bi bi-search">
                                                </i>

                                            </span>

                                            <input
                                                type="search"
                                                id="productSearch"
                                                class="form-control"
                                                placeholder="Search product...">

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <div class="card-body p-0">

                                <div class="table-responsive">

                                    <table
                                        class="table
                                               table-hover
                                               align-middle
                                               mb-0">

                                        <thead
                                            class="table-light">

                                            <tr>

                                                <th>
                                                    Product
                                                </th>

                                                <th>
                                                    Category
                                                </th>

                                                <th>
                                                    Unit
                                                </th>

                                                <th>
                                                    Price
                                                </th>

                                                <th>
                                                    Stock
                                                </th>

                                                <th
                                                    class="text-end">

                                                    Action

                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody
                                            id="productTableBody">

                                            <tr>

                                                <td
                                                    colspan="6"
                                                    class="text-center py-5">

                                                    Loading products...

                                                </td>

                                            </tr>

                                        </tbody>

                                    </table>

                                </div>

                            </div>


                            <!-- PAGINATION -->

                            <div
                                class="card-footer
                                       bg-white">

                                <nav>

                                    <ul
                                        id="productPagination"
                                        class="pagination
                                               pagination-sm
                                               justify-content-center
                                               mb-0">

                                    </ul>

                                </nav>

                            </div>

                        </div>

                    </div>


                    <!-- =================================================
                         CART
                         ================================================= -->

                    <div class="col-lg-5">

                        <div
                            class="card
                                   shadow-sm
                                   border-0">

                            <div
                                class="card-header
                                       bg-white
                                       d-flex
                                       justify-content-between
                                       align-items-center">

                                <h5 class="mb-0">

                                    Cart

                                </h5>


                                <span
                                    id="cartCount"
                                    class="badge bg-primary">

                                    0

                                </span>

                            </div>


                            <div class="card-body p-0">

                                <div class="table-responsive">

                                    <table
                                        class="table
                                               table-sm
                                               align-middle
                                               mb-0">

                                        <thead
                                            class="table-light">

                                            <tr>

                                                <th>
                                                    Product
                                                </th>

                                                <th>
                                                    Qty
                                                </th>

                                                <th
                                                    class="text-end">

                                                    Total

                                                </th>

                                                <th></th>

                                            </tr>

                                        </thead>


                                        <tbody
                                            id="cartBody">
                                        </tbody>

                                    </table>

                                </div>


                                <div
                                    id="cartEmpty"
                                    class="text-center
                                           text-muted
                                           py-5">

                                    <i
                                        class="bi bi-cart3 fs-1">
                                    </i>

                                    <p class="mt-2 mb-0">

                                        Cart is empty

                                    </p>

                                </div>

                            </div>


                            <!-- TOTALS -->

                            <div class="card-footer bg-white">


                                <div
                                    id="saleAlert"
                                    class="alert d-none">
                                </div>


                                <div
                                    class="d-flex
                                           justify-content-between
                                           mb-2">

                                    <span>
                                        Subtotal
                                    </span>

                                    <strong
                                        id="subtotal">

                                        0.00

                                    </strong>

                                </div>


                                <div class="row g-2 mb-2">

                                    <div class="col-6">

                                        <label
                                            class="form-label">

                                            Discount %

                                        </label>

                                        <input
                                            type="number"
                                            id="discountPercentage"
                                            class="form-control"
                                            min="0"
                                            step="0.01"
                                            value="0">

                                    </div>


                                    <div class="col-6">

                                        <label
                                            class="form-label">

                                            Discount Amount

                                        </label>

                                        <div
                                            class="form-control
                                                   bg-light">

                                            <span
                                                id="discountAmount">

                                                0.00

                                            </span>

                                        </div>

                                    </div>

                                </div>


                                <hr>


                                <div
                                    class="d-flex
                                           justify-content-between
                                           fs-5
                                           mb-3">

                                    <strong>
                                        Grand Total
                                    </strong>

                                    <strong
                                        id="grandTotal">

                                        0.00

                                    </strong>

                                </div>


                                <div class="mb-3">

                                    <label
                                        class="form-label">

                                        Payment Method

                                    </label>

                                    <select
                                        id="paymentMethod"
                                        class="form-select">

                                        <option value="CASH">
                                            Cash
                                        </option>

                                        <option value="MOBILE_MONEY">
                                            Mobile Money
                                        </option>

                                        <option value="CREDIT">
                                            Credit / Debt
                                        </option>

                                        <option value="BANK_TRANSFER">
                                            Bank Transfer
                                        </option>

                                        <option value="BANK_TRANSFER">
                                            Bank Transfer
                                        </option>

                                    </select>

                                </div>


                                <div class="mb-3">

                                    <label
                                        class="form-label">

                                        Amount Paid

                                    </label>

                                    <input
                                        type="number"
                                        id="amountPaid"
                                        class="form-control"
                                        min="0"
                                        step="0.01"
                                        value="0">

                                </div>


                                <div
                                    class="d-flex
                                           justify-content-between
                                           mb-3">

                                    <span>
                                        Remaining Balance
                                    </span>

                                    <strong
                                        id="amountDue"
                                        class="text-danger">

                                        0.00

                                    </strong>

                                </div>


                                <div class="mb-3">

                                    <label
                                        class="form-label">

                                        Notes

                                    </label>

                                    <textarea
                                        id="saleNotes"
                                        class="form-control"
                                        rows="2">
                                    </textarea>

                                </div>


                                <button
                                    type="button"
                                    id="completeSaleButton"
                                    class="btn btn-success w-100">

                                    <i
                                        class="bi bi-check-circle me-1">
                                    </i>

                                    Complete Sale

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- ========================================================
                 RECEIPT MODAL
                 ======================================================== -->

            <div
                class="modal fade"
                id="receiptModal"
                tabindex="-1">

                <div
                    class="modal-dialog
                           modal-dialog-centered
                           modal-lg">

                    <div class="modal-content">

                        <div class="modal-header">

                            <h5 class="modal-title">

                                Sale Receipt

                            </h5>

                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal">
                            </button>

                        </div>


                        <div
                            class="modal-body"
                            id="receiptContent">

                        </div>


                        <div class="modal-footer">

                            <button
                                type="button"
                                class="btn btn-secondary"
                                data-bs-dismiss="modal">

                                Close

                            </button>


                            <button
                                type="button"
                                class="btn btn-primary"
                                onclick="window.print()">

                                <i
                                    class="bi bi-printer me-1">
                                </i>

                                Print Receipt

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;
    }

});

function printThermalReceipt(sale) {

    const receiptWindow =
        window.open(
            "",
            "_blank",
            "width=400,height=700"
        );

    if (!receiptWindow) {

        alert(
            "Please allow popups to print receipts."
        );

        return;
    }


    const items =
        sale.items ?? [];


    const itemsHtml =
        items.map(item => {

            return `
                <tr>

                    <td class="item">

                        ${escapeHtml(
                            item.productName ?? "-"
                        )}

                    </td>

                    <td class="qty">

                        ${Number(
                            item.quantity ?? 0
                        )}

                    </td>

                    <td class="amount">

                        ${formatMoney(
                            item.unitPrice
                        )}

                    </td>

                    <td class="amount">

                        ${formatMoney(
                            item.subtotal
                        )}

                    </td>

                </tr>
            `;

        }).join("");}

            const receiptHtml = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
    ${escapeHtml(
        sale.receiptNumber ?? "Receipt"
    )}
</title>

<style>

    * {
        box-sizing: border-box;
    }

    body {

        margin: 0;

        padding: 0;

        background: white;

        color: black;

        font-family:
            Arial,
            Helvetica,
            sans-serif;

        font-size: 12px;

    }


    .receipt {

        width: 80mm;

        max-width: 80mm;

        margin: 0 auto;

        padding: 4mm;

    }


    .center {
        text-align: center;
    }


    .business-name {

        font-size: 18px;

        font-weight: bold;

        margin-bottom: 3px;

    }


    .receipt-title {

        font-size: 13px;

        font-weight: bold;

    }


    .small {

        font-size: 10px;

    }


    .line {

        border-top:
            1px dashed #000;

        margin:
            7px 0;

    }


    .info-row {

        display: flex;

        justify-content:
            space-between;

        gap: 10px;

        margin-bottom: 3px;

    }


    table {

        width: 100%;

        border-collapse:
            collapse;

        margin-top: 5px;

    }


    th {

        border-bottom:
            1px solid #000;

        padding:
            4px 2px;

        font-size: 10px;

    }


    td {

        padding:
            4px 2px;

        vertical-align:
            top;

    }


    .item {

        width: 40%;

    }


    .qty {

        width: 12%;

        text-align: center;

    }


    .amount {

        width: 24%;

        text-align: right;

    }


    .summary {

        margin-top: 5px;

    }


    .summary-row {

        display: flex;

        justify-content:
            space-between;

        margin:
            4px 0;

    }


    .total {

        font-size: 15px;

        font-weight: bold;

        border-top:
            1px solid #000;

        border-bottom:
            1px double #000;

        padding:
            6px 0;

    }


    .status {

        text-align: center;

        font-weight: bold;

        margin-top: 8px;

    }


    .footer {

        text-align: center;

        margin-top: 12px;

        font-size: 10px;

    }


    @media print {

        body {
            margin: 0;
            padding: 0;
        }

        .receipt {

            width: 80mm;

            max-width: 80mm;

            padding: 3mm;

        }

        @page {

            size: 80mm auto;

            margin: 0;

        }

    }

</style>

</head>


<body>

<div class="receipt">


    <div class="center">

        <div class="business-name">

            BON ACCUEIL

        </div>

        <div class="receipt-title">

            SALES RECEIPT

        </div>

    </div>


    <div class="line"></div>


    <div class="info-row">

        <span>Receipt:</span>

        <strong>

            ${escapeHtml(
                sale.receiptNumber ?? "-"
            )}

        </strong>

    </div>


    <div class="info-row">

        <span>Date:</span>

        <span>

            ${formatDate(
                sale.saleDate
            )}

        </span>

    </div>


    <div class="info-row">

        <span>Customer:</span>

        <span>

            ${escapeHtml(
                sale.customerName ??
                "Walk-in Customer"
            )}

        </span>

    </div>


    ${
        sale.customerPhone
            ? `
                <div class="info-row">

                    <span>Phone:</span>

                    <span>
                        ${escapeHtml(
                            sale.customerPhone
                        )}
                    </span>

                </div>
            `
            : ""
    }


    <div class="line"></div>


    <table>

        <thead>

            <tr>

                <th>
                    Item
                </th>

                <th>
                    Qty
                </th>

                <th>
                    Price
                </th>

                <th>
                    Total
                </th>

            </tr>

        </thead>


        <tbody>

            ${itemsHtml}

        </tbody>

    </table>


    <div class="line"></div>


    <div class="summary">

        <div class="summary-row">

            <span>
                Subtotal
            </span>

            <span>
                ${formatMoney(
                    sale.subtotal
                )}
            </span>

        </div>


        <div class="summary-row">

            <span>
                Discount
                (${Number(
                    sale.discountPercentage ?? 0
                )}%)
            </span>

            <span>
                ${formatMoney(
                    sale.discountAmount
                )}
            </span>

        </div>


        <div class="summary-row total">

            <span>
                TOTAL
            </span>

            <span>
                ${formatMoney(
                    sale.total
                )}
            </span>

        </div>


        <div class="summary-row">

            <span>
                Paid
            </span>

            <span>
                ${formatMoney(
                    sale.paidAmount
                )}
            </span>

        </div>


        <div class="summary-row">

            <strong>
                Balance
            </strong>

            <strong>
                ${formatMoney(
                    sale.balance
                )}
            </strong>

        </div>

    </div>


    <div class="status">

        ${formatSaleStatus(
            sale.status
        )}

    </div>


    ${
        sale.notes
            ? `
                <div class="line"></div>

                <div class="small">

                    <strong>
                        Notes:
                    </strong>

                    ${escapeHtml(
                        sale.notes
                    )}

                </div>
            `
            : ""
    }


    <div class="line"></div>


    <div class="footer">

        Thank you for working with us!

        <br>

        Please keep this receipt.

    </div>


</div>


<script>

    window.onload = function () {

        window.print();

    };


    window.onafterprint = function () {

        window.close();

    };

</script>


</body>

</html>
`;