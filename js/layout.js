/*
 * ============================================================
 * layout.js
 * ============================================================
 *
 * Responsible for rendering the common application layout:
 *
 *  - Responsive sidebar
 *  - Top navbar
 *  - Dashboard navigation
 *  - User information
 *  - Role badge
 *  - Logout
 *  - Mobile sidebar toggle
 *  - Role-based menu items
 *
 * Requirements:
 *  - session.js must be loaded before this file
 *  - Session object must be available
 *
 * ============================================================
 */


/*
 * ============================================================
 * GET DASHBOARD LINK
 * ============================================================
 */

function getDashboardLink(role) {

    switch (role) {

        case "ADMIN":

            return "admin-dashboard.html";


        case "MANAGER":

            return "manager-dashboard.html";


        case "USER":

            return "user-dashboard.html";


        default:

            return "user-dashboard.html";
    }
}


/*
 * ============================================================
 * GET ROLE LABEL
 * ============================================================
 */

function getRoleLabel(role) {

    switch (role) {

        case "ADMIN":

            return "Administrator";


        case "MANAGER":

            return "Manager";


        case "USER":

            return "User";


        default:

            return role || "User";
    }
}
/*
 * ============================================================
 * GET ROLE BADGE CLASS
 * ============================================================
 */

function getRoleBadgeClass(role) {

    switch (role) {

        case "ADMIN":

            return "bg-danger";


        case "MANAGER":

            return "bg-warning text-dark";


        case "USER":

            return "bg-primary";


        default:

            return "bg-secondary";
    }
}
/*
 * ============================================================
 * RENDER APPLICATION LAYOUT
 * ============================================================
 */
