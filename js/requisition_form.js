document.addEventListener("DOMContentLoaded", async () => {

    // Only Manager and Admin can create requisitions
    Session.requireRole("MANAGER", "ADMIN");

    // IMPORTANT:
    // layout must be rendered before accessing #pageContent
    renderLayout();

    const pageContent = document.getElementById("pageContent");

    pageContent.innerHTML = `
        <div class="container-fluid py-3">

            <!-- HEADER -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="mb-1">
                        <i class="bi bi-file-earmark-plus"></i>
                        Create Requisition
                    </h3>

                    <p class="text-muted mb-0">
                        Request stock replenishment or a new product.
                    </p>
                </div>

                <a href="requisitions.html"
                   class="btn btn-outline-secondary">
                    <i class="bi bi-list"></i>
                    Requisitions
                </a>
            </div>


            <!-- ALERT -->
            <div id="alertContainer"></div>


            <!-- FORM CARD -->
            <div class="card shadow-sm">

                <div class="card-header">
                    <strong>
                        Requisition Information
                    </strong>
                </div>

                <div class="card-body">

                    <!-- PRODUCT TYPE -->
                    <div class="mb-4">

                        <label class="form-label fw-semibold">
                            Product Type
                        </label>

                        <div class="d-flex gap-4">

                            <div class="form-check">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="productType"
                                    id="existingProduct"
                                    value="existing"
                                    checked>

                                <label
                                    class="form-check-label"
                                    for="existingProduct">

                                    Existing Product
                                </label>
                            </div>


                            <div class="form-check">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="productType"
                                    id="newProduct"
                                    value="new">

                                <label
                                    class="form-check-label"
                                    for="newProduct">

                                    New Product
                                </label>
                            </div>

                        </div>

                    </div>


                    <!-- EXISTING PRODUCT -->
                    <div id="existingProductSection">

                        <div class="mb-3">

                            <label class="form-label">
                                Product
                            </label>

                            <select
                                id="productId"
                                class="form-select">

                                <option value="">
                                    Loading products...
                                </option>

                            </select>

                        </div>

                    </div>


                    <!-- NEW PRODUCT -->
                    <div id="newProductSection"
                         class="d-none">

                        <div class="row">

                            <div class="col-md-6 mb-3">

                                <label class="form-label">
                                    Product Name
                                </label>

                                <input
                                    type="text"
                                    id="requestedProductName"
                                    class="form-control"
                                    maxlength="150">

                            </div>


                            <div class="col-md-6 mb-3">

                                <label class="form-label">
                                    Category
                                </label>

                                <input
                                    type="text"
                                    id="requestedCategory"
                                    class="form-control"
                                    maxlength="100">

                            </div>

                        </div>

                    </div>


                    <!-- QUANTITY / UNIT -->
                    <div class="row">

                        <div class="col-md-6 mb-3">

                            <label class="form-label">
                                Quantity
                            </label>

                            <input
                                type="number"
                                id="quantity"
                                class="form-control"
                                min="0.01"
                                step="0.01"
                                required>

                        </div>


                        <div class="col-md-6 mb-3">

                            <label class="form-label">
                                Unit
                            </label>

                            <input
                                type="text"
                                id="unit"
                                class="form-control"
                                placeholder="pcs, kg, box, litre...">

                        </div>

                    </div>


                    <!-- PRICE -->
                    <div class="mb-3">

                        <label class="form-label">
                            Estimated Unit Price
                        </label>

                        <input
                            type="number"
                            id="estimatedUnitPrice"
                            class="form-control"
                            min="0"
                            step="0.01">

                    </div>


                    <!-- REASON -->
                    <div class="mb-3">

                        <label class="form-label">
                            Reason
                        </label>

                        <textarea
                            id="reason"
                            class="form-control"
                            rows="4"
                            maxlength="500"
                            required
                            placeholder="Explain why this product is required..."></textarea>

                    </div>


                    <!-- SUBMIT -->
                    <div class="d-flex justify-content-end gap-2">

                        <a href="requisitions.html"
                           class="btn btn-secondary">

                            Cancel

                        </a>

                        <button
                            type="button"
                            id="submitRequisition"
                            class="btn btn-primary">

                            <i class="bi bi-send"></i>
                            Submit Requisition

                        </button>

                    </div>

                </div>
            </div>

        </div>
    `;


    // ============================================================
    // ELEMENTS
    // ============================================================

    const existingRadio =
        document.getElementById("existingProduct");

    const newRadio =
        document.getElementById("newProduct");

    const existingSection =
        document.getElementById("existingProductSection");

    const newSection =
        document.getElementById("newProductSection");

    const productSelect =
        document.getElementById("productId");


    // ============================================================
    // SWITCH PRODUCT TYPE
    // ============================================================

    function updateProductType() {

        if (existingRadio.checked) {

            existingSection.classList.remove("d-none");
            newSection.classList.add("d-none");

        } else {

            existingSection.classList.add("d-none");
            newSection.classList.remove("d-none");

        }
    }


    existingRadio.addEventListener(
        "change",
        updateProductType
    );

    newRadio.addEventListener(
        "change",
        updateProductType
    );


    // ============================================================
    // LOAD PRODUCTS
    // ============================================================

    async function loadProducts() {

        try {

            const products =
                await API.get("/products");

            productSelect.innerHTML = `
                <option value="">
                    -- Select Product --
                </option>
            `;

            products.forEach(product => {

                const option =
                    document.createElement("option");

                option.value = product.id;

                option.textContent =
                    `${product.productName} — Stock: ${product.stock ?? 0}`;

                productSelect.appendChild(option);
            });


            // Support:
            // requisition_form.html?productId=5

            const params =
                new URLSearchParams(window.location.search);

            const productId =
                params.get("productId");

            if (productId) {

                productSelect.value =
                    productId;
            }

        } catch (error) {

            console.error(
                "Error loading products:",
                error
            );

            productSelect.innerHTML = `
                <option value="">
                    Unable to load products
                </option>
            `;
        }
    }


    await loadProducts();


    // ============================================================
    // SUBMIT
    // ============================================================

    document
        .getElementById("submitRequisition")
        .addEventListener("click", submitRequisition);


    async function submitRequisition() {

        const button =
            document.getElementById("submitRequisition");

        const alertContainer =
            document.getElementById("alertContainer");


        alertContainer.innerHTML = "";


        const isExisting =
            existingRadio.checked;


        const quantity =
            parseFloat(
                document.getElementById("quantity").value
            );


        const estimatedUnitPriceValue =
            document.getElementById("estimatedUnitPrice").value;


        const reason =
            document.getElementById("reason").value.trim();


        // ========================================================
        // VALIDATION
        // ========================================================

        if (!quantity || quantity <= 0) {

            showAlert(
                "Please enter a valid quantity.",
                "warning"
            );

            return;
        }


        if (!reason) {

            showAlert(
                "Please enter the reason for this requisition.",
                "warning"
            );

            return;
        }


        if (isExisting) {

            if (!productSelect.value) {

                showAlert(
                    "Please select a product.",
                    "warning"
                );

                return;
            }

        } else {

            const productName =
                document
                    .getElementById("requestedProductName")
                    .value
                    .trim();


            if (!productName) {

                showAlert(
                    "Please enter the new product name.",
                    "warning"
                );

                return;
            }
        }


        // ========================================================
        // REQUEST PAYLOAD
        // ========================================================

        const request = {

            productId:
                isExisting
                    ? Number(productSelect.value)
                    : null,

            requestedProductName:
                isExisting
                    ? null
                    : document
                        .getElementById("requestedProductName")
                        .value
                        .trim(),

            requestedCategory:
                isExisting
                    ? null
                    : document
                        .getElementById("requestedCategory")
                        .value
                        .trim(),

            quantity: quantity,

            unit:
                document
                    .getElementById("unit")
                    .value
                    .trim(),

            estimatedUnitPrice:
                estimatedUnitPriceValue
                    ? parseFloat(estimatedUnitPriceValue)
                    : null,

            reason: reason
        };


        console.log(
            "Requisition request:",
            request
        );


        // ========================================================
        // SEND
        // ========================================================

        button.disabled = true;

        button.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Submitting...
        `;


        try {

            const response =
                await API.post(
                    "/requisitions",
                    request
                );


            console.log(
                "Created requisition:",
                response
            );


            showAlert(
                "Requisition created successfully.",
                "success"
            );


            setTimeout(() => {

                window.location.href =
                    "requisitions.html";

            }, 1000);


        } catch (error) {

            console.error(
                "Create requisition error:",
                error
            );


            showAlert(
                error.message ||
                "Failed to create requisition.",
                "danger"
            );


            button.disabled = false;

            button.innerHTML = `
                <i class="bi bi-send"></i>
                Submit Requisition
            `;
        }
    }


    // ============================================================
    // ALERT
    // ============================================================

    function showAlert(message, type) {

        document.getElementById(
            "alertContainer"
        ).innerHTML = `

            <div class="alert alert-${type} alert-dismissible fade show">

                ${message}

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="alert">
                </button>

            </div>
        `;
    }

});