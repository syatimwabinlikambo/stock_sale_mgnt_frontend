let addUserModal;
let availableRoles = [];

/*
 * =========================================
 * INITIALIZATION
 * =========================================
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const modalElement =
            document.getElementById(
                "addUserModal"
            );

        if (modalElement) {

            addUserModal =
                new bootstrap.Modal(
                    modalElement
                );

        }


        const form =
            document.getElementById(
                "userForm"
            );

        if (form) {

            form.addEventListener(
                "submit",
                createUser
            );

        }

    }
);


/*
 * =========================================
 * LOAD USERS
 * =========================================
 */

async function loadUsers() {

    const pageContent =
        document.getElementById(
            "pageContent"
        );

    pageContent.innerHTML = `

        <div class="d-flex
                    justify-content-between
                    align-items-center
                    mb-4">

            <div>

                <h2 class="fw-bold mb-1">
                    Users
                </h2>

                <p class="text-muted mb-0">
                    Manage application users.
                </p>

            </div>


            <button
                class="btn btn-primary"
                onclick="openAddUserModal()">

                + Add User

            </button>

        </div>


        <div
            id="usersAlert"
            class="alert d-none">
        </div>


        <div class="card
                    border-0
                    shadow-sm">

            <div class="card-body">

                <div class="table-responsive">

                    <table
                        class="table
                               table-hover
                               align-middle">

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>User</th>

                                <th>Email</th>

                                <th>Role</th>

                                <th>Status</th>

                                <th class="text-end">
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody id="usersTable">

                            <tr>

                                <td
                                    colspan="6"
                                    class="text-center
                                           py-4">

                                    Loading users...

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    `;


    try {

        const response =
            await API.get("/users");

        if (!response) return;

        const data =
            await response.json();

        if (!response.ok) {

            showUsersAlert(
                data.message ||
                "Unable to load users.",
                "danger"
            );

            return;
        }

        renderUsers(data);

    } catch (error) {

        console.error(error);

        showUsersAlert(
            "Unable to connect to the server.",
            "danger"
        );

    }
}


/*
 * =========================================
 * RENDER USERS
 * =========================================
 */

function renderUsers(users) {

    const table =
        document.getElementById(
            "usersTable"
        );

    if (!users.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="text-center
                           text-muted
                           py-4">

                    No users found.

                </td>

            </tr>

        `;

        return;
    }


    table.innerHTML =
        users.map(user => `

            <tr>

                <td>
                    ${user.id}
                </td>


                <td>

                    <strong>
                        ${escapeHtml(
            user.firstName
        )}
                        ${escapeHtml(
            user.lastName
        )}
                    </strong>

                </td>


                <td>
                    ${escapeHtml(
            user.email
        )}
                </td>


                <td>

                    ${roleBadge(user.role)}

                </td>


                <td>

                    ${user.enabled

                ? `
                            <span
                                class="badge
                                       bg-success">

                                Active

                            </span>
                          `

                : `
                            <span
                                class="badge
                                       bg-secondary">

                                Disabled

                            </span>
                          `
            }

                </td>


                <td class="text-end">

                    ${user.enabled

                ? `
                            <button
                                class="btn
                                       btn-sm
                                       btn-outline-danger"
                                onclick="changeStatus(
                                    ${user.id},
                                    false
                                )">

                                Disable

                            </button>
                          `

                : `
                            <button
                                class="btn
                                       btn-sm
                                       btn-outline-success"
                                onclick="changeStatus(
                                    ${user.id},
                                    true
                                )">

                                Enable

                            </button>
                          `
            }

                </td>

            </tr>

        `).join("");
}


/*
 * =========================================
 * ROLE BADGE
 * =========================================
 */

function roleBadge(role) {

    switch (role) {

        case "ADMIN":

            return `
                <span class="badge bg-danger">
                    ADMIN
                </span>
            `;

        case "MANAGER":

            return `
                <span class="badge bg-warning text-dark">
                    MANAGER
                </span>
            `;

        default:

            return `
                <span class="badge bg-primary">
                    USER
                </span>
            `;
    }
}


/*
 * =========================================
 * CREATE USER
 * =========================================
 */

async function createUser(event) {

    event.preventDefault();

    const button =
        document.getElementById(
            "saveUserButton"
        );

    const request = {

        firstName:
            document.getElementById(
                "firstName"
            ).value.trim(),

        lastName:
            document.getElementById(
                "lastName"
            ).value.trim(),

        email:
            document.getElementById(
                "email"
            ).value.trim(),

        password:
            document.getElementById(
                "password"
            ).value,

        role:
            document.getElementById(
                "role"
            ).value
    };


    button.disabled = true;

    button.innerHTML = `

        <span
            class="spinner-border
                   spinner-border-sm
                   me-2">
        </span>

        Creating...

    `;


    try {

        const response =
            await API.post(
                "/users",
                request
            );

        if (!response) return;

        const data =
            await response.json();


        if (!response.ok) {

            showUserFormError(data);

            return;
        }


        addUserModal.hide();

        document
            .getElementById(
                "userForm"
            )
            .reset();

        showUsersAlert(
            "User created successfully.",
            "success"
        );

        await loadUsers();

    } catch (error) {

        console.error(error);

        showUserFormAlert(
            "Unable to connect to server.",
            "danger"
        );

    } finally {

        button.disabled = false;

        button.textContent =
            "Create User";

    }
}


/*
 * =========================================
 * ENABLE / DISABLE USER
 * =========================================
 */

async function changeStatus(
    userId,
    enabled
) {

    const action =
        enabled
            ? "enable"
            : "disable";


    const confirmed =
        confirm(
            `Are you sure you want to ${action} this user?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await API.request(
                `/users/${userId}/status?enabled=${enabled}`,
                {
                    method: "PATCH"
                }
            );


        if (!response) return;


        const data =
            await response.json();


        if (!response.ok) {

            showUsersAlert(
                data.message ||
                "Unable to update user.",
                "danger"
            );

            return;
        }


        showUsersAlert(
            `User ${action}d successfully.`,
            "success"
        );


        await loadUsers();

    } catch (error) {

        console.error(error);

        showUsersAlert(
            "Unable to connect to server.",
            "danger"
        );

    }
}

