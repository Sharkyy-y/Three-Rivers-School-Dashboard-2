
document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("createParentForm");
    const childrenSelect = document.getElementById("parentChildren");
    const message = document.getElementById("parentCreateMessage");
    const result = document.getElementById("parentCreatedResult");

    if (!form || !childrenSelect || !message || !result) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const passwordField = document.getElementById("createdParentPassword");
    const copyButton = document.getElementById("copyParentPassword");

    if (!passwordField || !copyButton) return;

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

            throw error;
        }
    }

    try {
        await loadStudents();
    } catch (error) {
        message.textContent =
            "Unable to load students. Refresh the page and try again.";
        message.style.color = "#dc2626";
    }

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

        const childIds = Array.from(childrenSelect.selectedOptions)
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
                await supabaseClient.functions.invoke("create-parent", {
                    body: {
                        full_name: fullName,
                        username,
                        phone: phone || null,
                        email: email || null,
                        relationship,
                        childIds
                    }
                });

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

            if (!data || !data.success || !data.temporary_password) {
                throw new Error(
                    data?.error ||
                    "The account was created, but no temporary password was returned. Check the account before retrying."
                );
            }

            // IMPORTANT: Reset the form BEFORE filling the result fields.
            form.reset();

            // Display the returned account details.
            document.getElementById("createdParentName").textContent =
                data.full_name;

            document.getElementById("createdParentUsername").textContent =
                data.username;

            passwordField.value = data.temporary_password;
            passwordField.style.display = "block";

            result.hidden = false;

            message.textContent =
                "Parent account created successfully.";

            message.style.color = "#15803d";

            // Reload the student list.
            try {
                await loadStudents();
            } catch (reloadError) {
                console.error(
                    "Student list reload error:",
                    reloadError
                );
            }

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

    copyButton.addEventListener("click", async function () {
        const password = passwordField.value;

        if (!password) {
            message.textContent = "No temporary password is available.";
            message.style.color = "#dc2626";
            return;
        }

        try {
            await navigator.clipboard.writeText(password);

            this.textContent = "Copied!";

            setTimeout(() => {
                this.textContent = "Copy Temporary Password";
            }, 2000);

        } catch (error) {
            passwordField.focus();
            passwordField.select();

            message.textContent =
                "Automatic copying failed. Use Ctrl+C to copy the selected password.";

            message.style.color = "#dc2626";
        }
    });
});
