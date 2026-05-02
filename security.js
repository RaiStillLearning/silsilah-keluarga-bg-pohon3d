/**
 * Security script for Family Tree protected pages.
 * Includes Anti-Inspect, Clean URL, & Link Masking.
 */
(function() {
    const HASH_M = "d21e13f6c20c00f20f7d3682ae81c77cb77bf1ff5fc8457a6a946f7af0248f7f";
    const HASH_A = "6acdc47ff6574a1e6679f856058428c35c15104a1abe62b2b35c01c4e21f7de3";
    
    const AUTH_KEY = "family_tree_auth";
    const ROLE_KEY = "family_tree_role";

    // --- 1. ANTI-INSPECT PROTECTION ---
    function disableInspect() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.onkeydown = function(e) {
            if (e.keyCode == 123) return false;
            if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 105)) return false;
            if (e.metaKey && e.altKey && e.keyCode == 73) return false;
            if (e.ctrlKey && e.shiftKey && (e.keyCode == 74 || e.keyCode == 106)) return false;
            if (e.metaKey && e.altKey && e.keyCode == 74) return false;
            if (e.ctrlKey && e.keyCode == 85) return false;
            if (e.ctrlKey && e.shiftKey && e.keyCode == 67) return false;
        };
    }

    // --- 2. LINK MASKING / OBFUSCATION ---
    // Mengarahkan ke halaman menggunakan Base64 agar tidak terbaca di HTML
    window.navTo = function(encodedPath) {
        try {
            const path = atob(encodedPath);
            window.location.href = path;
        } catch (e) {
            console.error("Navigation error");
        }
    };

    function checkAuth() {
        if (window.location.pathname === "/login" || window.location.pathname.includes("login.html")) return;
        const isAuth = localStorage.getItem(AUTH_KEY) === "true";
        if (!isAuth) {
            document.documentElement.style.display = 'none';
            localStorage.setItem("redirect_after_login", window.location.href);
            window.location.replace("/login");
        }
    }

    disableInspect();
    checkAuth();

    window.verifyFamilyLogin = async function(u, p, skip = false) {
        const msgBuffer = new TextEncoder().encode(p);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        
        let role = null;
        if (u === "admin@gmail.com" && hashHex === HASH_A) role = "admin";
        else if (u === "keluarga@gmail.com" && hashHex === HASH_M) role = "member";

        if (role) {
            localStorage.setItem(AUTH_KEY, "true");
            localStorage.setItem(ROLE_KEY, role);
            if (!skip) {
                const r = localStorage.getItem("redirect_after_login") || "/";
                localStorage.removeItem("redirect_after_login");
                window.location.replace(r.replace(".html", ""));
            }
            return true;
        }
        return false;
    };

    window.isAdmin = () => localStorage.getItem(ROLE_KEY) === "admin";
    window.logoutFamily = () => {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(ROLE_KEY);
        window.location.replace("/login");
    };
})();
