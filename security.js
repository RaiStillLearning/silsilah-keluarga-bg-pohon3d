/**
 * Security script for Family Tree protected pages.
 * Includes Supabase Auth, Anti-Inspect, Clean URL, & Link Masking.
 */
(function() {
    // --- SUPABASE CONFIG ---
    const SUPABASE_URL = "https://gtuplmzrnggflusstydg.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_tWBQLp3YxXmyNTm-T-_Ahw_7qODsoc3";

    // --- LEGACY HASHES (fallback) ---
    const HASH_M = "d21e13f6c20c00f20f7d3682ae81c77cb77bf1ff5fc8457a6a946f7af0248f7f";
    const HASH_A = "6acdc47ff6574a1e6679f856058428c35c15104a1abe62b2b35c01c4e21f7de3";
    
    const AUTH_KEY = "family_tree_auth";
    const ROLE_KEY = "family_tree_role";

    // --- SUPABASE CLIENT (lightweight, no SDK needed) ---
    const supabaseAuth = {
        async signUp(email, password, fullName) {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    data: { full_name: fullName }
                })
            });
            return await res.json();
        },

        async signIn(email, password) {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ email, password })
            });
            return await res.json();
        },

        async signOut(accessToken) {
            await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        }
    };

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
    window.navTo = function(encodedPath) {
        try {
            const path = atob(encodedPath);
            window.location.href = path;
        } catch (e) {
            console.error("Navigation error");
        }
    };

    // --- 3. AUTH CHECK ---
    function checkAuth() {
        const path = window.location.pathname;
        if (path === "/login" || path.includes("login.html") || 
            path === "/register" || path.includes("register.html")) return;
        
        const isAuth = localStorage.getItem(AUTH_KEY) === "true";
        if (!isAuth) {
            document.documentElement.style.display = 'none';
            localStorage.setItem("redirect_after_login", window.location.href);
            window.location.replace("/login");
        }
    }

    disableInspect();
    checkAuth();

    // --- 4. PASSWORD VALIDATION ---
    window.validatePassword = function(password) {
        const rules = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
        const allPassed = Object.values(rules).every(v => v);
        const strength = Object.values(rules).filter(v => v).length;
        return { rules, allPassed, strength };
    };

    // --- 5. REGISTER ---
    window.registerFamily = async function(fullName, email, password) {
        try {
            const result = await supabaseAuth.signUp(email, password, fullName);
            if (result.error) {
                return { success: false, message: result.error.message || result.error_description || "Registrasi gagal" };
            }
            if (result.id || result.user) {
                return { success: true, message: "Akun berhasil dibuat! Silakan login." };
            }
            return { success: false, message: result.msg || "Registrasi gagal. Coba lagi." };
        } catch (err) {
            return { success: false, message: "Koneksi ke server gagal. Periksa internet Anda." };
        }
    };

    // --- 6. LOGIN (Supabase first, then legacy fallback) ---
    window.verifyFamilyLogin = async function(u, p, skip = false) {
        // Try Supabase Auth first
        try {
            const result = await supabaseAuth.signIn(u, p);
            if (result.access_token) {
                localStorage.setItem(AUTH_KEY, "true");
                localStorage.setItem(ROLE_KEY, "member");
                localStorage.setItem("supabase_token", result.access_token);
                localStorage.setItem("user_email", u);
                if (result.user && result.user.user_metadata) {
                    localStorage.setItem("user_name", result.user.user_metadata.full_name || u);
                }
                if (!skip) {
                    const r = localStorage.getItem("redirect_after_login") || "/";
                    localStorage.removeItem("redirect_after_login");
                    window.location.replace(r.replace(".html", ""));
                }
                return true;
            }
        } catch (e) {
            // Supabase failed, try legacy
        }

        // Legacy fallback (hardcoded hashes)
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

    // --- 7. UTILITY ---
    window.isAdmin = () => localStorage.getItem(ROLE_KEY) === "admin";
    
    window.logoutFamily = async () => {
        // Sign out from Supabase if token exists
        const token = localStorage.getItem("supabase_token");
        if (token) {
            try { await supabaseAuth.signOut(token); } catch(e) {}
        }
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(ROLE_KEY);
        localStorage.removeItem("supabase_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_name");
        window.location.replace("/login");
    };
})();
