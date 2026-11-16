
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("parentForgotPasswordForm");

    if (!form) return;

    const emailInput = document.getElementById("parentRecoveryEmail");
    const button = document.getElementById("parentRecoveryButton");
    const message = document.getElementById("parentRecoveryMessage");

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = emailInput.value.trim().toLowerCase();

        if (!email) {
            message.textContent = "Please enter your email address.";
            return;
        }

        button.disabled = true;
        button.textContent = "Sending...";
        message.textContent = "";

        try {

            const recoveryPage = new URL(
                "parent-reset-password.html",
                window.location.href
            ).href;

            const { error } = await supabaseClient.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: recoveryPage
                }
            );

            if (error) {
                throw error;
            }

            message.style.color = "#15803d";
            message.textContent =
                "If an account exists for this email, a password recovery link will be sent. Please check your inbox.";

            form.reset();

        } catch (error) {

            console.error("PARENT PASSWORD RECOVERY ERROR:", error);

            message.style.color = "#dc2626";
            message.textContent =
                error.message || "Unable to send the recovery email. Please try again.";

        } finally {

            button.disabled = false;
            button.textContent = "Send Recovery Link";

        }

    });

});