function renderLayout() {

    /*
     * --------------------------------------------------------
     * Get current user
     * --------------------------------------------------------
     */

    const user = Session.getUser();
    /*
     * --------------------------------------------------------
     * If there is no authenticated user,
     * do not render the application.
     * --------------------------------------------------------
     */

    if (!user) {

        console.warn(
            "No authenticated user found."
        );

        return;
    }
    /*
     * --------------------------------------------------------
     * Find layout container
     * --------------------------------------------------------
     */

    const layout =
        document.getElementById(
            "appLayout"
        );


    if (!layout) {

        console.error(
            "Element #appLayout was not found."
        );

        return;
    }
    /*
     * --------------------------------------------------------
     * Current user information
     * --------------------------------------------------------
     */

    const userId =
        user.userId ||
        user.id;

    const firstName =
        user.firstName || "";

    const lastName =
        user.lastName || "";

    const email =
        user.email || "";

    const role =
        user.role || "USER";

    /*
     * --------------------------------------------------------
     * Navigation information
     * --------------------------------------------------------
     */
    const dashboardLink =
        getDashboardLink(role);

    const roleLabel =
        getRoleLabel(role);

    const roleBadgeClass =
        getRoleBadgeClass(role);

    /*
     * --------------------------------------------------------
     * Render layout
     * --------------------------------------------------------
     */
    layout.innerHTML = `

        <div class="app-wrapper">

            <!-- =================================================
                 SIDEBAR
                 ================================================= -->

            <aside
                id="sidebar"
                class="sidebar">


                <!-- SIDEBAR HEADER -->

                <div class="sidebar-header">

                    <div
                        class="d-flex
                               align-items-center
                               justify-content-between">


                        <span class="sidebar-logo">
                            <img src="../assets/logo/logo-bonaccueil-1-3.png"
                                        alt="Logo">
                        </span>
                    <!--   <h4 class="mb-0">

                            YourApp

                        </h4> -->


                        <!-- Mobile close button -->

                        <button
                            type="button"
                            id="sidebarClose"
                            class="btn
                                   btn-sm
                                   btn-outline-light
                                   d-lg-none">

                            ✕

                        </button>

                    </div>

                </div>


                <!-- USER PROFILE -->

                <div
                    class="sidebar-user
                           px-3
                           py-3
                           border-bottom">

                    <div
                        class="d-flex
                               align-items-center">

                        <div
                            class="rounded-circle
                                   bg-primary
                                   text-white
                                   d-flex
                                   align-items-center
                                   justify-content-center
                                   me-2"
                            style="
                                width: 42px;
                                height: 42px;
                            ">

                            ${escapeLayoutHtml(
        firstName
            ? firstName
                .charAt(0)
                .toUpperCase()
            : "U"
    )}
                        </div>


                        <div
                            class="overflow-hidden">

                            <div
                                class="fw-semibold
                                       text-white
                                       text-truncate">

                                ${escapeLayoutHtml(
        firstName
    )}
                                ${escapeLayoutHtml(
        lastName
    )}
                            </div>


                            <small
                                class="text-secondary
                                       text-truncate
                                       d-block">

                                ${escapeLayoutHtml(
        email
    )}
                            </small>

                        </div>

                    </div>

                </div>

                <!-- SIDEBAR MENU -->

                <nav class="sidebar-menu">


                    <!-- DASHBOARD -->

                <a
                    href="${dashboardLink}"
                    class="sidebar-link">

                    <span class="sidebar-icon">

                        <img
                            src="../assets/icons/icons8-dashboard-96.png"
                            alt="Dashboard Icon">

                    </span>

                    <span>
                        Dashboard
                    </span>

                </a>

                    <!-- =========================================
                         ADMIN MENU
                         ========================================= -->

                    ${role === "ADMIN"
            ? `
                            <a
                                href="users.html"
                                class="sidebar-link">

                                <span class="sidebar-icon">

                                    <img
                                        src="../assets/icons/icons8-users-90.png"
                                        alt="Users">

                                </span>

                                <span>
                                    Users
                                </span>

                            </a>

                            <a
                                href="products.html"
                                class="sidebar-link">

                                <span class="sidebar-icon">

                                    <img
                                        src="../assets/icons/icons8-open-box-50.png"
                                        alt="Products">

                                </span>

                                <span>
                                    Products
                                </span>

                            </a>

                            <a
                                href="stock.html"
                                class="sidebar-link">

                                <span class="sidebar-icon">

                                    <img
                                        src="../assets/icons/icons8-stock-100.png"
                                        alt="Stock">

                                </span>

                                <span>
                                    Stock
                                </span>

                            </a>
                            <a
                                href="customers.html"
                                class="sidebar-link">

                                <span class="sidebar-icon">

                                    <img
                                        src="../assets/icons/icons8-customers-100.png"
                                        alt="Customers">

                                </span>

                                <span>
                                    Customers
                                </span>

                            </a>

                            <a
                                href="#"
                                class="sidebar-link">

                                <span
                                    class="sidebar-icon">

                                    <img src="../assets/icons/icons8-settings-90.png"
                                        alt="Settings">

                                </span>

                                <span>
                                    Settings
                                </span>

                            </a>

                        `
            : ""
        }

                    <!-- =========================================
                         MANAGER MENU
                         ========================================= -->

                    ${role === "MANAGER"
            ? `
                            <div
                                class="sidebar-section-title">

                                Management

                            </div>


                            <a
                                href="#"
                                class="sidebar-link">

                                <span
                                    class="sidebar-icon">

                                    📦

                                </span>

                                <span>
                                    Operations
                                </span>

                            </a>

                            <a
                                href="#"
                                class="sidebar-link">

                                <span
                                    class="sidebar-icon">

                                    📊

                                </span>

                                <span>
                                    Reports
                                </span>

                            </a>

                            <a
                                href="products.html"
                                class="sidebar-link">

                                <span class="sidebar-icon">

                                    <img
                                        src="../assets/icons/icons8-open-box-50.png"
                                        alt="Products">

                                </span>

                                <span>
                                    Products
                                </span>

                            </a>

                            <a
                                href="stock.html"
                                class="sidebar-link">

                                <span class="sidebar-icon">

                                    <img
                                        src="../assets/icons/icons8-stock-100.png"
                                        alt="Stock">

                                </span>

                                <span>
                                    Stock
                                </span>

                            </a>
                            <a
                                href="customers.html"
                                class="sidebar-link">

                                <span class="sidebar-icon">

                                      <img
                                        src="../assets/icons/icons8-customers-100.png"
                                        alt="Customers">

                                </span>

                                <span>
                                    Customers
                                </span>

                            </a>

                            {

                        }

                        `
                    : ""
                    }

                    <!-- =========================================
                         USER MENU
                         ========================================= -->

                    ${role === "USER"
            ? `
                            <div
                                class="sidebar-section-title">

                                Application

                            </div>


                            <a
                                href="#"
                                class="sidebar-link">

                                <span
                                    class="sidebar-icon">

                                    📄

                                </span>

                                <span>
                                    My Activities
                                </span>

                            </a>

                            <a
                                href="products.html"
                                class="sidebar-link">

                                <span class="sidebar-icon">

                                    <img
                                        src="../assets/icons/icons8-open-box-50.png"
                                        alt="Products">

                                </span>

                                <span>
                                    Products
                                </span>

                            </a>

                        `
            : ""
        }

                </nav>


                <!-- SIDEBAR FOOTER -->

                <div
                    class="sidebar-footer
                           px-3
                           py-3">

                    <button
                        type="button"
                        id="sidebarLogoutButton"
                        class="btn
                               btn-outline-light
                               btn-sm
                               w-100">

                        <img src="../assets/icons/icons8-logout-96.png"
                                        alt="Settings"> Logout

                    </button>

                </div>

            </aside>

            <!-- =================================================
                 MAIN CONTENT
                 ================================================= -->

            <div class="main-content">


                <!-- =================================================
                     TOP NAVBAR
                     ================================================= -->

                <nav
                    class="navbar
                           navbar-expand-lg
                           navbar-light
                           bg-white
                           shadow-sm">


                    <div
                        class="container-fluid">


                        <!-- MOBILE SIDEBAR BUTTON -->

                        <button
                            type="button"
                            class="btn
                                   btn-outline-secondary
                                   d-lg-none
                                   me-2"
                            id="sidebarToggle">

                            ☰

                        </button>


                        <!-- APPLICATION TITLE -->

                        <span
                            class="navbar-brand">

                            <img src="../assets/logo/logo-bonaccueil-1-3.png"
                                        alt="Logo">

                        </span>


                        <!-- RIGHT SIDE -->

                        <div
                            class="ms-auto
                                   d-flex
                                   align-items-center">


                            <!-- USER NAME -->

                            <div
                                class="d-none
                                       d-md-block
                                       text-end
                                       me-3">

                                <div
                                    class="fw-semibold">

                                    ${escapeLayoutHtml(
            firstName
        )}
                                    ${escapeLayoutHtml(
            lastName
        )}

                                </div>

                                <small
                                    class="text-muted">

                                    ${escapeLayoutHtml(
            email
        )}

                                </small>

                            </div>


                            <!-- ROLE -->

                            <span
                                class="badge
                                       ${roleBadgeClass}
                                       me-3">

                                ${escapeLayoutHtml(
            roleLabel
        )}

                            </span>


                            <!-- LOGOUT -->

                            <button
                                type="button"
                                id="logoutButton"
                                class="btn
                                       btn-outline-danger
                                       btn-sm
                                       d-none
                                       d-sm-inline-block">

                                Logout

                            </button>


                        </div>

                    </div>

                </nav>


                <!-- =================================================
                     PAGE CONTENT
                     ================================================= -->

                <main
                    class="container-fluid
                           p-3
                           p-md-4">

                    <div id="pageContent"></div>

                </main>


            </div>

        </div>


        <!-- =====================================================
             MOBILE SIDEBAR OVERLAY
             ===================================================== -->

        <div
            id="sidebarOverlay"
            class="sidebar-overlay">

        </div>

    `;


    /*
     * ========================================================
     * EVENT LISTENERS
     * ========================================================
     */


    /*
     * --------------------------------------------------------
     * Desktop/mobile logout
     * --------------------------------------------------------
     */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            handleLogout
        );

    }


    const sidebarLogoutButton =
        document.getElementById(
            "sidebarLogoutButton"
        );


    if (sidebarLogoutButton) {

        sidebarLogoutButton.addEventListener(
            "click",
            handleLogout
        );

    }


    /*
     * --------------------------------------------------------
     * Mobile sidebar toggle
     * --------------------------------------------------------
     */

    const sidebarToggle =
        document.getElementById(
            "sidebarToggle"
        );


    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            openSidebar
        );

    }


    /*
     * --------------------------------------------------------
     * Mobile sidebar close
     * --------------------------------------------------------
     */

    const sidebarClose =
        document.getElementById(
            "sidebarClose"
        );


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );

    }


    /*
     * --------------------------------------------------------
     * Overlay click
     * --------------------------------------------------------
     */

    const sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    /*
     * --------------------------------------------------------
     * Close sidebar when clicking a link
     * on mobile
     * --------------------------------------------------------
     */

    const sidebarLinks =
        document.querySelectorAll(
            ".sidebar-link"
        );


    sidebarLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <
                        992
                    ) {

                        closeSidebar();

                    }

                }
            );

        }
    );

}


/*
 * ============================================================
 * LOGOUT
 * ============================================================
 */

function handleLogout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {

        return;
    }


    Session.logout();
}


/*
 * ============================================================
 * OPEN SIDEBAR
 * ============================================================
 */

function openSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (sidebar) {

        sidebar.classList.add(
            "show"
        );

    }


    if (overlay) {

        overlay.classList.add(
            "show"
        );

    }


    document.body.classList.add(
        "sidebar-open"
    );
}


/*
 * ============================================================
 * CLOSE SIDEBAR
 * ============================================================
 */

function closeSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "show"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "sidebar-open"
    );
}


/*
 * ============================================================
 * ESCAPE HTML
 * ============================================================
 *
 * Prevents user information such as names/emails from being
 * injected directly into the HTML.
 *
 * ============================================================
 */

function escapeLayoutHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;
}