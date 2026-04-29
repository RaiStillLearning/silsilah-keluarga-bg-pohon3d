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
        // Jika sudah di halaman login, jangan redirect lagi
        if (window.location.pathname.includes("login.html")) return;

        const isAuth = localStorage.getItem(AUTH_KEY) === "true";
        
        if (!isAuth) {
            // Simpan URL asal untuk kembali setelah login
            localStorage.setItem("redirect_after_login", window.location.href);
            // Paksa pindah ke login.html segera
            window.location.replace("login.html");
            
            // Tambahan: Sembunyikan body jika redirect tertunda
            document.write('<style>body { display:none !important; }</style>');
        }
    }

    // Jalankan pengecekan segera setelah file dimuat
    checkAuth();

    // Export fungsi verifikasi ke window agar bisa dipakai di login.html
    window.verifyFamilyLogin = async function(username, password, skipRedirect = false) {
        if (username !== VALID_USERNAME) return false;
        
        const inputHash = await sha256(password);
        if (inputHash === HASHED_PASSWORD) {
            localStorage.setItem(AUTH_KEY, "true");
            if (!skipRedirect) {
                const redirect = localStorage.getItem("redirect_after_login") || "index.html";
                localStorage.removeItem("redirect_after_login");
                window.location.replace(redirect);
            }
            return true;
        }
        return false;
    };

    window.logoutFamily = function() {
        localStorage.removeItem(AUTH_KEY);
        window.location.replace("login.html");
    };
})();
