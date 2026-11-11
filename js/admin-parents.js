
// ==========================================
// THREE RIVERS ACADEMY
// ADMIN PARENT MANAGEMENT
// ==========================================

let adminParents = [];
let adminParentsStatistics = {
    total_parents: 0,
    parents_with_students: 0,
    parents_without_students: 0
};

// ==========================================
// HELPERS
// ==========================================

function escapeParentHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function parentElement(id) {
    return document.getElementById(id);
}

function setParentText(id, value) {
    const element = parentElement(id);

    if (element) {
        element.textContent = value;
    }
}

// ==========================================
// PAGE STYLES
// ==========================================

function addParentDirectoryStyles() {

    if (parentElement("adminParentDirectoryStyles")) return;

    const style = document.createElement("style");

    style.id = "adminParentDirectoryStyles";

    style.textContent = `
        .parent-record-card {
            display: grid;
            grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
            gap: 22px;
            padding: 22px;
            margin-bottom: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 15px;
            background: #ffffff;
            transition: box-shadow .2s, transform .2s;
        }

        .parent-record-card:hover {
            box-shadow: 0 7px 22px rgba(0,0,0,.06);
            transform: translateY(-2px);
        }

        .parent-record-main {
            display: flex;
            gap: 15px;
            min-width: 0;
        }

        .parent-record-avatar {
            width: 48px;
            height: 48px;
            min-width: 48px;
            display: grid;
            place-items: center;
            border-radius: 14px;
            background: #dcfce7;
            color: #166534;
            font-size: 20px;
            font-weight: 800;
        }

        .parent-record-info {
            min-width: 0;
        }

        .parent-record-info h3 {
            margin: 2px 0 9px;
            color: #14532d;
            font-size: 17px;
            overflow-wrap: anywhere;
        }

        .parent-record-info p {
            margin: 5px 0;
            color: #64748b;
            font-size: 13px;
            overflow-wrap: anywhere;
        }

        .parent-record-students {
            padding: 15px;
            border-radius: 12px;
            background: #f8fafc;
        }

        .parent-record-students h4 {
            margin: 0 0 12px;
            color: #334155;
            font-size: 13px;
        }

        .parent-linked-student {
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .parent-linked-student:last-child {
            border-bottom: 0;
        }

        .parent-linked-student strong {
            display: block;
            color: #1e293b;
            font-size: 13px;
        }

        .parent-linked-student span {
            display: block;
            margin-top: 4px;
            color: #64748b;
            font-size: 12px;
        }

        .parent-link-status {
            display: inline-block;
            margin-top: 9px;
            padding: 5px 9px;
            border-radius: 20px;
            background: #dcfce7;
            color: #166534;
            font-size: 11px;
            font-weight: 700;
        }

        .parent-link-status.unlinked {
            background: #fef3c7;
            color: #92400e;
        }

        .parent-directory-empty {
            padding: 45px 20px;
            text-align: center;
            color: #64748b;
        }

        .parent-directory-empty h3 {
            color: #334155;
            margin-bottom: 8px;
        }

        @media (max-width: 700px) {
            .parent-record-card {
                grid-template-columns: 1fr;
            }
        }
    `;

    document.head.appendChild(style);
}

// ==========================================
// LOAD PARENT DIRECTORY
// ==========================================

async function loadAdminParents() {

    const container = parentElement("parentsContainer");
    const refreshButton = parentElement("refreshParentsButton");
    const message = parentElement("parentsDirectoryMessage");

    if (!container) return;

    container.innerHTML = `
        <div class="parents-loading">
            <div class="parents-spinner"></div>
            <span>Loading parent accounts...</span>
        </div>
    `;

    if (message) {
        message.textContent = "";
        message.style.color = "";
    }

    if (refreshButton) {
        refreshButton.disabled = true;
        refreshButton.textContent = "Loading...";
    }

    try {

        // Confirm an active administrator session.

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            window.location.href = "login.html";
            return;
        }

        // Secure server-side directory request.
        // The Edge Function verifies the admin role
        // and derives the school from the admin profile.

        const {
            data,
            error
        } = await supabaseClient.functions.invoke(
            "manage-parents",
            {
                body: {
                    action: "list"
                }
            }
        );

        if (error) {
            console.error("PARENT DIRECTORY FUNCTION ERROR:", error);
            throw new Error(
                data?.error ||
                error.message ||
                "Unable to contact the parent management service."
            );
        }

        if (!data || !data.success) {
            throw new Error(
                data?.error || "Unable to load parent accounts."
            );
        }

        adminParents = Array.isArray(data.parents)
            ? data.parents
            : [];

        adminParentsStatistics = data.statistics || {
            total_parents: adminParents.length,
            parents_with_students: 0,
            parents_without_students: 0
        };

        updateParentStatistics();
        renderAdminParents();

        console.log(
            "PARENT DIRECTORY LOADED:",
            adminParents.length
        );

    } catch (error) {

        console.error("ADMIN PARENT DIRECTORY ERROR:", error);

        container.innerHTML = `
            <div class="parent-directory-empty">
                <h3>Unable to load parent accounts</h3>
                <p>${escapeParentHTML(error.message)}</p>
            </div>
        `;

        setParentText("parentsVisibleCount", "Unavailable");

        if (message) {
            message.textContent = error.message;
            message.style.color = "#dc2626";
        }

    } finally {

        if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.textContent = "↻ Refresh";
        }
    }
}

// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateParentStatistics() {

    setParentText(
        "parentsCount",
        adminParentsStatistics.total_parents ?? adminParents.length
    );

    setParentText(
        "parentLinkedCount",
        adminParentsStatistics.parents_with_students ?? 0
    );

    setParentText(
        "parentUnlinkedCount",
        adminParentsStatistics.parents_without_students ?? 0
    );
}

// ==========================================
// RENDER PARENT DIRECTORY
// ==========================================

function renderAdminParents() {

    const container = parentElement("parentsContainer");

    if (!container) return;

    const searchInput = parentElement("parentSearch");
    const filterInput = parentElement("parentFilter");

    const search = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const filter = filterInput
        ? filterInput.value
        : "all";

    const visibleParents = adminParents.filter(parent => {

        const students = Array.isArray(parent.linked_students)
            ? parent.linked_students
            : [];

        const hasStudents = students.length > 0;

        const matchesFilter =
            filter === "all" ||
            (filter === "linked" && hasStudents) ||
            (filter === "unlinked" && !hasStudents);

        const searchableText = [
            parent.full_name,
            parent.username,
            parent.phone,
            parent.email,
            ...students.map(student => student.full_name),
            ...students.map(student => student.admission_number)
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchableText.includes(search);

        return matchesFilter && matchesSearch;
    });

    // Update heading.

    const titles = {
        all: "All Parents",
        linked: "Parents With Linked Students",
        unlinked: "Parents Without Linked Students"
    };

    setParentText(
        "parentsListTitle",
        titles[filter] || "All Parents"
    );

    setParentText(
        "parentsVisibleCount",
        visibleParents.length
    );

    // Empty directory.

    if (visibleParents.length === 0) {

        container.innerHTML = `
            <div class="parent-directory-empty">
                <h3>No parents found</h3>
                <p>
                    ${
                        adminParents.length === 0
                            ? "No parent accounts have been registered yet."
                            : "Try changing your search or filter."
                    }
                </p>
            </div>
        `;

        return;
    }

    // Render parent cards.

    container.innerHTML = visibleParents.map(parent => {

        const students = Array.isArray(parent.linked_students)
            ? parent.linked_students
            : [];

        const initial = String(
            parent.full_name || "P"
        ).charAt(0).toUpperCase();

        const studentHTML = students.length > 0
            ? students.map(student => `
                <div class="parent-linked-student">
                    <strong>
                        ${escapeParentHTML(student.full_name || "Unnamed student")}
                    </strong>

                    <span>
                        Admission:
                        ${escapeParentHTML(student.admission_number || "—")}
                    </span>

                    <span>
                        Class:
                        ${escapeParentHTML(student.class_name || "Not assigned")}
                    </span>

                    <span>
                        Relationship:
                        ${escapeParentHTML(student.relationship || "Not specified")}
                    </span>
                </div>
            `).join("")
            : `
                <div class="parent-linked-student">
                    <strong>No linked students</strong>
                    <span>This parent account has no student connections.</span>
                </div>
            `;

        return `
            <article class="parent-record-card">

                <div class="parent-record-main">

                    <div class="parent-record-avatar">
                        ${escapeParentHTML(initial)}
                    </div>

                    <div class="parent-record-info">

                        <h3>
                            ${escapeParentHTML(parent.full_name || "Unnamed Parent")}
                        </h3>

                        <p>
                            <strong>Username:</strong>
                            ${escapeParentHTML(parent.username || "Not set")}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${escapeParentHTML(parent.email || "Not provided")}
                        </p>

                        <p>
                            <strong>Phone:</strong>
                            ${escapeParentHTML(parent.phone || "Not provided")}
                        </p>

                        <span class="parent-link-status ${students.length === 0 ? "unlinked" : ""}">
                            ${
                                students.length > 0
                                    ? `${students.length} linked student${students.length === 1 ? "" : "s"}`
                                    : "No linked students"
                            }
                        </span>

                    </div>

                </div>

                <div class="parent-record-students">

                    <h4>Linked Students</h4>

                    ${studentHTML}

                </div>

            </article>
        `;

    }).join("");
}

// ==========================================
// SEARCH
// ==========================================

const parentSearchInput = parentElement("parentSearch");

if (parentSearchInput) {
    parentSearchInput.addEventListener(
        "input",
        renderAdminParents
    );
}

// ==========================================
// FILTER
// ==========================================

const parentFilterInput = parentElement("parentFilter");

if (parentFilterInput) {
    parentFilterInput.addEventListener(
        "change",
        renderAdminParents
    );
}

// ==========================================
// REFRESH
// ==========================================

const refreshParentsButton = parentElement("refreshParentsButton");

if (refreshParentsButton) {
    refreshParentsButton.addEventListener(
        "click",
        loadAdminParents
    );
}

// ==========================================
// START PARENT MANAGEMENT
// ==========================================

if (
    window.location.pathname.includes("admin-parents.html")
) {

    addParentDirectoryStyles();
    loadAdminParents();

}
