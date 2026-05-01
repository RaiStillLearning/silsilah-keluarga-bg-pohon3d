/**
 * Security script for Family Tree protected pages.
 */
(function() {
    const HASHED_MEMBER = "d21e13f6c20c00f20f7d3682ae81c77cb77bf1ff5fc8457a6a946f7af0248f7f";
    const HASHED_ADMIN = "6acdc47ff6574a1e6679f856058428c35c15104a1abe62b2b35c01c4e21f7de3"; // keluargaku123

    
    const VALID_MEMBER_EMAIL = "keluarga@gmail.com";
    const VALID_ADMIN_EMAIL = "admin@gmail.com";
    
    const AUTH_KEY = "family_tree_auth";
    const ROLE_KEY = "family_tree_role";

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    function checkAuth() {
        if (window.location.pathname.includes("login.html")) return;
        const isAuth = localStorage.getItem(AUTH_KEY) === "true";
        if (!isAuth) {
            document.documentElement.style.display = 'none';
            localStorage.setItem("redirect_after_login", window.location.href);
            window.location.replace("login.html");
        }
    }

    checkAuth();

    window.verifyFamilyLogin = async function(username, password, skipRedirect = false) {
        const inputHash = await sha256(password);
        let role = null;

        if (username === VALID_ADMIN_EMAIL && inputHash === HASHED_ADMIN) {
            role = "admin";
        } else if (username === VALID_MEMBER_EMAIL && inputHash === HASHED_MEMBER) {
            role = "member";
        }

        if (role) {
            localStorage.setItem(AUTH_KEY, "true");
            localStorage.setItem(ROLE_KEY, role);
            if (!skipRedirect) {
                const redirect = localStorage.getItem("redirect_after_login") || "index.html";
                localStorage.removeItem("redirect_after_login");
                window.location.replace(redirect);
            }
            return true;
        }
        return false;
    };

    window.isAdmin = function() {
        return localStorage.getItem(ROLE_KEY) === "admin";
    };

    window.logoutFamily = function() {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(ROLE_KEY);
        window.location.replace("login.html");
    };
})();
