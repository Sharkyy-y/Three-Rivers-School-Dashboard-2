const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value;

        const role =
            document.querySelector(
                'input[name="role"]:checked'
            ).value;

        alert(
            `Login system coming soon!\n\nEmail: ${email}\nAccount: ${role}`
        );

    });

}

const SUPABASE_URL = "https://deurewdqzvlioopuhikx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_k2TUtDnGrc0Bupc7kmYEOQ__-vaiMig";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// LOGIN
// ==========================================

async function loginUser() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const message = document.getElementById("login-message");

    if (!email || !password) {
        message.textContent = "Please enter your email and password.";
        return;
    }

    message.textContent = "Signing in...";

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        console.error(error);

        message.textContent = error.message;
        return;
    }

    // Login successful
    window.location.href = "student-dashboard.html";
}


// ==========================================
// LOGOUT
// ==========================================

async function logoutUser() {

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {
        console.error(error);
        return;
    }

    window.location.href = "login.html";
}


// ==========================================
// PROTECT STUDENT DASHBOARD
// ==========================================

async function checkStudentLogin() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return null;
    }

    return user;
}
