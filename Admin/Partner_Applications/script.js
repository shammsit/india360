
const SUPABASE_URL = "https://fsbisocbgkivezbmbpes.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_43CMaeuD8RGpNtqoHOmI0g_SAL_Dt-Z";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const FUNCTION_NAME = "partner-applications";
const PAGE_SIZE = 20;

let currentPage = 1;
let totalApplications = 0;
let selectedApplication = null;
let currentState = "andhra_pradesh";
let searchTimer = null;

const $ = (id) => document.getElementById(id);

const tableBody = $("applicationTable");
const message = $("message");
const modal = $("detailsModal");

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function showMessage(text, type = "error") {
    message.textContent = text;
    message.style.color =
        type === "success" ? "#16803c" : "#b42318";
}

function showReviewMessage(text, type = "error") {
    $("reviewMessage").textContent = text;
    $("reviewMessage").style.color =
        type === "success" ? "#16803c" : "#b42318";
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatValue(value) {
    if (Array.isArray(value)) return value.join(", ") || "—";
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
}

function statusClass(status) {
    return String(status || "PENDING")
        .toLowerCase()
        .replace(/[^a-z_]/g, "");
}

function statusBadge(status) {
    const safeStatus = escapeHTML(status || "PENDING");

    return `
        <span class="status status-${statusClass(status)}">
            ${safeStatus.replaceAll("_", " ")}
        </span>
    `;
}

function safeURL(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol)
            ? url.href
            : null;
    } catch {
        return null;
    }
}

function documentLink(label, value) {
    const url = safeURL(value);

    if (!url) {
        return `<span>${escapeHTML(label)}: ${escapeHTML(value || "Not provided")}</span>`;
    }

    return `
        <a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHTML(label)} — Open document
        </a>
    `;
}

