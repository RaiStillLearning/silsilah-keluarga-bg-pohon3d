/**
 * Security script for Family Tree protected pages.
 * Ensures the user has entered the correct password.
 */
(function() {
    const PASSWORD = "keluargaku"; // The shared family password
    const AUTH_KEY = "family_tree_auth";

    function checkAuth() {
        if (window.location.pathname.endsWith("login.html")) return;
        const isAuth = localStorage.getItem(AUTH_KEY) === "true";
        if (!isAuth) {
            // Store current URL to return after login
            localStorage.setItem("redirect_after_login", window.location.href);
            window.location.href = "login.html";
        }
    }

    // Run check immediately
    checkAuth();

    // Export verify function for the login page
    window.verifyFamilyPassword = function(input) {
        if (input === PASSWORD) {
            localStorage.setItem(AUTH_KEY, "true");
            const redirect = localStorage.getItem("redirect_after_login") || "index.html";
            localStorage.removeItem("redirect_after_login");
            window.location.href = redirect;
            return true;
        }
        return false;
    };
})();
