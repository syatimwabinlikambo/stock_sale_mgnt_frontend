const Session = {

    getToken() {

        return localStorage.getItem("token");

    },


    getUser() {

        const user =
            localStorage.getItem("user");

        if (!user) {
            return null;
        }

        try {

            return JSON.parse(user);

        } catch {

            return null;

        }
    },


    isAuthenticated() {

        return !!this.getToken();

    },


    getRole() {

        const user = this.getUser();

        return user
            ? user.role
            : null;
    },


    logout() {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "../index.html";
    },


    redirectToDashboard() {

        const role =
            this.getRole();

        switch (role) {

            case "ADMIN":

                window.location.href =
                    "pages/admin-dashboard.html";

                break;

            case "MANAGER":

                window.location.href =
                    "pages/manager-dashboard.html";

                break;

            case "USER":

                window.location.href =
                    "pages/user-dashboard.html";

                break;
            case "CASHIER":

                window.location.href =
                    "pages/cashier_money.html";

                break;

            default:

                this.logout();
        }
    },


    requireAuthentication() {

        if (!this.isAuthenticated()) {

            window.location.href =
                "../index.html";

            return false;
        }

        return true;
    },


    requireRole(...allowedRoles) {

        if (!this.requireAuthentication()) {
            return false;
        }

        const role =
            this.getRole();

        if (!allowedRoles.includes(role)) {

            this.redirectToDashboard();

            return false;
        }

        return true;
    }
};