
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("parentResetPasswordForm");
    const newPasswordInput = document.getElementById("parentResetNewPassword");
    const confirmPasswordInput = document.getElementById("parentResetConfirmPassword");
    const button = document.getElementById("parentResetPasswordButton");
    const message = document.getElementById("parentResetPasswordMessage");

    if (!form) return;

    let recoverySessionReady = false;
    let recoveryUserId = null;

    form.hidden = true;

    message.style.color = "#dc2626";
    message.textContent =
        "Please open the password recovery link sent to your email.";

    if (typeof supabaseClient === "undefined") {
        message.textContent =
            "Unable to connect to the account service. Please refresh the page.";
        return;
    }

    // Detect a valid password recovery session.
    supabaseClient.auth.onAuthStateChange((event, session) => {

        if (event === "PASSWORD_RECOVERY" && session?.user) {

            recoverySessionReady = true;
            recoveryUserId = session.user.id;

            form.hidden = false;

            message.style.color = "#15803d";
            message.textContent =
                "Recovery link verified. You can now set your new password.";

        }

    });

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        if (!recoverySessionReady) {
            message.style.color = "#dc2626";
            message.textContent =
                "Your recovery session is invalid or expired. Please request a new recovery link.";
            return;
        }

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword.length < 8) {
            message.textContent =
                "Your new password must contain at least 8 characters.";
            return;
        }

        if (newPassword !== confirmPassword) {
            message.textContent =
                "The passwords do not match.";
            return;
        }

        button.disabled = true;
        button.textContent = "Updating...";
        message.textContent = "";

        try {

            const { data: sessionData, error: sessionError } =
                await supabaseClient.auth.getSession();

            if (sessionError) throw sessionError;

            const session = sessionData.session;

            if (!session || session.user.id !== recoveryUserId) {
                throw new Error(
                    "Your recovery session has expired. Please request a new link."
                );
            }

            // Confirm that this account belongs to a parent.
            const { data: profile, error: profileError } =
                await supabaseClient
                    .from("profiles")
                    .select("role")
                    .eq("id", session.user.id)
                    .maybeSingle();

            if (profileError) throw profileError;

            if (!profile || profile.role !== "parent") {
                throw new Error(
                    "This recovery page is only available to parent accounts."
                );
            }

            // Update the password.
            const { error: updateError } =
                await supabaseClient.auth.updateUser({
                    password: newPassword
                });

            if (updateError) throw updateError;

            // Sign out after a successful password reset.
            await supabaseClient.auth.signOut();

            recoverySessionReady = false;
            recoveryUserId = null;

            form.reset();
            form.hidden = true;

            message.style.color = "#15803d";
            message.textContent =
                "Your password has been updated successfully. You can now sign in using your new password.";

        } catch (error) {

            console.error("PARENT PASSWORD RESET ERROR:", error);

            message.style.color = "#dc2626";
            message.textContent =
                error.message || "Unable to update your password. Please try again.";

        } finally {

            button.disabled = false;
            button.textContent = "Update Password";

        }

    });

});
