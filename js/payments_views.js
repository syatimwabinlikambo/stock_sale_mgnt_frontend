document.addEventListener("DOMContentLoaded", async () => {

    // ============================================================
    // AUTHORIZATION
    // ============================================================

    if (!Session.requireRole("MANAGER", "ADMIN")) {
        return;
    }

    // ============================================================
    // RENDER APPLICATION LAYOUT FIRST
    // ============================================================

    renderLayout();

    // ============================================================
    // RENDER PAYMENTS PAGE
    // ============================================================

    renderPaymentsPage();

    // ============================================================
    // LOAD PAYMENTS
    // ============================================================

    await loadPayments();
});

// ============================================================
// STATE
// ============================================================

let payments = [];


// ============================================================
// RENDER PAGE
// ============================================================

function renderPaymentsPage() {

    const pageContent = document.getElementById("pageContent");

    if (!pageContent) {
        console.error("pageContent element not found.");
        return;
    }

    pageContent.innerHTML = `

        <div class="container-fluid py-3">

            <!-- ==================================================
                 PAGE HEADER
                 ================================================== -->

            <div class="d-flex flex-wrap
                        justify-content-between
                        align-items-center
                        gap-2 mb-4">

                <div>
                    <h4 class="mb-1">
                        <i class="bi bi-credit-card me-2"></i>
                        Payments
                    </h4>

                    <p class="text-muted mb-0">
                        View and manage customer payments
                    </p>
                </div>

                <button
                        type="button"
                        class="btn btn-primary"
                        id="refreshPaymentsButton">

                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                </button>

            </div>


            <!-- ==================================================
                 SUMMARY CARDS
                 ================================================== -->

            <div class="row g-3 mb-4">

                <!-- Total Payments -->

                <div class="col-12 col-sm-6 col-xl-3">

                    <div class="card shadow-sm h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between
                                        align-items-center">

                                <div>

                                    <div class="text-muted small">
                                        Total Payments
                                    </div>

                                    <h4 class="mb-0"
                                        id="totalPayments">
                                        0.00
                                    </h4>

                                </div>

                                <div class="fs-2 text-primary">
                                    <i class="bi bi-cash-stack"></i>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- Cash Payments -->

                <div class="col-12 col-sm-6 col-xl-3">

                    <div class="card shadow-sm h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between
                                        align-items-center">

                                <div>

                                    <div class="text-muted small">
                                        Cash Payments
                                    </div>

                                    <h4 class="mb-0"
                                        id="cashPayments">
                                        0.00
                                    </h4>

                                </div>

                                <div class="fs-2 text-success">
                                    <i class="bi bi-wallet2"></i>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- Other Payments -->

                <div class="col-12 col-sm-6 col-xl-3">

                    <div class="card shadow-sm h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between
                                        align-items-center">

                                <div>

                                    <div class="text-muted small">
                                        Other Payments
                                    </div>

                                    <h4 class="mb-0"
                                        id="otherPayments">
                                        0.00
                                    </h4>

                                </div>

                                <div class="fs-2 text-info">
                                    <i class="bi bi-credit-card"></i>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- Outstanding -->

                <div class="col-12 col-sm-6 col-xl-3">

                    <div class="card shadow-sm h-100">

                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between
                                        align-items-center">

                                <div>

                                    <div class="text-muted small">
                                        Outstanding Balance
                                    </div>

                                    <h4 class="mb-0"
                                        id="outstandingBalance">
                                        0.00
                                    </h4>

                                </div>

                                <div class="fs-2 text-warning">
                                    <i class="bi bi-hourglass-split"></i>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- ==================================================
                 FILTERS
                 ================================================== -->

            <div class="card shadow-sm mb-4">

                <div class="card-body">

                    <div class="row g-3">

                        <!-- Search -->

                        <div class="col-12 col-lg-5">

                            <label
                                    for="paymentSearch"
                                    class="form-label">

                                Search

                            </label>

                            <div class="input-group">

                                <span class="input-group-text">
                                    <i class="bi bi-search"></i>
                                </span>

                                <input
                                        type="text"
                                        id="paymentSearch"
                                        class="form-control"
                                        placeholder="Customer, sale, receipt or reference...">

                            </div>

                        </div>


                        <!-- Payment Method -->

                        <div class="col-12 col-sm-6 col-lg-3">

                            <label
                                    for="paymentMethodFilter"
                                    class="form-label">

                                Payment Method

                            </label>

                            <select
                                    id="paymentMethodFilter"
                                    class="form-select">

                                <option value="">
                                    All Methods
                                </option>

                                <option value="CASH">
                                    Cash
                                </option>

                                <option value="CARD">
                                    Card
                                </option>

                                <option value="MOBILE_MONEY">
                                    Mobile Money
                                </option>

                                <option value="BANK_TRANSFER">
                                    Bank Transfer
                                </option>

                                <option value="OTHER">
                                    Other
                                </option>

                            </select>

                        </div>


                        <!-- Status -->

                        <div class="col-12 col-sm-6 col-lg-3">

                            <label
                                    for="paymentStatusFilter"
                                    class="form-label">

                                Sale Status

                            </label>

                            <select
                                    id="paymentStatusFilter"
                                    class="form-select">

                                <option value="">
                                    All Statuses
                                </option>

                                <option value="PAID">
                                    Paid
                                </option>

                                <option value="PARTIAL">
                                    Partial
                                </option>

                                <option value="UNPAID">
                                    Unpaid
                                </option>

                                <option value="CANCELLED">
                                    Cancelled
                                </option>

                            </select>

                        </div>


                        <!-- Clear -->

                        <div class="col-12 col-lg-1 d-flex align-items-end">

                            <button
                                    type="button"
                                    id="clearPaymentFilters"
                                    class="btn btn-outline-secondary w-100"
                                    title="Clear filters">

                                <i class="bi bi-x-lg"></i>

                            </button>

                        </div>

                    </div>

                </div>

            </div>


            <!-- ==================================================
                 PAYMENTS TABLE
                 ================================================== -->

            <div class="card shadow-sm">

                <div class="card-header
                            d-flex
                            justify-content-between
                            align-items-center">

                    <span>
                        <i class="bi bi-list-ul me-2"></i>
                        Payment History
                    </span>

                    <span
                            class="badge text-bg-secondary"
                            id="paymentCount">
                        0
                    </span>

                </div>


                <div class="card-body p-0">

                    <div class="table-responsive">

                        <table class="table
                                      table-hover
                                      align-middle
                                      mb-0">

                            <thead class="table-light">

                            <tr>

                                <th>
                                    Payment
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Sale
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th class="text-end">
                                    Amount
                                </th>

                                <th>
                                    Method
                                </th>

                                <th class="text-end">
                                    Balance
                                </th>

                                <th>
                                    Status
                                </th>

                                <th class="text-center">
                                    Action
                                </th>

                            </tr>

                            </thead>

                            <tbody id="paymentTableBody">

                            <tr>

                                <td
                                        colspan="9"
                                        class="text-center py-5">

                                    <div
                                            class="spinner-border
                                                   spinner-border-sm
                                                   text-primary">
                                    </div>

                                    <div class="mt-2 text-muted">
                                        Loading payments...
                                    </div>

                                </td>

                            </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>


        <!-- ======================================================
             PAYMENT DETAILS MODAL
             ====================================================== -->

        <div
                class="modal fade"
                id="paymentDetailsModal"
                tabindex="-1"
                aria-hidden="true">

            <div class="modal-dialog modal-lg modal-dialog-centered">

                <div class="modal-content">

                    <div class="modal-header">

                        <h5 class="modal-title">
                            <i class="bi bi-receipt me-2"></i>
                            Payment Details
                        </h5>

                        <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal">
                        </button>

                    </div>


                    <div
                            class="modal-body"
                            id="paymentDetailsContent">

                    </div>


                    <div class="modal-footer">

                        <button
                                type="button"
                                class="btn btn-secondary"
                                data-bs-dismiss="modal">

                            Close

                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;


    // ============================================================
    // EVENTS
    // ============================================================

    document
        .getElementById("refreshPaymentsButton")
        .addEventListener("click", loadPayments);

    document
        .getElementById("paymentSearch")
        .addEventListener("input", filterPayments);

    document
        .getElementById("paymentMethodFilter")
        .addEventListener("change", filterPayments);

    document
        .getElementById("paymentStatusFilter")
        .addEventListener("change", filterPayments);

    document
        .getElementById("clearPaymentFilters")
        .addEventListener("click", clearFilters);
}


// ============================================================
// LOAD PAYMENTS
// ============================================================

async function loadPayments() {

    const tableBody =
        document.getElementById("paymentTableBody");

    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5">
                    <div class="spinner-border spinner-border-sm"></div>
                    <div class="mt-2 text-muted">
                        Loading payments...
                    </div>
                </td>
            </tr>
        `;


        const response =
            await API.get("/payments");


        if (!response.ok) {

            throw new Error(
                `Failed to load payments (${response.status})`
            );
        }


        payments = await response.json();


        // Safety in case backend eventually returns Page
        if (!Array.isArray(payments)) {

            if (Array.isArray(payments.content)) {
                payments = payments.content;
            } else {
                payments = [];
            }
        }


        renderPayments(payments);
        updateSummary(payments);

    } catch (error) {

        console.error(
            "Error loading payments:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="9"
                    class="text-center text-danger py-5">

                    <i class="bi bi-exclamation-triangle fs-3"></i>

                    <div class="mt-2">
                        Unable to load payments.
                    </div>

                    <button
                            class="btn btn-sm btn-outline-primary mt-3"
                            onclick="loadPayments()">

                        <i class="bi bi-arrow-clockwise me-1"></i>
                        Try Again

                    </button>

                </td>
            </tr>
        `;
    }
}


// ============================================================
// RENDER PAYMENTS
// ============================================================

function renderPayments(list) {

    const tableBody =
        document.getElementById("paymentTableBody");

    const paymentCount =
        document.getElementById("paymentCount");


    paymentCount.textContent =
        list.length;


    if (list.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9"
                    class="text-center py-5 text-muted">

                    <i class="bi bi-cash-stack fs-1 d-block mb-2"></i>

                    No payments found.

                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        list.map(payment => `

            <tr>

                <!-- Payment ID -->

                <td>
                    <strong>
                        #${escapeHtml(payment.id)}
                    </strong>
                </td>


                <!-- Date -->

                <td>
                    <div>
                        ${formatDate(payment.paymentDate)}
                    </div>

                    <small class="text-muted">
                        ${formatTime(payment.paymentDate)}
                    </small>
                </td>


                <!-- Sale -->

                <td>

                    <button
                            type="button"
                            class="btn btn-link p-0 text-decoration-none"
                            onclick="viewPayment(${payment.id})">

                        #${escapeHtml(payment.saleId)}

                    </button>

                    ${
                        payment.receiptNumber
                            ? `
                                <div>
                                    <small class="text-muted">
                                        ${escapeHtml(payment.receiptNumber)}
                                    </small>
                                </div>
                              `
                            : ""
                    }

                </td>


                <!-- Customer -->

                <td>

                    <div class="fw-semibold">
                        ${escapeHtml(payment.customerName || "Walk-in Customer")}
                    </div>

                </td>


                <!-- Amount -->

                <td class="text-end">

                    <strong>
                        ${formatMoney(payment.amount)}
                    </strong>

                </td>


                <!-- Payment Method -->

                <td>

                    <span class="badge ${paymentMethodClass(payment.paymentMethod)}">

                        ${formatPaymentMethod(payment.paymentMethod)}

                    </span>

                </td>


                <!-- Balance -->

                <td class="text-end">

                    <span class="
                        ${Number(payment.balance || 0) > 0
                            ? "text-danger fw-semibold"
                            : "text-success fw-semibold"}">

                        ${formatMoney(payment.balance)}

                    </span>

                </td>


                <!-- Sale Status -->

                <td>

                    ${statusBadge(payment.saleStatus)}

                </td>


                <!-- Action -->

                <td class="text-center">

                    <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            onclick="viewPayment(${payment.id})"
                            title="View payment">

                        <i class="bi bi-eye"></i>

                    </button>

                </td>

            </tr>

        `).join("");
}


// ============================================================
// SUMMARY
// ============================================================

function updateSummary(list) {

    let totalPayments = 0;
    let cashPayments = 0;
    let otherPayments = 0;

    const outstandingSales = new Map();


    list.forEach(payment => {

        const amount =
            Number(payment.amount || 0);

        totalPayments += amount;


        if (payment.paymentMethod === "CASH") {

            cashPayments += amount;

        } else {

            otherPayments += amount;

        }


        // Keep one balance per sale
        if (payment.saleId != null) {

            outstandingSales.set(
                payment.saleId,
                Number(payment.balance || 0)
            );
        }

    });


    let outstandingBalance = 0;

    outstandingSales.forEach(balance => {

        outstandingBalance += balance;

    });


    document.getElementById("totalPayments")
        .textContent = formatMoney(totalPayments);

    document.getElementById("cashPayments")
        .textContent = formatMoney(cashPayments);

    document.getElementById("otherPayments")
        .textContent = formatMoney(otherPayments);

    document.getElementById("outstandingBalance")
        .textContent = formatMoney(outstandingBalance);
}


// ============================================================
// FILTER
// ============================================================

function filterPayments() {

    const search =
        document.getElementById("paymentSearch")
            .value
            .trim()
            .toLowerCase();


    const method =
        document.getElementById("paymentMethodFilter")
            .value;


    const status =
        document.getElementById("paymentStatusFilter")
            .value;


    const filtered =
        payments.filter(payment => {

            const searchText = [

                payment.id,
                payment.saleId,
                payment.customerName,
                payment.receiptNumber,
                payment.reference

            ]
                .filter(value => value != null)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchText.includes(search);


            const matchesMethod =
                !method ||
                payment.paymentMethod === method;


            const matchesStatus =
                !status ||
                payment.saleStatus === status;


            return (
                matchesSearch &&
                matchesMethod &&
                matchesStatus
            );
        });


    renderPayments(filtered);
}


// ============================================================
// CLEAR FILTERS
// ============================================================

function clearFilters() {

    document.getElementById("paymentSearch").value = "";

    document.getElementById("paymentMethodFilter").value = "";

    document.getElementById("paymentStatusFilter").value = "";

    renderPayments(payments);
}


// ============================================================
// VIEW PAYMENT
// ============================================================

window.viewPayment = async function (paymentId) {

    const modalElement =
        document.getElementById("paymentDetailsModal");

    const content =
        document.getElementById("paymentDetailsContent");


    content.innerHTML = `
        <div class="text-center py-4">

            <div class="spinner-border text-primary"></div>

            <div class="mt-2 text-muted">
                Loading payment...
            </div>

        </div>
    `;


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );

    modal.show();


    try {

        const response =
            await API.get(`/payments/${paymentId}`);


        if (!response.ok) {
            throw new Error(
                `Failed to load payment (${response.status})`
            );
        }


        const payment =
            await response.json();


        content.innerHTML =
            createPaymentDetails(payment);


    } catch (error) {

        console.error(error);

        content.innerHTML = `
            <div class="alert alert-danger">

                <i class="bi bi-exclamation-triangle me-2"></i>

                Unable to load payment details.

            </div>
        `;
    }
};


// ============================================================
// PAYMENT DETAILS HTML
// ============================================================

function createPaymentDetails(payment) {

    return `

        <div class="row g-3">

            <!-- Payment -->

            <div class="col-12 col-md-6">

                <div class="card bg-light border-0">

                    <div class="card-body">

                        <small class="text-muted">
                            Payment ID
                        </small>

                        <h5 class="mb-0">
                            #${escapeHtml(payment.id)}
                        </h5>

                    </div>

                </div>

            </div>


            <!-- Sale -->

            <div class="col-12 col-md-6">

                <div class="card bg-light border-0">

                    <div class="card-body">

                        <small class="text-muted">
                            Sale
                        </small>

                        <h5 class="mb-0">
                            #${escapeHtml(payment.saleId)}
                        </h5>

                        ${
                            payment.receiptNumber
                                ? `
                                    <small class="text-muted">
                                        ${escapeHtml(payment.receiptNumber)}
                                    </small>
                                  `
                                : ""
                        }

                    </div>

                </div>

            </div>


            <!-- Customer -->

            <div class="col-12">

                <div class="card border-0 bg-light">

                    <div class="card-body">

                        <small class="text-muted">
                            Customer
                        </small>

                        <div class="fw-semibold">
                            ${escapeHtml(
                                payment.customerName ||
                                "Walk-in Customer"
                            )}
                        </div>

                    </div>

                </div>

            </div>


            <!-- Amount -->

            <div class="col-12 col-md-6">

                <div class="card border-0 bg-light">

                    <div class="card-body">

                        <small class="text-muted">
                            Payment Amount
                        </small>

                        <h4 class="mb-0">
                            ${formatMoney(payment.amount)}
                        </h4>

                    </div>

                </div>

            </div>


            <!-- Method -->

            <div class="col-12 col-md-6">

                <div class="card border-0 bg-light">

                    <div class="card-body">

                        <small class="text-muted">
                            Payment Method
                        </small>

                        <div class="mt-1">

                            <span class="badge ${paymentMethodClass(payment.paymentMethod)}">

                                ${formatPaymentMethod(
                                    payment.paymentMethod
                                )}

                            </span>

                        </div>

                    </div>

                </div>

            </div>


            <!-- Sale Financial Information -->

            <div class="col-12">

                <hr>

                <h6 class="mb-3">
                    Sale Information
                </h6>

            </div>


            <div class="col-4">

                <small class="text-muted">
                    Sale Total
                </small>

                <div class="fw-semibold">
                    ${formatMoney(payment.saleTotal)}
                </div>

            </div>


            <div class="col-4">

                <small class="text-muted">
                    Paid
                </small>

                <div class="fw-semibold text-success">
                    ${formatMoney(payment.paidAmount)}
                </div>

            </div>


            <div class="col-4">

                <small class="text-muted">
                    Balance
                </small>

                <div class="fw-semibold ${
                    Number(payment.balance || 0) > 0
                        ? "text-danger"
                        : "text-success"
                }">

                    ${formatMoney(payment.balance)}

                </div>

            </div>


            <!-- Date -->

            <div class="col-12 col-md-6">

                <small class="text-muted">
                    Payment Date
                </small>

                <div>
                    ${formatDate(payment.paymentDate)}
                    ${formatTime(payment.paymentDate)}
                </div>

            </div>


            <!-- Status -->

            <div class="col-12 col-md-6">

                <small class="text-muted">
                    Sale Status
                </small>

                <div class="mt-1">

                    ${statusBadge(payment.saleStatus)}

                </div>

            </div>


            <!-- Reference -->

            ${
                payment.reference
                    ? `
                        <div class="col-12">

                            <small class="text-muted">
                                Reference
                            </small>

                            <div>
                                ${escapeHtml(payment.reference)}
                            </div>

                        </div>
                      `
                    : ""
            }


            <!-- Notes -->

            ${
                payment.notes
                    ? `
                        <div class="col-12">

                            <small class="text-muted">
                                Notes
                            </small>

                            <div>
                                ${escapeHtml(payment.notes)}
                            </div>

                        </div>
                      `
                    : ""
            }

        </div>
    `;
}


// ============================================================
// PAYMENT METHOD
// ============================================================

function formatPaymentMethod(method) {

    if (!method) {
        return "Unknown";
    }

    return method
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}


function paymentMethodClass(method) {

    switch (method) {

        case "CASH":
            return "text-bg-success";

        case "CARD":
            return "text-bg-primary";

        case "MOBILE_MONEY":
            return "text-bg-info";

        case "BANK_TRANSFER":
            return "text-bg-secondary";

        default:
            return "text-bg-dark";
    }
}


// ============================================================
// SALE STATUS
// ============================================================

function statusBadge(status) {

    switch (status) {

        case "PAID":

            return `
                <span class="badge text-bg-success">
                    Paid
                </span>
            `;


        case "PARTIAL":

            return `
                <span class="badge text-bg-warning">
                    Partial
                </span>
            `;


        case "UNPAID":

            return `
                <span class="badge text-bg-danger">
                    Unpaid
                </span>
            `;


        case "CANCELLED":

            return `
                <span class="badge text-bg-secondary">
                    Cancelled
                </span>
            `;


        default:

            return `
                <span class="badge text-bg-secondary">
                    ${escapeHtml(status || "Unknown")}
                </span>
            `;
    }
}


// ============================================================
// MONEY
// ============================================================

function formatMoney(value) {

    const number =
        Number(value || 0);

    return number.toFixed(2);
}


// ============================================================
// DATE
// ============================================================

function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString();
}


function formatTime(value) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}