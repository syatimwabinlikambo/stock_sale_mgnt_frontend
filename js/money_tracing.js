document.addEventListener("DOMContentLoaded", async () => {

    // ---------------------------------------------------------
    // AUTHORIZATION
    // ---------------------------------------------------------
    Session.requireRole("MANAGER");

    // IMPORTANT:
    // layout.js must run before we access #pageContent
    renderLayout();

    const pageContent = document.getElementById("pageContent");

    if (!pageContent) {
        console.error("pageContent element not found");
        return;
    }

    // ---------------------------------------------------------
    // PAGE
    // ---------------------------------------------------------
    pageContent.innerHTML = `
        <div class="container-fluid">

            <!-- HEADER -->
            <div class="d-flex flex-wrap justify-content-between
                        align-items-center mb-4">

                <div>
                    <h3 class="mb-1">
                        <i class="bi bi-cash-stack me-2"></i>
                        Money Tracing
                    </h3>

                    <p class="text-muted mb-0">
                        Submit and track money requests.
                    </p>
                </div>

                <button class="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#moneyModal">
                    <i class="bi bi-plus-circle me-1"></i>
                    New Submission
                </button>

            </div>


            <!-- SUMMARY -->
            <div class="row g-3 mb-4">

                <div class="col-md-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">

                            <div class="d-flex justify-content-between">
                                <div>
                                    <small class="text-muted">
                                        Pending Cashier
                                    </small>

                                    <h3 id="pendingCashierCount"
                                        class="mb-0">
                                        0
                                    </h3>
                                </div>

                                <i class="bi bi-hourglass-split
                                          fs-2 text-warning"></i>
                            </div>

                        </div>
                    </div>
                </div>


                <div class="col-md-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">

                            <div class="d-flex justify-content-between">
                                <div>
                                    <small class="text-muted">
                                        Pending Admin
                                    </small>

                                    <h3 id="pendingAdminCount"
                                        class="mb-0">
                                        0
                                    </h3>
                                </div>

                                <i class="bi bi-shield-exclamation
                                          fs-2 text-info"></i>
                            </div>

                        </div>
                    </div>
                </div>


                <div class="col-md-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">

                            <div class="d-flex justify-content-between">
                                <div>
                                    <small class="text-muted">
                                        Completed
                                    </small>

                                    <h3 id="completedCount"
                                        class="mb-0">
                                        0
                                    </h3>
                                </div>

                                <i class="bi bi-check-circle
                                          fs-2 text-success"></i>
                            </div>

                        </div>
                    </div>
                </div>

            </div>


            <!-- FILTER -->
            <div class="card shadow-sm mb-4">

                <div class="card-body">

                    <div class="row g-3">

                        <div class="col-md-6">
                            <label class="form-label">
                                Search
                            </label>

                            <input type="text"
                                   id="searchInput"
                                   class="form-control"
                                   placeholder="Purpose, reference...">
                        </div>


                        <div class="col-md-4">

                            <label class="form-label">
                                Status
                            </label>

                            <select id="statusFilter"
                                    class="form-select">

                                <option value="ALL">
                                    All statuses
                                </option>

                                <option value="PENDING_CASHIER">
                                    Pending Cashier
                                </option>

                                <option value="PENDING_ADMIN">
                                    Pending Admin
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                                <option value="REJECTED">
                                    Rejected
                                </option>

                            </select>

                        </div>


                        <div class="col-md-2 d-flex align-items-end">

                            <button id="refreshBtn"
                                    class="btn btn-outline-secondary w-100">

                                <i class="bi bi-arrow-clockwise me-1"></i>
                                Refresh

                            </button>

                        </div>

                    </div>

                </div>

            </div>


            <!-- TABLE -->
            <div class="card shadow-sm">

                <div class="card-header d-flex
                            justify-content-between
                            align-items-center">

                    <strong>
                        My Money Submissions
                    </strong>

                    <span id="recordCount"
                          class="badge bg-secondary">
                        0
                    </span>

                </div>


                <div class="table-responsive">

                    <table class="table table-hover
                                  align-middle mb-0">

                        <thead class="table-light">

                            <tr>
                                <th>Date</th>
                                <th>Purpose</th>
                                <th>Amount</th>
                                <th>Reference</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>

                        </thead>

                        <tbody id="moneyTableBody">

                            <tr>
                                <td colspan="6"
                                    class="text-center text-muted py-4">

                                    Loading...

                                </td>
                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>


        <!-- =================================================
             NEW MONEY MODAL
        ================================================== -->

        <div class="modal fade"
             id="moneyModal"
             tabindex="-1">

            <div class="modal-dialog modal-lg">

                <div class="modal-content">

                    <div class="modal-header">

                        <h5 class="modal-title">
                            <i class="bi bi-cash-stack me-2"></i>
                            New Money Submission
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal">
                        </button>

                    </div>


                    <form id="moneyForm">

                        <div class="modal-body">

                            <div id="formAlert"></div>


                            <div class="row g-3">

                                <div class="col-md-6">

                                    <label class="form-label">
                                        Amount *
                                    </label>

                                    <input type="number"
                                           id="amount"
                                           class="form-control"
                                           min="0.01"
                                           step="0.01"
                                           required>

                                </div>


                                <div class="col-md-6">

                                    <label class="form-label">
                                        Reference
                                    </label>

                                    <input type="text"
                                           id="reference"
                                           class="form-control"
                                           maxlength="100"
                                           placeholder="Optional reference">

                                </div>


                                <div class="col-12">

                                    <label class="form-label">
                                        Purpose *
                                    </label>

                                    <input type="text"
                                           id="purpose"
                                           class="form-control"
                                           maxlength="250"
                                           required
                                           placeholder="Why is this money being submitted?">

                                </div>


                                <div class="col-12">

                                    <label class="form-label">
                                        Notes
                                    </label>

                                    <textarea id="notes"
                                              class="form-control"
                                              rows="3"
                                              maxlength="500"
                                              placeholder="Additional information">
                                    </textarea>

                                </div>

                            </div>

                        </div>


                        <div class="modal-footer">

                            <button type="button"
                                    class="btn btn-secondary"
                                    data-bs-dismiss="modal">

                                Cancel

                            </button>

                            <button type="submit"
                                    id="submitBtn"
                                    class="btn btn-primary">

                                <i class="bi bi-send me-1"></i>
                                Submit

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>


        <!-- =================================================
             DETAILS MODAL
        ================================================== -->

        <div class="modal fade"
             id="detailsModal"
             tabindex="-1">

            <div class="modal-dialog modal-lg">

                <div class="modal-content">

                    <div class="modal-header">

                        <h5 class="modal-title">
                            Money Tracing Details
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal">
                        </button>

                    </div>

                    <div class="modal-body"
                         id="detailsBody">

                    </div>

                </div>

            </div>

        </div>
    `;


    // ---------------------------------------------------------
    // STATE
    // ---------------------------------------------------------
    let records = [];


    // ---------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------
    function formatAmount(amount) {

        return Number(amount || 0).toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    }


    function formatDate(value) {

        if (!value) return "-";

        return new Date(value).toLocaleString();
    }


    function statusBadge(status) {

        const classes = {
            PENDING_CASHIER: "bg-warning text-dark",
            PENDING_ADMIN: "bg-info text-dark",
            COMPLETED: "bg-success",
            REJECTED: "bg-danger"
        };

        return `
            <span class="badge ${classes[status] || "bg-secondary"}">
                ${status ? status.replaceAll("_", " ") : "-"}
            </span>
        `;
    }


    function escapeHtml(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    // ---------------------------------------------------------
    // LOAD
    // ---------------------------------------------------------
    // async function loadMoneyTracing() {

    //     try {

    //         const response =
    //             await API.get("/money-tracing");

    //         records = Array.isArray(response)
    //             ? response
    //             : [];

    //         render();

    //     } catch (error) {

    //         console.error(error);

    //         document.getElementById("moneyTableBody").innerHTML = `
    //             <tr>
    //                 <td colspan="6"
    //                     class="text-center text-danger py-4">

    //                     Failed to load money tracing records.

    //                 </td>
    //             </tr>
    //         `;
    //     }
    // }
    async function loadMoneyTracing() {

        try {

            const response =
                await API.get("/money-tracing");

            if (!response.ok) {

                if (response.status === 401) {
                    Session.logout();
                    return;
                }

                throw new Error(
                    "Unable to load money tracing records."
                );
            }

            records = await response.json();

            if (!Array.isArray(records)) {
                records = [];
            }

            console.log("Money tracing records:", records);

            render();

        } catch (error) {

            console.error(
                "Money tracing load error:",
                error
            );

            document.getElementById(
                "moneyTableBody"
            ).innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-danger py-4">

                    Unable to load money tracing records.

                </td>
            </tr>
        `;
        }
    }


    // ---------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------
    function render() {

        updateSummary();

        const search =
            document.getElementById("searchInput")
                .value
                .toLowerCase()
                .trim();

        const status =
            document.getElementById("statusFilter").value;


        const filtered = records.filter(record => {

            const matchesSearch =
                !search ||
                (record.purpose || "")
                    .toLowerCase()
                    .includes(search) ||
                (record.reference || "")
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                status === "ALL" ||
                record.status === status;


            return matchesSearch && matchesStatus;

        });


        document.getElementById("recordCount")
            .textContent = filtered.length;


        const tbody =
            document.getElementById("moneyTableBody");


        if (!filtered.length) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="text-center text-muted py-4">

                        No money submissions found.

                    </td>
                </tr>
            `;

            return;
        }


        tbody.innerHTML = filtered.map(record => `

            <tr>

                <td>
                    ${formatDate(record.submittedAt)}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(record.purpose)}
                    </strong>
                </td>

                <td>
                    <strong>
                        ${formatAmount(record.amount)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(record.reference || "-")}
                </td>

                <td>
                    ${statusBadge(record.status)}
                </td>

                <td>

                    <button class="btn btn-sm btn-outline-primary"
                            onclick="showMoneyDetails(${record.id})">

                        <i class="bi bi-eye"></i>

                    </button>

                </td>

            </tr>

        `).join("");
    }


    // ---------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------
    function updateSummary() {

        document.getElementById("pendingCashierCount")
            .textContent =
            records.filter(
                r => r.status === "PENDING_CASHIER"
            ).length;


        document.getElementById("pendingAdminCount")
            .textContent =
            records.filter(
                r => r.status === "PENDING_ADMIN"
            ).length;


        document.getElementById("completedCount")
            .textContent =
            records.filter(
                r => r.status === "COMPLETED"
            ).length;
    }


    // ---------------------------------------------------------
    // SUBMIT
    // ---------------------------------------------------------
    document.getElementById("moneyForm")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const submitBtn =
                document.getElementById("submitBtn");

            const alertBox =
                document.getElementById("formAlert");


            const request = {

                amount:
                    Number(document.getElementById("amount").value),

                purpose:
                    document.getElementById("purpose").value.trim(),

                reference:
                    document.getElementById("reference").value.trim(),

                notes:
                    document.getElementById("notes").value.trim()
            };


            try {

                submitBtn.disabled = true;

                submitBtn.innerHTML = `
                    <span class="spinner-border spinner-border-sm me-1"></span>
                    Submitting...
                `;


                await API.post(
                    "/money-tracing",
                    request
                );


                alertBox.innerHTML = `
                    <div class="alert alert-success">
                        Money submission created successfully.
                    </div>
                `;


                document.getElementById("moneyForm").reset();


                setTimeout(() => {

                    const modal =
                        bootstrap.Modal.getInstance(
                            document.getElementById("moneyModal")
                        );

                    modal.hide();

                    alertBox.innerHTML = "";

                    loadMoneyTracing();

                }, 700);


            } catch (error) {

                console.error(error);

                alertBox.innerHTML = `
                    <div class="alert alert-danger">
                        Failed to submit money request.
                    </div>
                `;

            } finally {

                submitBtn.disabled = false;

                submitBtn.innerHTML = `
                    <i class="bi bi-send me-1"></i>
                    Submit
                `;
            }

        });


    // ---------------------------------------------------------
    // DETAILS
    // ---------------------------------------------------------
    window.showMoneyDetails = function (id) {

        const record =
            records.find(r => r.id === id);

        if (!record) return;


        document.getElementById("detailsBody").innerHTML = `

            <div class="row g-3">

                <div class="col-md-6">
                    <strong>Amount</strong>
                    <div>
                        ${formatAmount(record.amount)}
                    </div>
                </div>

                <div class="col-md-6">
                    <strong>Status</strong>
                    <div>
                        ${statusBadge(record.status)}
                    </div>
                </div>

                <div class="col-md-12">
                    <strong>Purpose</strong>
                    <div>
                        ${escapeHtml(record.purpose)}
                    </div>
                </div>

                <div class="col-md-6">
                    <strong>Reference</strong>
                    <div>
                        ${escapeHtml(record.reference || "-")}
                    </div>
                </div>

                <div class="col-md-6">
                    <strong>Submitted At</strong>
                    <div>
                        ${formatDate(record.submittedAt)}
                    </div>
                </div>

                <div class="col-12">
                    <strong>Notes</strong>
                    <div>
                        ${escapeHtml(record.notes || "-")}
                    </div>
                </div>

                <hr>

                <div class="col-md-6">

                    <strong>Cashier</strong>

                    <div>
                        ${escapeHtml(record.cashierName || "Not processed")}
                    </div>

                    <div class="mt-1">
                        ${record.cashierDecision
                ? statusBadge(record.cashierDecision)
                : ""}
                    </div>

                    <small class="text-muted">
                        ${escapeHtml(record.cashierComment || "")}
                    </small>

                </div>


                <div class="col-md-6">

                    <strong>Administrator</strong>

                    <div>
                        ${escapeHtml(record.adminName || "Not processed")}
                    </div>

                    <div class="mt-1">
                        ${record.adminDecision
                ? statusBadge(record.adminDecision)
                : ""}
                    </div>

                    <small class="text-muted">
                        ${escapeHtml(record.adminComment || "")}
                    </small>

                </div>

            </div>

        `;


        new bootstrap.Modal(
            document.getElementById("detailsModal")
        ).show();

    };


    // ---------------------------------------------------------
    // EVENTS
    // ---------------------------------------------------------
    document.getElementById("searchInput")
        .addEventListener("input", render);

    document.getElementById("statusFilter")
        .addEventListener("change", render);

    document.getElementById("refreshBtn")
        .addEventListener("click", loadMoneyTracing);


    // ---------------------------------------------------------
    // INITIAL LOAD
    // ---------------------------------------------------------
    await loadMoneyTracing();

});