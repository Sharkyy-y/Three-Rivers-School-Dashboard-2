
document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("createParentForm");
    const childrenSelect = document.getElementById("parentChildren");
    const message = document.getElementById("parentCreateMessage");
    const result = document.getElementById("parentCreatedResult");

    if (!form || !childrenSelect || !message || !result) return;

    const submitButton = form.querySelector(
        'button[type="submit"]'
    );

    // Load students belonging to the administrator's school.
    async function loadStudents() {
        childrenSelect.innerHTML =
            '<option disabled>Loading students...</option>';

        try {
            const { data: students, error } = await supabaseClient
                .from("students")
                .select("id, full_name, admission_number, class_name")
                .order("full_name");

            if (error) throw error;

            childrenSelect.innerHTML = "";

            if (!students || students.length === 0) {
                childrenSelect.innerHTML =
                    '<option disabled>No students found.</option>';
                return;
            }

            students.forEach(student => {
                const option = document.createElement("option");

                option.value = student.id;
                option.textContent =
                    `${student.full_name} (${student.admission_number}) — ${student.class_name}`;

                childrenSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Student loading error:", error);

            childrenSelect.innerHTML =
                '<option disabled>Could not load students.</option>';

            message.textContent =
                "Unable to load students. Refresh the page and try again.";
        }
    }

    await loadStudents();

    // Create parent account.
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        result.hidden = true;
        message.textContent = "";

        const fullName =
            document.getElementById("parentFullName").value.trim();

        const username =
            document.getElementById("parentUsername").value.trim();

        const phone =
            document.getElementById("parentPhone").value.trim();

        const email =
            document.getElementById("parentEmail").value.trim();

        const relationship =
            document.getElementById("parentRelationship").value;

        const childIds = Array.from(
            childrenSelect.selectedOptions
        )
            .filter(option => option.value)
            .map(option => option.value);

        if (!fullName || !username) {
            message.textContent =
                "Please enter the parent's name and username.";
            return;
        }

        if (!phone && !email) {
            message.textContent =
                "Enter at least one recovery contact: phone or email.";
            return;
        }

        if (childIds.length === 0) {
            message.textContent =
                "Please select at least one child.";
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Creating account...";

        try {
            const {
                data: { session },
                error: sessionError
            } = await supabaseClient.auth.getSession();

            if (sessionError || !session) {
                throw new Error(
                    "Your administrator session has expired. Please sign in again."
                );
            }

            const { data, error } =
                await supabaseClient.functions.invoke(
                    "create-parent",
                    {
                        body: {
                            full_name: fullName,
                            username,
                            phone: phone || null,
                            email: email || null,
                            relationship,
                            childIds
                        }
                    }
                );

            if (error) {
                let details = error.message;

                try {
                    const response = error.context;

                    if (response && typeof response.json === "function") {
                        const body = await response.json();
                        details = body.error || details;
                    }
                } catch (_) {
                    // Keep the original error message.
                }

                throw new Error(details);
            }

            if (!data || !data.success) {
                throw new Error(
                    data?.error || "Parent account creation failed."
                );
            }

            document.getElementById("createdParentName").textContent =
                data.full_name;

            document.getElementById("createdParentUsername").textContent =
                data.username;

            const passwordField = document.getElementById("createdParentPassword");
passwordField.value = data.temporary_password;
passwordField.style.display = "block";

            result.hidden = false;

            message.textContent =
                "Parent account created successfully.";

            message.style.color = "#15803d";

            form.reset();

            await loadStudents();

        } catch (error) {
            console.error("Create parent error:", error);

            message.textContent =
                error.message || "Could not create parent account.";

            message.style.color = "#dc2626";

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "+ Create Parent Account";
        }
    });

    // Copy temporary password.
    document.getElementById("copyParentPassword")
        .addEventListener("click", async function () {
            const password =
                document.getElementById("createdParentPassword").value;

            try {
                await navigator.clipboard.writeText(password);

                this.textContent = "Copied!";
                
                setTimeout(() => {
                    this.textContent = "Copy Temporary Password";
                }, 2000);

            } catch (error) {
                message.textContent =
                    "Copy failed. Select and copy the password manually.";
                message.style.color = "#dc2626";
            }
        });
});
