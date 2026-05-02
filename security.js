/**
 * Security script for Family Tree protected pages.
 * Includes Anti-Inspect & Clean URL handling.
 */
(function() {
    const HASHED_MEMBER = "d21e13f6c20c00f20f7d3682ae81c77cb77bf1ff5fc8457a6a946f7af0248f7f";
    const HASHED_ADMIN = "6acdc47ff6574a1e6679f856058428c35c15104a1abe62b2b35c01c4e21f7de3"; // keluargaku123
    
    const VALID_MEMBER_EMAIL = "keluarga@gmail.com";
    const VALID_ADMIN_EMAIL = "admin@gmail.com";
    
    const AUTH_KEY = "family_tree_auth";
    const ROLE_KEY = "family_tree_role";

    // --- 1. ANTI-INSPECT / DEVTOOLS PROTECTION ---
    function disableInspect() {
        // Matikan Klik Kanan
        document.addEventListener('contextmenu', e => e.preventDefault());

        // Matikan Pintasan Keyboard
        document.onkeydown = function(e) {
            // F12
            if (e.keyCode == 123) return false;
            // Ctrl+Shift+I / Cmd+Option+I (Inspect)
            if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 105)) return false;
            if (e.metaKey && e.altKey && e.keyCode == 73) return false;
            // Ctrl+Shift+J / Cmd+Option+J (Console)
            if (e.ctrlKey && e.shiftKey && (e.keyCode == 74 || e.keyCode == 106)) return false;
            if (e.metaKey && e.altKey && e.keyCode == 74) return false;
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.keyCode == 85) return false;
            // Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && e.keyCode == 67) return false;
        };
    }

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    function checkAuth() {
        // Update redirect to use clean URL "/login"
        if (window.location.pathname === "/login" || window.location.pathname.includes("login.html")) return;
        
        const isAuth = localStorage.getItem(AUTH_KEY) === "true";
        if (!isAuth) {
            document.documentElement.style.display = 'none';
            localStorage.setItem("redirect_after_login", window.location.href);
            window.location.replace("/login");
        }
    }

    // Inisialisasi
    disableInspect();
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
                const redirect = localStorage.getItem("redirect_after_login") || "/";
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
        window.location.replace("/login");
    };
})();
