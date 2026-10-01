// ==========================================
// SUPABASE SETUP
// ==========================================

const SUPABASE_URL =
    "https://deurewdqzvlioopuhikx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_k2TUtDnGrc0Bupc7kmYEOQ__-vaiMig";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById("email")
                    .value
                    .trim();

            const password =
                document.getElementById("password")
                    .value;

            const roleInput =
                document.querySelector(
                    'input[name="role"]:checked'
                );

            const selectedRole =
                roleInput ? roleInput.value : "student";

            const message =
                document.getElementById("login-message");

            if (message) {
                message.textContent =
                    "Signing in...";
            }

            console.log("Login started");


            // SIGN IN
            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });


            console.log(
                "Supabase response:",
                data
            );

            console.log(
                "Supabase error:",
                error
            );


            // LOGIN ERROR
            if (error) {

                if (message) {
                    message.textContent =
                        error.message;
                }

                console.error(error);

                return;
            }


            // GET PROFILE
            const {
                data: profile,
                error: profileError
            } =
                await supabaseClient
                    .from("profiles")
                    .select("*")
                    .eq("id", data.user.id)
                    .single();


            if (profileError) {

                console.error(
                    "Profile error:",
                    profileError
                );

                if (message) {
                    message.textContent =
                        "Login worked, but your profile could not be found.";
                }

                return;
            }


            console.log(
                "Profile:",
                profile
            );


            // CHECK ROLE
            if (profile.role !== selectedRole) {

                if (message) {
                    message.textContent =
                        "The selected account type does not match this account.";
                }

                await supabaseClient.auth.signOut();

                return;
            }


            // SUCCESS
            console.log(
                "Login successful!"
            );


            if (message) {
                message.textContent =
                    "Login successful. Loading dashboard...";
            }


            // GO TO DASHBOARD
            window.location.href =
                "student-dashboard.html";

        }
    );
}


// ==========================================
// STUDENT DASHBOARD
// ==========================================

async function loadStudentDashboard() {

    console.log(
        "Loading student dashboard..."
    );


    // GET CURRENT USER
    const {
        data: { user },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            "User error:",
            userError
        );

        window.location.href =
            "login.html";

        return;
    }


    console.log(
        "Logged in user:",
        user
    );


    // ======================================
    // GET STUDENT
    // ======================================

    const {
        data: student,
        error: studentError
    } =
        await supabaseClient
            .from("students")
            .select("*")
            .eq("user_id", user.id)
            .single();


    if (studentError || !student) {

        console.error(
            "Student error:",
            studentError
        );

        alert(
            "Student record not found."
        );

        return;
    }


    console.log(
        "Student:",
        student
    );


    // ======================================
    // STUDENT NAME
    // ======================================

    const studentName =
        document.getElementById(
            "studentName"
        );

    if (studentName) {

        studentName.textContent =
            student.full_name;
    }


    // ======================================
    // WELCOME NAME
    // ======================================

    const welcomeStudentName =
        document.getElementById(
            "welcomeStudentName"
        );

    if (welcomeStudentName) {

        welcomeStudentName.textContent =
            student.full_name;
    }


    // ======================================
    // ACADEMIC AVERAGE
    // ======================================

    const {
        data: grades,
        error: gradesError
    } =
        await supabaseClient
            .from("grades")
            .select(
                "score, max_score"
            )
            .eq(
                "student_id",
                student.id
            );


    const academicAverage =
        document.getElementById(
            "academicAverage"
        );


    if (gradesError) {

        console.error(
            "Grades error:",
            gradesError
        );

        if (academicAverage) {
            academicAverage.textContent =
                "Unavailable";
        }

    } else {

        let totalScore = 0;
        let totalMaxScore = 0;


        grades.forEach(
            grade => {

                totalScore +=
                    Number(grade.score);

                totalMaxScore +=
                    Number(grade.max_score);

            }
        );


        let average = 0;


        if (totalMaxScore > 0) {

            average =
                (
                    totalScore /
                    totalMaxScore
                ) * 100;
        }


        if (academicAverage) {

            academicAverage.textContent =
                Math.round(average) + "%";
        }
    }


    // ======================================
    // ATTENDANCE
    // ======================================

    const {
        data: attendance,
        error: attendanceError
    } =
        await supabaseClient
            .from("attendance")
            .select("status")
            .eq(
                "student_id",
                student.id
            );


    const attendanceElement =
        document.getElementById(
            "attendancePercentage"
        );


    if (attendanceError) {

        console.error(
            "Attendance error:",
            attendanceError
        );

        if (attendanceElement) {

            attendanceElement.textContent =
                "Unavailable";
        }

    } else {

        const totalDays =
            attendance.length;


        const presentDays =
            attendance.filter(
                record =>
                    record.status === "present"
            ).length;


        const lateDays =
            attendance.filter(
                record =>
                    record.status === "late"
            ).length;


        let attendancePercentage = 0;


        if (totalDays > 0) {

            attendancePercentage =
                (
                    (
                        presentDays +
                        lateDays
                    ) /
                    totalDays
                ) * 100;
        }


        if (attendanceElement) {

            attendanceElement.textContent =
                Math.round(
                    attendancePercentage
                ) + "%";
        }
    }


    // ======================================
    // TODAY'S TIMETABLE
    // ======================================

    const today =
        new Date();


    const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];


    const todayName =
        dayNames[
            today.getDay()
        ];


    const todayDate =
        document.getElementById(
            "todayDate"
        );


    if (todayDate) {

        todayDate.textContent =
            today.toLocaleDateString(
                "en-GB",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
    }


    // GET TIMETABLE
    const {
        data: timetable,
        error: timetableError
    } =
        await supabaseClient
            .from("timetable")
            .select(`
                start_time,
                end_time,
                teacher_name,
                room,
                subjects (
                    name
                )
            `)
            .eq(
                "class_name",
                student.class_name
            )
            .eq(
                "day_of_week",
                todayName
            )
            .order(
                "start_time",
                {
                    ascending: true
                }
            );


    const timetableContainer =
        document.getElementById(
            "todayTimetable"
        );


    if (!timetableContainer) {
        return;
    }


    if (timetableError) {

        console.error(
            "Timetable error:",
            timetableError
        );

        timetableContainer.innerHTML =
            "<p>Unable to load today's timetable.</p>";

        return;
    }


    if (
        !timetable ||
        timetable.length === 0
    ) {

        timetableContainer.innerHTML =
            "<p>No lessons scheduled for today.</p>";

        return;
    }


    timetableContainer.innerHTML = "";


    timetable.forEach(
        lesson => {

            const lessonElement =
                document.createElement(
                    "div"
                );


            lessonElement.className =
                "lesson";


            const startTime =
                lesson.start_time
                    .substring(0, 5);


            const endTime =
                lesson.end_time
                    .substring(0, 5);


            lessonElement.innerHTML = `

                <div class="lesson-time">
                    ${startTime}
                </div>

                <div class="lesson-line"></div>

                <div class="lesson-info">

                    <strong>
                        ${
                            lesson.subjects?.name ||
                            "Subject"
                        }
                    </strong>

                    <span>
                        ${
                            lesson.room ||
                            "Room TBA"
                        }
                        •
                        ${
                            lesson.teacher_name ||
                            "Teacher TBA"
                        }
                    </span>

                </div>

            `;


            timetableContainer.appendChild(
                lessonElement
            );

        }
    );

}


// ==========================================
// START DASHBOARD
// ==========================================

if (
    window.location.pathname.includes(
        "student-dashboard.html"
    )
) {

    loadStudentDashboard();

}
