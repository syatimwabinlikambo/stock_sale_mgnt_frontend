document.addEventListener("DOMContentLoaded", () => {

    if (!Session.requireRole("MANAGER", "USER")) {
        return;
    }


    renderPaymentsPage();


    const tableBody =
        document.getElementById("paymentsTableBody");

    const searchInput =
        document.getElementById("paymentSearch");

    const totalReceivable =
        document.getElementById("totalReceivable");

    const outstandingCount =
        document.getElementById("outstandingCount");

    const paymentModal =
        new bootstrap.Modal(
            document.getElementById(
                "paymentModal"
            )
        );


    const paymentForm =
        document.getElementById("paymentForm");


    const paymentSaleId =
        document.getElementById("paymentSaleId");

    const paymentAmount =
        document.getElementById("paymentAmount");

    const paymentMethod =
        document.getElementById("paymentMethod");

    const paymentReference =
        document.getElementById("paymentReference");

    const paymentNotes =
        document.getElementById("paymentNotes");

    const paymentFormAlert =
        document.getElementById("paymentFormAlert");


    let sales = [];


    // ============================================================
    // LOAD OUTSTANDING SALES
    // ============================================================

    async function loadOutstandingSales() {

        try {

            const response =
                await API.get(
                    "/sales/outstanding"
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load outstanding sales."
                );
            }


            sales =
                await response.json();


            renderSales(sales);

            updateSummary(sales);

        } catch (error) {

            console.error(error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8"
                        class="text-center text-danger py-4">
                        Unable to load outstanding sales.
                    </td>
                </tr>
            `;
        }
    }


    // ============================================================
    // RENDER SALES
    // ============================================================

    function renderSales(list) {

        if (!list.length) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8"
                        class="text-center py-5">

                        <i class="bi bi-check-circle fs-1 d-block mb-2"></i>

                        No outstanding payments.

                    </td>
                </tr>
            `;

            return;
        }


        tableBody.innerHTML =
            list.map(sale => {

                const status =
                    sale.status || "UNPAID";


                let badge =
                    "bg-secondary";


                if (status === "UNPAID") {
                    badge = "bg-danger";
                }

                if (
                    status === "PARTIAL" ||
                    status === "PARTIALLY_PAID"
                ) {
                    badge = "bg-warning text-dark";
                }

                if (status === "CREDIT") {
                    badge = "bg-info text-dark";
                }


                return `
                    <tr>

                        <td>
                            ${escapeHtml(
                                sale.receiptNumber || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                sale.customerName ||
                                "Walk-in Customer"
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                sale.saleDate
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                sale.total
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                sale.paidAmount
                            )}
                        </td>

                        <td class="fw-bold text-danger">
                            ${formatMoney(
                                sale.balance
                            )}
                        </td>

                        <td>
                            <span class="badge ${badge}">
                                ${escapeHtml(status)}
                            </span>
                        </td>

                        <td class="text-end">

                            <button
                                class="btn btn-sm btn-primary"
                                onclick="openPayment(${sale.id})">

                                <i class="bi bi-cash-coin me-1"></i>

                                Pay

                            </button>

                        </td>

                    </tr>
                `;

            }).join("");
    }


    // ============================================================
    // SUMMARY
    // ============================================================

    function updateSummary(list) {

        const amount =
            list.reduce(
                (sum, sale) =>
                    sum + Number(
                        sale.balance || 0
                    ),
                0
            );


        totalReceivable.textContent =
            formatMoney(amount);


        outstandingCount.textContent =
            list.length;
    }


    // ============================================================
    // OPEN PAYMENT
    // ============================================================

    window.openPayment =
        function (saleId) {

            const sale =
                sales.find(
                    item =>
                        Number(item.id) ===
                        Number(saleId)
                );


            if (!sale) {
                return;
            }


            paymentSaleId.value =
                sale.id;


            paymentAmount.value =
                "";


            paymentAmount.max =
                sale.balance;


            paymentAmount.placeholder =
                `Maximum ${formatMoney(
                    sale.balance
                )}`;


            paymentFormAlert.className =
                "alert d-none";


            paymentFormAlert.textContent =
                "";


            paymentModal.show();
        };


    // ============================================================
    // SUBMIT PAYMENT
    // ============================================================

    paymentForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const saleId =
                Number(
                    paymentSaleId.value
                );


            const amount =
                Number(
                    paymentAmount.value
                );


            if (!amount || amount <= 0) {

                showAlert(
                    "Enter a valid payment amount.",
                    "danger"
                );

                return;
            }


            const sale =
                sales.find(
                    item =>
                        Number(item.id) ===
                        saleId
                );


            if (
                sale &&
                amount >
                Number(sale.balance)
            ) {

                showAlert(
                    "Payment cannot exceed the outstanding balance.",
                    "danger"
                );

                return;
            }


            const data = {

                saleId: saleId,

                amount: amount,

                paymentMethod:
                    paymentMethod.value,

                reference:
                    paymentReference.value.trim(),

                notes:
                    paymentNotes.value.trim()
            };


            try {

                const response =
                    await API.post(
                        "/payments",
                        data
                    );


                if (!response.ok) {

                    throw new Error(
                        await readApiError(
                            response
                        )
                    );
                }


                paymentModal.hide();


                await loadOutstandingSales();


            } catch (error) {

                console.error(error);

                showAlert(
                    error.message,
                    "danger"
                );
            }

        }
    );


    // ============================================================
    // SEARCH
    // ============================================================

    searchInput.addEventListener(
        "input",
        () => {

            const keyword =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (!keyword) {

                renderSales(sales);

                return;
            }


            const filtered =
                sales.filter(
                    sale => {

                        const customer =
                            String(
                                sale.customerName || ""
                            ).toLowerCase();


                        const receipt =
                            String(
                                sale.receiptNumber || ""
                            ).toLowerCase();


                        const status =
                            String(
                                sale.status || ""
                            ).toLowerCase();


                        return (
                            customer.includes(keyword) ||
                            receipt.includes(keyword) ||
                            status.includes(keyword)
                        );
                    }
                );


            renderSales(filtered);
        }
    );


    // ============================================================
    // ALERT
    // ============================================================

    function showAlert(message, type) {

        paymentFormAlert.className =
            `alert alert-${type}`;

        paymentFormAlert.textContent =
            message;
    }


    // ============================================================
    // API ERROR
    // ============================================================

    async function readApiError(response) {

        try {

            const data =
                await response.json();


            return (
                data.message ||
                data.error ||
                "Payment failed."
            );

        } catch {

            return "Payment failed.";
        }
    }


    // ============================================================
    // MONEY
    // ============================================================

    function formatMoney(value) {

        return Number(
            value || 0
        ).toFixed(2);
    }


    // ============================================================
    // DATE
    // ============================================================

    function formatDate(value) {

        if (!value) {
            return "-";
        }

        return new Date(value)
            .toLocaleString();
    }


    // ============================================================
    // ESCAPE HTML
    // ============================================================

    function escapeHtml(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value;

        return div.innerHTML;
    }


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    loadOutstandingSales();


    // ============================================================
    // PAGE HTML
    // ============================================================

    function renderPaymentsPage() {

        document.getElementById(
            "pageContent"
        ).innerHTML = `

        <div class="container-fluid py-3">

            <div class="d-flex
                        justify-content-between
                        align-items-center
                        flex-wrap
                        gap-2
                        mb-4">

                <div>

                    <h2 class="mb-1">
                        Payments
                    </h2>

                    <p class="text-muted mb-0">
                        Manage customer outstanding payments
                    </p>

                </div>

            </div>


            <!-- SUMMARY -->

            <div class="row g-3 mb-4">

                <div class="col-md-6">

                    <div class="card shadow-sm border-0">

                        <div class="card-body">

                            <small class="text-muted">
                                Total Receivable
                            </small>

                            <h3
                                id="totalReceivable"
                                class="mb-0 text-danger">
                                0.00
                            </h3>

                        </div>

                    </div>

                </div>


                <div class="col-md-6">

                    <div class="card shadow-sm border-0">

                        <div class="card-body">

                            <small class="text-muted">
                                Outstanding Sales
                            </small>

                            <h3
                                id="outstandingCount"
                                class="mb-0">
                                0
                            </h3>

                        </div>

                    </div>

                </div>

            </div>


            <!-- TABLE -->

            <div class="card shadow-sm border-0">

                <div class="card-header bg-white">

                    <div class="row align-items-center">

                        <div class="col-md-6">

                            <h5 class="mb-0">
                                Outstanding Sales
                            </h5>

                        </div>

                        <div class="col-md-6 mt-2 mt-md-0">

                            <input
                                type="search"
                                id="paymentSearch"
                                class="form-control"
                                placeholder="Search customer, receipt or status...">

                        </div>

                    </div>

                </div>


                <div class="card-body p-0">

                    <div class="table-responsive">

                        <table
                            class="table table-hover align-middle mb-0">

                            <thead class="table-light">

                                <tr>

                                    <th>Receipt</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Paid</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                    <th class="text-end">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody id="paymentsTableBody">

                                <tr>

                                    <td
                                        colspan="8"
                                        class="text-center py-4">

                                        Loading...

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>


        <!-- PAYMENT MODAL -->

        <div
            class="modal fade"
            id="paymentModal"
            tabindex="-1">

            <div
                class="modal-dialog modal-dialog-centered">

                <div class="modal-content">

                    <div class="modal-header">

                        <h5 class="modal-title">
                            Record Payment
                        </h5>

                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal">
                        </button>

                    </div>


                    <form id="paymentForm">

                        <div class="modal-body">

                            <div
                                id="paymentFormAlert"
                                class="alert d-none">
                            </div>


                            <input
                                type="hidden"
                                id="paymentSaleId">


                            <div class="mb-3">

                                <label class="form-label">
                                    Amount
                                </label>

                                <input
                                    type="number"
                                    id="paymentAmount"
                                    class="form-control"
                                    min="0.01"
                                    step="0.01"
                                    required>

                            </div>


                            <div class="mb-3">

                                <label class="form-label">
                                    Payment Method
                                </label>

                                <select
                                    id="paymentMethod"
                                    class="form-select"
                                    required>

                                    <option value="">
                                        Select method
                                    </option>

                                    <option value="CASH">
                                        Cash
                                    </option>

                                    <option value="MOBILE_MONEY">
                                        Mobile Money
                                    </option>

                                    <option value="BANK_TRANSFER">
                                        Bank Transfer
                                    </option>

                                    <option value="CARD">
                                        Card
                                    </option>

                                    <option value="OTHER">
                                        Other
                                    </option>

                                </select>

                            </div>


                            <div class="mb-3">

                                <label class="form-label">
                                    Reference
                                </label>

                                <input
                                    type="text"
                                    id="paymentReference"
                                    class="form-control">

                            </div>


                            <div class="mb-3">

                                <label class="form-label">
                                    Notes
                                </label>

                                <textarea
                                    id="paymentNotes"
                                    class="form-control"
                                    rows="2">
                                </textarea>

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
                                class="btn btn-primary">

                                Record Payment

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
        `;
    }

});