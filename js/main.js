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
                roleInput
                    ? roleInput.value
                    : "student";

            const message =
                document.getElementById(
                    "login-message"
                );


            if (message) {
                message.textContent =
                    "Signing in...";
            }


            console.log(
                "Login started..."
            );


            // ----------------------------------
            // SIGN IN WITH SUPABASE
            // ----------------------------------

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


            // ----------------------------------
            // LOGIN ERROR
            // ----------------------------------

            if (error) {

                console.error(
                    "Login error:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message;
                }

                return;
            }


            // ----------------------------------
            // GET USER PROFILE
            // ----------------------------------

            const {
                data: profile,
                error: profileError
            } =
                await supabaseClient
                    .from("profiles")
                    .select("*")
                    .eq(
                        "id",
                        data.user.id
                    )
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


            // ----------------------------------
            // CHECK ACCOUNT TYPE
            // ----------------------------------

            if (
                profile.role !==
                selectedRole
            ) {

                if (message) {
                    message.textContent =
                        "The selected account type does not match this account.";
                }

                await supabaseClient.auth.signOut();

                return;
            }


            // ----------------------------------
            // LOGIN SUCCESS
            // ----------------------------------

            console.log(
                "Login successful!"
            );


            if (message) {
                message.textContent =
                    "Login successful. Loading dashboard...";
            }


            // ----------------------------------
            // GO TO STUDENT DASHBOARD
            // ----------------------------------

            window.location.href =
                "student-dashboard.html";

        }
    );
}


// ==========================================
// LOAD STUDENT DASHBOARD
// ==========================================

