// Login/signup/token handling
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }

});


async function login(event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const button =
        document.getElementById("loginButton");

    setLoading(button, true);

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            showAlert(
                data.message || "Login failed.",
                "danger"
            );

            return;
        }

        /*
         * Store authentication information
         */

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify({
                userId: data.userId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                role: data.role
            })
        );

        showAlert(
            "Login successful. Redirecting...",
            "success"
        );

        setTimeout(() => {

            Session.redirectToDashboard();

        }, 500);

    } catch (error) {

        console.error(error);

        showAlert(
            "Unable to connect to the server.",
            "danger"
        );

    } finally {

        setLoading(button, false);

    }
}


function showAlert(message, type) {

    const alert =
        document.getElementById("alertMessage");

    if (!alert) return;

    alert.className =
        `alert alert-${type}`;

    alert.textContent = message;
}


function setLoading(button, loading) {

    if (!button) return;

    button.disabled = loading;

    if (loading) {

        button.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2">
            </span>
            Logging in...
        `;

    } else {

        button.textContent = "Login";

    }
}