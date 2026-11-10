
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const identifierInput = document.getElementById("email");
    const message = document.getElementById("login-message");
    const roleInputs = document.querySelectorAll(
        'input[name="role"]'
    );

    if (!form || !identifierInput || !message) return;

    function updateParentField() {
        const selectedRole = document.querySelector(
            'input[name="role"]:checked'
        )?.value;

        const label = document.querySelector(
            'label[for="email"]'
        );

        if (selectedRole === "parent") {
            label.textContent = "Username, phone number or email";
            identifierInput.placeholder =
                "Enter your username or phone number";
        } else {
            label.textContent = "Email address";
            identifierInput.placeholder = "you@example.com";
        }
    }

    roleInputs.forEach(input => {
        input.addEventListener("change", updateParentField);
    });

    updateParentField();

    form.addEventListener("submit", async function (event) {
        const selectedRole = document.querySelector(
            'input[name="role"]:checked'
        )?.value;

        if (selectedRole !== "parent") return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const identifier = identifierInput.value.trim();
        const password =
            document.getElementById("password").value;

        const button = form.querySelector(
            'button[type="submit"]'
        );

        message.textContent = "Signing in...";
        button.disabled = true;

        try {
            const { data, error } =
                await supabaseClient.functions.invoke(
                    "parent-login",
                    {
                        body: {
                            identifier,
                            password
                        }
                    }
                );

            if (error || !data?.success || !data?.session) {
                throw new Error(
                    data?.error || error?.message ||
                    "Unable to sign in."
                );
            }

            const { error: sessionError } =
                await supabaseClient.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token
                });

            if (sessionError) {
                throw sessionError;
            }

            message.textContent =
                "Login successful. Opening parent portal...";

            window.location.href = "parent-dashboard.html";

        } catch (error) {
            console.error("Parent login:", error);

            message.textContent =
                error.message || "Login failed. Please try again.";

            button.disabled = false;
        }
    }, true);
});
