document.addEventListener("DOMContentLoaded", () => {

    /*
     * ============================================================
     * AUTHENTICATION
     * ============================================================
     */

    if (!Session.requireRole("MANAGER", "ADMIN")) {
        return;
    }


    renderStockPage();

    /*
     * ============================================================
     * ELEMENTS
     * ============================================================
     */

    const stockTableBody =
        document.getElementById("stockTableBody");

    const movementTableBody =
        document.getElementById("movementTableBody");

    const totalProducts =
        document.getElementById("totalProducts");

    const lowStockProducts =
        document.getElementById("lowStockProducts");

    const outOfStockProducts =
        document.getElementById("outOfStockProducts");

    const stockSearch =
        document.getElementById("stockSearch");

    const addStockButton =
        document.getElementById("addStockButton");

    const stockMovementForm =
        document.getElementById("stockMovementForm");

    const stockProduct =
        document.getElementById("stockProduct");

    const movementType =
        document.getElementById("movementType");

    const stockQuantity =
        document.getElementById("stockQuantity");

    const stockReason =
        document.getElementById("stockReason");

    const stockReference =
        document.getElementById("stockReference");

    const stockFormAlert =
        document.getElementById("stockFormAlert");

    const saveStockMovementButton =
        document.getElementById(
            "saveStockMovementButton"
        );

    const adjustmentHelp =
        document.getElementById(
            "adjustmentHelp"
        );


    /*
     * ============================================================
     * STATE
     * ============================================================
     */

    let products = [];

    let movements = [];



    /*
     * ============================================================
     * MODAL
     * ============================================================
     */

    const stockModal =
        new bootstrap.Modal(
            document.getElementById(
                "stockMovementModal"
            )
        );



    /*
     * ============================================================
     * INITIAL LOAD
     * ============================================================
     */

    loadStockData();



    /*
     * ============================================================
     * LOAD PRODUCTS
     * ============================================================
     */

    async function loadStockData() {

        try {

            const response =
                await API.get("/products");


            if (!response.ok) {

                if (response.status === 401) {

                    Session.logout();

                    return;
                }

                throw new Error(
                    "Unable to load products."
                );
            }


            products =
                await response.json();


            renderProducts(products);

            populateProductSelect(products);

            updateSummary(products);


            await loadMovements();

        } catch (error) {

            console.error(error);

            stockTableBody.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="text-center text-danger py-4">
                        Unable to load stock.
                    </td>
                </tr>
            `;
        }
    }



    /*
     * ============================================================
     * RENDER PRODUCTS
     * ============================================================
     */

    function renderProducts(
        productList
    ) {

        if (!productList.length) {

            stockTableBody.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="text-center py-4">
                        No products found.
                    </td>
                </tr>
            `;

            return;
        }


        stockTableBody.innerHTML =
            productList.map(product => {

                const stock =
                    Number(product.stock ?? 0);

                const alertStock =
                    Number(
                        product.alertStock ?? 0
                    );


                let statusBadge;


                if (stock <= 0) {

                    statusBadge = `
                        <span class="badge bg-dark">
                            Out of Stock
                        </span>
                    `;

                } else if (
                    stock < alertStock
                ) {

                    statusBadge = `
                        <span class="badge bg-danger">
                            Low Stock
                        </span>
                    `;

                } else {

                    statusBadge = `
                        <span class="badge bg-success">
                            Normal
                        </span>
                    `;
                }


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
                            <strong>
                                ${stock}
                            </strong>
                        </td>


                        <td>
                            ${alertStock}
                        </td>


                        <td>
                            ${statusBadge}
                        </td>


                        <td class="text-end">

                            <button
                                class="btn btn-sm btn-outline-primary"
                                onclick="openStockForProduct(${product.id})"
                            >
                                Manage
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");
    }



    /*
     * ============================================================
     * SUMMARY
     * ============================================================
     */

    function updateSummary(
        productList
    ) {

        const total =
            productList.length;


        const lowStock =
            productList.filter(product => {

                const stock =
                    Number(product.stock ?? 0);

                const alertStock =
                    Number(
                        product.alertStock ?? 0
                    );

                return (
                    stock > 0 &&
                    stock < alertStock
                );

            }).length;


        const outOfStock =
            productList.filter(product => {

                return Number(
                    product.stock ?? 0
                ) <= 0;

            }).length;


        totalProducts.textContent =
            total;

        lowStockProducts.textContent =
            lowStock;

        outOfStockProducts.textContent =
            outOfStock;
    }



    /*
     * ============================================================
     * PRODUCT SELECT
     * ============================================================
     */

    function populateProductSelect(
        productList
    ) {

        stockProduct.innerHTML = `
            <option value="">
                Select product
            </option>
        `;


        productList.forEach(product => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                product.id;


            option.textContent =
                `${product.productName} — Stock: ${product.stock ?? 0
                }`;


            stockProduct.appendChild(
                option
            );
        });
    }



    /*
     * ============================================================
     * LOAD MOVEMENTS
     * ============================================================
     */

    async function loadMovements() {

        try {

            const response =
                await API.get(
                    "/stock/movements"
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load movements."
                );
            }


            movements =
                await response.json();


            renderMovements(
                movements
            );

        } catch (error) {

            console.error(error);

            movementTableBody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="text-center text-danger py-4">
                        Unable to load movements.
                    </td>
                </tr>
            `;
        }
    }



    /*
     * ============================================================
     * RENDER MOVEMENTS
     * ============================================================
     */

    function renderMovements(
        movementList
    ) {

        if (!movementList.length) {

            movementTableBody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="text-center py-4">
                        No stock movements found.
                    </td>
                </tr>
            `;

            return;
        }


        movementTableBody.innerHTML =
            movementList.map(
                movement => {

                    const product =
                        movement.product;


                    const type =
                        movement.movementType;


                    let badgeClass =
                        "bg-secondary";


                    if (type === "STOCK_IN") {

                        badgeClass =
                            "bg-success";

                    } else if (
                        type === "STOCK_OUT"
                    ) {

                        badgeClass =
                            "bg-danger";

                    } else if (
                        type === "SALE"
                    ) {

                        badgeClass =
                            "bg-primary";

                    } else if (
                        type === "ADJUSTMENT"
                    ) {

                        badgeClass =
                            "bg-warning text-dark";
                    }


                    return `
                        <tr>

                            <td>
                                ${formatDate(
                        movement.createdAt
                    )}
                            </td>


                            <td>
                                ${product
                            ? escapeHtml(
                                product.productName
                            )
                            : "-"
                        }
                            </td>


                            <td>
                                <span class="badge ${badgeClass}">
                                    ${formatMovementType(type)}
                                </span>
                            </td>


                            <td>
                                ${movement.quantity ?? 0}
                            </td>


                            <td>
                                ${movement.previousStock ?? 0}
                            </td>


                            <td>
                                <strong>
                                    ${movement.newStock ?? 0}
                                </strong>
                            </td>


                            <td>
                                ${escapeHtml(
                            movement.reason
                            ?? "-"
                        )}
                            </td>

                        </tr>
                    `;

                }
            ).join("");
    }



    /*
     * ============================================================
     * OPEN MODAL
     * ============================================================
     */

    addStockButton.addEventListener(
        "click",
        () => {

            resetForm();

            stockModal.show();
        }
    );



    /*
     * ============================================================
     * OPEN STOCK FOR PRODUCT
     * ============================================================
     */

    window.openStockForProduct =
        function (productId) {

            resetForm();

            stockProduct.value =
                productId;

            stockModal.show();
        };



    /*
     * ============================================================
     * MOVEMENT TYPE CHANGE
     * ============================================================
     */

    movementType.addEventListener(
        "change",
        () => {

            if (
                movementType.value ===
                "ADJUSTMENT"
            ) {

                adjustmentHelp
                    .classList
                    .remove("d-none");

            } else {

                adjustmentHelp
                    .classList
                    .add("d-none");
            }
        }
    );



    /*
     * ============================================================
     * SUBMIT MOVEMENT
     * ============================================================
     */

    stockMovementForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            hideAlert();


            const productId =
                Number(
                    stockProduct.value
                );


            const quantity =
                Number(
                    stockQuantity.value
                );


            if (!productId) {

                showAlert(
                    "Please select a product.",
                    "danger"
                );

                return;
            }


            if (
                !quantity ||
                quantity <= 0
            ) {

                showAlert(
                    "Please enter a valid quantity.",
                    "danger"
                );

                return;
            }


            const data = {

                productId:

                    productId,

                movementType:

                    movementType.value,

                quantity:

                    quantity,

                reason:

                    stockReason.value
                        .trim(),

                reference:

                    stockReference.value
                        .trim()

            };


            saveStockMovementButton.disabled =
                true;

            saveStockMovementButton.textContent =
                "Saving...";


            try {

                const response =
                    await API.post(
                        "/stock/movements",
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


                stockModal.hide();


                await loadStockData();


            } catch (error) {

                console.error(error);

                showAlert(
                    error.message,
                    "danger"
                );

            } finally {

                saveStockMovementButton.disabled =
                    false;

                saveStockMovementButton.textContent =
                    "Save Movement";
            }

        }
    );



    /*
     * ============================================================
     * SEARCH
     * ============================================================
     */

    stockSearch.addEventListener(
        "input",
        () => {

            const search =
                stockSearch.value
                    .trim()
                    .toLowerCase();


            if (!search) {

                renderProducts(
                    products
                );

                return;
            }


            const filtered =
                products.filter(
                    product => {

                        const name =
                            String(
                                product.productName
                                ?? ""
                            )
                                .toLowerCase();


                        const category =
                            String(
                                product.productCategory
                                ?? ""
                            )
                                .toLowerCase();


                        return (
                            name.includes(search) ||
                            category.includes(search)
                        );

                    }
                );


            renderProducts(
                filtered
            );
        }
    );



    /*
     * ============================================================
     * RESET FORM
     * ============================================================
     */

    function resetForm() {

        stockMovementForm.reset();

        hideAlert();

        adjustmentHelp
            .classList
            .add("d-none");
    }



    /*
     * ============================================================
     * ALERT
     * ============================================================
     */

    function showAlert(
        message,
        type
    ) {

        stockFormAlert.className =
            `alert alert-${type}`;

        stockFormAlert.textContent =
            message;
    }


    function hideAlert() {

        stockFormAlert.className =
            "alert d-none";

        stockFormAlert.textContent =
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
     * MOVEMENT LABEL
     * ============================================================
     */

    function formatMovementType(
        type
    ) {

        switch (type) {

            case "STOCK_IN":
                return "Stock In";

            case "STOCK_OUT":
                return "Stock Out";

            case "ADJUSTMENT":
                return "Adjustment";

            case "SALE":
                return "Sale";

            default:
                return type ?? "-";
        }
    }



    /*
     * ============================================================
     * DATE
     * ============================================================
     */

    function formatDate(
        value
    ) {

        if (!value) {
            return "-";
        }


        const date =
            new Date(value);


        return date.toLocaleString();
    }

    /*
     * ============================================================
     * RENDER STOCK PAGE
     * ============================================================
     */
    function renderStockPage() {

        const pageContent =
            document.getElementById("pageContent");

        if (!pageContent) {
            console.error(
                "pageContent element not found."
            );
            return;
        }

        pageContent.innerHTML = `

        <div class="container-fluid py-3">

            <!-- PAGE HEADER -->

            <div class="d-flex
                        justify-content-between
                        align-items-center
                        flex-wrap
                        gap-2
                        mb-4">

                <div>

                    <h2 class="mb-1">
                        Stock Management
                    </h2>

                    <p class="text-muted mb-0">
                        Manage inventory and stock movements
                    </p>

                </div>

                <button
                    type="button"
                    class="btn btn-primary"
                    id="addStockButton">

                    <i class="bi bi-plus-circle me-1"></i>

                    Stock Movement

                </button>

            </div>


            <!-- SUMMARY CARDS -->

            <div class="row g-3 mb-4">

                <div class="col-12 col-md-4">

                    <div class="card shadow-sm border-0 h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between
                                        align-items-center">

                                <div>

                                    <p class="text-muted mb-1">
                                        Total Products
                                    </p>

                                    <h3
                                        id="totalProducts"
                                        class="mb-0">
                                        0
                                    </h3>

                                </div>

                                <i class="bi bi-box-seam fs-1"></i>

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
                                        Low Stock
                                    </p>

                                    <h3
                                        id="lowStockProducts"
                                        class="mb-0 text-danger">
                                        0
                                    </h3>

                                </div>

                                <i
                                    class="bi
                                           bi-exclamation-triangle
                                           fs-1
                                           text-danger">
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
                                        id="outOfStockProducts"
                                        class="mb-0">
                                        0
                                    </h3>

                                </div>

                                <i
                                    class="bi
                                           bi-x-circle
                                           fs-1">
                                </i>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- INVENTORY -->

            <div class="card shadow-sm border-0">

                <div class="card-header bg-white">

                    <div class="row align-items-center">

                        <div class="col-md-6">

                            <h5 class="mb-0">
                                Current Inventory
                            </h5>

                        </div>

                        <div class="col-md-6 mt-2 mt-md-0">

                            <input
                                type="search"
                                id="stockSearch"
                                class="form-control"
                                placeholder="Search product...">

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

                            <thead class="table-light">

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                    <th>
                                        Alert Stock
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th class="text-end">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody id="stockTableBody">

                                <tr>

                                    <td
                                        colspan="6"
                                        class="text-center py-4">

                                        Loading stock...

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>


            <!-- MOVEMENTS -->

            <div class="card shadow-sm border-0 mt-4">

                <div class="card-header bg-white">

                    <h5 class="mb-0">
                        Recent Stock Movements
                    </h5>

                </div>


                <div class="card-body p-0">

                    <div class="table-responsive">

                        <table
                            class="table
                                   table-hover
                                   align-middle
                                   mb-0">

                            <thead class="table-light">

                                <tr>

                                    <th>Date</th>

                                    <th>Product</th>

                                    <th>Type</th>

                                    <th>Quantity</th>

                                    <th>Previous</th>

                                    <th>New Stock</th>

                                    <th>Reason</th>

                                </tr>

                            </thead>


                            <tbody id="movementTableBody">

                                <tr>

                                    <td
                                        colspan="7"
                                        class="text-center py-4">

                                        Loading movements...

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>


        <!-- STOCK MOVEMENT MODAL -->

        <div
            class="modal fade"
            id="stockMovementModal"
            tabindex="-1">

            <div
                class="modal-dialog
                       modal-lg
                       modal-dialog-centered">

                <div class="modal-content">

                    <div class="modal-header">

                        <h5 class="modal-title">
                            Stock Movement
                        </h5>

                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal">
                        </button>

                    </div>


                    <form id="stockMovementForm">

                        <div class="modal-body">

                            <div
                                id="stockFormAlert"
                                class="alert d-none">
                            </div>


                            <div class="mb-3">

                                <label
                                    class="form-label">

                                    Product

                                </label>

                                <select
                                    id="stockProduct"
                                    class="form-select"
                                    required>

                                    <option value="">
                                        Select product
                                    </option>

                                </select>

                            </div>


                            <div class="mb-3">

                                <label
                                    class="form-label">

                                    Movement Type

                                </label>
                                <select
                                        id="movementType"
                                        class="form-select"
                                        required>

                                        <option value="">
                                            Select movement
                                        </option>

                                        <option value="STOCK_IN">
                                            Stock In
                                        </option>

                                        <option value="STOCK_OUT">
                                            Stock Out
                                        </option>

                                        <option value="ADJUSTMENT">
                                            Adjustment
                                        </option>

                                    </select>

                                    <div
                                        id="adjustmentHelp"
                                        class="form-text d-none">

                                        For an adjustment, enter the new actual stock quantity.

                                    </div>

                            </div>


                            <div class="mb-3">

                                <label
                                    class="form-label">

                                    Quantity

                                </label>

                                <input
                                    type="number"
                                    id="stockQuantity"
                                    class="form-control"
                                    min="0.01"
                                    step="0.01"
                                    required>

                            </div>


                            <div class="mb-3">

                                <label
                                    class="form-label">

                                    Reason

                                </label>

                                <textarea
                                    id="stockReason"
                                    class="form-control"
                                    rows="2">
                                </textarea>

                            </div>


                            <div class="mb-3">

                                <label
                                    class="form-label">

                                    Reference

                                </label>

                                <input
                                    type="text"
                                    id="stockReference"
                                    class="form-control">

                            </div>

                        </div>


                        <div class="modal-footer">

                            <button
                                type="button"
                                class="btn btn-secondary"
                                data-bs-dismiss="modal">

                                Cancel

                            </button>


                            <button
                                type="submit"
                                id="saveStockMovementButton"
                                class="btn btn-primary">

                                Save Movement

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    `;
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
            value;


        return div.innerHTML;
    }

});


