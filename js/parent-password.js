
// ==========================================
// THREE RIVERS ACADEMY
// PARENT PASSWORD CHANGE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("parentChangePasswordForm");

    if (!form) return;

    const currentPasswordInput =
        document.getElementById("parentCurrentPassword");

    const newPasswordInput =
        document.getElementById("parentNewPassword");

    const confirmPasswordInput =
        document.getElementById("parentConfirmPassword");

    const submitButton =
        document.getElementById("parentChangePasswordButton");

    const message =
        document.getElementById("parentPasswordMessage");

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "#15803d" : "#dc2626";
    }

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword.length < 8) {
            showMessage("Your new password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage("The new passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            showMessage("Your new password must be different from your current password.");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Updating...";
        message.textContent = "";

        try {

            // GET CURRENT AUTHENTICATED USER

            const {
                data: { user },
                error: userError
            } = await supabaseClient.auth.getUser();

            if (userError || !user) {
                throw new Error("Your session has expired. Please log in again.");
            }

            if (!user.email) {
                throw new Error("Your account does not have a registered email address.");
            }

            // VERIFY THAT THIS IS A PARENT ACCOUNT

            const { data: profile, error: profileError } =
                await supabaseClient
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

            if (profileError || !profile || profile.role !== "parent") {
                throw new Error("Parent account verification failed.");
            }

            // VERIFY CURRENT PASSWORD

            const { error: loginError } =
                await supabaseClient.auth.signInWithPassword({
                    email: user.email,
                    password: currentPassword
                });

            if (loginError) {
                throw new Error("Your current password is incorrect.");
            }

            // UPDATE PASSWORD THROUGH SUPABASE AUTH

            const { error: updateError } =
                await supabaseClient.auth.updateUser({
                    password: newPassword
                });

            if (updateError) {
                throw updateError;
            }

            // CLEAR FORM AFTER SUCCESS

            form.reset();

            showMessage(
                "Your password has been updated successfully.",
                true
            );

        } catch (error) {

            console.error("PARENT PASSWORD UPDATE ERROR:", error);

            showMessage(
                error.message || "Unable to update your password."
            );

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Update Password";

        }

    });

});
