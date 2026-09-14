/*
 * ============================================================
 * requisitions.js
 * ============================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * ========================================================
         * AUTHENTICATION
         * ========================================================
         */

        if (
            !Session.requireRole(
                "MANAGER",
                "ADMIN"
            )
        ) {

            return;

        }


        /*
         * ========================================================
         * RENDER COMMON LAYOUT
         * ========================================================
         */

        renderLayout();


        const pageContent =
            document.getElementById(
                "pageContent"
            );


        if (!pageContent) {

            console.error(
                "pageContent element not found."
            );

            return;

        }


        /*
         * ========================================================
         * RENDER PAGE
         * ========================================================
         */

        pageContent.innerHTML = `

            <div class="container-fluid py-3">


                <!-- HEADER -->

                <div class="d-flex
                            justify-content-between
                            align-items-center
                            flex-wrap
                            gap-2
                            mb-4">

                    <div>

                        <h2 class="mb-1">

                            <i class="bi bi-file-earmark-text me-2"></i>

                            Requisitions

                        </h2>

                        <p class="text-muted mb-0">

                            Manage product requests and approvals.

                        </p>

                    </div>


                    <a
                        href="requisition_form.html"
                        class="btn btn-primary">

                        <i class="bi bi-plus-circle me-1"></i>

                        New Requisition

                    </a>

                </div>


                <!-- SUMMARY -->

                <div class="row g-3 mb-4">


                    <div class="col-12 col-md-4">

                        <div class="card shadow-sm border-0">

                            <div class="card-body">

                                <div class="d-flex
                                            justify-content-between">

                                    <div>

                                        <small
                                            class="text-muted">

                                            Pending

                                        </small>

                                        <h3
                                            id="pendingCount"
                                            class="mb-0">

                                            0

                                        </h3>

                                    </div>

                                    <i
                                        class="bi bi-hourglass-split
                                               fs-1
                                               text-warning">
                                    </i>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="col-12 col-md-4">

                        <div class="card shadow-sm border-0">

                            <div class="card-body">

                                <div class="d-flex
                                            justify-content-between">

                                    <div>

                                        <small
                                            class="text-muted">

                                            Approved

                                        </small>

                                        <h3
                                            id="approvedCount"
                                            class="mb-0">

                                            0

                                        </h3>

                                    </div>

                                    <i
                                        class="bi bi-check-circle
                                               fs-1
                                               text-success">
                                    </i>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="col-12 col-md-4">

                        <div class="card shadow-sm border-0">

                            <div class="card-body">

                                <div class="d-flex
                                            justify-content-between">

                                    <div>

                                        <small
                                            class="text-muted">

                                            Denied

                                        </small>

                                        <h3
                                            id="deniedCount"
                                            class="mb-0">

                                            0

                                        </h3>

                                    </div>

                                    <i
                                        class="bi bi-x-circle
                                               fs-1
                                               text-danger">
                                    </i>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- FILTERS -->

                <div class="card shadow-sm mb-3">

                    <div class="card-body">

                        <div class="row g-2">

                            <div class="col-12 col-md-6">

                                <label
                                    class="form-label">

                                    Search

                                </label>

                                <input
                                    type="text"
                                    id="searchInput"
                                    class="form-control"
                                    placeholder="Search product or requester...">

                            </div>


                            <div class="col-12 col-md-4">

                                <label
                                    class="form-label">

                                    Status

                                </label>

                                <select
                                    id="statusFilter"
                                    class="form-select">

                                    <option value="ALL">
                                        All
                                    </option>

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="APPROVED">
                                        Approved
                                    </option>

                                    <option value="DENIED">
                                        Denied
                                    </option>

                                    <option value="FULFILLED">
                                        Fulfilled
                                    </option>

                                    <option value="CANCELLED">
                                        Cancelled
                                    </option>

                                </select>

                            </div>


                            <div class="col-12 col-md-2 d-grid">

                                <label
                                    class="form-label d-none d-md-block">

                                    &nbsp;

                                </label>

                                <button
                                    id="refreshButton"
                                    class="btn btn-outline-primary">

                                    <i
                                        class="bi bi-arrow-clockwise me-1">
                                    </i>

                                    Refresh

                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- ALERT -->

                <div
                    id="pageAlert"
                    class="alert d-none">
                </div>


                <!-- TABLE -->

                <div class="card shadow-sm">

                    <div class="card-header">

                        <strong>
                            Requisition List
                        </strong>

                    </div>


                    <div class="card-body p-0">

                        <div class="table-responsive">

                            <table
                                class="table table-hover
                                       align-middle
                                       mb-0">

                                <thead
                                    class="table-light">

                                    <tr>

                                        <th>
                                            Product
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Requested By
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th class="text-end">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody
                                    id="requisitionTableBody">

                                    <tr>

                                        <td
                                            colspan="6"
                                            class="text-center py-4">

                                            Loading requisitions...

                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>


            <!-- DECISION MODAL -->

            <div
                class="modal fade"
                id="decisionModal"
                tabindex="-1">

                <div
                    class="modal-dialog">

                    <div
                        class="modal-content">


                        <div
                            class="modal-header">

                            <h5
                                class="modal-title">

                                Requisition Decision

                            </h5>

                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal">
                            </button>

                        </div>


                        <div
                            class="modal-body">

                            <input
                                type="hidden"
                                id="decisionRequisitionId">


                            <div
                                id="decisionProduct"
                                class="alert alert-light">
                            </div>


                            <div class="mb-3">

                                <label
                                    class="form-label">

                                    Decision

                                </label>

                                <select
                                    id="decisionStatus"
                                    class="form-select">

                                    <option value="APPROVED">
                                        Approve
                                    </option>

                                    <option value="DENIED">
                                        Deny
                                    </option>

                                </select>

                            </div>


                            <div class="mb-3">

                                <label
                                    class="form-label">

                                    Note

                                </label>

                                <textarea
                                    id="decisionNote"
                                    class="form-control"
                                    rows="3"
                                    maxlength="500"
                                    placeholder="Optional note..."></textarea>

                            </div>

                        </div>


                        <div
                            class="modal-footer">

                            <button
                                type="button"
                                class="btn btn-secondary"
                                data-bs-dismiss="modal">

                                Cancel

                            </button>


                            <button
                                type="button"
                                id="saveDecisionButton"
                                class="btn btn-primary">

                                Save Decision

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;


        /*
         * ========================================================
         * ELEMENTS
         * ========================================================
         */

        const tableBody =
            document.getElementById(
                "requisitionTableBody"
            );

        const searchInput =
            document.getElementById(
                "searchInput"
            );

        const statusFilter =
            document.getElementById(
                "statusFilter"
            );

        const refreshButton =
            document.getElementById(
                "refreshButton"
            );

        const pendingCount =
            document.getElementById(
                "pendingCount"
            );

        const approvedCount =
            document.getElementById(
                "approvedCount"
            );

        const deniedCount =
            document.getElementById(
                "deniedCount"
            );

        const pageAlert =
            document.getElementById(
                "pageAlert"
            );


        /*
         * ========================================================
         * MODAL
         * ========================================================
         */

        const decisionModalElement =
            document.getElementById(
                "decisionModal"
            );

        const decisionModal =
            new bootstrap.Modal(
                decisionModalElement
            );


        /*
         * ========================================================
         * STATE
         * ========================================================
         */

        let requisitions = [];


        /*
         * ========================================================
         * HELPERS
         * ========================================================
         */

        function escapeHtml(value) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }

            return String(value)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");

        }


        function formatDate(value) {

            if (!value) {
                return "-";
            }

            const date =
                new Date(value);

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return value;

            }

            return date.toLocaleString();

        }


        function statusBadge(status) {

            switch (status) {

                case "PENDING":

                    return `
                        <span class="badge bg-warning text-dark">
                            Pending
                        </span>
                    `;


                case "APPROVED":

                    return `
                        <span class="badge bg-success">
                            Approved
                        </span>
                    `;


                case "DENIED":

                    return `
                        <span class="badge bg-danger">
                            Denied
                        </span>
                    `;


                case "FULFILLED":

                    return `
                        <span class="badge bg-primary">
                            Fulfilled
                        </span>
                    `;


                case "CANCELLED":

                    return `
                        <span class="badge bg-secondary">
                            Cancelled
                        </span>
                    `;


                default:

                    return `
                        <span class="badge bg-secondary">
                            ${escapeHtml(status)}
                        </span>
                    `;

            }

        }


        function getProductName(
            requisition
        ) {

            if (
                requisition.productName
            ) {

                return requisition.productName;

            }

            if (
                requisition.requestedProductName
            ) {

                return requisition
                    .requestedProductName;

            }

            return "Unknown Product";

        }


        function showAlert(
            message,
            type = "danger"
        ) {

            pageAlert.className =
                `alert alert-${type}`;

            pageAlert.textContent =
                message;

            pageAlert.classList.remove(
                "d-none"
            );

        }


        /*
         * ========================================================
         * LOAD
         * ========================================================
         */

        async function loadRequisitions() {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="text-center py-4">

                        <span
                            class="spinner-border
                                   spinner-border-sm
                                   me-2">
                        </span>

                        Loading requisitions...

                    </td>

                </tr>

            `;


            try {

                const response =
                    await API.get(
                        "/requisitions"
                    );


                if (!response.ok) {

                    throw new Error(
                        "Unable to load requisitions."
                    );

                }


                requisitions =
                    await response.json();


                if (
                    !Array.isArray(
                        requisitions
                    )
                ) {

                    requisitions = [];

                }


                updateSummary();

                renderTable();


            } catch (error) {

                console.error(
                    error
                );

                tableBody.innerHTML = `

                    <tr>

                        <td
                            colspan="6"
                            class="text-center
                                   text-danger
                                   py-4">

                            Unable to load requisitions.

                        </td>

                    </tr>

                `;

                showAlert(
                    error.message ||
                    "Unable to load requisitions."
                );

            }

        }


        /*
         * ========================================================
         * SUMMARY
         * ========================================================
         */

        function updateSummary() {

            pendingCount.textContent =
                requisitions.filter(
                    r =>
                        r.status ===
                        "PENDING"
                ).length;


            approvedCount.textContent =
                requisitions.filter(
                    r =>
                        r.status ===
                        "APPROVED"
                ).length;


            deniedCount.textContent =
                requisitions.filter(
                    r =>
                        r.status ===
                        "DENIED"
                ).length;

        }


        /*
         * ========================================================
         * FILTER
         * ========================================================
         */

        function getFilteredRequisitions() {

            const search =
                searchInput
                    .value
                    .trim()
                    .toLowerCase();


            const status =
                statusFilter.value;


            return requisitions.filter(
                requisition => {

                    const productName =
                        getProductName(
                            requisition
                        )
                        .toLowerCase();


                    const requester =
                        (
                            requisition
                                .requestedByName
                            || ""
                        )
                        .toLowerCase();


                    const matchesSearch =
                        !search ||
                        productName.includes(
                            search
                        ) ||
                        requester.includes(
                            search
                        );


                    const matchesStatus =
                        status === "ALL" ||
                        requisition.status ===
                            status;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );

        }


        /*
         * ========================================================
         * RENDER TABLE
         * ========================================================
         */

        function renderTable() {

            const filtered =
                getFilteredRequisitions();


            if (!filtered.length) {

                tableBody.innerHTML = `

                    <tr>

                        <td
                            colspan="6"
                            class="text-center
                                   text-muted
                                   py-4">

                            No requisitions found.

                        </td>

                    </tr>

                `;

                return;

            }


            tableBody.innerHTML =
                filtered.map(
                    requisition => {

                        const productName =
                            getProductName(
                                requisition
                            );


                        const isNewProduct =
                            requisition.newProduct;


                        const quantity =
                            requisition.quantity
                            ?? 0;


                        const unit =
                            requisition.unit
                            || "";


                        const canDecide =
                            requisition.status ===
                            "PENDING";


                        return `

                            <tr>

                                <!-- PRODUCT -->

                                <td>

                                    <strong>

                                        ${escapeHtml(
                                            productName
                                        )}

                                    </strong>


                                    ${
                                        isNewProduct
                                        ? `
                                            <br>

                                            <span
                                                class="badge
                                                       bg-info
                                                       text-dark">

                                                New Product

                                            </span>
                                          `
                                        : ""
                                    }

                                </td>


                                <!-- QUANTITY -->

                                <td>

                                    ${quantity}

                                    ${
                                        unit
                                        ? escapeHtml(
                                            ` ${unit}`
                                        )
                                        : ""
                                    }

                                </td>


                                <!-- REQUESTER -->

                                <td>

                                    ${
                                        escapeHtml(
                                            requisition
                                                .requestedByName
                                            || "-"
                                        )
                                    }

                                </td>


                                <!-- DATE -->

                                <td>

                                    ${
                                        formatDate(
                                            requisition
                                                .requestedAt
                                        )
                                    }

                                </td>


                                <!-- STATUS -->

                                <td>

                                    ${statusBadge(
                                        requisition.status
                                    )}

                                </td>


                                <!-- ACTION -->

                                <td
                                    class="text-end">

                                    ${
                                        canDecide
                                        ? `

                                            <button
                                                type="button"
                                                class="btn
                                                       btn-sm
                                                       btn-outline-primary"
                                                onclick="openDecisionModal(
                                                    ${requisition.id}
                                                )">

                                                <i
                                                    class="bi
                                                          bi-check2-square
                                                          me-1">
                                                </i>

                                                Review

                                            </button>

                                          `
                                        : `
                                            <button
                                                type="button"
                                                class="btn
                                                       btn-sm
                                                       btn-outline-secondary"
                                                onclick="viewRequisition(
                                                    ${requisition.id}
                                                )">

                                                <i
                                                    class="bi
                                                          bi-eye
                                                          me-1">
                                                </i>

                                                View

                                            </button>
                                          `
                                    }

                                </td>

                            </tr>

                        `;

                    }
                ).join("");

        }


        /*
         * ========================================================
         * OPEN DECISION MODAL
         * ========================================================
         */

        window.openDecisionModal =
            function(id) {

                const requisition =
                    requisitions.find(
                        r =>
                            Number(r.id) ===
                            Number(id)
                    );


                if (!requisition) {

                    return;

                }


                document.getElementById(
                    "decisionRequisitionId"
                ).value =
                    requisition.id;


                document.getElementById(
                    "decisionProduct"
                ).innerHTML = `

                    <strong>
                        ${escapeHtml(
                            getProductName(
                                requisition
                            )
                        )}
                    </strong>

                    <br>

                    Quantity:
                    ${escapeHtml(
                        requisition.quantity
                    )}
                    ${
                        requisition.unit
                        ? escapeHtml(
                            ` ${requisition.unit}`
                        )
                        : ""
                    }

                    <br>

                    Reason:
                    ${escapeHtml(
                        requisition.reason
                    )}

                `;


                document.getElementById(
                    "decisionStatus"
                ).value =
                    "APPROVED";


                document.getElementById(
                    "decisionNote"
                ).value =
                    "";


                decisionModal.show();

            };


        /*
         * ========================================================
         * VIEW
         * ========================================================
         */

        window.viewRequisition =
            function(id) {

                const requisition =
                    requisitions.find(
                        r =>
                            Number(r.id) ===
                            Number(id)
                    );


                if (!requisition) {

                    return;

                }


                alert(

                    `Product: ${
                        getProductName(
                            requisition
                        )
                    }\n` +

                    `Quantity: ${
                        requisition.quantity
                    } ${
                        requisition.unit || ""
                    }\n` +

                    `Status: ${
                        requisition.status
                    }\n` +

                    `Reason: ${
                        requisition.reason
                    }\n\n` +

                    `Processing Note: ${
                        requisition.processingNote
                        || "-"
                    }`

                );

            };


        /*
         * ========================================================
         * SAVE DECISION
         * ========================================================
         */

        document.getElementById(
            "saveDecisionButton"
        ).addEventListener(
            "click",
            async () => {

                const id =
                    document.getElementById(
                        "decisionRequisitionId"
                    ).value;


                const status =
                    document.getElementById(
                        "decisionStatus"
                    ).value;


                const note =
                    document.getElementById(
                        "decisionNote"
                    ).value
                    .trim();


                if (!id) {

                    return;

                }


                const button =
                    document.getElementById(
                        "saveDecisionButton"
                    );


                button.disabled =
                    true;


                button.innerHTML = `

                    <span
                        class="spinner-border
                               spinner-border-sm
                               me-1">
                    </span>

                    Saving...

                `;


                try {

                    const response =
                        await API.put(
                            `/requisitions/${id}/decision`,
                            {
                                status: status,
                                note: note || null
                            }
                        );


                    if (!response.ok) {

                        let message =
                            "Unable to save decision.";

                        try {

                            const data =
                                await response.json();

                            message =
                                data.message ||
                                data.error ||
                                message;

                        } catch (_) {}

                        throw new Error(
                            message
                        );

                    }


                    decisionModal.hide();


                    showAlert(
                        status === "APPROVED"
                            ? "Requisition approved successfully."
                            : "Requisition denied successfully.",
                        "success"
                    );


                    await loadRequisitions();


                } catch (error) {

                    console.error(
                        error
                    );

                    showAlert(
                        error.message ||
                        "Unable to save decision."
                    );

                } finally {

                    button.disabled =
                        false;

                    button.innerHTML =
                        "Save Decision";

                }

            }
        );


        /*
         * ========================================================
         * FILTER EVENTS
         * ========================================================
         */

        searchInput.addEventListener(
            "input",
            renderTable
        );


        statusFilter.addEventListener(
            "change",
            renderTable
        );


        refreshButton.addEventListener(
            "click",
            loadRequisitions
        );


        /*
         * ========================================================
         * INITIAL LOAD
         * ========================================================
         */

        await loadRequisitions();

    }
);