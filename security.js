/**
 * Security script for Family Tree protected pages.
 * Includes Supabase Auth, Anti-Inspect, Clean URL, & Link Masking.
 */
(function() {
    // --- SUPABASE CONFIG ---
    const SUPABASE_URL = "https://gtuplmzrnggflusstydg.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dXBsbXpybmdnZmx1c3N0eWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MzkyMDcsImV4cCI6MjA5MzIxNTIwN30.hRqHPkQFbrTw5lFmxtDuACJdK68pwkUncDMDWgCJqNE";

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
        },

        async sendOTP(email) {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ email, create_user: false })
            });
            return await res.json();
        },

        async verifyLoginOTP(email, token) {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ type: 'magiclink', email, token })
            });
            return await res.json();
        }
    };

    // --- 1. ANTI-INSPECT PROTECTION ---
    function disableInspect() {
        // Block right-click
        document.addEventListener('contextmenu', e => e.preventDefault());

        // Block keyboard shortcuts (Win/Mac)
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === 123) { e.preventDefault(); return false; } // F12
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 73) { e.preventDefault(); return false; } // Ctrl+Shift+I
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 74) { e.preventDefault(); return false; } // Ctrl+Shift+J
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 67) { e.preventDefault(); return false; } // Ctrl+Shift+C
            if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) { e.preventDefault(); return false; }  // Ctrl+U
            if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) { e.preventDefault(); return false; }  // Ctrl+S
            if (e.metaKey && e.altKey && e.keyCode === 73) { e.preventDefault(); return false; }     // Cmd+Opt+I
            if (e.metaKey && e.altKey && e.keyCode === 74) { e.preventDefault(); return false; }     // Cmd+Opt+J
        });

        // Detect DevTools via window size difference
        const threshold = 160;
        function detectBySize() {
            const widthDiff = window.outerWidth - window.innerWidth;
            const heightDiff = window.outerHeight - window.innerHeight;
            if (widthDiff > threshold || heightDiff > threshold) {
                document.body.innerHTML = '<div style="display:flex;height:100vh;align-items:center;justify-content:center;font-family:sans-serif;color:#666;"><p>Akses tidak diizinkan.</p></div>';
                setTimeout(() => window.location.replace('/login'), 1000);
            }
        }
        setInterval(detectBySize, 1000);

        // Detect DevTools via Image id getter trick
        const devImg = new Image();
        Object.defineProperty(devImg, 'id', {
            get: function() {
                document.body.innerHTML = '';
                window.location.replace('/login');
            }
        });
        setInterval(function() {
            console.log('%c', devImg);
            console.clear();
        }, 1500);
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
            path === "/register" || path.includes("register.html") ||
            path === "/verify-otp" || path.includes("verify-otp.html")) return;

        // Handle Supabase magic link callback (access_token in URL hash)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            const type = params.get('type');
            if (accessToken && type === 'signup') {
                localStorage.setItem(AUTH_KEY, "true");
                localStorage.setItem(ROLE_KEY, "member");
                localStorage.setItem("supabase_token", accessToken);
                localStorage.removeItem("pending_verify_email");
                // Clean URL and redirect
                window.history.replaceState(null, '', '/home');
                window.location.replace('/home');
                return;
            }
        }
        
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
                localStorage.setItem('pending_verify_email', email);
                return { success: true, message: "Kode OTP telah dikirim ke email Anda!", needVerify: true };
            }
            return { success: false, message: result.msg || "Registrasi gagal. Coba lagi." };
        } catch (err) {
            return { success: false, message: "Koneksi ke server gagal. Periksa internet Anda." };
        }
    };

    // --- 5b. VERIFY OTP ---
    window.verifyOTP = async function(email, token) {
        try {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ type: 'signup', email: email, token: token })
            });
            const data = await res.json();
            if (res.ok && (data.access_token || data.user)) {
                return { success: true };
            }
            return { success: false, message: data.error_description || data.msg || 'Kode OTP salah atau sudah expired.' };
        } catch (err) {
            return { success: false, message: 'Koneksi ke server gagal.' };
        }
    };

    // --- 5c. RESEND VERIFICATION ---
    window.resendVerification = async function(email) {
        try {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/resend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ type: 'signup', email: email })
            });
            if (res.ok) {
                return { success: true };
            }
            const data = await res.json();
            return { success: false, message: data.error_description || data.msg || 'Gagal mengirim ulang kode.' };
        } catch (err) {
            return { success: false, message: 'Koneksi ke server gagal.' };
        }
    };

    // --- 5d. LOGIN OTP ---
    window.requestLoginOTP = async function(email) {
        try {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ email, create_user: false })
            });
            const data = await res.json();
            // Supabase returns empty {} on success, or { error: ... } on failure
            if (data.error || data.msg || data.code >= 400) {
                return { success: false, message: data.error?.message || data.msg || "Gagal mengirim OTP" };
            }
            return { success: true };
        } catch (err) {
            return { success: false, message: "Koneksi ke server gagal." };
        }
    };

    window.verifyLoginOTP = async function(email, token) {
        try {
            const result = await supabaseAuth.verifyLoginOTP(email, token);
            if (result.access_token) {
                const role = result.user?.user_metadata?.role || "member";
                localStorage.setItem(AUTH_KEY, "true");
                localStorage.setItem(ROLE_KEY, role);
                localStorage.setItem("supabase_token", result.access_token);
                localStorage.setItem("user_email", email);
                if (result.user && result.user.user_metadata) {
                    localStorage.setItem("user_name", result.user.user_metadata.full_name || email);
                }
                return { success: true };
            }
            return { success: false, message: result.error_description || "Kode OTP salah" };
        } catch (err) {
            return { success: false, message: "Koneksi ke server gagal." };
        }
    };

    // --- 6. LOGIN (Supabase first, then legacy fallback) ---
    window.verifyFamilyLogin = async function(u, p, skip = false) {
        // Try Supabase Auth first
        try {
            const result = await supabaseAuth.signIn(u, p);
            if (result.access_token) {
                const role = result.user?.user_metadata?.role || "member";
                localStorage.setItem(AUTH_KEY, "true");
                localStorage.setItem(ROLE_KEY, role);
                localStorage.setItem("supabase_token", result.access_token);
                localStorage.setItem("user_email", u);
                if (result.user && result.user.user_metadata) {
                    localStorage.setItem("user_name", result.user.user_metadata.full_name || u);
                }
                if (!skip) {
                    const r = localStorage.getItem("redirect_after_login") || "/home";
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
                const r = localStorage.getItem("redirect_after_login") || "/home";
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
