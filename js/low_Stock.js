document.addEventListener("DOMContentLoaded", async () => {

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
     * RENDER APPLICATION LAYOUT
     * ============================================================
     */

    renderLayout();


    /*
     * ============================================================
     * PAGE CONTENT
     * ============================================================
     */

    const pageContent =
        document.getElementById("pageContent");

    if (!pageContent) {
        console.error("pageContent element not found.");
        return;
    }


    pageContent.innerHTML = `

        <div class="container-fluid py-4">

            <!-- ==================================================
                 HEADER
                 ================================================== -->

            <div class="d-flex
                        justify-content-between
                        align-items-center
                        flex-wrap
                        gap-2
                        mb-4">

                <div>

                    <h2 class="mb-1">
                        <i class="bi bi-exclamation-triangle text-danger me-2"></i>
                        Low Stock Inventory
                    </h2>

                    <p class="text-muted mb-0">
                        Products that require replenishment
                    </p>

                </div>

                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    id="refreshLowStock">

                    <i class="bi bi-arrow-clockwise me-1"></i>

                    Refresh

                </button>

            </div>


            <!-- ==================================================
                 SUMMARY
                 ================================================== -->

            <div class="row g-3 mb-4">

                <div class="col-12 col-md-4">

                    <div class="card shadow-sm border-0 h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between
                                        align-items-center">

                                <div>

                                    <p class="text-muted mb-1">
                                        Products Requiring Attention
                                    </p>

                                    <h3
                                        id="lowStockCount"
                                        class="mb-0 text-danger">

                                        0

                                    </h3>

                                </div>

                                <i class="bi bi-exclamation-triangle
                                          fs-1 text-danger">
                                </i>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-12 col-md-4">

                    <div class="card shadow-sm border-0 h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between
                                        align-items-center">

                                <div>

                                    <p class="text-muted mb-1">
                                        Out of Stock
                                    </p>

                                    <h3
                                        id="outOfStockCount"
                                        class="mb-0">

                                        0

                                    </h3>

                                </div>

                                <i class="bi bi-box-seam
                                          fs-1">
                                </i>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-12 col-md-4">

                    <div class="card shadow-sm border-0 h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between
                                        align-items-center">

                                <div>

                                    <p class="text-muted mb-1">
                                        Search Results
                                    </p>

                                    <h3
                                        id="searchCount"
                                        class="mb-0">

                                        0

                                    </h3>

                                </div>

                                <i class="bi bi-search
                                          fs-1">
                                </i>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- ==================================================
                 SEARCH
                 ================================================== -->

            <div class="card shadow-sm border-0 mb-4">

                <div class="card-body">

                    <div class="row g-3">

                        <div class="col-12 col-md-8">

                            <label
                                for="lowStockSearch"
                                class="form-label">

                                Search product

                            </label>

                            <div class="input-group">

                                <span class="input-group-text">

                                    <i class="bi bi-search"></i>

                                </span>

                                <input
                                    type="text"
                                    id="lowStockSearch"
                                    class="form-control"
                                    placeholder="Search by product name or category">

                            </div>

                        </div>


                        <div class="col-12 col-md-4">

                            <label
                                for="stockStatusFilter"
                                class="form-label">

                                Status

                            </label>

                            <select
                                id="stockStatusFilter"
                                class="form-select">

                                <option value="ALL">
                                    All
                                </option>

                                <option value="OUT">
                                    Out of Stock
                                </option>

                                <option value="LOW">
                                    Low Stock
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

            </div>


            <!-- ==================================================
                 TABLE
                 ================================================== -->

            <div class="card shadow-sm border-0">

                <div class="card-header">

                    <h5 class="mb-0">

                        <i class="bi bi-box-seam me-2"></i>

                        Products Requiring Replenishment

                    </h5>

                </div>


                <div class="card-body p-0">

                    <div class="table-responsive">

                        <table
                            class="table table-hover
                                   align-middle
                                   mb-0">

                            <thead class="table-light">

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Current Stock
                                    </th>

                                    <th>
                                        Alert Level
                                    </th>

                                    <th>
                                        Required
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th class="text-end">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody id="lowStockTableBody">

                                <tr>

                                    <td
                                        colspan="7"
                                        class="text-center py-4">

                                        Loading low-stock products...

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    `;


    /*
     * ============================================================
     * ELEMENTS
     * ============================================================
     */

    const tableBody =
        document.getElementById(
            "lowStockTableBody"
        );

    const searchInput =
        document.getElementById(
            "lowStockSearch"
        );

    const statusFilter =
        document.getElementById(
            "stockStatusFilter"
        );

    const refreshButton =
        document.getElementById(
            "refreshLowStock"
        );

    const lowStockCount =
        document.getElementById(
            "lowStockCount"
        );

    const outOfStockCount =
        document.getElementById(
            "outOfStockCount"
        );

    const searchCount =
        document.getElementById(
            "searchCount"
        );


    /*
     * ============================================================
     * STATE
     * ============================================================
     */

    let products = [];


    /*
     * ============================================================
     * LOAD DATA
     * ============================================================
     */

    async function loadLowStock() {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center py-4">

                    <div class="spinner-border
                                spinner-border-sm
                                me-2">

                    </div>

                    Loading...

                </td>

            </tr>

        `;

        try {

            const response =
                await API.get(
                    "/products/low-stock"
                );


            if (!response.ok) {

                if (response.status === 401) {

                    Session.logout();

                    return;
                }

                throw new Error(
                    "Unable to load low-stock products."
                );
            }


            products =
                await response.json();


            updateSummary();

            renderProducts();

        } catch (error) {

            console.error(error);

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center
                               text-danger
                               py-4">

                        Unable to load low-stock products.

                    </td>

                </tr>

            `;

        }

    }


    /*
     * ============================================================
     * SUMMARY
     * ============================================================
     */

    function updateSummary() {

        const outOfStock =
            products.filter(product =>
                Number(product.stock ?? 0) <= 0
            ).length;


        lowStockCount.textContent =
            products.length;


        outOfStockCount.textContent =
            outOfStock;


        searchCount.textContent =
            getFilteredProducts().length;

    }


    /*
     * ============================================================
     * FILTER
     * ============================================================
     */

    function getFilteredProducts() {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        const status =
            statusFilter.value;


        return products.filter(product => {

            const stock =
                Number(product.stock ?? 0);

            const alertStock =
                Number(product.alertStock ?? 0);


            const matchesSearch =
                !search ||
                String(product.productName ?? "")
                    .toLowerCase()
                    .includes(search) ||
                String(product.productCategory ?? "")
                    .toLowerCase()
                    .includes(search);


            let matchesStatus = true;


            if (status === "OUT") {

                matchesStatus =
                    stock <= 0;

            } else if (status === "LOW") {

                matchesStatus =
                    stock > 0 &&
                    stock <= alertStock;

            }


            return (
                matchesSearch &&
                matchesStatus
            );

        });

    }


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    function renderProducts() {

        const filtered =
            getFilteredProducts();


        searchCount.textContent =
            filtered.length;


        if (!filtered.length) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center
                               text-muted
                               py-5">

                        <i class="bi bi-check-circle
                                  fs-2 d-block mb-2">
                        </i>

                        No products require replenishment.

                    </td>

                </tr>

            `;

            return;
        }


        tableBody.innerHTML =
            filtered.map(product => {

                const stock =
                    Number(product.stock ?? 0);

                const alertStock =
                    Number(product.alertStock ?? 0);


                const required =
                    Math.max(
                        alertStock - stock,
                        0
                    );


                let statusBadge;


                if (stock <= 0) {

                    statusBadge = `

                        <span class="badge bg-dark">

                            Out of Stock

                        </span>

                    `;

                } else {

                    statusBadge = `

                        <span class="badge bg-danger">

                            Low Stock

                        </span>

                    `;

                }


                return `

                    <tr>

                        <td>

                            <strong>

                                ${escapeHtml(
                                    product.productName ?? "-"
                                )}

                            </strong>

                        </td>


                        <td>

                            ${escapeHtml(
                                product.productCategory ?? "-"
                            )}

                        </td>


                        <td>

                            <strong
                                class="${
                                    stock <= 0
                                        ? "text-danger"
                                        : "text-warning"
                                }">

                                ${stock}

                            </strong>

                        </td>


                        <td>

                            ${alertStock}

                        </td>


                        <td>

                            <strong>

                                ${required}

                            </strong>

                        </td>


                        <td>

                            ${statusBadge}

                        </td>


                        <td class="text-end">

                            <button
                                type="button"
                                class="btn btn-sm
                                       btn-primary"
                                onclick="requestStock(${product.id})">

                                <i class="bi bi-cart-plus me-1"></i>

                                Request

                            </button>

                        </td>

                    </tr>

                `;

            }).join("");

    }


    /*
     * ============================================================
     * EVENTS
     * ============================================================
     */

    searchInput.addEventListener(
        "input",
        renderProducts
    );


    statusFilter.addEventListener(
        "change",
        renderProducts
    );


    refreshButton.addEventListener(
        "click",
        loadLowStock
    );


    /*
     * ============================================================
     * INITIAL LOAD
     * ============================================================
     */

    await loadLowStock();

});


/*
 * ================================================================
 * REQUEST STOCK
 * ================================================================
 *
 * We intentionally leave this as a placeholder for now.
 *
 * The next module will open the requisition form and allow:
 *
 * 1. Existing product request
 * 2. New product request
 *
 * ================================================================
 */

function requestStock(productId) {

    window.location.href =
        `requisition_form.html?productId=${productId}`;

}


/*
 * ================================================================
 * HTML ESCAPE
 * ================================================================
 */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}