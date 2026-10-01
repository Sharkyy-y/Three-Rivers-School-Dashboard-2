const SUPABASE_URL =
    "https://deurewdqzvlioopuhikx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_k2TUtDnGrc0Bupc7kmYEOQ__-vaiMig";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// LOGIN FORM
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const selectedRole =
            document.querySelector(
                'input[name="role"]:checked'
            ).value;

        const message =
            document.getElementById("login-message");


        message.textContent = "Signing in...";


        // Login with Supabase
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            console.error(error);

            message.textContent =
                "Login failed: " + error.message;

            return;
        }


        // Get the user's profile
        const { data: profile, error: profileError } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", data.user.id)
                .single();


        if (profileError) {

            console.error(profileError);

            message.textContent =
                "Your account exists, but your profile could not be found.";

            await supabaseClient.auth.signOut();

            return;
        }


        // Check that selected account type
        // matches the actual account role
        if (profile.role !== selectedRole) {

            message.textContent =
                "The selected account type does not match this account.";

            await supabaseClient.auth.signOut();

            return;
        }


        // Save role for later use
        localStorage.setItem(
            "userRole",
            profile.role
        );


        // Save user ID
        localStorage.setItem(
            "userId",
            data.user.id
        );


        // Redirect based on role

        if (profile.role === "student") {

            window.location.href =
                "student-dashboard.html";

        } else {

            // For now, all other roles go here.
            // We will build their dashboards later.

            alert(
                profile.role +
                " dashboard will be added next."
            );

            await supabaseClient.auth.signOut();
        }

    });

}

// ==========================================
// STUDENT DASHBOARD
// ==========================================

async function loadStudentDashboard() {

    // Check whether someone is logged in
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href = "login.html";

        return;
    }


    // Find this student's record
    const {
        data: student,
        error: studentError
    } = await supabaseClient
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .single();


    if (studentError || !student) {

        console.error(studentError);

        alert(
            "Your student account is not linked to a student record."
        );

        return;
    }


    // ==========================================
    // DISPLAY REAL STUDENT INFORMATION
    // ==========================================

    const studentName =
        document.getElementById("studentName");

    const studentClass =
        document.getElementById("studentClass");

    const studentAdmission =
        document.getElementById("studentAdmission");


    if (studentName) {
        studentName.textContent =
            student.full_name;
    }


    if (studentClass) {
        studentClass.textContent =
            student.class_name;
    }


    if (studentAdmission) {
        studentAdmission.textContent =
            student.admission_number;
    }
}


// ==========================================
// RUN DASHBOARD
// ==========================================

if (
    window.location.pathname.includes(
        "student-dashboard.html"
    )
) {
    loadStudentDashboard();
}