async function callFunction(payload) {
    const { data: { session }, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !session) {
        window.location.replace("../login.html");
        throw new Error("Your admin session has expired. Please sign in again.");
    }

    const { data, error } = await supabaseClient.functions.invoke(
        FUNCTION_NAME,
        {
            body: {
                ...payload,
                state: currentState
            }
        }
    );

    if (error) {
        let details = error.message || "Edge Function request failed.";

        try {
            if (error.context && typeof error.context.json === "function") {
                const response = await error.context.json();
                details = response.error || details;
            }
        } catch (_) {}

        throw new Error(details);
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    return data;
}

// Verify central administrator session for this page.
async function initializePage() {
    try {
        const { data: { user }, error } =
            await supabaseClient.auth.getUser();

        if (error || !user) {
            window.location.replace("../login.html");
            return;
        }

        const { data: admin, error: adminError } =
            await supabaseClient
                .from("admin_users")
                .select("email, role, is_active")
                .eq("user_id", user.id)
                .eq("is_active", true)
                .maybeSingle();

        if (adminError || !admin ||
            !["super_admin", "state_admin", "reviewer"].includes(admin.role)) {
            await supabaseClient.auth.signOut();
            window.location.replace("../login.html");
            return;
        }

        $("adminEmail").textContent = admin.email || user.email;
        $("connectionStatus").textContent = "Verifying state connection...";

        await loadDashboard();
    } catch (error) {
        console.error(error);
        $("connectionStatus").textContent = "Connection failed";
        showMessage(error.message);
    }
}

// Load summary statistics and applications.
async function loadDashboard() {
    $("connectionStatus").textContent = "Connecting...";
    $("stateHeading").textContent = "Andhra Pradesh applications";

    try {
        await loadStats();
        await loadApplications();

        $("connectionStatus").textContent = "Database connected";
    } catch (error) {
        $("connectionStatus").textContent = "Connection error";
        showMessage(error.message);
    }
}

async function loadStats() {
    const data = await callFunction({ action: "stats" });

    $("totalCount").textContent = data.total ?? 0;
    $("pendingCount").textContent = data.pending ?? 0;
    $("reviewCount").textContent = data.under_review ?? 0;
    $("approvedCount").textContent = data.approved ?? 0;
    $("rejectedCount").textContent = data.rejected ?? 0;
}

async function loadApplications() {
    tableBody.innerHTML = `
        <tr><td colspan="7" class="empty-cell">Loading applications...</td></tr>
    `;

    showMessage("");

    const data = await callFunction({
        action: "list",
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: $("searchInput").value.trim(),
        status: $("statusFilter").value
    });

    const applications = data.applications || [];
    totalApplications = data.total || 0;

    if (!applications.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-cell">
                    No applications found.
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = applications.map(app => `
            <tr>
                <td>#${escapeHTML(app.application_number)}</td>
                <td>
                    <strong>${escapeHTML(app.full_name)}</strong><br>
                    <small>${escapeHTML(app.email)}</small>
                </td>
                <td>${escapeHTML(app.mobile)}</td>
                <td>${escapeHTML(app.district)}</td>
                <td>${formatDate(app.created_at)}</td>
                <td>${statusBadge(app.application_status)}</td>
                <td>
                    <button
                        class="view-btn"
                        type="button"
                        data-id="${escapeHTML(app.id)}"
                    >
                        View
                    </button>
                </td>
            </tr>
        `).join("");
    }

    const totalPages = Math.max(1, Math.ceil(totalApplications / PAGE_SIZE));

    $("pageInfo").textContent =
        `Page ${currentPage} of ${totalPages}`;

    $("previousBtn").disabled = currentPage <= 1;
    $("nextBtn").disabled = currentPage >= totalPages;
}

// Application detail helpers.
function detailItem(label, value) {
    return `
        <div class="detail-item">
            <small>${escapeHTML(label)}</small>
            <div>${escapeHTML(formatValue(value))}</div>
        </div>
    `;
}

function detailSection(title, fields) {
    return `
        <section class="detail-section">
            <h3>${escapeHTML(title)}</h3>
            <div class="detail-grid">
                ${fields.join("")}
            </div>
        </section>
    `;
}

function renderDetails(app) {
    const fields = [];

    fields.push(detailSection("Personal Information", [
        detailItem("Full Name", app.full_name),
        detailItem("Application Number", app.application_number),
        detailItem("Date of Birth", app.date_of_birth),
        detailItem("Gender", app.other_gender || app.gender),
        detailItem("Email", app.email),
        detailItem("Mobile", app.mobile),
        detailItem("WhatsApp", app.whatsapp)
    ]));

    fields.push(detailSection("Location Information", [
        detailItem("State", app.state),
        detailItem("District", app.district),
        detailItem("City", app.city),
        detailItem("PIN Code", app.pincode),
        detailItem("Full Address", app.full_address),
        detailItem("Latitude", app.latitude),
        detailItem("Longitude", app.longitude),
        detailItem("Location Accuracy", app.location_accuracy)
    ]));

    fields.push(detailSection("Education and Occupation", [
        detailItem("Education", app.other_education || app.education),
        detailItem("Institution", app.institution),
        detailItem("Occupation", app.other_occupation || app.occupation)
    ]));

    fields.push(detailSection("Skills and Experience", [
        detailItem("Languages", app.other_languages
            ? [...(app.languages || []), app.other_languages]
            : app.languages),
        detailItem("Technologies", app.other_technologies
            ? [...(app.technologies || []), app.other_technologies]
            : app.technologies),
        detailItem("Experience", app.experience),
        detailItem("Interests", app.other_interests
            ? [...(app.interests || []), app.other_interests]
            : app.interests),
        detailItem("Motivation", app.motivation),
        detailItem("Contribution", app.contribution)
    ]));

    fields.push(detailSection("Online Profiles", [
        detailItem("LinkedIn", app.linkedin),
        detailItem("GitHub", app.github),
        detailItem("Portfolio", app.portfolio),
        detailItem("Social Profile", app.social_profile)
    ]));

    const documentLinks = [
        documentLink("Google Drive Folder", app.drive_link)
    ];

    if (Array.isArray(app.documents)) {
        app.documents.forEach((doc, index) => {
            documentLinks.push(
                `<span>${escapeHTML(doc)}</span>`
            );
        });
    }

    fields.push(`
        <section class="detail-section">
            <h3>Documents and Declarations</h3>
            <div class="document-links">
                ${documentLinks.join("")}
                ${detailItem("Video Uploaded", app.video_uploaded)}
                ${detailItem("Accuracy Declaration", app.accuracy_declaration)}
                ${detailItem("Terms Accepted", app.terms_accepted)}
                ${detailItem("Contact Consent", app.contact_consent)}
            </div>
        </section>
    `);

    fields.push(detailSection("Review Information", [
        detailItem("Application Status", app.application_status),
        detailItem("Admin Remarks", app.admin_remarks),
        detailItem("Submitted On", formatDate(app.created_at)),
        detailItem("Reviewed On", formatDate(app.reviewed_at))
    ]));

    $("applicationDetails").innerHTML = fields.join("");
}

async function openApplication(id) {
    selectedApplication = null;
    modal.hidden = false;

    $("applicationDetails").textContent = "Loading application details...";
    $("modalApplicationNumber").textContent = "";
    $("adminRemarks").value = "";
    showReviewMessage("");

    try {
        const data = await callFunction({
            action: "details",
            id
        });

        selectedApplication = data.application;

        $("modalApplicationNumber").textContent =
            `Application #${selectedApplication.application_number}`;

        $("adminRemarks").value =
            selectedApplication.admin_remarks || "";

        renderDetails(selectedApplication);

    } catch (error) {
        $("applicationDetails").textContent = error.message;
    }
}

async function updateApplication(status) {
    if (!selectedApplication) return;

    const remarks = $("adminRemarks").value.trim();

    if (status === "REJECTED" && !remarks) {
        showReviewMessage("A rejection reason is required.");
        $("adminRemarks").focus();
        return;
    }

    const buttons = [
        $("underReviewBtn"),
        $("approveBtn"),
        $("rejectBtn")
    ];

    buttons.forEach(button => button.disabled = true);
    showReviewMessage("Updating application...");

    try {
        const data = await callFunction({
            action: "update",
            id: selectedApplication.id,
            status,
            remarks
        });

        selectedApplication = {
            ...selectedApplication,
            ...data.application
        };

        showReviewMessage("Application updated successfully.", "success");

        renderDetails(selectedApplication);

        $("adminRemarks").value =
            selectedApplication.admin_remarks || "";

        await loadStats();
        await loadApplications();

    } catch (error) {
        showReviewMessage(error.message);
    } finally {
        buttons.forEach(button => button.disabled = false);
    }
}

// Event listeners.
tableBody.addEventListener("click", event => {
    const button = event.target.closest("[data-id]");
    if (button) openApplication(button.dataset.id);
});

$("searchBtn").addEventListener("click", () => {
    currentPage = 1;
    loadApplications().catch(error => showMessage(error.message));
});

$("searchInput").addEventListener("input", () => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
        currentPage = 1;
        loadApplications().catch(error => showMessage(error.message));
    }, 400);
});

