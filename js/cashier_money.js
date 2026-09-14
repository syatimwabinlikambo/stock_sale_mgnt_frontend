document.addEventListener("DOMContentLoaded", async () => {

    Session.requireRole("CASHIER");

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
                        <i class="bi bi-cash-coin me-2"></i>
                        Cash Verification
                    </h3>

                    <p class="text-muted mb-0">
                        Verify money submissions from managers.
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

                <div class="col-md-6">

                    <div class="card shadow-sm">

                        <div class="card-body">

                            <small class="text-muted">
                                Awaiting Verification
                            </small>

                            <h2 id="pendingCount">
                                0
                            </h2>

                        </div>

                    </div>

                </div>


                <div class="col-md-6">

                    <div class="card shadow-sm">

                        <div class="card-body">

                            <small class="text-muted">
                                Total Records
                            </small>

                            <h2 id="totalCount">
                                0
                            </h2>

                        </div>

                    </div>

                </div>

            </div>


            <!-- TABLE -->

            <div class="card shadow-sm">

                <div class="card-header">
                    <strong>
                        Pending Cash Verification
                    </strong>
                </div>

                <div class="table-responsive">

                    <table class="table table-hover
                                  align-middle mb-0">

                        <thead class="table-light">

                            <tr>
                                <th>Date</th>
                                <th>Manager</th>
                                <th>Purpose</th>
                                <th>Amount</th>
                                <th>Reference</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody id="moneyTableBody">

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

        </div>


        <!-- DECISION MODAL -->

        <div class="modal fade"
             id="decisionModal"
             tabindex="-1">

            <div class="modal-dialog">

                <div class="modal-content">

                    <div class="modal-header">

                        <h5 class="modal-title">
                            Cash Verification
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
                                  placeholder="Enter verification comment...">
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


    let records = [];
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


    async function loadRecords() {

        try {

            const response =
                await API.get(
                    "/money-tracing/pending-cashier"
                );

            if (!response.ok) {

                if (response.status === 401) {
                    Session.logout();
                    return;
                }

                throw new Error(
                    "Unable to load pending cash requests."
                );
            }

            records = await response.json();

            if (!Array.isArray(records)) {
                records = [];
            }

            console.log(
                "Pending cashier records:",
                records
            );

            render();

        } catch (error) {

            console.error(
                "Cashier money load error:",
                error
            );

            document.getElementById(
                "moneyTableBody"
            ).innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-danger py-4">

                    Failed to load pending requests.

                </td>
            </tr>
        `;
        }
    }

    function render() {

        document.getElementById("pendingCount")
            .textContent = records.length;

        document.getElementById("totalCount")
            .textContent = records.length;


        const tbody =
            document.getElementById("moneyTableBody");


        if (!records.length) {

            tbody.innerHTML = `

                <tr>

                    <td colspan="6"
                        class="text-center text-muted py-5">

                        <i class="bi bi-check-circle fs-2"></i>

                        <div class="mt-2">
                            No money requests awaiting verification.
                        </div>

                    </td>

                </tr>

            `;

            return;
        }


        tbody.innerHTML =
            records.map(record => `

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
                        ${escapeHtml(record.purpose)}
                    </td>

                    <td>
                        <strong>
                            ${formatAmount(record.amount)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                record.reference || "-"
            )}
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


    window.openDecision = function (id) {

        selectedRecord =
            records.find(record => record.id === id);

        if (!selectedRecord) return;


        document.getElementById("decisionInfo")
            .innerHTML = `

                <div class="border rounded p-3">

                    <div class="row g-2">

                        <div class="col-6">
                            <small class="text-muted">
                                Manager
                            </small>

                            <div>
                                ${escapeHtml(
                selectedRecord.submittedByName
            )}
                            </div>
                        </div>


                        <div class="col-6">
                            <small class="text-muted">
                                Amount
                            </small>

                            <div class="fw-bold">
                                ${formatAmount(
                selectedRecord.amount
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

                    </div>

                </div>
            `;


        document.getElementById("decisionComment").value = "";
        document.getElementById("decisionAlert").innerHTML = "";


        new bootstrap.Modal(
            document.getElementById("decisionModal")
        ).show();
    };


    async function processDecision(decision) {

        if (!selectedRecord) return;


        const comment =
            document.getElementById("decisionComment")
                .value
                .trim();


        const approveBtn =
            document.getElementById("approveBtn");

        const rejectBtn =
            document.getElementById("rejectBtn");


        try {

            approveBtn.disabled = true;
            rejectBtn.disabled = true;


            const response = await API.put(
                `/money-tracing/${selectedRecord.id}/cashier-decision`,
                {
                    decision: decision,
                    comment: comment
                }
            );

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Failed to process cashier decision."
                );
            }

            const modal =
                bootstrap.Modal.getInstance(
                    document.getElementById("decisionModal")
                );

            modal.hide();


            await loadRecords();


        } catch (error) {

            console.error(error);

            document.getElementById("decisionAlert")
                .innerHTML = `

                    <div class="alert alert-danger">

                        Failed to process the request.

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
            loadRecords
        );


    await loadRecords();

});