async function loadStudentDashboard() {

    console.log(
        "Loading student dashboard..."
    );

    // ======================================
// ANNOUNCEMENTS
// ======================================

const announcementsContainer =
    document.getElementById(
        "announcementsContainer"
    );


if (announcementsContainer) {

    const {
        data: announcements,
        error: announcementsError
    } =
        await supabaseClient
            .from("announcements")
            .select(`
                id,
                title,
                message,
                target_role,
                target_class,
                created_at
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(5);


    console.log(
        "ANNOUNCEMENTS RESULT:",
        announcements
    );

    console.log(
        "ANNOUNCEMENTS ERROR:",
        announcementsError
    );


    // ----------------------------------
    // ERROR
    // ----------------------------------

    if (announcementsError) {

        console.error(
            "Announcements error:",
            announcementsError
        );

        announcementsContainer.innerHTML =
            `
            <p>
                Unable to load announcements.
            </p>
            `;

    }


    // ----------------------------------
    // NO ANNOUNCEMENTS
    // ----------------------------------

    else if (
        !announcements ||
        announcements.length === 0
    ) {

        announcementsContainer.innerHTML =
            `
            <p>
                No announcements available.
            </p>
            `;

    }


    // ----------------------------------
    // DISPLAY ANNOUNCEMENTS
    // ----------------------------------

    else {

        announcementsContainer.innerHTML =
            "";


        announcements.forEach(
            function (announcement, index) {

                const announcementElement =
                    document.createElement(
                        "div"
                    );


                announcementElement.className =
                    "announcement";


                // ----------------------------------
                // ICON
                // ----------------------------------

                const icon =
                    index === 0
                        ? "!"
                        : "★";


                // ----------------------------------
                // TIME
                // ----------------------------------

                const createdDate =
                    new Date(
                        announcement.created_at
                    );


                const now =
                    new Date();


                const difference =
                    Math.floor(
                        (
                            now -
                            createdDate
                        ) /
                        (
                            1000 *
                            60 *
                            60
                        )
                    );


                let postedText;


                if (
                    difference < 1
                ) {

                    postedText =
                        "Posted just now";

                } else if (
                    difference === 1
                ) {

                    postedText =
                        "Posted 1 hour ago";

                } else if (
                    difference < 24
                ) {

                    postedText =
                        `Posted ${difference} hours ago`;

                } else {

                    const days =
                        Math.floor(
                            difference / 24
                        );


                    if (
                        days === 1
                    ) {

                        postedText =
                            "Posted yesterday";

                    } else {

                        postedText =
                            `Posted ${days} days ago`;
                    }
                }


                // ----------------------------------
                // HTML
                // ----------------------------------

                announcementElement.innerHTML =
                    `
                    <div class="announcement-icon">
                        ${icon}
                    </div>

                    <div>

                        <strong>
                            ${announcement.title}
                        </strong>

                        <p>
                            ${announcement.message}
                        </p>

                        <small>
                            ${postedText}
                        </small>

                    </div>
                    `;


                announcementsContainer.appendChild(
                    announcementElement
                );

            }
        );

    }

}

    // ======================================
    // GET CURRENT USER
    // ======================================

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !user
    ) {

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
    // GET STUDENT RECORD
    // ======================================

    const {
        data: student,
        error: studentError
    } =
        await supabaseClient
            .from("students")
            .select("*")
            .eq(
                "user_id",
                user.id
            )
            .single();


    if (
        studentError ||
        !student
    ) {

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
    // WELCOME STUDENT NAME
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

    const academicAverage =
        document.getElementById(
            "academicAverage"
        );


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
            function (grade) {

                totalScore +=
                    Number(
                        grade.score
                    );

                totalMaxScore +=
                    Number(
                        grade.max_score
                    );

            }
        );


        let average = 0;


        if (
            totalMaxScore > 0
        ) {

            average =
                (
                    totalScore /
                    totalMaxScore
                ) * 100;
        }


        if (academicAverage) {

            academicAverage.textContent =
                Math.round(
                    average
                ) + "%";
        }
    }


    // ======================================
    // ATTENDANCE
    // ======================================

    const attendanceElement =
        document.getElementById(
            "attendancePercentage"
        );


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
                function (record) {

                    return (
                        record.status ===
                        "present"
                    );

                }
            ).length;


        const lateDays =
            attendance.filter(
                function (record) {

                    return (
                        record.status ===
                        "late"
                    );

                }
            ).length;


        let attendancePercentage = 0;


        if (
            totalDays > 0
        ) {

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
    // TODAY'S DATE
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


    // ======================================
    // TODAY'S TIMETABLE
    // ======================================

    const timetableContainer =
        document.getElementById(
            "todayTimetable"
        );


    if (!timetableContainer) {

        console.log(
            "Timetable container not found."
        );

        return;
    }


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


    // --------------------------------------
    // TIMETABLE ERROR
    // --------------------------------------

    if (timetableError) {

        console.error(
            "Timetable error:",
            timetableError
        );

        timetableContainer.innerHTML =
            `
            <p>
                Unable to load today's timetable.
            </p>
            `;

        return;
    }


    // --------------------------------------
    // NO LESSONS
    // --------------------------------------

    if (
        !timetable ||
        timetable.length === 0
    ) {

        timetableContainer.innerHTML =
            `
            <p>
                No lessons scheduled for today.
            </p>
            `;

        return;
    }


    // --------------------------------------
    // DISPLAY LESSONS
    // --------------------------------------

    timetableContainer.innerHTML =
        "";


    timetable.forEach(
        function (lesson) {

            const lessonElement =
                document.createElement(
                    "div"
                );


            lessonElement.className =
                "lesson";


            const startTime =
                lesson.start_time
                    ? lesson.start_time.substring(
                        0,
                        5
                    )
                    : "";


            const subjectName =
                lesson.subjects &&
                lesson.subjects.name
                    ? lesson.subjects.name
                    : "Subject";


            const room =
                lesson.room
                    ? lesson.room
                    : "Room TBA";


            const teacher =
                lesson.teacher_name
                    ? lesson.teacher_name
                    : "Teacher TBA";


            lessonElement.innerHTML =

                `
                <div class="lesson-time">
                    ${startTime}
                </div>

                <div class="lesson-line"></div>

                <div class="lesson-info">

                    <strong>
                        ${subjectName}
                    </strong>

                    <span>
                        ${room} • ${teacher}
                    </span>

                </div>
                `;


            timetableContainer.appendChild(
                lessonElement
            );

        }
    );

    // ======================================
// UPCOMING ASSIGNMENTS
// ======================================
 console.log("ASSIGNMENTS CODE STARTED");
    
const assignmentsContainer =
    document.getElementById(
        "assignmentsContainer"
    );


if (assignmentsContainer) {

    const todayDate =
        new Date()
            .toISOString()
            .split("T")[0];


    const {
        data: assignments,
        error: assignmentsError
    } =
        await supabaseClient
            .from("assignments")
            .select(`
                id,
                title,
                description,
                due_date,
                subjects (
                    name
                )
            `)
            .eq(
                "class_name",
                student.class_name
            )
            .gte(
                "due_date",
                todayDate
            )
            .order(
                "due_date",
                {
                    ascending: true
                }
            );

    console.log(
    "ASSIGNMENTS RESULT:",
    assignments
);

console.log(
    "ASSIGNMENTS ERROR:",
    assignmentsError
);

    // ----------------------------------
    // ERROR
    // ----------------------------------

    if (assignmentsError) {

        console.error(
            "Assignments error:",
            assignmentsError
        );

        assignmentsContainer.innerHTML =
            `
            <p>
                Unable to load assignments.
            </p>
            `;

    }


    // ----------------------------------
    // NO ASSIGNMENTS
    // ----------------------------------

    else if (
        !assignments ||
        assignments.length === 0
    ) {

        assignmentsContainer.innerHTML =
            `
            <p>
                No upcoming assignments.
            </p>
            `;

    }


    // ----------------------------------
    // DISPLAY ASSIGNMENTS
    // ----------------------------------

    else {

        assignmentsContainer.innerHTML =
            "";


        assignments.forEach(
            function (assignment) {

                const assignmentElement =
                    document.createElement(
                        "div"
                    );


                assignmentElement.className =
                    "assignment";


                // Subject name
                const subjectName =
                    assignment.subjects &&
                    assignment.subjects.name
                        ? assignment.subjects.name
                        : "Subject";


                // First letter for icon
                const iconLetter =
                    subjectName
                        .charAt(0)
                        .toUpperCase();


                // Calculate due date
                const dueDate =
                    new Date(
                        assignment.due_date +
                        "T00:00:00"
                    );


                const today =
                    new Date();

                today.setHours(
                    0,
                    0,
                    0,
                    0
                );


                const difference =
                    Math.ceil(
                        (
                            dueDate -
                            today
                        ) /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )
                    );


                let dueText;


                if (
                    difference === 0
                ) {

                    dueText =
                        "Today";

                } else if (
                    difference === 1
                ) {

                    dueText =
                        "Tomorrow";

                } else if (
                    difference > 1 &&
                    difference < 7
                ) {

                    dueText =
                        dueDate.toLocaleDateString(
                            "en-GB",
                            {
                                weekday:
                                    "long"
                            }
                        );

                } else {

                    dueText =
                        dueDate.toLocaleDateString(
                            "en-GB",
                            {
                                day:
                                    "numeric",

                                month:
                                    "short"
                            }
                        );
                }


                assignmentElement.innerHTML =
                    `
                    <div class="assignment-icon">
                        ${iconLetter}
                    </div>

                    <div class="assignment-info">

                        <strong>
                            ${assignment.title}
                        </strong>

                        <span>
                            ${subjectName}
                        </span>

                    </div>

                    <div class="due-date">
                        ${dueText}
                    </div>
                    `;


                assignmentsContainer.appendChild(
                    assignmentElement
                );

            }
        );

    }

}

    console.log(
        "Student dashboard loaded successfully."
    );

}


// ==========================================
// START STUDENT DASHBOARD
// ==========================================

if (
    window.location.pathname.includes(
        "student-dashboard.html"
    )
) {

    loadStudentDashboard();

}