/*
 * =========================================
 * LOAD ROLES
 * =========================================
 */
async function loadRoles() {

    const roleSelect =
        document.getElementById("role");

    if (!roleSelect) {
        return;
    }

    try {

        const response =
            await API.get("/roles");

        if (!response) {
            return;
        }

        const roles =
            await response.json();

        if (!response.ok) {

            console.error(
                "Unable to load roles:",
                roles
            );

            return;
        }

        roleSelect.innerHTML = `

            <option value="">
                Select role
            </option>

        `;

        roles.forEach(role => {

            const option =
                document.createElement("option");

            option.value = role;

            option.textContent =
                formatRoleName(role);

            roleSelect.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Error loading roles:",
            error
        );

    }
}

/*
 * =========================================
 * POPULATE ROLE SELECT
 * =========================================
 */
function populateRoleSelect(
    select,
    roles
) {

    select.innerHTML = `

        <option value="">
            Select role
        </option>

    `;


    roles.forEach(role => {

        const option =
            document.createElement("option");

        option.value = role;

        option.textContent =
            formatRoleName(role);

        select.appendChild(option);

    });
}

function formatRoleName(role) {

    return role
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
}


/*
 * =========================================
 * ADD USER MODAL
 * =========================================
 */
async function openAddUserModal() {

    document
        .getElementById("userForm")
        .reset();

    const alert =
        document.getElementById(
            "userFormAlert"
        );

    alert.className =
        "alert d-none";


    /*
     * Load roles from backend
     */

    await loadRoles();


    addUserModal.show();
}


/*
 * =========================================
 * ERROR HANDLING
 * =========================================
 */

function showUserFormError(data) {

    if (data.errors) {

        const messages =
            Object.values(
                data.errors
            );

        showUserFormAlert(
            messages.join("<br>"),
            "danger",
            true
        );

    } else {

        showUserFormAlert(
            data.message ||
            "Unable to create user.",
            "danger"
        );
    }
}


function showUserFormAlert(
    message,
    type,
    html = false
) {

    const alert =
        document.getElementById(
            "userFormAlert"
        );

    alert.className =
        `alert alert-${type}`;

    if (html) {

        alert.innerHTML =
            message;

    } else {

        alert.textContent =
            message;

    }
}


function showUsersAlert(
    message,
    type
) {

    const alert =
        document.getElementById(
            "usersAlert"
        );

    if (!alert) return;

    alert.className =
        `alert alert-${type}`;

    alert.textContent =
        message;
}


/*
 * =========================================
 * SECURITY
 * =========================================
 */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}

