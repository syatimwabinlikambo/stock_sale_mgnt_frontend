const Customers = {

    customers: [],

    currentPage: 0,

    pageSize: 20,

    totalPages: 0,

    editingCustomerId: null,

    statusFilter: "true",


    // ============================================================
    // INITIALIZE
    // ============================================================

    init() {

        if (!Session.requireRole("MANAGER", "ADMIN")) {
            return;
        }

        renderLayout();

        this.renderPage();

        this.bindEvents();

        this.loadCustomers();
    },


    // ============================================================
    // RENDER PAGE
    // ============================================================

    renderPage() {

        const pageContent =
            document.getElementById("pageContent");


        if (!pageContent) {

            console.error(
                "pageContent not found."
            );

            return;
        }


        pageContent.innerHTML = `

            <div class="container-fluid">


                <!-- =================================================
                     HEADER
                     ================================================= -->

                <div class="
                    d-flex
                    justify-content-between
                    align-items-center
                    flex-wrap
                    gap-3
                    mb-4
                ">

                    <div>

                        <h2 class="fw-bold mb-1">

                            Customers

                        </h2>

                        <p class="text-muted mb-0">

                            Manage customer accounts.

                        </p>

                    </div>


                    <button
                        type="button"
                        id="addCustomerButton"
                        class="btn btn-primary">

                        <i class="bi bi-person-plus me-1"></i>

                        Add Customer

                    </button>

                </div>



                <!-- =================================================
                     FILTER CARD
                     ================================================= -->

                <div class="card border-0 shadow-sm mb-4">

                    <div class="card-body">

                        <div class="row g-3">


                            <!-- SEARCH -->

                            <div class="col-md-7">

                                <label
                                    for="customerSearch"
                                    class="form-label">

                                    Search Customer

                                </label>


                                <div class="input-group">

                                    <span class="input-group-text">

                                        <i class="bi bi-search"></i>

                                    </span>


                                    <input
                                        type="text"
                                        id="customerSearch"
                                        class="form-control"
                                        placeholder="Name, phone or email...">

                                </div>

                            </div>



                            <!-- STATUS -->

                            <div class="col-md-3">

                                <label
                                    for="customerStatusFilter"
                                    class="form-label">

                                    Status

                                </label>


                                <select
                                    id="customerStatusFilter"
                                    class="form-select">

                                    <option value="true">
                                        Active
                                    </option>

                                    <option value="false">
                                        Inactive
                                    </option>

                                    <option value="">
                                        All Customers
                                    </option>

                                </select>

                            </div>



                            <!-- SEARCH BUTTON -->

                            <div class="col-md-2 d-flex align-items-end">

                                <button
                                    type="button"
                                    id="searchCustomerButton"
                                    class="btn btn-outline-primary w-100">

                                    <i class="bi bi-search me-1"></i>

                                    Search

                                </button>

                            </div>

                        </div>

                    </div>

                </div>



                <!-- =================================================
                     TABLE
                     ================================================= -->

                <div class="card border-0 shadow-sm">

                    <div class="card-header bg-white">

                        <div class="
                            d-flex
                            justify-content-between
                            align-items-center
                        ">

                            <h5 class="mb-0">

                                Customer List

                            </h5>


                            <span
                                id="customerCount"
                                class="badge bg-secondary">

                                0

                            </span>

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

                                        <th>#</th>

                                        <th>Customer</th>

                                        <th>Phone</th>

                                        <th>Email</th>

                                        <th>Address</th>

                                        <th>Status</th>

                                        <th class="text-end">

                                            Actions

                                        </th>

                                    </tr>

                                </thead>


                                <tbody id="customerTableBody">

                                    <tr>

                                        <td
                                            colspan="7"
                                            class="text-center py-5">

                                            Loading customers...

                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>



                    <!-- PAGINATION -->

                    <div class="card-footer bg-white">

                        <div class="
                            d-flex
                            justify-content-between
                            align-items-center
                        ">

                            <button
                                type="button"
                                id="previousPageButton"
                                class="btn btn-sm btn-outline-secondary">

                                <i class="bi bi-chevron-left"></i>

                                Previous

                            </button>


                            <span
                                id="pageInfo"
                                class="text-muted">

                                Page 1

                            </span>


                            <button
                                type="button"
                                id="nextPageButton"
                                class="btn btn-sm btn-outline-secondary">

                                Next

                                <i class="bi bi-chevron-right"></i>

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;
    },


    // ============================================================
    // EVENTS
    // ============================================================

    bindEvents() {

        document
            .getElementById("addCustomerButton")
            .addEventListener(
                "click",
                () => this.openCreateModal()
            );


        document
            .getElementById("customerForm")
            .addEventListener(
                "submit",
                event => this.saveCustomer(event)
            );


        document
            .getElementById("searchCustomerButton")
            .addEventListener(
                "click",
                () => {

                    this.currentPage = 0;

                    this.loadCustomers();

                }
            );


        document
            .getElementById("customerStatusFilter")
            .addEventListener(
                "change",
                () => {

                    this.currentPage = 0;

                    this.statusFilter =
                        document
                            .getElementById(
                                "customerStatusFilter"
                            )
                            .value;

                    this.loadCustomers();

                }
            );


        document
            .getElementById("customerSearch")
            .addEventListener(
                "keydown",
                event => {

                    if (event.key === "Enter") {

                        event.preventDefault();

                        this.currentPage = 0;

                        this.loadCustomers();

                    }

                }
            );


        document
            .getElementById("previousPageButton")
            .addEventListener(
                "click",
                () => this.previousPage()
            );


        document
            .getElementById("nextPageButton")
            .addEventListener(
                "click",
                () => this.nextPage()
            );

    },


    // ============================================================
    // LOAD CUSTOMERS
    // ============================================================

    async loadCustomers() {

        const keyword =
            document
                .getElementById("customerSearch")
                .value
                .trim();


        let endpoint;


        /*
         * IMPORTANT:
         *
         * If there is a keyword, use:
         *
         * /customers/search
         *
         * Otherwise use:
         *
         * /customers
         */

        if (keyword) {

            endpoint =
                "/customers/search";

        } else {

            endpoint =
                "/customers";

        }


        const params =
            new URLSearchParams();


        params.append(
            "page",
            this.currentPage
        );


        params.append(
            "size",
            this.pageSize
        );


        params.append(
            "sort",
            "lastName,asc"
        );


        /*
         * Only add active when the user selected
         * Active or Inactive.
         *
         * Empty = all customers.
         */

        if (this.statusFilter !== "") {

            params.append(
                "active",
                this.statusFilter
            );

        }


        if (keyword) {

            params.append(
                "keyword",
                keyword
            );

        }


        endpoint +=
            "?" +
            params.toString();


        console.log(
            "Customer API:",
            endpoint
        );


        try {

            const response =
                await API.get(endpoint);


            if (response.status === 401) {

                Session.logout();

                return;
            }


            if (!response.ok) {

                throw new Error(
                    await this.extractError(response)
                );

            }


            const data =
                await response.json();


            this.customers =
                data.content || [];


            this.totalPages =
                data.totalPages || 0;


            this.renderCustomers();

            this.updatePagination();


        } catch (error) {

            console.error(
                "Unable to load customers:",
                error
            );


            this.showTableError(
                error.message ||
                "Unable to load customers."
            );

        }

    },


    // ============================================================
    // RENDER CUSTOMERS
    // ============================================================

    renderCustomers() {

        const tbody =
            document.getElementById(
                "customerTableBody"
            );


        const count =
            document.getElementById(
                "customerCount"
            );


        count.textContent =
            this.customers.length;


        if (this.customers.length === 0) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center
                               text-muted
                               py-5">

                        <i class="
                            bi
                            bi-people
                            fs-1
                            d-block
                            mb-2
                        "></i>

                        No customers found.

                    </td>

                </tr>

            `;

            return;
        }


        tbody.innerHTML =
            this.customers
                .map(
                    (customer, index) =>
                        this.customerRow(
                            customer,
                            index
                        )
                )
                .join("");


        this.bindCustomerActions();

    },


    // ============================================================
    // CUSTOMER ROW
    // ============================================================

    customerRow(customer, index) {

        const fullName =
            `${customer.firstName || ""} ${customer.lastName || ""}`
                .trim();


        const active =
            customer.active === true;


        const statusBadge = active

            ? `
                <span class="badge bg-success">

                    <i class="bi bi-check-circle me-1"></i>

                    Active

                </span>
              `

            : `
                <span class="badge bg-secondary">

                    <i class="bi bi-dash-circle me-1"></i>

                    Inactive

                </span>
              `;


        const statusButton = active

            ? `
                <button
                    type="button"
                    class="btn
                           btn-sm
                           btn-outline-warning
                           deactivate-customer"
                    data-id="${customer.id}"
                    title="Deactivate">

                    <i class="bi bi-person-dash"></i>

                </button>
              `

            : `
                <button
                    type="button"
                    class="btn
                           btn-sm
                           btn-outline-success
                           activate-customer"
                    data-id="${customer.id}"
                    title="Activate">

                    <i class="bi bi-person-check"></i>

                </button>
              `;


        return `

            <tr>

                <td>

                    ${
                        this.currentPage *
                        this.pageSize +
                        index +
                        1
                    }

                </td>


                <td>

                    <div class="fw-semibold">

                        ${this.escapeHtml(fullName)}

                    </div>

                </td>


                <td>

                    ${this.escapeHtml(
                        customer.phone || "-"
                    )}

                </td>


                <td>

                    ${this.escapeHtml(
                        customer.email || "-"
                    )}

                </td>


                <td>

                    ${this.escapeHtml(
                        customer.address || "-"
                    )}

                </td>


                <td>

                    ${statusBadge}

                </td>


                <td class="text-end">

                    <div class="btn-group">

                        <!-- EDIT -->

                        <button
                            type="button"
                            class="btn
                                   btn-sm
                                   btn-outline-primary
                                   edit-customer"
                            data-id="${customer.id}"
                            title="Edit">

                            <i class="bi bi-pencil"></i>

                        </button>


                        <!-- ACTIVATE / DEACTIVATE -->

                        ${statusButton}

                    </div>

                </td>

            </tr>

        `;

    },


    // ============================================================
    // CUSTOMER ACTIONS
    // ============================================================

    bindCustomerActions() {

        document
            .querySelectorAll(".edit-customer")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.openEditModal(
                            Number(button.dataset.id)
                        );

                    }
                );

            });


        document
            .querySelectorAll(".deactivate-customer")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.changeStatus(
                            Number(button.dataset.id),
                            false
                        );

                    }
                );

            });


        document
            .querySelectorAll(".activate-customer")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.changeStatus(
                            Number(button.dataset.id),
                            true
                        );

                    }
                );

            });

    },


    // ============================================================
    // ACTIVATE / DEACTIVATE
    // ============================================================

    async changeStatus(id, active) {

        const message = active

            ? "Are you sure you want to activate this customer?"

            : "Are you sure you want to deactivate this customer?";


        if (!confirm(message)) {
            return;
        }


        const endpoint = active

            ? `/customers/${id}/activate`

            : `/customers/${id}/deactivate`;


        try {

            const response =
                await API.request(
                    endpoint,
                    {
                        method: "PATCH"
                    }
                );


            if (response.status === 401) {

                Session.logout();

                return;
            }


            if (!response.ok) {

                throw new Error(
                    await this.extractError(response)
                );

            }


            await this.loadCustomers();


        } catch (error) {

            console.error(
                "Unable to change customer status:",
                error
            );


            alert(
                error.message ||
                "Unable to change customer status."
            );

        }

    },


    // ============================================================
    // CREATE
    // ============================================================

    openCreateModal() {

        this.editingCustomerId = null;


        document
            .getElementById("customerModalTitle")
            .textContent =
            "Add Customer";


        document
            .getElementById("customerForm")
            .reset();


        this.clearFormAlert();


        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById(
                    "customerModal"
                )
            )
            .show();

    },


    // ============================================================
    // EDIT
    // ============================================================

    async openEditModal(id) {

        let customer =
            this.customers.find(
                item => item.id === id
            );


        /*
         * If the customer is not in the current page,
         * retrieve it directly.
         */

        if (!customer) {

            try {

                const response =
                    await API.get(
                        `/customers/${id}`
                    );


                if (!response.ok) {

                    throw new Error(
                        await this.extractError(response)
                    );

                }


                customer =
                    await response.json();


            } catch (error) {

                alert(
                    error.message ||
                    "Unable to load customer."
                );

                return;
            }
        }


        this.editingCustomerId = id;


        document
            .getElementById("customerModalTitle")
            .textContent =
            "Edit Customer";


        document
            .getElementById("firstName")
            .value =
            customer.firstName || "";


        document
            .getElementById("lastName")
            .value =
            customer.lastName || "";


        document
            .getElementById("phone")
            .value =
            customer.phone || "";


        document
            .getElementById("email")
            .value =
            customer.email || "";


        document
            .getElementById("address")
            .value =
            customer.address || "";


        this.clearFormAlert();


        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById(
                    "customerModal"
                )
            )
            .show();

    },


    // ============================================================
    // SAVE
    // ============================================================

    async saveCustomer(event) {

        event.preventDefault();


        const button =
            document.getElementById(
                "saveCustomerButton"
            );


        const data = {

            firstName:
                document
                    .getElementById("firstName")
                    .value
                    .trim(),

            lastName:
                document
                    .getElementById("lastName")
                    .value
                    .trim(),

            phone:
                document
                    .getElementById("phone")
                    .value
                    .trim() || null,

            email:
                document
                    .getElementById("email")
                    .value
                    .trim() || null,

            address:
                document
                    .getElementById("address")
                    .value
                    .trim() || null

        };


        button.disabled = true;

        button.innerHTML = `

            <span
                class="spinner-border
                       spinner-border-sm
                       me-1">
            </span>

            Saving...

        `;


        try {

            let response;


            if (this.editingCustomerId) {

                response =
                    await API.put(
                        `/customers/${this.editingCustomerId}`,
                        data
                    );

            } else {

                response =
                    await API.post(
                        "/customers",
                        data
                    );

            }


            if (response.status === 401) {

                Session.logout();

                return;
            }


            if (!response.ok) {

                throw new Error(
                    await this.extractError(response)
                );

            }


            bootstrap.Modal
                .getInstance(
                    document.getElementById(
                        "customerModal"
                    )
                )
                .hide();


            await this.loadCustomers();


        } catch (error) {

            console.error(
                "Unable to save customer:",
                error
            );


            this.showFormAlert(
                error.message ||
                "Unable to save customer.",
                "danger"
            );


        } finally {

            button.disabled = false;

            button.textContent =
                "Save Customer";

        }

    },


    // ============================================================
    // PAGINATION
    // ============================================================

    previousPage() {

        if (this.currentPage <= 0) {
            return;
        }


        this.currentPage--;

        this.loadCustomers();

    },


    nextPage() {

        if (
            this.currentPage >=
            this.totalPages - 1
        ) {
            return;
        }


        this.currentPage++;

        this.loadCustomers();

    },


    updatePagination() {

        const pageInfo =
            document.getElementById(
                "pageInfo"
            );


        const previous =
            document.getElementById(
                "previousPageButton"
            );


        const next =
            document.getElementById(
                "nextPageButton"
            );


        const page =
            this.totalPages === 0
                ? 0
                : this.currentPage + 1;


        pageInfo.textContent =
            `Page ${page} of ${this.totalPages}`;


        previous.disabled =
            this.currentPage <= 0;


        next.disabled =
            this.currentPage >=
            this.totalPages - 1;

    },


    // ============================================================
    // ALERT
    // ============================================================

    showFormAlert(message, type) {

        const alert =
            document.getElementById(
                "customerFormAlert"
            );


        alert.className =
            `alert alert-${type}`;


        alert.textContent =
            message;

    },


    clearFormAlert() {

        const alert =
            document.getElementById(
                "customerFormAlert"
            );


        alert.className =
            "alert d-none";


        alert.textContent =
            "";

    },


    // ============================================================
    // TABLE ERROR
    // ============================================================

    showTableError(message) {

        const tbody =
            document.getElementById(
                "customerTableBody"
            );


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center
                           text-danger
                           py-4">

                    <i
                        class="bi
                               bi-exclamation-triangle
                               me-1">
                    </i>

                    ${this.escapeHtml(message)}

                </td>

            </tr>

        `;

    },


    // ============================================================
    // ERROR HANDLING
    // ============================================================

    async extractError(response) {

        try {

            const data =
                await response.json();


            if (data.message) {

                return data.message;

            }


            if (data.error) {

                return data.error;

            }


            if (data.errors) {

                return Object
                    .values(data.errors)
                    .join(", ");

            }


        } catch {

            // Response wasn't JSON

        }


        return `Request failed with status ${response.status}`;

    },


    // ============================================================
    // ESCAPE HTML
    // ============================================================

    escapeHtml(value) {

        const element =
            document.createElement("div");


        element.textContent =
            value ?? "";


        return element.innerHTML;

    }

};


// ================================================================
// START APPLICATION
// ================================================================

document.addEventListener(
    "DOMContentLoaded",
    () => Customers.init()
);