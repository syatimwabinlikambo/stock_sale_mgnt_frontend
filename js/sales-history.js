document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * ============================================================
         * AUTHENTICATION
         * ============================================================
         */

        if (
            !Session.requireRole(
                "USER",
                "MANAGER",
                "ADMIN"
            )
        ) {
            return;
        }


        /*
         * ============================================================
         * STATE
         * ============================================================
         */

        let sales = [];


        /*
         * ============================================================
         * RENDER PAGE
         * ============================================================
         */

        renderSalesPage();


        /*
         * ============================================================
         * LOAD SALES
         * ============================================================
         */

        loadSales();


        /*
         * ============================================================
         * PAGE
         * ============================================================
         */

        function renderSalesPage() {

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


            pageContent.innerHTML = `

                <div class="container-fluid py-3">

                    <!-- =================================================
                         HEADER
                         ================================================= -->

                    <div class="
                        d-flex
                        justify-content-between
                        align-items-center
                        flex-wrap
                        gap-2
                        mb-4
                    ">

                        <div>

                            <h2 class="mb-1">

                                Sales History

                            </h2>

                            <p class="text-muted mb-0">

                                View and manage completed sales

                            </p>

                        </div>


                        <a
                            href="sales.html"
                            class="btn btn-primary"
                        >

                            <i class="bi bi-cart-plus me-1"></i>

                            New Sale

                        </a>

                    </div>


                    <!-- =================================================
                         SUMMARY
                         ================================================= -->

                    <div class="row g-3 mb-4">


                        <!-- TOTAL SALES -->

                        <div class="col-12 col-md-3">

                            <div
                                class="
                                    card
                                    shadow-sm
                                    border-0
                                    h-100
                                "
                            >

                                <div class="card-body">

                                    <p class="text-muted mb-1">

                                        Total Sales

                                    </p>

                                    <h3
                                        id="totalSales"
                                        class="mb-0"
                                    >
                                        0
                                    </h3>

                                </div>

                            </div>

                        </div>


                        <!-- PAID -->

                        <div class="col-12 col-md-3">

                            <div
                                class="
                                    card
                                    shadow-sm
                                    border-0
                                    h-100
                                "
                            >

                                <div class="card-body">

                                    <p class="text-muted mb-1">

                                        Paid

                                    </p>

                                    <h3
                                        id="paidSales"
                                        class="mb-0 text-success"
                                    >
                                        0
                                    </h3>

                                </div>

                            </div>

                        </div>


                        <!-- OUTSTANDING -->

                        <div class="col-12 col-md-3">

                            <div
                                class="
                                    card
                                    shadow-sm
                                    border-0
                                    h-100
                                "
                            >

                                <div class="card-body">

                                    <p class="text-muted mb-1">

                                        Outstanding

                                    </p>

                                    <h3
                                        id="outstandingSales"
                                        class="mb-0 text-danger"
                                    >
                                        0
                                    </h3>

                                </div>

                            </div>

                        </div>


                        <!-- CREDIT -->

                        <div class="col-12 col-md-3">

                            <div
                                class="
                                    card
                                    shadow-sm
                                    border-0
                                    h-100
                                "
                            >

                                <div class="card-body">

                                    <p class="text-muted mb-1">

                                        Credit / Unpaid

                                    </p>

                                    <h3
                                        id="creditSales"
                                        class="mb-0 text-warning"
                                    >
                                        0
                                    </h3>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- =================================================
                         SALES TABLE
                         ================================================= -->

                    <div
                        class="
                            card
                            shadow-sm
                            border-0
                        "
                    >

                        <div
                            class="
                                card-header
                                bg-white
                                py-3
                            "
                        >

                            <div
                                class="
                                    row
                                    align-items-center
                                    g-2
                                "
                            >

                                <div class="col-md-6">

                                    <h5 class="mb-0">

                                        Sales

                                    </h5>

                                </div>


                                <div class="col-md-6">

                                    <input
                                        type="search"
                                        id="salesSearch"
                                        class="form-control"
                                        placeholder="
                                            Search receipt or customer...
                                        "
                                    >

                                </div>

                            </div>

                        </div>


                        <div class="card-body p-0">

                            <div class="table-responsive">

                                <table
                                    class="
                                        table
                                        table-hover
                                        align-middle
                                        mb-0
                                    "
                                >

                                    <thead class="table-light">

                                        <tr>

                                            <th>
                                                Receipt
                                            </th>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Customer
                                            </th>

                                            <th>
                                                Total
                                            </th>

                                            <th>
                                                Paid
                                            </th>

                                            <th>
                                                Balance
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
                                        id="salesTableBody"
                                    >

                                        <tr>

                                            <td
                                                colspan="8"
                                                class="
                                                    text-center
                                                    py-4
                                                "
                                            >

                                                Loading sales...

                                            </td>

                                        </tr>

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- =====================================================
                     SALE DETAILS MODAL
                     ===================================================== -->

                <div
                    class="modal fade"
                    id="saleDetailsModal"
                    tabindex="-1"
                    aria-hidden="true"
                >

                    <div
                        class="
                            modal-dialog
                            modal-lg
                            modal-dialog-centered
                            modal-dialog-scrollable
                        "
                    >

                        <div class="modal-content">


                            <div class="modal-header">

                                <h5 class="modal-title">

                                    Sale Details

                                </h5>

                                <button
                                    type="button"
                                    class="btn-close"
                                    data-bs-dismiss="modal"
                                >
                                </button>

                            </div>


                            <div
                                class="modal-body"
                                id="saleDetailsBody"
                            >

                            </div>


                            <div class="modal-footer">

                                <button
                                    type="button"
                                    class="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >

                                    Close

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            `;
        }


        /*
         * ============================================================
         * LOAD SALES
         * ============================================================
         */

        async function loadSales() {

            const tableBody =
                document.getElementById("salesTableBody");

            try {

                const response =
                    await API.get("/sales");

                if (!response.ok) {

                    if (response.status === 401) {
                        Session.logout();
                        return;
                    }

                    throw new Error(
                        "Unable to load sales."
                    );
                }

                const data =
                    await response.json();

                console.log("Sales API response:", data);

                /*
                 * Backend returns a Spring Page:
                 *
                 * {
                 *     content: [...],
                 *     totalElements: 4,
                 *     totalPages: 1,
                 *     ...
                 * }
                 */

                sales = data.content ?? [];

                renderSales(sales);

                updateSummary(sales);

            } catch (error) {

                console.error(error);

                tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-danger py-4"
                >

                    Unable to load sales.

                </td>

            </tr>

        `;
            }
        }

        /*
         * ============================================================
         * RENDER SALES
         * ============================================================
         */

        function renderSales(saleList) {

            const tableBody =
                document.getElementById(
                    "salesTableBody"
                );


            if (!saleList.length) {

                tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center py-4"
                >

                    No sales found.

                </td>

            </tr>

        `;

                return;
            }


            tableBody.innerHTML =
                saleList.map(
                    sale => `

            <tr>

                <td>

                    <strong>

                        ${escapeHtml(
                        sale.receiptNumber ?? "-"
                    )}

                    </strong>

                </td>


                <td>

                    ${formatDate(
                        sale.saleDate
                    )}

                </td>


                <td>

                    <div class="fw-semibold">

                        ${escapeHtml(
                        sale.customerName ?? "-"
                    )}

                    </div>

                    <small class="text-muted">

                        ${escapeHtml(
                        sale.customerPhone ?? ""
                    )}

                    </small>

                </td>


                <td>

                    ${formatMoney(
                        sale.total
                    )}

                </td>


                <td class="text-success">

                    ${formatMoney(
                        sale.paidAmount
                    )}

                </td>


                <td class="
                    ${Number(sale.balance ?? 0) > 0
                            ? "text-danger"
                            : "text-success"
                        }
                ">

                    <strong>

                        ${formatMoney(
                            sale.balance
                        )}

                    </strong>

                </td>


                <td>

                    ${getStatusBadge(
                            sale.status
                        )}

                </td>


                <td class="text-end">

                    <div class="btn-group">

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            onclick="viewSale(${sale.id})"
                        >
                            <i class="bi bi-eye"></i>
                            View
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-dark"
                            onclick="printSaleReceipt(${sale.id})"
                            title="Print Receipt"
                        >
                            <i class="bi bi-printer"></i>
                            Print
                        </button>

                    </div>

                </td>

            </tr>

        `
                ).join("");
        }


        /*
         * ============================================================
         * SUMMARY
         * ============================================================
         */
        function updateSummary(saleList) {

            const totalSales =
                saleList.length;


            const paidSales =
                saleList.filter(
                    sale =>
                        sale.status === "PAID"
                ).length;


            const creditSales =
                saleList.filter(
                    sale =>
                        sale.status === "CREDIT" ||
                        sale.status === "UNPAID"
                ).length;


            const outstanding =
                saleList.reduce(
                    (
                        total,
                        sale
                    ) => {

                        return total +
                            Number(
                                sale.balance ?? 0
                            );

                    },
                    0
                );


            document.getElementById(
                "totalSales"
            ).textContent =
                totalSales;


            document.getElementById(
                "paidSales"
            ).textContent =
                paidSales;


            document.getElementById(
                "creditSales"
            ).textContent =
                creditSales;


            document.getElementById(
                "outstandingSales"
            ).textContent =
                formatMoney(
                    outstanding
                );
        }

        /*
         * ============================================================
         * SEARCH
         * ============================================================
         */

        document.addEventListener(
            "input",
            event => {

                if (
                    event.target.id !==
                    "salesSearch"
                ) {
                    return;
                }


                const keyword =
                    event.target.value
                        .trim()
                        .toLowerCase();


                if (!keyword) {

                    renderSales(
                        sales
                    );

                    return;
                }


                const filtered =
                    sales.filter(
                        sale => {

                            const receipt =
                                String(
                                    sale.receiptNumber
                                    ?? ""
                                ).toLowerCase();


                            const customer =
                                String(
                                    sale.customerName
                                    ?? ""
                                ).toLowerCase();


                            return (
                                receipt.includes(
                                    keyword
                                ) ||
                                customer.includes(
                                    keyword
                                )
                            );
                        }
                    );


                renderSales(
                    filtered
                );
            }
        );


        /*
         * ============================================================
         * VIEW SALE
         * ============================================================
         */

        window.viewSale =
            async function (
                saleId
            ) {

                try {

                    const response =
                        await API.get(
                            `/sales/${saleId}`
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Unable to load sale details."
                        );
                    }


                    const sale =
                        await response.json();


                    renderSaleDetails(
                        sale
                    );


                    const modal =
                        new bootstrap.Modal(
                            document.getElementById(
                                "saleDetailsModal"
                            )
                        );


                    modal.show();


                } catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        error.message
                    );
                }
            };


        /*
         * ============================================================
         * SALE DETAILS
         * ============================================================
         */

        function renderSaleDetails(
            sale
        ) {

            const body =
                document.getElementById(
                    "saleDetailsBody"
                );


            const items =
                sale.items ?? [];


            body.innerHTML = `

                <div class="row mb-4">

                    <div class="col-md-6">

                        <strong>
                            Receipt
                        </strong>

                        <div>
                            ${escapeHtml(
                sale.receiptNumber
                ?? "-"
            )}
                        </div>

                    </div>


                    <div class="col-md-6">

                        <strong>
                            Date
                        </strong>

                        <div>
                            ${formatDate(
                sale.saleDate
                ?? sale.createdAt
            )}
                        </div>

                    </div>

                </div>


                <div class="mb-4">

                    <strong>
                        Customer
                    </strong>

                    <div>
                        ${escapeHtml(
                sale.customerName
                ?? "-"
            )}
                    </div>

                </div>


                <div class="table-responsive mb-4">

                    <table class="table table-bordered">

                        <thead class="table-light">

                            <tr>

                                <th>
                                    Product
                                </th>

                                <th>
                                    Quantity
                                </th>

                                <th>
                                    Unit Price
                                </th>

                                <th>
                                    Total
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${items.length
                    ? items.map(
                        item => `

                                        <tr>

                                            <td>
                                                ${escapeHtml(
                            item.productName
                            ?? "-"
                        )}
                                            </td>

                                            <td>
                                                ${item.quantity ?? 0}
                                            </td>

                                            <td>
                                                ${formatMoney(
                            item.unitPrice
                        )}
                                            </td>

                                            <td>
                                                ${formatMoney(
                            item.subtotal
                        )}
                                            </td>

                                        </tr>

                                    `
                    ).join("")
                    : `
                                        <tr>
                                            <td
                                                colspan="4"
                                                class="text-center"
                                            >
                                                No items found.
                                            </td>
                                        </tr>
                                    `
                }

                        </tbody>

                    </table>

                </div>


                <div class="row justify-content-end">

                    <div class="col-md-6">

                        <div class="d-flex justify-content-between">

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ${formatMoney(
                    sale.subtotalAmount
                )}
                            </strong>

                        </div>


                        <div class="d-flex justify-content-between">

                            <span>
                                Discount
                                (${sale.discountPercentage ?? 0}%)
                            </span>

                            <strong>
                                ${formatMoney(
                    sale.discountAmount
                )}
                            </strong>

                        </div>


                        <hr>


                        <div class="d-flex justify-content-between">

                            <span>
                                Total
                            </span>

                            <strong>
                                ${formatMoney(
                    sale.totalAmount
                )}
                            </strong>

                        </div>


                        <div class="d-flex justify-content-between">

                            <span>
                                Paid
                            </span>

                            <strong class="text-success">

                                ${formatMoney(
                    sale.paidAmount
                )}

                            </strong>

                        </div>


                        <div class="d-flex justify-content-between">

                            <span>
                                Balance
                            </span>

                            <strong class="text-danger">

                                ${formatMoney(
                    sale.balance
                )}

                            </strong>

                        </div>


                        <div class="mt-3 text-end">

                            ${getStatusBadge(
                    sale.status
                )}

                        </div>

                    </div>

                </div>

            `;
        }


        /*
         * ============================================================
         * STATUS BADGE
         * ============================================================
         */

        function getStatusBadge(
            status
        ) {

            switch (status) {

                case "PAID":

                    return `
                        <span class="badge bg-success">
                            Paid
                        </span>
                    `;


                case "PARTIAL":

                case "PARTIALLY_PAID":

                    return `
                        <span class="badge bg-warning text-dark">
                            Partially Paid
                        </span>
                    `;


                case "CREDIT":

                    return `
                        <span class="badge bg-danger">
                            Credit
                        </span>
                    `;


                case "UNPAID":

                    return `
                        <span class="badge bg-secondary">
                            Unpaid
                        </span>
                    `;


                case "CANCELLED":

                    return `
                        <span class="badge bg-dark">
                            Cancelled
                        </span>
                    `;


                default:

                    return `
                        <span class="badge bg-secondary">
                            ${escapeHtml(
                        status ?? "-"
                    )}
                        </span>
                    `;
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

            return Number(
                value ?? 0
            ).toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );
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


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return "-";
            }


            return date.toLocaleString();
        }

        function printReceipt(sale) {

            const receiptWindow =
                window.open(
                    "",
                    "_blank",
                    "width=420,height=700"
                );


            if (!receiptWindow) {

                alert(
                    "Please allow popups to print the receipt."
                );

                return;
            }


            const items =
                sale.items ?? [];


            const itemsHtml =
                items.map(item => {

                    const quantity =
                        Number(
                            item.quantity ?? 0
                        );

                    const unitPrice =
                        Number(
                            item.unitPrice ?? 0
                        );

                    const subtotal =
                        Number(
                            item.subtotal ?? 0
                        );


                    return `

                <tr>

                    <td class="item">

                        ${escapeHtml(
                        item.productName ?? "-"
                    )}

                    </td>

                    <td class="qty">

                        ${quantity}

                    </td>

                    <td class="price">

                        ${formatMoney(
                        unitPrice
                    )}

                    </td>

                    <td class="total">

                        ${formatMoney(
                        subtotal
                    )}

                    </td>

                </tr>

            `;

                }).join("");
            const receiptHtml = `

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Receipt ${escapeHtml(
                sale.receiptNumber ?? ""
            )}
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }


                body {

                    margin: 0;

                    padding: 10px;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    font-size: 12px;

                    color: #000;

                    background: #fff;

                }


                .receipt {

                    width: 80mm;

                    max-width: 80mm;

                    margin: 0 auto;

                }


                .header {

                    text-align: center;

                    margin-bottom: 10px;

                }


                .business-name {

                    font-size: 20px;

                    font-weight: bold;

                    margin-bottom: 3px;

                }


                .business-info {

                    font-size: 11px;

                }


                .divider {

                    border-top: 1px dashed #000;

                    margin: 8px 0;

                }


                .receipt-info {

                    font-size: 11px;

                }


                .receipt-info div {

                    display: flex;

                    justify-content:
                        space-between;

                    margin-bottom: 2px;

                }


                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-top: 8px;

                }


                th {

                    border-bottom:
                        1px solid #000;

                    padding:
                        4px 2px;

                    text-align: left;

                }


                td {

                    padding:
                        4px 2px;

                    vertical-align:
                        top;

                }


                .qty {

                    text-align: center;

                    width: 12%;

                }


                .price {

                    text-align: right;

                    width: 22%;

                }


                .total {

                    text-align: right;

                    width: 24%;

                }


                .item {

                    width: 42%;

                }


                .summary {

                    margin-top: 8px;

                }


                .summary-row {

                    display: flex;

                    justify-content:
                        space-between;

                    margin:
                        4px 0;

                }


                .grand-total {

                    font-size: 15px;

                    font-weight: bold;

                    border-top:
                        1px solid #000;

                    border-bottom:
                        1px double #000;

                    padding:
                        6px 0;

                }


                .balance {

                    font-weight: bold;

                }


                .status {

                    text-align: center;

                    margin-top: 10px;

                    font-weight: bold;

                }


                .footer {

                    text-align: center;

                    margin-top: 15px;

                    font-size: 11px;

                }


                @media print {

                    body {

                        padding: 0;

                    }


                    .receipt {

                        width: 80mm;

                        max-width: 80mm;

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


            <div class="header">

                <div class="business-name">

                    BON ACCUEIL

                </div>

                <div class="business-info">

                    Sales Receipt

                </div>

            </div>


            <div class="divider"></div>


            <div class="receipt-info">

                <div>

                    <span>Receipt:</span>

                    <strong>

                        ${escapeHtml(
                sale.receiptNumber ?? "-"
            )}

                    </strong>

                </div>


                <div>

                    <span>Date:</span>

                    <span>

                        ${formatDate(
                sale.saleDate
            )}

                    </span>

                </div>


                <div>

                    <span>Customer:</span>

                    <span>

                        ${escapeHtml(
                sale.customerName ??
                "Walk-in Customer"
            )}

                    </span>

                </div>


                ${sale.customerPhone
                    ? `
                            <div>

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

            </div>


            <div class="divider"></div>


            <table>

                <thead>

                    <tr>

                        <th>
                            Item
                        </th>

                        <th class="qty">
                            Qty
                        </th>

                        <th class="price">
                            Price
                        </th>

                        <th class="total">
                            Total
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${itemsHtml}

                </tbody>

            </table>


            <div class="divider"></div>


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


                <div class="summary-row grand-total">

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


                <div class="summary-row balance">

                    <span>
                        Balance
                    </span>

                    <span>

                        ${formatMoney(
                    sale.balance
                )}

                    </span>

                </div>

            </div>


            <div class="status">

                ${formatSaleStatus(
                    sale.status
                )}

            </div>


            ${sale.notes
                    ? `
                        <div class="divider"></div>

                        <div>

                            <strong>
                                Notes:
                            </strong>

                            <br>

                            ${escapeHtml(
                        sale.notes
                    )}

                        </div>
                    `
                    : ""
                }


            <div class="footer">

                <div>
                    Thank you for your business!
                </div>

                <div>
                    Please keep this receipt.
                </div>

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
        }
    });

