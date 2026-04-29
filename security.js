/**
 * Security script for Family Tree protected pages.
 * Ensures the user has entered the correct username and password.
 */
(function() {
    const HASHED_PASSWORD = "d21e13f6c20c00f20f7d3682ae81c77cb77bf1ff5fc8457a6a946f7af0248f7f"; // SHA-256 of 'keluargaku'
    const VALID_USERNAME = "keluarga@gmail.com";
    const AUTH_KEY = "family_tree_auth";

    // Helper function to hash a string using SHA-256
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    function checkAuth() {
        if (window.location.pathname.endsWith("login.html")) return;
        const isAuth = localStorage.getItem(AUTH_KEY) === "true";
        if (!isAuth) {
            // Hide everything immediately to prevent content flash
            document.documentElement.style.display = 'none';
            localStorage.setItem("redirect_after_login", window.location.href);
            window.location.href = "login.html";
        }
    }

    // Run check immediately
    checkAuth();

    // Export verify function for the login page
    window.verifyFamilyLogin = async function(username, password, skipRedirect = false) {
        if (username !== VALID_USERNAME) return false;
        
        const inputHash = await sha256(password);
        if (inputHash === HASHED_PASSWORD) {
            localStorage.setItem(AUTH_KEY, "true");
            if (!skipRedirect) {
                const redirect = localStorage.getItem("redirect_after_login") || "index.html";
                localStorage.removeItem("redirect_after_login");
                window.location.href = redirect;
            }
            return true;
        }
        return false;
    };

    window.logoutFamily = function() {
        localStorage.removeItem(AUTH_KEY);
        window.location.href = "login.html";
    };
})();
