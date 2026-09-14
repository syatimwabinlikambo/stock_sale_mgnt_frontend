document.addEventListener("DOMContentLoaded", async () => {

    Session.requireRole("ADMIN");

    renderLayout();

    const pageContent =
        document.getElementById("pageContent");

    if (!pageContent) {
        console.error("pageContent element not found");
        return;
    }


    pageContent.innerHTML = `

        <div class="container-fluid">

            <div class="d-flex flex-wrap
                        justify-content-between
                        align-items-center mb-4">

                <div>

                    <h3 class="mb-1">
                        <i class="bi bi-shield-check me-2"></i>
                        Money Approval
                    </h3>

                    <p class="text-muted mb-0">
                        Final approval and money audit trail.
                    </p>

                </div>


                <button id="refreshBtn"
                        class="btn btn-outline-secondary">

                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Refresh

                </button>

            </div>


            <!-- SUMMARY -->

            <div class="row g-3 mb-4">

                <div class="col-md-4">

                    <div class="card shadow-sm">

                        <div class="card-body">

                            <small class="text-muted">
                                Awaiting Approval
                            </small>

                            <h2 id="pendingCount">
                                0
                            </h2>

                        </div>

                    </div>

                </div>


                <div class="col-md-4">

                    <div class="card shadow-sm">

                        <div class="card-body">

                            <small class="text-muted">
                                Completed
                            </small>

                            <h2 id="completedCount">
                                0
                            </h2>

                        </div>

                    </div>

                </div>


                <div class="col-md-4">

                    <div class="card shadow-sm">

                        <div class="card-body">

                            <small class="text-muted">
                                Rejected
                            </small>

                            <h2 id="rejectedCount">
                                0
                            </h2>

                        </div>

                    </div>

                </div>

            </div>


            <!-- PENDING ADMIN -->

            <div class="card shadow-sm mb-4">

                <div class="card-header">

                    <strong>
                        Awaiting Final Approval
                    </strong>

                </div>


                <div class="table-responsive">

                    <table class="table table-hover
                                  align-middle mb-0">

                        <thead class="table-light">

                            <tr>

                                <th>Date</th>
                                <th>Manager</th>
                                <th>Cashier</th>
                                <th>Purpose</th>
                                <th>Amount</th>
                                <th>Action</th>

                            </tr>

                        </thead>


                        <tbody id="pendingTableBody">

                            <tr>

                                <td colspan="6"
                                    class="text-center py-4">

                                    Loading...

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>


            <!-- AUDIT TRAIL -->

            <div class="card shadow-sm">

                <div class="card-header">

                    <strong>
                        Money Audit Trail
                    </strong>

                </div>


                <div class="table-responsive">

                    <table class="table table-hover
                                  align-middle mb-0">

                        <thead class="table-light">

                            <tr>

                                <th>Date</th>
                                <th>Purpose</th>
                                <th>Amount</th>
                                <th>Manager</th>
                                <th>Cashier</th>
                                <th>Admin</th>
                                <th>Status</th>

                            </tr>

                        </thead>


                        <tbody id="auditTableBody">

                            <tr>

                                <td colspan="7"
                                    class="text-center py-4">

                                    Loading...

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>


        <!-- DECISION MODAL -->

        <div class="modal fade"
             id="decisionModal"
             tabindex="-1">

            <div class="modal-dialog">

                <div class="modal-content">

                    <div class="modal-header">

                        <h5 class="modal-title">
                            Final Money Approval
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal">
                        </button>

                    </div>


                    <div class="modal-body">

                        <div id="decisionAlert"></div>

                        <div id="decisionInfo"
                             class="mb-3">
                        </div>


                        <label class="form-label">
                            Comment
                        </label>

                        <textarea id="decisionComment"
                                  class="form-control"
                                  rows="4"
                                  maxlength="500"
                                  placeholder="Enter final approval comment...">
                        </textarea>

                    </div>


                    <div class="modal-footer">

                        <button type="button"
                                class="btn btn-secondary"
                                data-bs-dismiss="modal">

                            Cancel

                        </button>

                        <button id="rejectBtn"
                                class="btn btn-danger">

                            <i class="bi bi-x-circle me-1"></i>
                            Reject

                        </button>

                        <button id="approveBtn"
                                class="btn btn-success">

                            <i class="bi bi-check-circle me-1"></i>
                            Approve

                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;


    let pendingRecords = [];
    let allRecords = [];
    let selectedRecord = null;


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


    function statusBadge(status) {

        const classes = {

            PENDING_CASHIER:
                "bg-warning text-dark",

            PENDING_ADMIN:
                "bg-info text-dark",

            COMPLETED:
                "bg-success",

            REJECTED:
                "bg-danger"

        };

        return `
            <span class="badge ${classes[status] || "bg-secondary"}">
                ${status
                ? status.replaceAll("_", " ")
                : "-"}
            </span>
        `;
    }


    async function loadData() {

        try {

            // const pendingResponse =
            //     await API.get(
            //         "/money-tracing/pending-admin"
            //     );

            // pendingRecords =
            //     Array.isArray(pendingResponse)
            //         ? pendingResponse
            //         : [];


            // const allResponse =
            //     await API.get("/money-tracing");

            // allRecords =
            //     Array.isArray(allResponse)
            //         ? allResponse
            //         : [];


            // renderPending();
            // renderAudit();
            // updateSummary();

            const pendingResponse =
                await API.get(
                    "/money-tracing/pending-admin"
                );

            if (!pendingResponse.ok) {

                if (pendingResponse.status === 401) {
                    Session.logout();
                    return;
                }

                throw new Error(
                    "Unable to load pending admin requests."
                );
            }

            pendingRecords =
                await pendingResponse.json();

            if (!Array.isArray(pendingRecords)) {
                pendingRecords = [];
            }


            const allResponse =
                await API.get(
                    "/money-tracing"
                );

            if (!allResponse.ok) {

                if (allResponse.status === 401) {
                    Session.logout();
                    return;
                }

                throw new Error(
                    "Unable to load money audit records."
                );
            }

            allRecords =
                await allResponse.json();

            if (!Array.isArray(allRecords)) {
                allRecords = [];
            }


            console.log(
                "Pending admin records:",
                pendingRecords
            );

            console.log(
                "All money records:",
                allRecords
            );


            renderPending();
            renderAudit();
            updateSummary();


        } catch (error) {

            console.error(error);

        }

    }


    function updateSummary() {

        document.getElementById("pendingCount")
            .textContent =
            pendingRecords.length;


        document.getElementById("completedCount")
            .textContent =
            allRecords.filter(
                r => r.status === "COMPLETED"
            ).length;


        document.getElementById("rejectedCount")
            .textContent =
            allRecords.filter(
                r => r.status === "REJECTED"
            ).length;
    }


    function renderPending() {

        const tbody =
            document.getElementById(
                "pendingTableBody"
            );


        if (!pendingRecords.length) {

            tbody.innerHTML = `

                <tr>

                    <td colspan="6"
                        class="text-center text-muted py-5">

                        <i class="bi bi-check-circle fs-2"></i>

                        <div class="mt-2">
                            No requests awaiting final approval.
                        </div>

                    </td>

                </tr>
            `;

            return;
        }


        tbody.innerHTML =
            pendingRecords.map(record => `

                <tr>

                    <td>
                        ${formatDate(record.submittedAt)}
                    </td>

                    <td>
                        ${escapeHtml(
                record.submittedByName || "-"
            )}
                    </td>

                    <td>
                        ${escapeHtml(
                record.cashierName || "-"
            )}
                    </td>

                    <td>
                        ${escapeHtml(record.purpose)}
                    </td>

                    <td>
                        <strong>
                            ${formatAmount(record.amount)}
                        </strong>
                    </td>

                    <td>

                        <button
                            class="btn btn-sm btn-primary"
                            onclick="openDecision(${record.id})">

                            <i class="bi bi-eye me-1"></i>
                            Review

                        </button>

                    </td>

                </tr>

            `).join("");
    }


    function renderAudit() {

        const tbody =
            document.getElementById(
                "auditTableBody"
            );


        if (!allRecords.length) {

            tbody.innerHTML = `

                <tr>

                    <td colspan="7"
                        class="text-center text-muted py-4">

                        No money records found.

                    </td>

                </tr>
            `;

            return;
        }


        tbody.innerHTML =
            allRecords.map(record => `

                <tr>

                    <td>
                        ${formatDate(record.submittedAt)}
                    </td>

                    <td>
                        ${escapeHtml(record.purpose)}
                    </td>

                    <td>
                        <strong>
                            ${formatAmount(record.amount)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                record.submittedByName || "-"
            )}
                    </td>

                    <td>
                        ${escapeHtml(
                record.cashierName || "-"
            )}
                    </td>

                    <td>
                        ${escapeHtml(
                record.adminName || "-"
            )}
                    </td>

                    <td>
                        ${statusBadge(record.status)}
                    </td>

                </tr>

            `).join("");
    }


    window.openDecision = function (id) {

        selectedRecord =
            pendingRecords.find(
                record => record.id === id
            );


        if (!selectedRecord) return;


        document.getElementById("decisionInfo")
            .innerHTML = `

                <div class="border rounded p-3">

                    <div class="row g-3">

                        <div class="col-md-6">

                            <small class="text-muted">
                                Manager
                            </small>

                            <div>
                                ${escapeHtml(
                selectedRecord.submittedByName
            )}
                            </div>

                        </div>


                        <div class="col-md-6">

                            <small class="text-muted">
                                Cashier
                            </small>

                            <div>
                                ${escapeHtml(
                selectedRecord.cashierName || "-"
            )}
                            </div>

                        </div>


                        <div class="col-md-6">

                            <small class="text-muted">
                                Amount
                            </small>

                            <div class="fw-bold">
                                ${formatAmount(
                selectedRecord.amount
            )}
                            </div>

                        </div>


                        <div class="col-md-6">

                            <small class="text-muted">
                                Reference
                            </small>

                            <div>
                                ${escapeHtml(
                selectedRecord.reference || "-"
            )}
                            </div>

                        </div>


                        <div class="col-12">

                            <small class="text-muted">
                                Purpose
                            </small>

                            <div>
                                ${escapeHtml(
                selectedRecord.purpose
            )}
                            </div>

                        </div>


                        <div class="col-12">

                            <small class="text-muted">
                                Notes
                            </small>

                            <div>
                                ${escapeHtml(
                selectedRecord.notes || "-"
            )}
                            </div>

                        </div>


                        <div class="col-12">

                            <hr>

                            <small class="text-muted">
                                Cashier Comment
                            </small>

                            <div>
                                ${escapeHtml(
                selectedRecord.cashierComment || "-"
            )}
                            </div>

                        </div>

                    </div>

                </div>
            `;


        document.getElementById("decisionComment")
            .value = "";

        document.getElementById("decisionAlert")
            .innerHTML = "";


        new bootstrap.Modal(
            document.getElementById("decisionModal")
        ).show();
    };


    async function processDecision(decision) {

        if (!selectedRecord) return;


        const comment =
            document.getElementById(
                "decisionComment"
            ).value.trim();


        const approveBtn =
            document.getElementById(
                "approveBtn"
            );

        const rejectBtn =
            document.getElementById(
                "rejectBtn"
            );


        try {

            approveBtn.disabled = true;
            rejectBtn.disabled = true;


            await API.put(
                `/money-tracing/${selectedRecord.id}/admin-decision`,
                {
                    decision: decision,
                    comment: comment
                }
            );


            bootstrap.Modal.getInstance(
                document.getElementById("decisionModal")
            ).hide();


            await loadData();


        } catch (error) {

            console.error(error);

            document.getElementById(
                "decisionAlert"
            ).innerHTML = `

                <div class="alert alert-danger">
                    Failed to process final decision.
                </div>

            `;

        } finally {

            approveBtn.disabled = false;
            rejectBtn.disabled = false;

        }
    }


    document.getElementById("approveBtn")
        .addEventListener(
            "click",
            () => processDecision("APPROVED")
        );


    document.getElementById("rejectBtn")
        .addEventListener(
            "click",
            () => processDecision("REJECTED")
        );


    document.getElementById("refreshBtn")
        .addEventListener(
            "click",
            loadData
        );


    await loadData();

});