$("statusFilter").addEventListener("change", () => {
    currentPage = 1;
    loadApplications().catch(error => showMessage(error.message));
});

$("previousBtn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadApplications().catch(error => showMessage(error.message));
    }
});

$("nextBtn").addEventListener("click", () => {
    const totalPages = Math.ceil(totalApplications / PAGE_SIZE);

    if (currentPage < totalPages) {
        currentPage++;
        loadApplications().catch(error => showMessage(error.message));
    }
});

$("refreshBtn").addEventListener("click", () => {
    loadDashboard();
});

$("closeModal").addEventListener("click", () => {
    modal.hidden = true;
});

modal.addEventListener("click", event => {
    if (event.target === modal) modal.hidden = true;
});

$("underReviewBtn").addEventListener("click", () => {
    updateApplication("UNDER_REVIEW");
});

$("approveBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to approve this application?")) {
        updateApplication("APPROVED");
    }
});

$("rejectBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to reject this application?")) {
        updateApplication("REJECTED");
    }
});

$("stateSelect").addEventListener("change", () => {
    const selected = $("stateSelect").value;

    if (selected !== "andhra_pradesh") {
        $("stateSelect").value = currentState;
        showMessage("This state's database has not been connected yet.");
        return;
    }

    currentState = selected;
    currentPage = 1;
    loadDashboard();
});

$("backDashboard").addEventListener("click", () => {
    window.location.href = "../dashboard.html";
});

$("logoutBtn").addEventListener("click", async () => {
    $("logoutBtn").disabled = true;

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        $("logoutBtn").disabled = false;
        showMessage("Logout failed: " + error.message);
        return;
    }

    window.location.replace("../login.html");
});

supabaseClient.auth.onAuthStateChange(event => {
    if (event === "SIGNED_OUT") {
        window.location.replace("../login.html");
    }
});

initializePage();
