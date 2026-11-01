
const SUPABASE_URL = "https://fsbisocbgkivezbmbpes.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_43CMaeuD8RGpNtqoHOmI0g_SAL_Dt-Z";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const allowedRoles = [
    "super_admin",
    "state_admin",
    "reviewer"
];

let isAuthorized = false;
let verificationInProgress = false;

function hideDashboard() {
    isAuthorized = false;
    document.documentElement.classList.add("auth-check");
}

function showDashboard() {
    document.documentElement.classList.remove("auth-check");
}

function redirectToLogin() {
    hideDashboard();
    window.location.replace("login.html");
}

async function verifyDashboardAccess() {
    if (verificationInProgress) return;

    verificationInProgress = true;
    hideDashboard();

    try {
        // Verify the actual user with Supabase Auth.
        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError || !userData.user) {
            redirectToLogin();
            return;
        }

        const user = userData.user;

        // Verify the user's admin permission in the database.
        const { data: admin, error: adminError } =
            await supabaseClient
                .from("admin_users")
                .select("user_id, email, role, is_active")
                .eq("user_id", user.id)
                .eq("is_active", true)
                .maybeSingle();

        if (adminError) {
            console.error("Admin verification failed:", adminError);
            redirectToLogin();
            return;
        }

        if (!admin || !allowedRoles.includes(admin.role)) {
            await supabaseClient.auth.signOut();
            redirectToLogin();
            return;
        }

        // Only now reveal the dashboard.
        document.getElementById("adminEmail").textContent =
            admin.email || user.email || "Administrator";

        document.getElementById("adminRole").textContent =
            admin.role.replaceAll("_", " ");

        document.getElementById("securityStatus").textContent =
            "Authorized Admin";

        isAuthorized = true;
        showDashboard();

    } catch (error) {
        console.error("Dashboard security error:", error);
        redirectToLogin();
    } finally {
        verificationInProgress = false;
    }
}

// Logout
document.getElementById("logoutBtn").addEventListener(
    "click",
    async function () {
        hideDashboard();

        this.disabled = true;
        this.textContent = "Signing out...";

        try {
            const { error } = await supabaseClient.auth.signOut();

            if (error) {
                throw error;
            }

            redirectToLogin();

        } catch (error) {
            console.error("Logout failed:", error);
            this.disabled = false;
            this.textContent = "Logout";

            // Keep dashboard hidden if logout status is uncertain.
            redirectToLogin();
        }
    }
);

// Recheck access whenever the page loads or is restored from browser cache.
window.addEventListener("pageshow", function () {
    verifyDashboardAccess();
});

// Also respond to sign-out in another tab.
supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
        redirectToLogin();
    }
});

// Initial verification
verifyDashboardAccess();