function formatSaleStatus(status) {

    switch (status) {

        case "PAID":
            return "PAID";

        case "PARTIAL":
        case "PARTIALLY_PAID":
            return "PARTIALLY PAID";

        case "UNPAID":
            return "UNPAID";

        case "CREDIT":
            return "CREDIT";

        case "CANCELLED":
            return "CANCELLED";

        default:
            return status ?? "-";
    }
}


/*
 * ============================================================
 * PRINT 80MM THERMAL RECEIPT
 * ============================================================
 */

function printReceipt(sale) {

    if (!sale) {
        console.error("No sale provided for receipt.");
        return;
    }

    const receiptWindow =
        window.open(
            "",
            "_blank",
            "width=400,height=700"
        );

    if (!receiptWindow) {

        alert(
            "Unable to open receipt window. " +
            "Please allow pop-ups for this application."
        );

        return;
    }


    /*
     * ========================================================
     * SAFE HTML
     * ========================================================
     */

    const escapeHtml = (value) => {

        const div =
            document.createElement("div");

        div.textContent =
            value ?? "";

        return div.innerHTML;
    };


    /*
     * ========================================================
     * FORMAT MONEY
     * ========================================================
     */

    const money = (value) => {

        return Number(
            value ?? 0
        ).toFixed(2);

    };


    /*
     * ========================================================
     * ITEMS
     * ========================================================
     */

    const items =
        Array.isArray(sale.items)
            ? sale.items
            : [];


    const itemsHtml =
        items.map(item => {

            const productName =
                escapeHtml(
                    item.productName ?? "-"
                );

            const quantity =
                Number(
                    item.quantity ?? 0
                );

            const unitPrice =
                Number(
                    item.unitPrice ?? 0
                );

            const subtotal =
                Number(
                    item.subtotal ??
                    quantity * unitPrice
                );


            return `
                <tr>

                    <td class="product">
                        ${productName}
                    </td>

                    <td class="qty">
                        ${quantity}
                    </td>

                    <td class="price">
                        ${money(unitPrice)}
                    </td>

                    <td class="total">
                        ${money(subtotal)}
                    </td>

                </tr>
            `;

        }).join("");


    /*
     * ========================================================
     * SALE INFORMATION
     * ========================================================
     */

    const receiptNumber =
        escapeHtml(
            sale.receiptNumber ?? "-"
        );


    const customerName =
        escapeHtml(
            sale.customerName ?? "Walk-in Customer"
        );


    const customerPhone =
        escapeHtml(
            sale.customerPhone ?? ""
        );


    const saleDate =
        sale.saleDate
            ? new Date(
                sale.saleDate
            ).toLocaleString()
            : "-";


    /*
     * ========================================================
     * AMOUNTS
     * ========================================================
     */

    const subtotal =
        Number(
            sale.subtotal ?? 0
        );


    const discountPercentage =
        Number(
            sale.discountPercentage ?? 0
        );


    const discountAmount =
        Number(
            sale.discountAmount ?? 0
        );


    const total =
        Number(
            sale.total ?? 0
        );


    const paidAmount =
        Number(
            sale.paidAmount ?? 0
        );


    const balance =
        Number(
            sale.balance ?? 0
        );


    /*
     * ========================================================
     * PAYMENT
     * ========================================================
     */

    let paymentMethod = "-";


    if (sale.payment) {

        paymentMethod =
            sale.payment.paymentMethod ??
            "-";
    }


    /*
     * ========================================================
     * RECEIPT HTML
     * ========================================================
     */

    receiptWindow.document.write(`

<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <title>
        Receipt ${receiptNumber}
    </title>

    <link
        rel="stylesheet"
        href="../css/receipt.css"
    >

</head>


<body>

    <div class="receipt">


        <!-- ==================================================
             HEADER
             ================================================== -->

        <div class="receipt-header">

            <img
                src="../assets/logo/logo-bonaccueil-1-3.png"
                class="receipt-logo"
                alt="Bon Accueil"
            >

            <div class="receipt-company">
                BON ACCUEIL ENTERPRISE
            </div>

            <div class="receipt-title">
                SALES RECEIPT
            </div>

            <div class="receipt-number">
                ${receiptNumber}
            </div>

        </div>


        <div class="receipt-divider"></div>


        <!-- ==================================================
             SALE INFORMATION
             ================================================== -->

        <div class="receipt-info">

            <div class="receipt-info-row">

                <span class="receipt-info-label">
                    Customer:
                </span>

                <span class="receipt-info-value">
                    ${customerName}
                </span>

            </div>


            ${customerPhone
            ? `
                    <div class="receipt-info-row">

                        <span>
                            Phone:
                        </span>

                        <span class="receipt-info-value">
                            ${customerPhone}
                        </span>

                    </div>
                    `
            : ""
        }


            <div class="receipt-info-row">

                <span>
                    Date:
                </span>

                <span class="receipt-info-value">
                    ${escapeHtml(saleDate)}
                </span>

            </div>

        </div>


        <div class="receipt-divider"></div>


        <!-- ==================================================
             ITEMS
             ================================================== -->

        <table class="receipt-items">

            <thead>

                <tr>

                    <th class="product">
                        Product
                    </th>

                    <th class="qty">
                        Qty
                    </th>

                    <th class="price">
                        Price
                    </th>

                    <th class="total">
                        Total
                    </th>

                </tr>

            </thead>


            <tbody>

                ${itemsHtml}

            </tbody>

        </table>


        <div class="receipt-divider"></div>


        <!-- ==================================================
             TOTALS
             ================================================== -->

        <div class="receipt-totals">

            <div class="receipt-total-row">

                <span>
                    Subtotal
                </span>

                <strong>
                    ${money(subtotal)}
                </strong>

            </div>


            <div class="receipt-total-row">

                <span>
                    Discount
                    ${discountPercentage > 0
            ? `(${money(discountPercentage)}%)`
            : ""
        }
                </span>

                <strong>
                    ${money(discountAmount)}
                </strong>

            </div>


            <div
                class="receipt-total-row
                       receipt-grand-total">

                <span>
                    TOTAL
                </span>

                <strong>
                    ${money(total)}
                </strong>

            </div>


            <div class="receipt-total-row">

                <span>
                    Paid
                </span>

                <strong>
                    ${money(paidAmount)}
                </strong>

            </div>


            <div
                class="receipt-total-row
                       receipt-balance">

                <span>
                    Balance
                </span>

                <strong>
                    ${money(balance)}
                </strong>

            </div>


            <div class="receipt-total-row">

                <span>
                    Payment
                </span>

                <strong>
                    ${escapeHtml(paymentMethod)}
                </strong>

            </div>

        </div>


        <!-- ==================================================
             FOOTER
             ================================================== -->

        <div class="receipt-footer">

            <strong>
                Thank you for your business!
            </strong>

            Please keep this receipt.

        </div>


    </div>

</body>

</html>

    `);


    receiptWindow.document.close();


    /*
     * ========================================================
     * WAIT FOR LOGO / CSS
     * ========================================================
     */

    receiptWindow.onload = function () {

        setTimeout(() => {

            receiptWindow.focus();

            receiptWindow.print();

        }, 300);

    };
}

async function printSaleReceipt(saleId) {

    try {

        const response =
            await API.get(
                `/sales/${saleId}/receipt`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to generate receipt."
            );
        }


        const receipt =
            await response.json();


        printThermalReceipt(
            receipt
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message
        );
    }
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