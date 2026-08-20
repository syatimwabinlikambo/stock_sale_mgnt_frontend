// Protected API calls
document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);


async function initializeDashboard() {

    const token =
        localStorage.getItem("token");

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    /*
     * No token = not authenticated
     */

    if (!token || !user) {

        window.location.href =
            "index.html";

        return;
    }

    /*
     * Display user information
     */

    document.getElementById("userName")
        .textContent =
        `${user.firstName} ${user.lastName}`;

    document.getElementById("fullName")
        .textContent =
        `${user.firstName} ${user.lastName}`;

    document.getElementById("userEmail")
        .textContent =
        user.email;

    document.getElementById("userRole")
        .textContent =
        user.role;


    /*
     * Test protected API
     */

    await checkAuthentication();


    /*
     * Logout
     */

    document.getElementById(
        "logoutButton"
    ).addEventListener(
        "click",
        logout
    );
}


async function checkAuthentication() {

    const token =
        localStorage.getItem("token");

    const status =
        document.getElementById("apiStatus");

    try {

        const response = await fetch(
            `${API_BASE_URL}/test/protected`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {

            logout();

            return;
        }

        const message =
            await response.text();

        if (response.ok) {

            status.className =
                "alert alert-success";

            status.textContent =
                message;

        } else {

            status.className =
                "alert alert-danger";

            status.textContent =
                "API authentication failed.";

        }

    } catch (error) {

        console.error(error);

        status.className =
            "alert alert-danger";

        status.textContent =
            "Unable to connect to API.";

    }
}


function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href =
        "index.html";
}