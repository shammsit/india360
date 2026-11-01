
const SUPABASE_URL = "https://fsbisocbgkivezbmbpes.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_43CMaeuD8RGpNtqoHOmI0g_SAL_Dt-Z";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

let checkingSession = false;

function showMessage(message, type = "error") {
    loginMessage.textContent = message;
    loginMessage.style.color =
        type === "success" ? "#16803c" : "#c0392b";
}

function setLoading(loading) {
    loginBtn.disabled = loading;
    loginBtn.textContent = loading ? "Please wait..." : "Sign In";
}

async function verifyAdmin(user) {
    if (!user || !user.id) {
        return null;
    }

    const { data, error } = await supabaseClient
        .from("admin_users")
        .select("user_id, email, role, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

    if (error) {
        console.error("Admin verification error:", error);
        throw new Error("Unable to verify administrator permissions.");
    }

    if (!data) {
        return null;
    }

    const allowedRoles = ["super_admin", "state_admin", "reviewer"];

    if (!allowedRoles.includes(data.role)) {
        return null;
    }

    return data;
}

async function redirectIfAdmin() {
    if (checkingSession) return;

    checkingSession = true;

    try {
        const { data: { session }, error } =
            await supabaseClient.auth.getSession();

        if (error) throw error;

        if (!session) return;

        const admin = await verifyAdmin(session.user);

        if (admin) {
            window.location.replace("dashboard.html");
        } else {
            await supabaseClient.auth.signOut();
            showMessage("Access denied. This account is not an authorized administrator.");
        }
    } catch (error) {
        console.error(error);
        showMessage(error.message || "Session verification failed.");
    } finally {
        checkingSession = false;
    }
}

// Check whether an administrator is already logged in.
redirectIfAdmin();

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    showMessage("");
    setLoading(true);

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            throw error;
        }

        const admin = await verifyAdmin(data.user);

        if (!admin) {
            await supabaseClient.auth.signOut();
            throw new Error(
                "Access denied. Your account does not have admin permission."
            );
        }

        showMessage("Login successful. Opening dashboard...", "success");

        window.location.replace("dashboard.html");

    } catch (error) {
        console.error("Login error:", error);
        showMessage(error.message || "Unable to sign in.");
    } finally {
        setLoading(false);
    }
});

// If the session expires or the user signs out, remain on login.
supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
        showMessage("Your session has ended. Please sign in again.");
    }
});
