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
// GO TO CORRECT DASHBOARD
// ----------------------------------

if (profile.role === "admin") {

    window.location.href =
        "admin-dashboard.html";

} else if (profile.role === "teacher") {

    window.location.href =
        "teacher-dashboard.html";

} else if (profile.role === "student") {

    window.location.href =
        "student-dashboard.html";

} else if (profile.role === "parent") {

    window.location.href =
        "parent-dashboard.html";

} else {

    console.error(
        "Unknown account role:",
        profile.role
    );

    if (message) {
        message.textContent =
            "Your account role is not configured.";
    }

}
            
        }
    );
}

// ==========================================
// LOAD STUDENT DASHBOARD
// ==========================================

async function loadStudentDashboard() {

    console.log("Loading student dashboard...");


    // ======================================
    // GET CURRENT USER
    // ======================================

    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error("User error:", userError);

        window.location.href = "login.html";

        return;
    }


    console.log("Logged in user:", user);


    // ======================================
    // GET STUDENT RECORD
    // ======================================

    const {
        data: student,
        error: studentError
    } = await supabaseClient
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .single();


    if (studentError || !student) {

        console.error("Student error:", studentError);

        alert("Student record not found.");

        return;
    }


    console.log("Student:", student);


    // ======================================
    // STUDENT NAME
    // ======================================

    const studentName =
        document.getElementById("studentName");

    const welcomeStudentName =
        document.getElementById("welcomeStudentName");

    const studentInitial =
        document.getElementById("studentInitial");


    if (studentName) {

        studentName.textContent =
            student.full_name || "Student";
    }


    if (welcomeStudentName) {

        welcomeStudentName.textContent =
            student.full_name || "Student";
    }


    if (studentInitial) {

        studentInitial.textContent =
            student.full_name
                ? student.full_name.charAt(0).toUpperCase()
                : "S";
    }


    // ======================================
    // CURRENT DATE
    // ======================================

    const today = new Date();


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
        dayNames[today.getDay()];


    const formattedDate =
        today.toLocaleDateString(
            "en-GB",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    const dashboardDay =
        document.getElementById("dashboardDay");

    const dashboardDate =
        document.getElementById("dashboardDate");

    const todayDateElement =
        document.getElementById("todayDate");


    if (dashboardDay) {

        dashboardDay.textContent =
            todayName;
    }


    if (dashboardDate) {

        dashboardDate.textContent =
            formattedDate;
    }


    if (todayDateElement) {

        todayDateElement.textContent =
            formattedDate;
    }


    // ======================================
    // ACADEMIC AVERAGE
    // ======================================

    const academicAverage =
        document.getElementById("academicAverage");


    const {
        data: grades,
        error: gradesError
    } = await supabaseClient
        .from("grades")
        .select("score, max_score")
        .eq("student_id", student.id);


    if (gradesError) {

        console.error("Grades error:", gradesError);

        if (academicAverage) {

            academicAverage.textContent =
                "Unavailable";
        }

    } else {

        let totalScore = 0;
        let totalMaxScore = 0;


        (grades || []).forEach(
            function (grade) {

                totalScore +=
                    Number(grade.score) || 0;

                totalMaxScore +=
                    Number(grade.max_score) || 0;
            }
        );


        let average = 0;


        if (totalMaxScore > 0) {

            average =
                (totalScore / totalMaxScore) * 100;
        }


        if (academicAverage) {

            academicAverage.textContent =
                Math.round(average) + "%";
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
    } = await supabaseClient
        .from("attendance")
        .select("status")
        .eq("student_id", student.id);


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

        const records =
            attendance || [];


        const totalDays =
            records.length;


        const presentDays =
            records.filter(
                function (record) {

                    return record.status === "present";
                }
            ).length;


        const lateDays =
            records.filter(
                function (record) {

                    return record.status === "late";
                }
            ).length;


        let attendancePercentage = 0;


        if (totalDays > 0) {

            attendancePercentage =
                (
                    (presentDays + lateDays) /
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

    const timetableContainer =
        document.getElementById(
            "todayTimetable"
        );


    if (timetableContainer) {

        const {
            data: timetable,
            error: timetableError
        } = await supabaseClient
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


        if (timetableError) {

            console.error(
                "Timetable error:",
                timetableError
            );

            timetableContainer.innerHTML = `
                <p>
                    Unable to load today's timetable.
                </p>
            `;

        } else if (
            !timetable ||
            timetable.length === 0
        ) {

            timetableContainer.innerHTML = `
                <p>
                    No lessons scheduled for today.
                </p>
            `;

        } else {

            timetableContainer.innerHTML = "";


            timetable.forEach(
                function (lesson) {

                    const lessonElement =
                        document.createElement("div");


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
                        lesson.room ||
                        "Room TBA";


                    const teacher =
                        lesson.teacher_name ||
                        "Teacher TBA";


                    lessonElement.innerHTML = `
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

        }

    }


    // ======================================
    // UPCOMING ASSIGNMENTS
    // ======================================

    console.log(
        "ASSIGNMENTS CODE STARTED"
    );


    const assignmentsContainer =
        document.getElementById(
            "assignmentsContainer"
        );


    const upcomingAssignmentsCount =
        document.getElementById(
            "upcomingAssignmentsCount"
        );


    if (assignmentsContainer) {

        const todayISO =
            today.toISOString()
                .split("T")[0];


        const todayString =
    new Date().toISOString().split("T")[0];

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
                name,
                code
            )
        `)
        .eq(
            "class_name",
            student.class_name
        )
        .gte(
            "due_date",
            todayString
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


        if (assignmentsError) {

            console.error(
                "Assignments error:",
                assignmentsError
            );


            assignmentsContainer.innerHTML = `
                <p>
                    Unable to load assignments.
                </p>
            `;


            if (upcomingAssignmentsCount) {

                upcomingAssignmentsCount.textContent =
                    "—";
            }

        } else {

            const assignmentList =
                assignments || [];


            // Update assignment number
            if (upcomingAssignmentsCount) {

                upcomingAssignmentsCount.textContent =
                    assignmentList.length;
            }


            if (
                assignmentList.length === 0
            ) {

                assignmentsContainer.innerHTML = `
                    <p>
                        No upcoming assignments.
                    </p>
                `;

            } else {

                assignmentsContainer.innerHTML =
                    "";


                assignmentList.forEach(
                    function (assignment) {

                        const assignmentElement =
                            document.createElement(
                                "div"
                            );


                        assignmentElement.className =
                            "assignment";


                        const subjectName =
                            assignment.subjects &&
                            assignment.subjects.name
                                ? assignment.subjects.name
                                : "Subject";


                        const iconLetter =
                            subjectName
                                .charAt(0)
                                .toUpperCase();


                        const dueDate =
                            new Date(
                                assignment.due_date +
                                "T00:00:00"
                            );


                        const todayForDueDate =
                            new Date();


                        todayForDueDate.setHours(
                            0,
                            0,
                            0,
                            0
                        );


                        const difference =
                            Math.ceil(
                                (
                                    dueDate -
                                    todayForDueDate
                                ) /
                                (
                                    1000 *
                                    60 *
                                    60 *
                                    24
                                )
                            );


                        let dueText;


                        if (difference === 0) {

                            dueText = "Today";

                        } else if (
                            difference === 1
                        ) {

                            dueText = "Tomorrow";

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


                        assignmentElement.innerHTML = `
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

    }


    // ======================================
    // ANNOUNCEMENTS
    // ======================================

    const announcementsContainer =
        document.getElementById(
            "announcementsContainer"
        );


    const notificationCount =
        document.getElementById(
            "notificationCount"
        );


    if (announcementsContainer) {

        const {
            data: announcements,
            error: announcementsError
        } = await supabaseClient
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


        if (announcementsError) {

            console.error(
                "Announcements error:",
                announcementsError
            );


            announcementsContainer.innerHTML = `
                <p>
                    Unable to load announcements.
                </p>
            `;


            if (notificationCount) {

                notificationCount.textContent =
                    "0";
            }

        } else {

            const announcementList =
                announcements || [];


            // Show number of recent announcements
            if (notificationCount) {

                notificationCount.textContent =
                    announcementList.length;
            }


            if (
                announcementList.length === 0
            ) {

                announcementsContainer.innerHTML = `
                    <p>
                        No announcements available.
                    </p>
                `;

            } else {

                announcementsContainer.innerHTML =
                    "";


                announcementList.forEach(
                    function (
                        announcement,
                        index
                    ) {

                        const announcementElement =
                            document.createElement(
                                "div"
                            );


                        announcementElement.className =
                            "announcement";


                        const icon =
                            index === 0
                                ? "!"
                                : "★";


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


                        announcementElement.innerHTML = `
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

    }


    // ======================================
    // CONDUCT
    // ======================================

    const conductStatus =
        document.getElementById(
            "conductStatus"
        );


    if (conductStatus) {

        const {
            data: conduct,
            error: conductError
        } = await supabaseClient
            .from("conduct")
            .select("*")
            .eq(
                "student_id",
                student.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(1);


        if (
            !conductError &&
            conduct &&
            conduct.length > 0
        ) {

            const latestConduct =
                conduct[0];


            conductStatus.textContent =
                latestConduct.status ||
                latestConduct.conduct_status ||
                latestConduct.rating ||
                "Recorded";

        } else {

            // Don't break the dashboard if the
            // conduct table has different columns
            // or no record exists yet.

            conductStatus.textContent =
                "No record";
        }

    }


    // ======================================
    // FINISHED
    // ======================================

    console.log(
        "Student dashboard loaded successfully."
    );

}


// ==========================================
// START STUDENT PAGES
// ==========================================

if (
    window.location.pathname.includes(
        "student-dashboard.html"
    )
) {

    loadStudentDashboard();

}


if (
    window.location.pathname.endsWith("/attendance.html") &&
    !window.location.pathname.endsWith("/teacher-attendance.html") &&
    !window.location.pathname.endsWith("/admin-attendance.html")
) {
    loadStudentAttendance();
}

async function loadStudentProfile() {

    console.log(
        "Loading student profile..."
    );


    // ==========================================
    // GET CURRENT USER
    // ==========================================

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
            "Profile user error:",
            userError
        );

        window.location.href =
            "login.html";

        return;
    }

// ==========================================
// GET STUDENT
// ==========================================

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
        "Profile student error:",
        studentError
    );

    return;
}


console.log(
    "Profile student:",
    student
);


// ==========================================
// FULL NAME
// ==========================================

const profileFullName =
    document.getElementById(
        "profileFullName"
    );

if (profileFullName) {

    profileFullName.textContent =
        student.full_name;

}


// ==========================================
// ADMISSION NUMBER
// ==========================================

const profileAdmissionNumber =
    document.getElementById(
        "profileAdmissionNumber"
    );

if (profileAdmissionNumber) {

    profileAdmissionNumber.textContent =
        student.admission_number;

}


// ==========================================
// CLASS
// ==========================================

const profileClass =
    document.getElementById(
        "profileClass"
    );

if (profileClass) {

    profileClass.textContent =
        student.class_name;

}


// ==========================================
// EMAIL
// ==========================================

const profileEmail =
    document.getElementById(
        "profileEmail"
    );

if (profileEmail) {

    profileEmail.textContent =
        student.email ||
        user.email ||
        "Not available";

}


// ==========================================
// TOP NAME
// ==========================================

const topStudentName =
    document.getElementById(
        "topStudentName"
    );

if (topStudentName) {

    topStudentName.textContent =
        student.full_name;

}


// ==========================================
// PROFILE INITIAL
// ==========================================

const profileInitial =
    document.getElementById(
        "profileInitial"
    );

if (profileInitial) {

    profileInitial.textContent =
        student.full_name
            .charAt(0)
            .toUpperCase();

}


// ==========================================
// PROFILE HERO NAME
// ==========================================

const profileHeroName =
    document.getElementById(
        "profileHeroName"
    );

if (profileHeroName) {

    profileHeroName.textContent =
        student.full_name;

}


// ==========================================
// PROFILE HERO CLASS
// ==========================================

const profileHeroClass =
    document.getElementById(
        "profileHeroClass"
    );

if (profileHeroClass) {

    profileHeroClass.textContent =
        student.class_name ||
        "Student";

}


// ==========================================
// PROFILE HERO ADMISSION
// ==========================================

const profileHeroAdmission =
    document.getElementById(
        "profileHeroAdmission"
    );

if (profileHeroAdmission) {

    profileHeroAdmission.textContent =
        student.admission_number ||
        "Student";

}


// ==========================================
// PROFILE PHOTO
// ==========================================

const photo =
    document.getElementById(
        "studentProfilePhoto"
    );

const placeholder =
    document.getElementById(
        "studentPhotoPlaceholder"
    );


if (
    student.profile_photo_url &&
    photo
) {

    photo.src =
        student.profile_photo_url;

    photo.style.display =
        "block";


    if (placeholder) {

        placeholder.style.display =
            "none";

    }

}

else {

    if (photo) {

        photo.style.display =
            "none";

    }


    if (placeholder) {

        placeholder.textContent =
            student.full_name
                .charAt(0)
                .toUpperCase();

        placeholder.style.display =
            "block";

    }

}


// ==========================================
// PROFILE PHOTO UPLOAD
// ==========================================

const cameraButton =
    document.querySelector(
        ".photo-camera"
    );


if (cameraButton) {

    cameraButton.style.cursor =
        "pointer";


    cameraButton.onclick =
        function () {

            const existingInput =
                document.getElementById(
                    "profilePhotoInput"
                );


            if (existingInput) {

                existingInput.click();

                return;

            }


            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "file";

            input.id =
                "profilePhotoInput";

            input.accept =
                "image/jpeg,image/png,image/webp";

            input.style.display =
                "none";


            document.body.appendChild(
                input
            );


            input.addEventListener(
                "change",
                async function () {

                    const file =
                        input.files[0];


                    if (!file) {

                        return;

                    }


                    // ----------------------------------
                    // CHECK FILE TYPE
                    // ----------------------------------

                    const allowedTypes = [
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                    ];


                    if (
                        !allowedTypes.includes(
                            file.type
                        )
                    ) {

                        alert(
                            "Please select a JPG, PNG, or WEBP image."
                        );

                        return;

                    }


                    // ----------------------------------
                    // CHECK FILE SIZE
                    // ----------------------------------

                    const maxSize =
                        5 *
                        1024 *
                        1024;


                    if (
                        file.size >
                        maxSize
                    ) {

                        alert(
                            "Please choose an image smaller than 5 MB."
                        );

                        return;

                    }


                    console.log(
                        "Uploading profile photo..."
                    );


                    cameraButton.textContent =
                        "⏳";


                    cameraButton.style.pointerEvents =
                        "none";


                    try {

                        // ----------------------------------
                        // CREATE UNIQUE FILE NAME
                        // ----------------------------------

                        const fileExtension =
                            file.name
                                .split(".")
                                .pop()
                                .toLowerCase();


                        const filePath =
                            user.id +
                            "/" +
                            Date.now() +
                            "." +
                            fileExtension;


                        // ----------------------------------
                        // UPLOAD TO SUPABASE STORAGE
                        // ----------------------------------

                        const {
                            error: uploadError
                        } =
                            await supabaseClient
                                .storage
                                .from(
                                    "student-profile-photos"
                                )
                                .upload(
                                    filePath,
                                    file,
                                    {
                                        cacheControl:
                                            "3600",

                                        upsert:
                                            false
                                    }
                                );


                        if (uploadError) {

                            console.error(
                                "Photo upload error:",
                                uploadError
                            );

                            alert(
                                "Unable to upload your photo. Please try again."
                            );

                            return;

                        }


                        // ----------------------------------
                        // GET PUBLIC URL
                        // ----------------------------------

                        const {
                            data: publicUrlData
                        } =
                            supabaseClient
                                .storage
                                .from(
                                    "student-profile-photos"
                                )
                                .getPublicUrl(
                                    filePath
                                );


                        const photoUrl =
                            publicUrlData
                                .publicUrl;


                        // ----------------------------------
                        // SAVE URL TO STUDENT
                        // ----------------------------------

                        const {
                            error: updateError
                        } =
                            await supabaseClient
                                .from(
                                    "students"
                                )
                                .update({
                                    profile_photo_url:
                                        photoUrl
                                })
                                .eq(
                                    "id",
                                    student.id
                                );


                        if (updateError) {

                            console.error(
                                "Profile photo database error:",
                                updateError
                            );

                            alert(
                                "The photo uploaded, but we couldn't save it to your profile."
                            );

                            return;

                        }


                        // ----------------------------------
                        // DISPLAY NEW PHOTO
                        // ----------------------------------

                        if (photo) {

                            photo.src =
                                photoUrl;

                            photo.style.display =
                                "block";

                        }


                        if (placeholder) {

                            placeholder.style.display =
                                "none";

                        }


                        console.log(
                            "Profile photo updated successfully."
                        );


                        alert(
                            "Profile photo updated successfully!"
                        );

                    }

                    catch (error) {

                        console.error(
                            "Profile photo error:",
                            error
                        );

                        alert(
                            "Something went wrong while uploading your photo."
                        );

                    }

                    finally {

                        cameraButton.textContent =
                            "📷";

                        cameraButton.style.pointerEvents =
                            "auto";

                    }

                }
            );


            input.click();

        };

}


console.log(
    "Student profile loaded successfully."
);

}

// ==========================================
// START PROFILE PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "profile.html"
    )
) {

    loadStudentProfile();

}


// ==========================================
// STUDENT GRADES
// ==========================================

async function loadStudentGrades() {

    console.log("Loading student grades...");

    // GET CURRENT USER
    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {

        console.error(
            "Grades user error:",
            userError
        );

        window.location.href = "login.html";

        return;
    }
    // GET STUDENT
    const {
        data: student,
        error: studentError
    } = await supabaseClient
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (studentError || !student) {

        console.error(
            "Grades student error:",
            studentError
        );

        return;
    }

    // ======================================
    // STUDENT NAME
    // ======================================

    const gradesStudentName =
        document.getElementById("gradesStudentName");

    if (gradesStudentName) {

        gradesStudentName.textContent =
            student.full_name;
    }


    // ======================================
    // PROFILE INITIAL
    // ======================================

    const gradesInitial =
        document.getElementById("gradesInitial");

    if (gradesInitial) {

        gradesInitial.textContent =
            student.full_name
                .charAt(0)
                .toUpperCase();
    }


    // ======================================
    // GET GRADES
    // ======================================

    const {
        data: grades,
        error: gradesError
    } = await supabaseClient
        .from("grades")
        .select(`
            id,
            assessment,
            score,
            max_score,
            created_at,
            subjects (
                name,
                code
            )
        `)
        .eq("student_id", student.id)
        .order("created_at", {
            ascending: false
        });


    console.log(
        "GRADES RESULT:",
        grades
    );

    console.log(
        "GRADES ERROR:",
        gradesError
    );


    const gradesContainer =
        document.getElementById(
            "gradesContainer"
        );


    if (gradesError) {

        console.error(gradesError);

        if (gradesContainer) {

            gradesContainer.innerHTML =
                "<p>Unable to load grades.</p>";
        }

        return;
    }


    // ======================================
    // NO GRADES
    // ======================================

    if (
        !grades ||
        grades.length === 0
    ) {

        if (gradesContainer) {

            gradesContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No grades available
                    </h3>

                    <p>
                        Your assessment results
                        will appear here once
                        they are added.
                    </p>

                </div>
            `;
        }

        const gradesAverage =
            document.getElementById(
                "gradesAverage"
            );

        const assessmentCount =
            document.getElementById(
                "assessmentCount"
            );

        const highestScore =
            document.getElementById(
                "highestScore"
            );


        if (gradesAverage) {
            gradesAverage.textContent = "—";
        }

        if (assessmentCount) {
            assessmentCount.textContent = "0";
        }

        if (highestScore) {
            highestScore.textContent = "—";
        }

        return;
    }


    // ======================================
    // CALCULATE OVERALL SUMMARY
    // ======================================

    let totalScore = 0;
    let totalMaximum = 0;
    let highestPercentage = 0;


    grades.forEach(function (grade) {

        const score =
            Number(grade.score);

        const maxScore =
            Number(grade.max_score);


        totalScore += score;

        totalMaximum += maxScore;


        if (maxScore > 0) {

            const percentage =
                (score / maxScore) * 100;


            if (
                percentage >
                highestPercentage
            ) {

                highestPercentage =
                    percentage;
            }
        }

    });


    let overallAverage = 0;


    if (totalMaximum > 0) {

        overallAverage =
            (totalScore / totalMaximum) * 100;
    }


    // ======================================
    // UPDATE OVERALL SUMMARY
    // ======================================

    const gradesAverage =
        document.getElementById(
            "gradesAverage"
        );

    if (gradesAverage) {

        gradesAverage.textContent =
            overallAverage.toFixed(1) + "%";
    }


    const assessmentCount =
        document.getElementById(
            "assessmentCount"
        );

    if (assessmentCount) {

        assessmentCount.textContent =
            grades.length;
    }


    const highestScore =
        document.getElementById(
            "highestScore"
        );

    if (highestScore) {

        highestScore.textContent =
            Math.round(
                highestPercentage
            ) + "%";
    }


    // ======================================
    // GRADE SECTIONS
    // ======================================

    const sections = {

        opener: {
            title: "Opener Exams",
            grades: []
        },

        midterm: {
            title: "Midterm Exams",
            grades: []
        },

        endterm: {
            title: "End Term Exams",
            grades: []
        },

        internal: {
            title: "Subject Internal Tests",
            grades: []
        }

    };


    // ======================================
    // CLASSIFY ASSESSMENTS
    // ======================================

    grades.forEach(function (grade) {

        const assessment =
            String(
                grade.assessment || ""
            ).toLowerCase();


        if (
            assessment.includes("opener") ||
            assessment.includes("opening")
        ) {

            sections.opener.grades.push(
                grade
            );

        }

        else if (
            assessment.includes("midterm") ||
            assessment.includes("mid-term") ||
            assessment.includes("mid term")
        ) {

            sections.midterm.grades.push(
                grade
            );

        }

        else if (
            assessment.includes("end term") ||
            assessment.includes("end-term") ||
            assessment.includes("endterm")
        ) {

            sections.endterm.grades.push(
                grade
            );

        }

        else {

            sections.internal.grades.push(
                grade
            );

        }

    });


    // ======================================
    // CREATE SECTION
    // ======================================

function getGradeClass(percentage) {

    if (percentage >= 80) {
        return "grade-excellent";
    }

    if (percentage >= 70) {
        return "grade-good";
    }

    if (percentage >= 50) {
        return "grade-average";
    }

    return "grade-low";
}
    
    function createGradeSection(
        title,
        sectionGrades
    ) {

        if (
            !sectionGrades ||
            sectionGrades.length === 0
        ) {

            return "";
        }


        let sectionScore = 0;

        let sectionMaximum = 0;


        sectionGrades.forEach(
            function (grade) {

                sectionScore +=
                    Number(
                        grade.score
                    );

                sectionMaximum +=
                    Number(
                        grade.max_score
                    );

            }
        );


        let sectionAverage = 0;


        if (
            sectionMaximum > 0
        ) {

            sectionAverage =
                (
                    sectionScore /
                    sectionMaximum
                ) * 100;
        }


        let rows = "";


        sectionGrades.forEach(
            function (grade) {

                const subjectName =
                    grade.subjects &&
                    grade.subjects.name
                        ? grade.subjects.name
                        : "Subject";


                const subjectCode =
                    grade.subjects &&
                    grade.subjects.code
                        ? grade.subjects.code
                        : "";


                const score =
                    Number(
                        grade.score
                    );


                const maxScore =
                    Number(
                        grade.max_score
                    );


                let percentage = 0;


                if (
                    maxScore > 0
                ) {

                    percentage =
                        (
                            score /
                            maxScore
                        ) * 100;
                }


                rows += `

                    <div class="grade-row">

                        <div class="grade-subject">

                            <strong>
                                ${subjectName}
                            </strong>

                            <span>
                                ${subjectCode}
                            </span>

                        </div>


                        <div class="grade-assessment">

                            ${grade.assessment}

                        </div>


                        <div class="grade-score">

                            ${score} / ${maxScore}

                        </div>


                       <div class="grade-percentage-wrapper">

    <div class="grade-percentage-bar">

        <div
            class="grade-percentage-fill ${getGradeClass(percentage)}"
            style="width: ${Math.min(percentage, 100)}%"
        ></div>

    </div>

    <div class="grade-percentage ${getGradeClass(percentage)}">

        ${Math.round(percentage)}%

    </div>

</div>

                    </div>

                `;

            }
        );


        return `

            <div class="grade-section">

                <div class="grade-section-header">

                    <div>

                        <h3>
                            ${title}
                        </h3>

                        <p>
                            ${sectionGrades.length}
                            assessment${sectionGrades.length === 1 ? "" : "s"}
                        </p>

                    </div>

                </div>


                <div class="grade-table-header">

                    <span>
                        Subject
                    </span>

                    <span>
                        Assessment
                    </span>

                    <span>
                        Score
                    </span>

                    <span>
                        Percentage
                    </span>

                </div>


                <div class="grade-section-rows">

                    ${rows}

                </div>


               <div class="grade-section-average">

    <div class="section-average-label">

        <span>
            ${title} Average
        </span>

        <small>
            Based on ${sectionGrades.length}
            assessment${sectionGrades.length === 1 ? "" : "s"}
        </small>

    </div>

    <strong class="${getGradeClass(sectionAverage)}">

        ${sectionAverage.toFixed(1)}%

    </strong>

</div>

            </div>

        `;

    }


    // ======================================
    // DISPLAY GRADES
    // ======================================

    if (!gradesContainer) {

        return;
    }


    gradesContainer.innerHTML = `

        ${createGradeSection(
            sections.opener.title,
            sections.opener.grades
        )}

        ${createGradeSection(
            sections.midterm.title,
            sections.midterm.grades
        )}

        ${createGradeSection(
            sections.endterm.title,
            sections.endterm.grades
        )}

        ${createGradeSection(
            sections.internal.title,
            sections.internal.grades
        )}

    `;


    console.log(
        "Student grades loaded successfully."
    );

}

if (
    window.location.pathname.endsWith(
        "/grades.html"
    )
) {

    loadStudentGrades();

}

// ==========================================
// STUDENT ATTENDANCE
// ==========================================

async function loadStudentAttendance() {

    console.log("Loading student attendance...");

    // GET CURRENT USER
    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {

        console.error(
            "Attendance user error:",
            userError
        );

        window.location.href = "login.html";

        return;
    }


    // GET STUDENT
    const {
        data: student,
        error: studentError
    } = await supabaseClient
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (studentError || !student) {

        console.error(
            "Attendance student error:",
            studentError
        );

        return;
    }


    // ======================================
    // STUDENT NAME
    // ======================================

    const attendanceStudentName =
        document.getElementById(
            "attendanceStudentName"
        );

    if (attendanceStudentName) {

        attendanceStudentName.textContent =
            student.full_name;
    }


    // ======================================
    // PROFILE INITIAL
    // ======================================

    const attendanceInitial =
        document.getElementById(
            "attendanceInitial"
        );

    if (attendanceInitial) {

        attendanceInitial.textContent =
            student.full_name
                .charAt(0)
                .toUpperCase();
    }


    // ======================================
    // GET ATTENDANCE
    // ======================================

    const {
        data: attendance,
        error: attendanceError
    } = await supabaseClient
        .from("attendance")
        .select(`
            id,
            date,
            status
        `)
        .eq(
            "student_id",
            student.id
        )
        .order(
            "date",
            {
                ascending: false
            }
        );


    console.log(
        "ATTENDANCE RESULT:",
        attendance
    );

    console.log(
        "ATTENDANCE ERROR:",
        attendanceError
    );


    const attendanceContainer =
        document.getElementById(
            "attendanceContainer"
        );


    // ======================================
    // ERROR
    // ======================================

    if (attendanceError) {

        console.error(
            attendanceError
        );

        if (attendanceContainer) {

            attendanceContainer.innerHTML =
                "<p>Unable to load attendance.</p>";
        }

        return;
    }


    // ======================================
    // CALCULATE TOTALS
    // ======================================

    const totalDays =
        attendance
            ? attendance.length
            : 0;


    const presentDays =
        attendance
            ? attendance.filter(
                function (record) {

                    return record.status === "present";

                }
            ).length
            : 0;


    const lateDays =
        attendance
            ? attendance.filter(
                function (record) {

                    return record.status === "late";

                }
            ).length
            : 0;


    const absentDays =
        attendance
            ? attendance.filter(
                function (record) {

                    return record.status === "absent";

                }
            ).length
            : 0;


    // ======================================
    // ATTENDANCE PERCENTAGE
    // ======================================

    let attendancePercentage = 0;


    if (totalDays > 0) {

        attendancePercentage =
            (
                (presentDays + lateDays) /
                totalDays
            ) * 100;
    }


    // ======================================
    // UPDATE SUMMARY
    // ======================================

   const attendancePercentageElement =
    document.getElementById(
        "attendancePercentage"
    );

if (attendancePercentageElement) {

    attendancePercentageElement.textContent =
        Math.round(attendancePercentage) + "%";
}


// UPDATE ATTENDANCE PROGRESS BAR

const attendanceProgressFill =
    document.getElementById(
        "attendanceProgressFill"
    );

if (attendanceProgressFill) {

    const safePercentage = Math.max(
        0,
        Math.min(attendancePercentage, 100)
    );

    attendanceProgressFill.style.width =
        safePercentage + "%";
}

// UPDATE PRESENT, LATE, AND ABSENT SUMMARY CARDS
const presentDaysElement = document.getElementById("presentDays");
const lateDaysElement = document.getElementById("lateDays");
const absentDaysElement = document.getElementById("absentDays");

if (presentDaysElement) {
    presentDaysElement.textContent = presentDays;
}

if (lateDaysElement) {
    lateDaysElement.textContent = lateDays;
}

if (absentDaysElement) {
    absentDaysElement.textContent = absentDays;
}

console.log("ATTENDANCE SUMMARY:", {
    totalDays: totalDays,
    present: presentDays,
    late: lateDays,
    absent: absentDays,
    percentage: Math.round(attendancePercentage) + "%"
});
    

    // ======================================
    // NO RECORDS
    // ======================================

    if (
        !attendance ||
        attendance.length === 0
    ) {

        if (attendanceContainer) {

            attendanceContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No attendance records
                    </h3>

                    <p>
                        Your attendance history
                        will appear here once
                        records are added.
                    </p>

                </div>
            `;
        }

        return;
    }


    // ======================================
    // DISPLAY ATTENDANCE
    // ======================================

    if (!attendanceContainer) {
        return;
    }


    attendanceContainer.innerHTML = "";


    attendance.forEach(
        function (record) {

            const attendanceElement =
                document.createElement(
                    "div"
                );


            attendanceElement.className =
                "attendance-row";


            // FORMAT DATE
            const recordDate =
                new Date(
                    record.date +
                    "T00:00:00"
                );


            const formattedDate =
                recordDate.toLocaleDateString(
                    "en-GB",
                    {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );


            // STATUS
            let statusText =
                record.status;


            statusText =
                statusText
                    .charAt(0)
                    .toUpperCase() +
                statusText
                    .slice(1);


            attendanceElement.innerHTML = `

                <div class="attendance-date">

                    <strong>
                        ${formattedDate}
                    </strong>

                </div>


                <div class="attendance-status">

                    <span
                        class="attendance-badge ${record.status}"
                    >
                        ${statusText}
                    </span>

                </div>

            `;


            attendanceContainer.appendChild(
                attendanceElement
            );

        }
    );


    console.log(
        "Student attendance loaded successfully."
    );

}

// ==========================================
// FULL STUDENT TIMETABLE - GRID
// ==========================================

async function loadFullTimetable() {

    console.log("Loading full timetable...");

    // GET CURRENT USER
    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {

        console.error(
            "Timetable user error:",
            userError
        );

        window.location.href = "login.html";

        return;
    }


    // GET STUDENT
    const {
        data: student,
        error: studentError
    } = await supabaseClient
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .single();


    if (studentError || !student) {

        console.error(
            "Timetable student error:",
            studentError
        );

        return;
    }


    // STUDENT NAME
    const timetableStudentName =
        document.getElementById(
            "timetableStudentName"
        );

    if (timetableStudentName) {

        timetableStudentName.textContent =
            student.full_name;
    }


    // PROFILE INITIAL
    const timetableInitial =
        document.getElementById(
            "timetableInitial"
        );

    if (timetableInitial) {

        timetableInitial.textContent =
            student.full_name
                .charAt(0)
                .toUpperCase();
    }


    // GET TIMETABLE
    const {
        data: timetable,
        error: timetableError
    } = await supabaseClient
        .from("timetable")
        .select(`
            id,
            class_name,
            teacher_name,
            room,
            day_of_week,
            start_time,
            end_time,
            subjects (
                name,
                code
            )
        `)
        .eq(
            "class_name",
            student.class_name
        )
        .order(
            "start_time",
            {
                ascending: true
            }
        );


    console.log(
        "TIMETABLE RESULT:",
        timetable
    );

    console.log(
        "TIMETABLE ERROR:",
        timetableError
    );


    const timetableContainer =
        document.getElementById(
            "timetableContainer"
        );


    if (!timetableContainer) {
        return;
    }


    // ERROR
    if (timetableError) {

        console.error(
            timetableError
        );

        timetableContainer.innerHTML =
            "<p>Unable to load timetable.</p>";

        return;
    }


    // NO DATA
    if (
        !timetable ||
        timetable.length === 0
    ) {

        timetableContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    No timetable available
                </h3>

                <p>
                    Your weekly timetable will
                    appear here once lessons are added.
                </p>

            </div>
        `;

        return;
    }


    // ======================================
    // DAYS
    // ======================================

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];


    timetableContainer.innerHTML = "";


    // ======================================
    // CREATE EACH DAY ROW
    // ======================================

    days.forEach(function (day) {

        const dayLessons =
            timetable.filter(
                function (lesson) {

                    return (
                        lesson.day_of_week ===
                        day
                    );

                }
            );


        const dayRow =
            document.createElement(
                "div"
            );

        dayRow.className =
            "timetable-grid-row";


        // DAY NAME
        const dayColumn =
            document.createElement(
                "div"
            );

        dayColumn.className =
            "timetable-grid-day";

        dayColumn.innerHTML = `
            <h3>
                ${day}
            </h3>
        `;


        // LESSONS AREA
        const lessonsColumn =
            document.createElement(
                "div"
            );

        lessonsColumn.className =
            "timetable-grid-lessons";


        if (
            dayLessons.length === 0
        ) {

            lessonsColumn.innerHTML = `
                <div class="no-lessons">
                    No lessons scheduled
                </div>
            `;

        } else {

            dayLessons.forEach(
                function (lesson) {

                    const lessonCard =
                        document.createElement(
                            "div"
                        );

                    lessonCard.className =
                        "timetable-grid-card";


                    const subjectName =
                        lesson.subjects &&
                        lesson.subjects.name
                            ? lesson.subjects.name
                            : "Subject";


                    const subjectCode =
                        lesson.subjects &&
                        lesson.subjects.code
                            ? lesson.subjects.code
                            : "";


                    const teacher =
                        lesson.teacher_name ||
                        "Teacher TBA";


                    const room =
                        lesson.room ||
                        "Room TBA";


                    const startTime =
                        lesson.start_time
                            ? lesson.start_time
                                .substring(
                                    0,
                                    5
                                )
                            : "";


                    const endTime =
                        lesson.end_time
                            ? lesson.end_time
                                .substring(
                                    0,
                                    5
                                )
                            : "";


                    lessonCard.innerHTML = `

                        <div class="grid-lesson-time">

                            <strong>
                                ${startTime}
                            </strong>

                            <span>
                                ${endTime}
                            </span>

                        </div>


                        <div class="grid-lesson-info">

                            <strong>
                                ${subjectName}
                            </strong>

                            ${
                                subjectCode
                                    ? `<span>${subjectCode}</span>`
                                    : ""
                            }

                            <small>
                                ${teacher}
                                •
                                ${room}
                            </small>

                        </div>

                    `;


                    lessonsColumn.appendChild(
                        lessonCard
                    );

                }
            );

        }


        dayRow.appendChild(
            dayColumn
        );

        dayRow.appendChild(
            lessonsColumn
        );


        timetableContainer.appendChild(
            dayRow
        );

    });


    console.log(
        "Grid timetable loaded successfully."
    );

}


// ==========================================
// START FULL TIMETABLE PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "timetable.html"
    )
) {

    loadFullTimetable();

}

// ==========================================
// FULL ASSIGNMENTS PAGE WITH SUBMISSIONS
// ==========================================

async function loadAssignmentsPage() {

    console.log("Loading assignments page...");

    // ------------------------------------------
    // GET CURRENT USER
    // ------------------------------------------

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            "Assignments user error:",
            userError
        );

        window.location.href =
            "login.html";

        return;
    }


    // ------------------------------------------
    // GET STUDENT
    // ------------------------------------------

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
            "Assignments student error:",
            studentError
        );

        return;
    }


    // ------------------------------------------
    // STUDENT NAME
    // ------------------------------------------

    const studentName =
        document.getElementById(
            "assignmentsStudentName"
        );

    if (studentName) {

        studentName.textContent =
            student.full_name;

    }


    // ------------------------------------------
    // STUDENT INITIAL
    // ------------------------------------------

    const initial =
        document.getElementById(
            "assignmentsInitial"
        );

    if (initial) {

        initial.textContent =
            student.full_name
                .charAt(0)
                .toUpperCase();

    }


    // ------------------------------------------
    // GET ASSIGNMENTS
    // ------------------------------------------

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
                    name,
                    code
                )
            `)
            .eq(
                "class_name",
                student.class_name
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


    const container =
        document.getElementById(
            "assignmentsPageContainer"
        );


    if (!container) {
        return;
    }


    // ------------------------------------------
    // ERROR
    // ------------------------------------------

    if (assignmentsError) {

        console.error(
            assignmentsError
        );

        container.innerHTML =
            "<p>Unable to load assignments.</p>";

        return;
    }


    // ------------------------------------------
    // NO ASSIGNMENTS
    // ------------------------------------------

    if (
        !assignments ||
        assignments.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No assignments yet
                </h3>

                <p>
                    Your assignments will appear
                    here when they are added.
                </p>

            </div>

        `;


        document.getElementById(
            "totalAssignments"
        ).textContent = "0";


        document.getElementById(
            "upcomingAssignments"
        ).textContent = "0";


        document.getElementById(
            "todayAssignments"
        ).textContent = "0";


        return;
    }


    // ------------------------------------------
    // TODAY
    // ------------------------------------------

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    // ------------------------------------------
    // SUMMARY COUNTS
    // ------------------------------------------

    let upcomingCount = 0;

    let todayCount = 0;


    assignments.forEach(
        function (assignment) {

            const dueDate =
                new Date(
                    assignment.due_date +
                    "T00:00:00"
                );


            dueDate.setHours(
                0,
                0,
                0,
                0
            );


            if (dueDate >= today) {

                upcomingCount++;

            }


            if (
                dueDate.getTime() ===
                today.getTime()
            ) {

                todayCount++;

            }

        }
    );


    // ------------------------------------------
    // UPDATE SUMMARY
    // ------------------------------------------

    const totalElement =
        document.getElementById(
            "totalAssignments"
        );

    if (totalElement) {

        totalElement.textContent =
            assignments.length;

    }


    const upcomingElement =
        document.getElementById(
            "upcomingAssignments"
        );

    if (upcomingElement) {

        upcomingElement.textContent =
            upcomingCount;

    }


    const todayElement =
        document.getElementById(
            "todayAssignments"
        );

    if (todayElement) {

        todayElement.textContent =
            todayCount;

    }


    // ------------------------------------------
    // GET STUDENT SUBMISSIONS
    // ------------------------------------------

    const {
        data: submissions,
        error: submissionsError
    } =
        await supabaseClient
            .from("submissions")
            .select(`
                id,
                assignment_id,
                submission_text,
                submitted_at,
                status
            `)
            .eq(
                "student_id",
                student.id
            );


    console.log(
        "SUBMISSIONS RESULT:",
        submissions
    );


    console.log(
        "SUBMISSIONS ERROR:",
        submissionsError
    );


    if (submissionsError) {

        console.error(
            submissionsError
        );

    }


    // ------------------------------------------
    // CLEAR CONTAINER
    // ------------------------------------------

    container.innerHTML = "";


    // ------------------------------------------
    // CREATE ASSIGNMENT CARDS
    // ------------------------------------------

    assignments.forEach(
        function (assignment) {


            const assignmentElement =
                document.createElement(
                    "div"
                );


            assignmentElement.className =
                "assignment-page-card";


            // ----------------------------------
            // SUBJECT
            // ----------------------------------

            const subjectName =
                assignment.subjects &&
                assignment.subjects.name
                    ? assignment.subjects.name
                    : "Subject";


            const subjectCode =
                assignment.subjects &&
                assignment.subjects.code
                    ? assignment.subjects.code
                    : "";


            // ----------------------------------
            // DUE DATE
            // ----------------------------------

            const dueDate =
                new Date(
                    assignment.due_date +
                    "T00:00:00"
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

            let dueClass =
                "assignment-normal";


            if (difference < 0) {

                dueText =
                    "Past due";

                dueClass =
                    "assignment-overdue";

            }

            else if (
                difference === 0
            ) {

                dueText =
                    "Due today";

                dueClass =
                    "assignment-today";

            }

            else if (
                difference === 1
            ) {

                dueText =
                    "Due tomorrow";

                dueClass =
                    "assignment-soon";

            }

            else if (
                difference < 7
            ) {

                dueText =
                    "Due " +
                    dueDate.toLocaleDateString(
                        "en-GB",
                        {
                            weekday: "long"
                        }
                    );

                dueClass =
                    "assignment-soon";

            }

            else {

                dueText =
                    "Due " +
                    dueDate.toLocaleDateString(
                        "en-GB",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    );

            }


            // ----------------------------------
            // FIND EXISTING SUBMISSION
            // ----------------------------------

            const existingSubmission =
                submissions
                    ? submissions.find(
                        function (submission) {

                            return (
                                submission.assignment_id ===
                                assignment.id
                            );

                        }
                    )
                    : null;


            // ----------------------------------
            // CARD HTML
            // ----------------------------------

            assignmentElement.innerHTML = `

                <div class="assignment-page-icon">

                    ${subjectName
                        .charAt(0)
                        .toUpperCase()}

                </div>


                <div class="assignment-page-main">


                    <div class="assignment-page-header">

                        <div>

                            <h3>
                                ${assignment.title}
                            </h3>

                            <span>
                                ${subjectName}

                                ${
                                    subjectCode
                                        ? " • " +
                                          subjectCode
                                        : ""
                                }

                            </span>

                        </div>


                        <span
                            class="assignment-due ${dueClass}"
                        >
                            ${dueText}
                        </span>

                    </div>


                    <p class="assignment-description">

                        ${
                            assignment.description ||
                            "No description provided."
                        }

                    </p>


                    <div class="assignment-date">

                        Due:

                        ${dueDate.toLocaleDateString(
                            "en-GB",
                            {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            }
                        )}

                    </div>


                    <div class="assignment-submit-area">


                        ${
                            existingSubmission
                                ? `

                                    <div class="submission-status">

                                        <strong>
                                            ✓ Submitted
                                        </strong>

                                        <span>
                                            ${new Date(
                                                existingSubmission.submitted_at
                                            ).toLocaleDateString(
                                                "en-GB",
                                                {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric"
                                                }
                                            )}
                                        </span>

                                    </div>

                                    <button
                                        type="button"
                                        class="assignment-submit-button"
                                        onclick="openSubmissionForm('${assignment.id}')"
                                    >
                                        Edit Submission
                                    </button>

                                `
                                : `

                                    <button
                                        type="button"
                                        class="assignment-submit-button"
                                        onclick="openSubmissionForm('${assignment.id}')"
                                    >
                                        Submit Work
                                    </button>

                                `
                        }


                    </div>


                    <div
                        id="submission-form-${assignment.id}"
                        class="submission-form"
                        style="display: none;"
                    >

                        <textarea
                            id="submission-text-${assignment.id}"
                            placeholder="Type your answer or submission here..."
                        ></textarea>


                        <label class="submission-file-label">

                            Attach a file

                            <input
                                type="file"
                                id="submission-file-${assignment.id}"
                            >

                        </label>


                        <div class="submission-form-actions">

                            <button
                                type="button"
                                class="submission-cancel-button"
                                onclick="closeSubmissionForm('${assignment.id}')"
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                class="assignment-submit-button"
                                onclick="submitAssignment('${assignment.id}', '${student.id}', '${user.id}')"
                            >
                                Submit Assignment
                            </button>

                        </div>


                        <p
                            id="submission-message-${assignment.id}"
                            class="submission-message"
                        ></p>

                    </div>


                </div>

            `;


            container.appendChild(
                assignmentElement
            );

        }
    );


    console.log(
        "Assignments page loaded successfully."
    );

}


// ==========================================
// OPEN SUBMISSION FORM
// ==========================================

function openSubmissionForm(
    assignmentId
) {

    const form =
        document.getElementById(
            "submission-form-" +
            assignmentId
        );


    if (!form) {
        return;
    }


    form.style.display =
        "block";


    form.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ==========================================
// CLOSE SUBMISSION FORM
// ==========================================

function closeSubmissionForm(
    assignmentId
) {

    const form =
        document.getElementById(
            "submission-form-" +
            assignmentId
        );


    if (!form) {
        return;
    }


    form.style.display =
        "none";

}


// ==========================================
// SUBMIT ASSIGNMENT
// ==========================================

async function submitAssignment(
    assignmentId,
    studentId,
    userId
) {

    console.log(
        "Submitting assignment:",
        assignmentId
    );


    const textArea =
        document.getElementById(
            "submission-text-" +
            assignmentId
        );


    const fileInput =
        document.getElementById(
            "submission-file-" +
            assignmentId
        );


    const message =
        document.getElementById(
            "submission-message-" +
            assignmentId
        );


    const text =
        textArea
            ? textArea.value.trim()
            : "";


    const file =
        fileInput &&
        fileInput.files.length > 0
            ? fileInput.files[0]
            : null;


    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!text && !file) {

        if (message) {

            message.textContent =
                "Please type an answer or attach a file.";

            message.className =
                "submission-message error";

        }

        return;
    }


    if (message) {

        message.textContent =
            "Submitting...";

        message.className =
            "submission-message";

    }


    // ------------------------------------------
    // FILE UPLOAD
    // ------------------------------------------

    let filePath = null;


    if (file) {

        const fileExtension =
            file.name.includes(".")
                ? file.name
                    .split(".")
                    .pop()
                    .toLowerCase()
                : "";


        const safeFileName =
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8) +
            (
                fileExtension
                    ? "." + fileExtension
                    : ""
            );


        filePath =
            userId +
            "/" +
            assignmentId +
            "/" +
            safeFileName;


        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from(
                    "assignment-submissions"
                )
                .upload(
                    filePath,
                    file
                );


        if (uploadError) {

            console.error(
                "File upload error:",
                uploadError
            );


            if (message) {

                message.textContent =
                    "The file could not be uploaded.";

                message.className =
                    "submission-message error";

            }

            return;
        }

    }


    // ------------------------------------------
    // CHECK FOR EXISTING SUBMISSION
    // ------------------------------------------

    const {
        data: existingSubmission,
        error: existingError
    } =
        await supabaseClient
            .from("submissions")
            .select("id")
            .eq(
                "assignment_id",
                assignmentId
            )
            .eq(
                "student_id",
                studentId
            )
            .maybeSingle();


    if (existingError) {

        console.error(
            "Existing submission error:",
            existingError
        );

    }


    // ------------------------------------------
    // SAVE SUBMISSION
    // ------------------------------------------

    const submissionData = {

        assignment_id:
            assignmentId,

        student_id:
            studentId,

        submission_text:
            text || null,

        submitted_at:
            new Date().toISOString(),

        status:
            "submitted"

    };


    let submissionError;


    if (existingSubmission) {

        const {
            error
        } =
            await supabaseClient
                .from("submissions")
                .update(
                    submissionData
                )
                .eq(
                    "id",
                    existingSubmission.id
                );


        submissionError =
            error;

    } else {

        const {
            error
        } =
            await supabaseClient
                .from("submissions")
                .insert(
                    submissionData
                );


        submissionError =
            error;

    }


    if (submissionError) {

        console.error(
            "Submission error:",
            submissionError
        );


        if (message) {

            message.textContent =
                "Your submission could not be saved.";

            message.className =
                "submission-message error";

        }

        return;
    }


    // ------------------------------------------
    // SUCCESS
    // ------------------------------------------

    if (message) {

        message.textContent =
            "Assignment submitted successfully!";

        message.className =
            "submission-message success";

    }


    setTimeout(
        function () {

            loadAssignmentsPage();

        },
        1200
    );

}
// ==========================================
// FULL ANNOUNCEMENTS PAGE
// ==========================================

async function loadAnnouncementsPage() {

    console.log("Loading announcements page...");


    // GET CURRENT USER

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            "Announcements user error:",
            userError
        );

        window.location.href =
            "login.html";

        return;
    }


    // GET STUDENT

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
            "Announcements student error:",
            studentError
        );

        return;
    }


    // STUDENT NAME

    const studentName =
        document.getElementById(
            "announcementsStudentName"
        );

    if (studentName) {

        studentName.textContent =
            student.full_name;

    }


    // INITIAL

    const initial =
        document.getElementById(
            "announcementsInitial"
        );

    if (initial) {

        initial.textContent =
            student.full_name
                .charAt(0)
                .toUpperCase();

    }


    // GET ANNOUNCEMENTS

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
            );


    console.log(
        "ANNOUNCEMENTS PAGE RESULT:",
        announcements
    );


    console.log(
        "ANNOUNCEMENTS PAGE ERROR:",
        announcementsError
    );


    const container =
        document.getElementById(
            "announcementsPageContainer"
        );


    if (!container) {
        return;
    }


    // ERROR

    if (announcementsError) {

        console.error(
            announcementsError
        );

        container.innerHTML =
            "<p>Unable to load announcements.</p>";

        return;
    }


    // NO ANNOUNCEMENTS

    if (
        !announcements ||
        announcements.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No announcements
                </h3>

                <p>
                    There are currently no school
                    announcements.
                </p>

            </div>

        `;

        return;
    }


    // CLEAR CONTAINER

    container.innerHTML = "";


    // CREATE ANNOUNCEMENTS

   announcements.forEach(
    function (announcement) {

        const announcementElement =
            document.createElement("div");

        announcementElement.className =
            "admin-announcement-item";


        const roleNames = {
            all: "🌍 Everyone",
            student: "🎓 Student Portal",
            teacher: "👨‍🏫 Teacher Portal",
            parent: "👨‍👩‍👧 Parent Portal",
            admin: "🛡️ Admin Portal"
        };


        const targetRole =
            roleNames[
                announcement.target_role
            ] ||
            announcement.target_role;


        const targetClass =
            announcement.target_class === "all"
                ? "All Classes"
                : announcement.target_class;


        const createdDate =
            new Date(
                announcement.created_at
            );


        const formattedDate =
            createdDate.toLocaleDateString(
                "en-GB",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );


        announcementElement.innerHTML = `

            <h3>
                ${announcement.title}
            </h3>

            <p>
                ${announcement.message}
            </p>

            <div class="announcement-meta">

                <span class="announcement-target">
                    ${targetRole}
                </span>

                <span class="announcement-target">
                    🎯 ${targetClass}
                </span>

                <span>
                    📅 ${formattedDate}
                </span>

            </div>


            <div class="announcement-actions">

                <button
                    class="announcement-edit-button"
                    onclick="editAnnouncement('${announcement.id}')">

                    ✏️ Edit

                </button>


                <button
                    class="announcement-delete-button"
                    onclick="deleteAnnouncement('${announcement.id}')">

                    🗑️ Delete

                </button>

            </div>

        `;


        adminAnnouncementsContainer.appendChild(
            announcementElement
        );

    }
);

}

// ==========================================
// START ANNOUNCEMENTS PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "announcements.html"
    )
) {

    loadAnnouncementsPage();

}

// Automatically load assignments when assignments page opens
if (document.getElementById("assignmentsPageContainer")) {
    loadAssignmentsPage();
}

// ==========================================
// ADMIN - STUDENT MANAGEMENT
// ==========================================

async function loadAdminStudents() {

    const studentsContainer =
        document.getElementById("studentsContainer");

    const studentCount =
        document.getElementById("studentCount");

    if (!studentsContainer) return;

    studentsContainer.innerHTML =
        "<p>Loading students...</p>";

    const { data: students, error } =
        await supabaseClient
            .from("students")
            .select("*")
            .order("full_name", { ascending: true });

    if (error) {

        console.error(
            "ADMIN STUDENTS ERROR:",
            error
        );

        studentsContainer.innerHTML =
            "<p>Unable to load students.</p>";

        return;
    }

    studentCount.textContent =
        `${students.length} student${students.length === 1 ? "" : "s"}`;

    if (students.length === 0) {

        studentsContainer.innerHTML =
            "<p>No students found.</p>";

        return;
    }

    studentsContainer.innerHTML = "";

   students.forEach(student => {

    const card = document.createElement("div");

    card.className = "student-admin-card";

    const initials = student.full_name
        ? student.full_name
            .split(" ")
            .map(name => name.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "S";

    const photo = student.profile_photo_url
        ? `
            <img
                src="${student.profile_photo_url}"
                alt="${student.full_name || "Student"}"
                class="student-admin-photo"
            >
        `
        : `
            <div class="student-admin-avatar">
                ${initials}
            </div>
        `;

    card.innerHTML = `

        <div class="student-admin-info">

            ${photo}

            <div class="student-admin-details">

                <h3>
                    ${student.full_name || "Unnamed Student"}
                </h3>

                <div class="student-meta">

                    <span>
                        <strong>Admission:</strong>
                        ${student.admission_number || "—"}
                    </span>

                    <span>
                        <strong>Class:</strong>
                        ${student.class_name || "—"}
                    </span>

                </div>

                <p>
                    ${student.email || "No email available"}
                </p>

            </div>

        </div>

       <div class="student-admin-actions">

    <button
        class="edit-student-button"
        onclick="openEditStudentModal('${student.id}')">
        Edit
    </button>

<button
    class="secondary-button"
    type="button"
    onclick="openSubjectAssignment('student', {
        id: '${student.id}',
        name: '${student.full_name}',
        admission_number: '${student.admission_number}'
    })">
    Assign Subjects
</button>

    <button
    class="delete-student-button"
    onclick="deleteStudent('${student.id}')">
    Delete
</button>

    <button
        class="reset-password-button"
        onclick="resetStudentPassword('${student.id}')">
        Reset Password
    </button>

</div>
    `;

    studentsContainer.appendChild(card);
});

}

 // ==========================================
// ADMIN - LOAD TOTAL TEACHERS
// ==========================================

async function loadTotalTeachers() {

    console.log(
    "LOADING TOTAL TEACHERS..."
);

    const totalTeachers =
        document.getElementById(
            "totalTeachers"
        );

    if (!totalTeachers) {
        return;
    }

    const {
        count,
        error
    } =
        await supabaseClient
            .from("teachers")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            );

    if (error) {

        console.error(
            "TOTAL TEACHERS ERROR:",
            error
        );

        totalTeachers.textContent =
            "0";

        return;
    }

    totalTeachers.textContent =
        count || 0;
}

if (
    window.location.pathname.includes(
        "admin-dashboard.html"
    )
) {

    loadTotalTeachers();

}

// ==========================================
// ADMIN - LOAD TEACHERS
// ==========================================

async function loadAdminTeachers() {

    const teachersContainer =
        document.getElementById(
            "teachersContainer"
        );

    const teachersCount =
        document.getElementById(
            "teachersCount"
        );

    if (!teachersContainer) {
        return;
    }

    teachersContainer.innerHTML =
        "<p>Loading teachers...</p>";

const {
    data: {
        user
    },
    error: userError
} = await supabaseClient.auth.getUser();

console.log(
    "CURRENT ADMIN AUTH USER ID:",
    user?.id
);

console.log(
    "CURRENT ADMIN AUTH EMAIL:",
    user?.email
);

console.log(
    "CURRENT ADMIN AUTH ERROR:",
    userError
);
    
    const {
        data: teachers,
        error
    } = await supabaseClient
        .from("teachers")
        .select(
            "id, full_name, email, phone, gender, date_of_birth, address"
        )
        .order(
            "full_name",
            {
                ascending: true
            }
        );

    console.log(
    "ADMIN TEACHERS RESULT:",
    teachers,
    error
);

    if (error) {

        console.error(
            "ADMIN TEACHERS ERROR:",
            error
        );

        teachersContainer.innerHTML =
            "<p>Unable to load teachers.</p>";

        return;
    }

    if (teachersCount) {

        teachersCount.textContent =
            `${teachers.length} teacher${teachers.length === 1 ? "" : "s"}`;

    }

    if (teachers.length === 0) {

        teachersContainer.innerHTML =
            `
            <div class="empty-state">

                <p>
                    No teachers have been added yet.
                </p>

            </div>
            `;

        return;
    }

    teachersContainer.innerHTML = "";

    teachers.forEach(
        teacher => {

            const card =
                document.createElement("div");

            card.className =
                "student-admin-card";

            const initials =
                teacher.full_name
                    ? teacher.full_name
                        .split(" ")
                        .map(
                            name =>
                                name.charAt(0)
                        )
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "T";

            card.innerHTML = `

                <div class="student-admin-info">

                    <div class="student-admin-avatar">
                        ${initials}
                    </div>

                    <div class="student-admin-details">

                        <h3>
                            ${teacher.full_name || "Unnamed Teacher"}
                        </h3>

                        <p>
                            <strong>Email:</strong>
                            ${teacher.email || "—"}
                        </p>

                        <p>
                            <strong>Phone:</strong>
                            ${teacher.phone || "—"}
                        </p>

                    </div>

                </div>

<div class="student-admin-actions">

    <button
        class="secondary-button"
        type="button"
        onclick="resetTeacherPassword('${teacher.id}')">

        Reset Password

    </button>


    <button
        class="edit-student-button"
        type="button"
        onclick="openEditTeacherModal('${teacher.id}')">

        Edit

    </button>

<button
    class="secondary-button"
    type="button"
    onclick="openSubjectAssignment('teacher', {
        id: '${teacher.id}',
        name: '${teacher.full_name}',
        email: '${teacher.email}'
    })">

    Assign Subjects

</button>

    <button
        class="delete-student-button"
        type="button"
        onclick="deleteTeacher('${teacher.id}')">

        Delete

    </button>

</div>
            
            `;

            teachersContainer.appendChild(
                card
            );

        }
    );

}

// ==========================================
// EDIT TEACHER
// ==========================================

window.openEditTeacherModal = async function (teacherId) {

    console.log(
        "EDIT TEACHER CLICKED:",
        teacherId
    );

    const teacherModal =
        document.getElementById("teacherModal");

    const teacherFormMessage =
        document.getElementById(
            "teacherFormMessage"
        );

    const teacherModalTitle =
        document.getElementById(
            "teacherModalTitle"
        );

    if (!teacherModal) {
        console.error("Teacher modal not found.");
        return;
    }

    teacherModal.classList.add("active");

    if (teacherFormMessage) {
        teacherFormMessage.textContent =
            "Loading teacher information...";
    }

    const {
        data: teacher,
        error
    } = await supabaseClient
        .from("teachers")
        .select(
            "id, full_name, email, phone, gender, date_of_birth, address"
        )
        .eq("id", teacherId)
        .single();

    console.log(
        "TEACHER EDIT RESULT:",
        teacher,
        error
    );

    if (error) {

        console.error(
            "LOAD TEACHER ERROR:",
            error
        );

        if (teacherFormMessage) {
            teacherFormMessage.textContent =
                "Unable to load teacher information.";
        }

        return;
    }

    document.getElementById(
        "teacherId"
    ).value = teacher.id;

    document.getElementById(
        "teacherFullName"
    ).value = teacher.full_name || "";

    document.getElementById(
        "teacherEmail"
    ).value = teacher.email || "";

    document.getElementById(
        "teacherPhone"
    ).value = teacher.phone || "";

    document.getElementById(
        "teacherGender"
    ).value = teacher.gender || "";

    document.getElementById(
        "teacherDateOfBirth"
    ).value = teacher.date_of_birth || "";

    document.getElementById(
        "teacherAddress"
    ).value = teacher.address || "";

    if (teacherModalTitle) {
        teacherModalTitle.textContent =
            "Edit Teacher";
    }

    const description =
        teacherModal.querySelector(
            ".student-modal-header p"
        );

    if (description) {
        description.textContent =
            "Update the teacher's information below.";
    }

    if (teacherFormMessage) {
        teacherFormMessage.textContent = "";
    }
};


// ==========================================
// DELETE TEACHER
// ==========================================

window.deleteTeacher = async function (teacherId) {

    console.log(
        "DELETE TEACHER CLICKED:",
        teacherId
    );

    const confirmed =
        confirm(
            "Are you sure you want to permanently delete this teacher?\n\n" +
            "This will remove the teacher's school record and login account."
        );

    if (!confirmed) {
        return;
    }

    try {

        alert("Deleting teacher...");

        const {
            data,
            error
        } = await supabaseClient
            .functions
            .invoke(
                "delete-teacher",
                {
                    body: {
                        teacherId: teacherId
                    }
                }
            );

        console.log(
            "DELETE TEACHER DATA:",
            data
        );

        console.log(
            "DELETE TEACHER ERROR:",
            error
        );

        if (error) {

            alert(
                "Unable to delete teacher:\n\n" +
                error.message
            );

            return;
        }

        if (
            !data ||
            !data.success
        ) {

            alert(
                data?.error ||
                "Unable to delete teacher."
            );

            return;
        }

        await loadAdminTeachers();

        alert(
            "Teacher deleted successfully."
        );

    } catch (error) {

        console.error(
            "DELETE TEACHER ERROR:",
            error
        );

        alert(
            error.message ||
            "An unexpected error occurred."
        );
    }
};

// ==========================================
// RESET TEACHER PASSWORD
// ==========================================


// ==========================================
// RESET TEACHER PASSWORD
// ==========================================

window.resetTeacherPassword = async function (teacherId) {

    const confirmed = confirm(
        "Are you sure you want to reset this teacher's password?\n\n" +
        "The current password will stop working."
    );

    if (!confirmed) return;

    try {

        const {
            data,
            error
        } = await supabaseClient.functions.invoke(
            "reset-teacher-password",
            {
                body: { teacherId: teacherId }
            }
        );

        if (error) {
            console.error("TEACHER RESET ERROR:", error);

            alert(
                "Unable to reset password:\n\n" +
                error.message
            );

            return;
        }

        if (!data || !data.success) {
            alert(data?.error || "Unable to reset password.");
            return;
        }

        const newPassword =
            data.teacher.temporary_password;

        const copyPassword = confirm(
            "TEACHER PASSWORD RESET SUCCESSFUL!\n\n" +
            "Teacher: " + data.teacher.full_name +
            "\nEmail: " + data.teacher.email +
            "\n\nNEW PASSWORD:\n" + newPassword +
            "\n\nPress OK to copy this password."
        );

        if (copyPassword) {

            try {

                await navigator.clipboard.writeText(newPassword);

                alert(
                    "Password copied successfully. Share it securely with the teacher."
                );

            } catch (error) {

                alert(
                    "Automatic copying failed.\n\nNew password:\n" +
                    newPassword
                );

            }
        }

        // Refresh credentials and reset date
        if (typeof loadAdminCredentials === "function") {
            await loadAdminCredentials();
        }

    } catch (error) {

        console.error("RESET TEACHER PASSWORD ERROR:", error);

        alert(
            error.message ||
            "An unexpected error occurred."
        );
    }
};

// ==========================================
// COPY TEACHER PASSWORD
// ==========================================

window.copyTeacherPassword = async function (
    teacherId
) {

    const passwordInput =
        document.getElementById(
            `teacher-password-${teacherId}`
        );

    if (
        !passwordInput ||
        !passwordInput.value
    ) {

        alert(
            "No password is currently stored for this teacher."
        );

        return;
    }

    try {

        await navigator.clipboard.writeText(
            passwordInput.value
        );

        alert(
            "Teacher password copied to clipboard."
        );

    } catch (error) {

        console.error(
            "COPY PASSWORD ERROR:",
            error
        );

        alert(
            "Unable to copy the password."
        );
    }
};

// ==========================================
// SEARCH TEACHERS
// ==========================================

const teacherSearch =
    document.getElementById(
        "teacherSearch"
    );

if (teacherSearch) {

    teacherSearch.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .trim()
                    .toLowerCase();

            const cards =
                document.querySelectorAll(
                    "#teachersContainer > *"
                );

            cards.forEach(
                card => {

                    const text =
                        card.textContent
                            .toLowerCase();

                    card.style.display =
                        text.includes(search)
                            ? ""
                            : "none";

                }
            );

        }
    );

}

// ==========================================
// ADMIN - TEACHER MODAL
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const addTeacherButton =
            document.getElementById(
                "addTeacherButton"
            );

        const teacherModal =
            document.getElementById(
                "teacherModal"
            );

        const closeTeacherButton =
            document.getElementById(
                "closeTeacherModal"
            );

        const cancelTeacherButton =
            document.getElementById(
                "cancelTeacherButton"
            );

        const teacherForm =
            document.getElementById(
                "teacherForm"
            );


        console.log(
            "TEACHER MODAL ELEMENTS:",
            {
                addTeacherButton,
                teacherModal,
                closeTeacherButton,
                cancelTeacherButton,
                teacherForm
            }
        );


        // ==========================================
        // OPEN ADD TEACHER MODAL
        // ==========================================

        if (addTeacherButton) {

            addTeacherButton.addEventListener(
                "click",
                function () {

                    console.log(
                        "ADD TEACHER BUTTON CLICKED"
                    );

                    if (teacherForm) {
                        teacherForm.reset();
                    }

                    const teacherId =
                        document.getElementById(
                            "teacherId"
                        );

                    if (teacherId) {
                        teacherId.value = "";
                    }

                    const modalTitle =
                        document.getElementById(
                            "teacherModalTitle"
                        );

                    if (modalTitle) {

                        modalTitle.textContent =
                            "Add Teacher";

                    }

                    const description =
                        teacherModal.querySelector(
                            ".student-modal-header p"
                        );

                    if (description) {

                        description.textContent =
                            "Enter the teacher's information below.";

                    }

                    const message =
                        document.getElementById(
                            "teacherFormMessage"
                        );

                    if (message) {

                        message.textContent = "";

                    }

                    teacherModal.classList.add(
                        "active"
                    );

                }
            );

        } else {

            console.error(
                "ADD TEACHER BUTTON NOT FOUND"
            );

        }


        // ==========================================
        // CLOSE MODAL
        // ==========================================

        function closeTeacherModalWindow() {

            if (teacherModal) {

                teacherModal.classList.remove(
                    "active"
                );

            }

        }


        if (closeTeacherButton) {

            closeTeacherButton.addEventListener(
                "click",
                closeTeacherModalWindow
            );

        }


        if (cancelTeacherButton) {

            cancelTeacherButton.addEventListener(
                "click",
                closeTeacherModalWindow
            );

        }


        // ==========================================
        // CLOSE WHEN CLICKING OUTSIDE
        // ==========================================

        if (teacherModal) {

            teacherModal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        teacherModal
                    ) {

                        closeTeacherModalWindow();

                    }

                }
            );

        }

    }
);

// ==========================================
// ADMIN - SAVE TEACHER
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const teacherForm =
            document.getElementById(
                "teacherForm"
            );

        const teacherModal =
            document.getElementById(
                "teacherModal"
            );


        if (!teacherForm) {
            return;
        }


        teacherForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const message =
                    document.getElementById(
                        "teacherFormMessage"
                    );


                const fullName =
                    document.getElementById(
                        "teacherFullName"
                    ).value.trim();


                const email =
                    document.getElementById(
                        "teacherEmail"
                    ).value.trim();


                const phone =
                    document.getElementById(
                        "teacherPhone"
                    ).value.trim();


                const gender =
                    document.getElementById(
                        "teacherGender"
                    ).value;


                const dateOfBirth =
                    document.getElementById(
                        "teacherDateOfBirth"
                    ).value;


                const address =
                    document.getElementById(
                        "teacherAddress"
                    ).value.trim();


                if (
                    !fullName ||
                    !email
                ) {

                    message.textContent =
                        "Full name and email are required.";

                    return;

                }


                message.textContent =
                    "Creating teacher account...";


                try {

            id="j8x0p4"
const {
    data,
    error
} =
    await supabaseClient
        .functions
        .invoke(
            "create-teacher",
            {
                body: {
                    full_name:
                        fullName,
                    email:
                        email,
                    phone:
                        phone ||
                        null,
                    gender:
                        gender ||
                        null,
                    date_of_birth:
                        dateOfBirth ||
                        null,
                    address:
                        address ||
                        null
                }
            }
        );

console.log(
    "CREATE TEACHER DATA:",
    data
);

console.log(
    "CREATE TEACHER ERROR:",
    error
);

if (error) {

    console.error(
        "CREATE TEACHER ERROR:",
        error
    );

    console.error(
        "FUNCTION RESPONSE DATA:",
        data
    );

    let errorMessage =
        error.message ||
        "Unable to create teacher.";

    if (data?.error) {

        errorMessage =
            data.error;

    }

    message.textContent =
        errorMessage;

    alert(
        "Teacher creation failed:\n\n" +
        errorMessage
    );

    return;

}


                    if (
                        !data ||
                        !data.success
                    ) {

                        message.textContent =
                            data?.error ||
                            "Unable to create teacher.";

                        return;

                    }

// ==========================================
// SHOW LOGIN DETAILS
// ==========================================

alert(
    "Teacher created successfully!\n\n" +
    "Teacher: " + fullName +
    "\n\n" +
    "Email: " + email +
    "\n\n" +
    "Temporary Password: " +
    data.temporaryPassword +
    "\n\n" +
    "The password has also been saved in the teacher directory."
);


                    teacherForm.reset();


                    teacherModal.classList.remove(
                        "active"
                    );


                    if (
                        typeof loadAdminTeachers ===
                        "function"
                    ) {

                        await loadAdminTeachers();

                    }


                } catch (error) {

                    console.error(
                        "SAVE TEACHER ERROR:",
                        error
                    );

                    message.textContent =
                        error.message ||
                        "An unexpected error occurred.";

                }

            }
        );

    }
);

// ==========================================
// RESET STUDENT PASSWORD
// ==========================================

async function resetStudentPassword(studentId) {

    const confirmed = confirm(
        "Are you sure you want to reset this student's password?\n\nThe current password will stop working."
    );

    if (!confirmed) return;

    try {

        const {
            data: accountData,
            error: accountError
        } = await supabaseClient.functions.invoke(
            "reset-student-password",
            {
                body: { studentId }
            }
        );

        if (accountError) {
            console.error("PASSWORD RESET ERROR:", accountError);

            alert("Password reset failed: " + accountError.message);
            return;
        }

        if (!accountData || !accountData.success) {
            console.error("PASSWORD RESET RESPONSE:", accountData);

            alert(accountData?.error || "Password reset failed.");
            return;
        }

        const newPassword =
            accountData.student.temporary_password;

        const copyPassword = confirm(
            "PASSWORD RESET SUCCESSFUL!\n\n" +
            "Student: " + accountData.student.full_name +
            "\nLogin email: " + accountData.student.email +
            "\n\nNEW PASSWORD:\n" + newPassword +
            "\n\nPress OK to copy the password."
        );

        if (copyPassword) {
            try {
                await navigator.clipboard.writeText(newPassword);

                alert(
                    "Password copied successfully. Share it securely with the student."
                );

            } catch (error) {
                alert(
                    "Automatic copying failed.\n\nNew password:\n" +
                    newPassword
                );
            }
        }

        // Refresh credentials and reset date
        if (typeof loadAdminCredentials === "function") {
            await loadAdminCredentials();
        }

    } catch (error) {

        console.error("PASSWORD RESET ERROR:", error);

        alert(
            error.message || "An unexpected error occurred."
        );
    }
}

// ==========================================
// COPY STUDENT PASSWORD
// ==========================================

async function copyStudentPassword(studentId) {

    const passwordInput =
        document.getElementById(
            `password-${studentId}`
        );

    if (
        !passwordInput ||
        !passwordInput.value
    ) {

        alert(
            "No password is available to copy."
        );

        return;
    }

    try {

        await navigator.clipboard.writeText(
            passwordInput.value
        );

        alert(
            "Password copied to clipboard!"
        );

    } catch (error) {

        console.error(
            "COPY PASSWORD ERROR:",
            error
        );

        alert(
            "The password could not be copied."
        );
    }
}

// ==========================================
// OPEN EDIT STUDENT MODAL
// ==========================================

async function openEditStudentModal(studentId) {

    const { data: student, error } =
        await supabaseClient
            .from("students")
            .select("*")
            .eq("id", studentId)
            .single();

    if (error) {

        console.error(
            "STUDENT LOAD ERROR:",
            error
        );

        alert("Unable to load student.");

        return;
    }

    document.getElementById("studentId").value =
        student.id;

    document.getElementById("studentFullName").value =
        student.full_name || "";

    document.getElementById("studentAdmissionNumber").value =
        student.admission_number || "";

    document.getElementById("studentClass").value =
        student.class_name || "";

    document.getElementById("studentEmail").value =
        student.email || "";

   // Phone
const phoneInput =
    document.getElementById("studentPhone");

if (phoneInput) {
    phoneInput.value =
        student.phone || "";
}

// Gender
const genderInput =
    document.getElementById("studentGender");

if (genderInput) {
    genderInput.value =
        student.gender || "";
}

// Date of birth
const dateOfBirthInput =
    document.getElementById("studentDateOfBirth");

if (dateOfBirthInput) {
    dateOfBirthInput.value =
        student.date_of_birth || "";
}

// Guardian name
const guardianNameInput =
    document.getElementById("studentGuardianName");

if (guardianNameInput) {
    guardianNameInput.value =
        student.guardian_name || "";
}

// Guardian phone
const guardianPhoneInput =
    document.getElementById("studentGuardianPhone");

if (guardianPhoneInput) {
    guardianPhoneInput.value =
        student.guardian_phone || "";
}

// Address
const addressInput =
    document.getElementById("studentAddress");

if (addressInput) {
    addressInput.value =
        student.address || "";
}

// ==========================================
// EDIT MODE
// ==========================================

document.getElementById(
    "modalTitle"
).textContent =
    "Edit Student";

const modalDescription =
    document.querySelector(
        ".student-modal-header p"
    );

if (modalDescription) {

    modalDescription.textContent =
        "Edit the student's information below.";

}

document.getElementById(
    "studentFormMessage"
).textContent = "";

// ==========================================
// OPEN MODAL
// ==========================================

document.getElementById(
    "studentModal"
).classList.add("active");

}
// ==========================================
// CLOSE STUDENT MODAL
// ==========================================

function closeStudentModal() {

    const modal =
        document.getElementById("studentModal");

    if (modal) {
        modal.classList.remove("active");
    }
}

// ==========================================
// ADD / EDIT STUDENT
// ==========================================

const studentForm =
    document.getElementById("studentForm");

const addStudentButton =
    document.getElementById("addStudentButton");


// ==========================================
// OPEN ADD STUDENT MODAL
// ==========================================

if (addStudentButton) {

    addStudentButton.addEventListener(
        "click",
        function () {

            // Clear the form
            document.getElementById("studentForm").reset();

            // Clear hidden student ID
            document.getElementById("studentId").value = "";

            // Change modal title
            document.getElementById("modalTitle").textContent =
                "Add Student";

            // Change description
            const modalDescription =
                document.querySelector(
                    ".student-modal-header p"
                );

            if (modalDescription) {

                modalDescription.textContent =
                    "Enter the student's information below.";

            }

            // Clear message
            document.getElementById(
                "studentFormMessage"
            ).textContent = "";

            // Open modal
            document.getElementById("studentModal")
                .classList.add("active");

        }
    );
}


// ==========================================
// SAVE STUDENT
// ==========================================

if (studentForm) {

    studentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const studentId =
                document.getElementById("studentId").value;

            const message =
                document.getElementById(
                    "studentFormMessage"
                );

          const studentData = {

    full_name:
        document.getElementById(
            "studentFullName"
        ).value.trim(),

    admission_number:
        document.getElementById(
            "studentAdmissionNumber"
        ).value.trim(),

    class_name:
        document.getElementById(
            "studentClass"
        ).value.trim(),

    email:
        document.getElementById(
            "studentEmail"
        ).value.trim(),

    phone:
        document.getElementById(
            "studentPhone"
        ).value.trim(),

    gender:
        document.getElementById(
            "studentGender"
        ).value,

    date_of_birth:
        document.getElementById(
            "studentDateOfBirth"
        ).value || null,

    guardian_name:
        document.getElementById(
            "studentGuardianName"
        ).value.trim(),

    guardian_phone:
        document.getElementById(
            "studentGuardianPhone"
        ).value.trim(),

    address:
        document.getElementById(
            "studentAddress"
        ).value.trim()

}; 

            message.textContent =
                "Saving...";


            // ======================================
            // EDIT EXISTING STUDENT
            // ======================================

            if (studentId) {

                const { error } =
                    await supabaseClient
                        .from("students")
                        .update(studentData)
                        .eq("id", studentId);


                if (error) {

                    console.error(
                        "STUDENT UPDATE ERROR:",
                        error
                    );

                    message.textContent =
                        "Error saving student: " +
                        error.message;

                    return;
                }


                message.textContent =
                    "Student updated successfully.";

            }


           // ======================================
// ADD NEW STUDENT
// ======================================

else {

    // ======================================
    // CREATE STUDENT RECORD
    // ======================================

    const {
        data: newStudent,
        error: insertError
    } = await supabaseClient
        .from("students")
        .insert([studentData])
        .select()
        .single();


    if (insertError) {

        console.error(
            "STUDENT INSERT ERROR:",
            insertError
        );

        message.textContent =
            "Error adding student: " +
            insertError.message;

        return;
    }


    // ======================================
    // CREATE AUTH ACCOUNT
    // ======================================

    message.textContent =
        "Creating student login account...";


    const {
        data: accountData,
        error: accountError
    } = await supabaseClient.functions.invoke(
        "create-student",
        {
            body: {

                studentId:
                    newStudent.id,

                ...studentData

            }
        }
    );


    if (accountError) {

        console.error(
            "STUDENT ACCOUNT ERROR:",
            accountError
        );

        message.textContent =
            "Student was added, but the login account could not be created: " +
            accountError.message;

        return;
    }


    if (
        !accountData ||
        !accountData.success
    ) {

        console.error(
            "STUDENT ACCOUNT RESPONSE:",
            accountData
        );

        message.textContent =
            "Student was added, but the login account could not be created.";

        return;
    }


    // ======================================
    // SHOW LOGIN DETAILS
    // ======================================

    message.innerHTML = `
        <strong>Student added successfully!</strong><br>
        Login email: ${accountData.student.email}<br>
        Temporary password: ${accountData.student.temporary_password}
    `;

}
            // Refresh student directory
            await loadAdminStudents();


            // Close modal
            setTimeout(() => {

                closeStudentModal();

                document.getElementById(
                    "studentForm"
                ).reset();

            }, 700);

        }
    );
}


// ==========================================
// SEARCH STUDENTS
// ==========================================

const studentSearch =
    document.getElementById("studentSearch");

if (studentSearch) {

    studentSearch.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .trim()
                    .toLowerCase();

            const cards =
                document.querySelectorAll(
                    "#studentsContainer > *"
                );

            cards.forEach(card => {

                const text =
                    card.textContent
                        .toLowerCase();

                card.style.display =
                    text.includes(search)
                        ? ""
                        : "none";

            });

        }
    );
}

// ==========================================
// ADMIN STUDENTS PAGE STARTUP
// ==========================================

if (
    window.location.pathname.includes(
        "admin-students.html"
    )
) {
    loadAdminStudents();
}


// ==========================================
// MODAL BUTTONS
// ==========================================

const cancelStudentButton =
    document.getElementById(
        "cancelStudentButton"
    );

if (cancelStudentButton) {

    cancelStudentButton.addEventListener(
        "click",
        closeStudentModal
    );
}

// ==========================================
// ADMIN DASHBOARD - TOTAL STUDENTS
// ==========================================

async function loadAdminDashboardStats() {

    const totalStudents =
        document.getElementById("totalStudents");

    if (!totalStudents) return;

    totalStudents.textContent = "…";

    const { count, error } =
        await supabaseClient
            .from("students")
            .select("id", {
                count: "exact",
                head: true
            });

    if (error) {

        console.error(
            "TOTAL STUDENTS ERROR:",
            error
        );

        totalStudents.textContent = "0";

        return;
    }

    totalStudents.textContent =
        count || 0;
}


// ==========================================
// START ADMIN DASHBOARD STATS
// ==========================================

if (
    document.getElementById("totalStudents")
) {

    loadAdminDashboardStats();

}

// ==========================================
// ADMIN DASHBOARD - TOTAL ANNOUNCEMENTS
// ==========================================

async function loadAdminAnnouncementsCount() {

    const totalAnnouncements =
        document.getElementById("totalAnnouncements");

    if (!totalAnnouncements) return;

    totalAnnouncements.textContent = "…";

    const { count, error } =
        await supabaseClient
            .from("announcements")
            .select("id", {
                count: "exact",
                head: true
            });

    if (error) {

        console.error(
            "TOTAL ANNOUNCEMENTS ERROR:",
            error
        );

        totalAnnouncements.textContent = "0";

        return;
    }

    totalAnnouncements.textContent =
        count || 0;
}


// ==========================================
// START ANNOUNCEMENT COUNT
// ==========================================

if (
    document.getElementById("totalAnnouncements")
) {

    loadAdminAnnouncementsCount();

}

// ======================================
// ADMIN ANNOUNCEMENTS
// ======================================

const announcementForm =
    document.getElementById("announcementForm");

const adminAnnouncementsContainer =
    document.getElementById(
        "adminAnnouncementsContainer"
    );


// ======================================
// LOAD ADMIN ANNOUNCEMENTS
// ======================================

async function loadAdminAnnouncements() {

    if (!adminAnnouncementsContainer) {
        return;
    }

    adminAnnouncementsContainer.innerHTML = `
        <p>Loading announcements...</p>
    `;

    const {
        data: announcements,
        error
    } = await supabaseClient
        .from("announcements")
        .select(`
            id,
            title,
            message,
            target_role,
            target_class,
            created_at
        `)
        .order("created_at", {
            ascending: false
        });

    console.log(
        "ADMIN ANNOUNCEMENTS:",
        announcements
    );

    console.log(
        "ADMIN ANNOUNCEMENTS ERROR:",
        error
    );


    if (error) {

        adminAnnouncementsContainer.innerHTML = `
            <p>
                Unable to load announcements.
            </p>
        `;

        console.error(
            "Admin announcements error:",
            error
        );

        return;
    }


    if (
        !announcements ||
        announcements.length === 0
    ) {

        adminAnnouncementsContainer.innerHTML = `
            <p>
                No announcements have been published yet.
            </p>
        `;

        return;
    }


    adminAnnouncementsContainer.innerHTML = "";


    announcements.forEach(
        function (announcement) {

            const announcementElement =
                document.createElement("div");

            announcementElement.className =
                "admin-announcement-item";


            const roleNames = {
                all: "🌍 Everyone",
                student: "🎓 Student Portal",
                teacher: "👨‍🏫 Teacher Portal",
                parent: "👨‍👩‍👧 Parent Portal",
                admin: "🛡️ Admin Portal"
            };


            const targetRole =
                roleNames[
                    announcement.target_role
                ] ||
                announcement.target_role;


            const targetClass =
                announcement.target_class === "all"
                    ? "All Classes"
                    : announcement.target_class;


            const createdDate =
                new Date(
                    announcement.created_at
                );


            const formattedDate =
                createdDate.toLocaleDateString(
                    "en-GB",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                );


            announcementElement.innerHTML = `

    <h3>
        ${announcement.title}
    </h3>

    <p>
        ${announcement.message}
    </p>

    <div class="announcement-meta">

        <span class="announcement-target">
            ${targetRole}
        </span>

        <span class="announcement-target">
            🎯 ${targetClass}
        </span>

        <span>
            📅 ${formattedDate}
        </span>

    </div>

    <div class="announcement-actions">

        <button
            type="button"
            class="announcement-edit-button"
            onclick="editAnnouncement('${announcement.id}')">

            ✏️ Edit

        </button>

        <button
            type="button"
            class="announcement-delete-button"
            onclick="deleteAnnouncement('${announcement.id}')">

            🗑️ Delete

        </button>

    </div>

`;

             adminAnnouncementsContainer.appendChild(
                announcementElement
            );

        }
    );

}

// ======================================
// EDIT ANNOUNCEMENT
// ======================================

async function editAnnouncement(id) {

    const newTitle =
        prompt(
            "Enter the new announcement title:"
        );

    if (newTitle === null) {
        return;
    }


    const newMessage =
        prompt(
            "Enter the new announcement message:"
        );

    if (newMessage === null) {
        return;
    }


    const title =
        newTitle.trim();

    const message =
        newMessage.trim();


    if (!title || !message) {

        alert(
            "Title and message cannot be empty."
        );

        return;
    }


    const {
        error
    } = await supabaseClient
        .from("announcements")
        .update({
            title: title,
            message: message
        })
        .eq("id", id);


    if (error) {

        console.error(
            "EDIT ANNOUNCEMENT ERROR:",
            error
        );

        alert(
            "Unable to update announcement."
        );

        return;
    }


    await loadAdminAnnouncements();

}


// ======================================
// DELETE ANNOUNCEMENT
// ======================================

async function deleteAnnouncement(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this announcement?"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("announcements")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(
            "DELETE ANNOUNCEMENT ERROR:",
            error
        );

        alert(
            "Unable to delete announcement."
        );

        return;
    }


    await loadAdminAnnouncements();

}
    
// ======================================
// PUBLISH ANNOUNCEMENT
// ======================================

console.log(
    "ADMIN ANNOUNCEMENT FORM:",
    announcementForm
);


if (announcementForm) {

    announcementForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log(
                "ANNOUNCEMENT FORM SUBMITTED"
            );


            const title =
                document
                    .getElementById("announcementTitle")
                    .value
                    .trim();


            const message =
                document
                    .getElementById("announcementMessage")
                    .value
                    .trim();


            const targetRole =
                document
                    .getElementById("announcementRole")
                    .value;


            const targetClass =
                document
                    .getElementById("announcementClass")
                    .value;


            const formMessage =
                document.getElementById(
                    "announcementFormMessage"
                );


            console.log(
                "ANNOUNCEMENT DATA:",
                {
                    title,
                    message,
                    targetRole,
                    targetClass
                }
            );


            if (!title || !message) {

                formMessage.textContent =
                    "Please enter a title and message.";

                return;
            }


            formMessage.textContent =
                "Publishing announcement...";


            const {
                data,
                error
            } = await supabaseClient
                .from("announcements")
                .insert({
                    title: title,
                    message: message,
                    target_role: targetRole,
                    target_class: targetClass
                })
                .select();


            console.log(
                "PUBLISHED ANNOUNCEMENT:",
                data
            );


            console.log(
                "PUBLISH ERROR:",
                error
            );


            if (error) {

                console.error(
                    "Publish announcement error:",
                    error
                );

                formMessage.textContent =
                    "Unable to publish announcement.";

                return;
            }


            formMessage.textContent =
                "Announcement published successfully!";


            announcementForm.reset();


            // Refresh published announcements
            await loadAdminAnnouncements();


            setTimeout(
                function () {

                    formMessage.textContent =
                        "";

                },
                3000
            );

        }
    );

}

// ======================================
// START ADMIN ANNOUNCEMENTS
// ======================================

if (adminAnnouncementsContainer) {

    loadAdminAnnouncements();

}

// ==========================================
// ADMIN ATTENDANCE
// ==========================================

async function loadAdminAttendance() {

    console.log("ADMIN ATTENDANCE ELEMENTS:", {
    studentCount: document.getElementById("adminAttendanceStudentCount"),
    average: document.getElementById("adminAverageAttendance"),
    present: document.getElementById("adminPresentToday"),
    absent: document.getElementById("adminAbsentToday"),
    container: document.getElementById("adminAttendanceContainer")
});

    const container =
        document.getElementById(
            "adminAttendanceContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "<p>Loading student attendance...</p>";


    // ======================================
    // GET ALL STUDENTS
    // ======================================

    const {
        data: students,
        error: studentsError
    } =
        await supabaseClient
            .from("students")
            .select(`
                id,
                full_name,
                admission_number,
                class_name
            `)
            .order(
                "full_name",
                {
                    ascending: true
                }
            );


    if (studentsError) {

        console.error(
            "ADMIN ATTENDANCE STUDENTS ERROR:",
            studentsError
        );

        container.innerHTML =
            "<p>Unable to load students.</p>";

        return;
    }


    if (
        !students ||
        students.length === 0
    ) {

        container.innerHTML =
            "<p>No students found.</p>";

        return;
    }


    // ======================================
    // GET ALL ATTENDANCE
    // ======================================

    const {
        data: attendance,
        error: attendanceError
    } =
        await supabaseClient
            .from("attendance")
            .select(`
                id,
                student_id,
                date,
                status
            `)
            .order(
                "date",
                {
                    ascending: false
                }
            );


    if (attendanceError) {

        console.error(
            "ADMIN ATTENDANCE ERROR:",
            attendanceError
        );

        container.innerHTML =
            "<p>Unable to load attendance records.</p>";

        return;
    }


    console.log(
        "ADMIN ATTENDANCE STUDENTS:",
        students
    );

    console.log(
        "ADMIN ATTENDANCE RECORDS:",
        attendance
    );


    // ======================================
    // TODAY
    // ======================================

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    // ======================================
    // COUNTERS
    // ======================================

    let totalAttendancePercentage = 0;

    let studentsWithAttendance = 0;

    let presentToday = 0;

    let absentToday = 0;


    // ======================================
    // CLEAR CONTAINER
    // ======================================

    container.innerHTML = "";


    // ======================================
    // CREATE STUDENT CARDS
    // ======================================

    students.forEach(
        function (student) {

            const studentAttendance =
                attendance.filter(
                    function (record) {

                        return (
                            record.student_id ===
                            student.id
                        );

                    }
                );


            // ----------------------------------
            // COUNTS
            // ----------------------------------

            let present = 0;

            let late = 0;

            let absent = 0;


            studentAttendance.forEach(
                function (record) {

                    const status =
                        String(
                            record.status
                        ).toLowerCase();


                    if (
                        status === "present"
                    ) {

                        present++;

                    }

                    else if (
                        status === "late"
                    ) {

                        late++;

                    }

                    else if (
                        status === "absent"
                    ) {

                        absent++;

                    }


                    // TODAY

                    if (
                        record.date ===
                        today
                    ) {

                        if (
                            status === "present" ||
                            status === "late"
                        ) {

                            presentToday++;

                        }

                        else if (
                            status === "absent"
                        ) {

                            absentToday++;

                        }

                    }

                }
            );


            // ----------------------------------
            // TOTAL DAYS
            // ----------------------------------

            const totalDays =
                present +
                late +
                absent;


            // ----------------------------------
            // ATTENDANCE PERCENTAGE
            // ----------------------------------

            const attendancePercentage =
                totalDays > 0
                    ? Math.round(
                        (
                            (
                                present +
                                late
                            ) /
                            totalDays
                        ) *
                        100
                    )
                    : 0;


            if (totalDays > 0) {

                totalAttendancePercentage +=
                    attendancePercentage;

                studentsWithAttendance++;

            }


            // ----------------------------------
            // INITIALS
            // ----------------------------------

            const initials =
                student.full_name
                    ? student.full_name
                        .split(" ")
                        .map(
                            function (name) {
                                return name
                                    .charAt(0);
                            }
                        )
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "S";


            // ----------------------------------
            // CARD
            // ----------------------------------

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-attendance-card";


            card.dataset.search =
                (
                    student.full_name +
                    " " +
                    (student.admission_number || "") +
                    " " +
                    (student.class_name || "")
                ).toLowerCase();


            card.innerHTML = `

                <div class="admin-attendance-student">

                    <div class="admin-attendance-avatar">

                        ${initials}

                    </div>


                    <div class="admin-attendance-student-info">

                        <h3>
                            ${student.full_name || "Unnamed Student"}
                        </h3>

                        <p>
                            Admission:
                            ${student.admission_number || "—"}
                        </p>

                        <span>
                            Class:
                            ${student.class_name || "—"}
                        </span>

                    </div>

                </div>


                <div class="admin-attendance-percentage">

                    <strong>
                        ${attendancePercentage}%
                    </strong>

                    <span>
                        Attendance
                    </span>

                </div>


                <div class="admin-attendance-stats">

                    <div class="attendance-mini-stat present">

                        <strong>
                            ${present}
                        </strong>

                        <span>
                            Present
                        </span>

                    </div>


                    <div class="attendance-mini-stat late">

                        <strong>
                            ${late}
                        </strong>

                        <span>
                            Late
                        </span>

                    </div>


                    <div class="attendance-mini-stat absent">

                        <strong>
                            ${absent}
                        </strong>

                        <span>
                            Absent
                        </span>

                    </div>


                    <div class="attendance-mini-stat total">

                        <strong>
                            ${totalDays}
                        </strong>

                        <span>
                            Days
                        </span>

                    </div>

                </div>


                <button
                    type="button"
                    class="view-attendance-button"
                    onclick="viewStudentAttendance('${student.id}')"
                >

                    View Details

                </button>

            `;


            container.appendChild(
                card
            );

        }
    );


    // ======================================
    // UPDATE OVERVIEW
    // ======================================

    const studentCountElement =
        document.getElementById(
            "adminAttendanceStudentCount"
        );


    if (studentCountElement) {

        studentCountElement.textContent =
            students.length;

    }


    const averageElement =
        document.getElementById(
            "adminAverageAttendance"
        );


    const average =
        studentsWithAttendance > 0
            ? Math.round(
                totalAttendancePercentage /
                studentsWithAttendance
            )
            : 0;


    if (averageElement) {

        averageElement.textContent =
            average + "%";

    }


    const presentTodayElement =
        document.getElementById(
            "adminPresentToday"
        );


    if (presentTodayElement) {

        presentTodayElement.textContent =
            presentToday;

    }


    const absentTodayElement =
        document.getElementById(
            "adminAbsentToday"
        );


    if (absentTodayElement) {

        absentTodayElement.textContent =
            absentToday;

    }


    console.log(
        "Admin attendance loaded successfully."
    );

}


// ==========================================
// VIEW STUDENT ATTENDANCE DETAILS
// ==========================================

async function viewStudentAttendance(
    studentId
) {

    console.log(
        "Viewing attendance for:",
        studentId
    );


    const {
        data: student,
        error: studentError
    } =
        await supabaseClient
            .from("students")
            .select(`
                id,
                full_name,
                admission_number,
                class_name
            `)
            .eq(
                "id",
                studentId
            )
            .single();


    if (studentError) {

        console.error(
            "STUDENT ATTENDANCE ERROR:",
            studentError
        );

        return;
    }


    const {
        data: records,
        error: attendanceError
    } =
        await supabaseClient
            .from("attendance")
            .select(`
                id,
                date,
                status
            `)
            .eq(
                "student_id",
                studentId
            )
            .order(
                "date",
                {
                    ascending: false
                }
            );


    if (attendanceError) {

        console.error(
            "STUDENT ATTENDANCE RECORD ERROR:",
            attendanceError
        );

        return;
    }


    let details = "";


    if (
        !records ||
        records.length === 0
    ) {

        details =
            "No attendance records found.";

    }

    else {

        details =
            records
                .map(
                    function (record) {

                        const formattedDate =
                            new Date(
                                record.date +
                                "T00:00:00"
                            ).toLocaleDateString(
                                "en-GB",
                                {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                }
                            );


                        return (
                            formattedDate +
                            " — " +
                            record.status
                        );

                    }
                )
                .join("\n");

    }


    alert(
        student.full_name +
        "\n" +
        "Admission: " +
        student.admission_number +
        "\n" +
        "Class: " +
        student.class_name +
        "\n\n" +
        details
    );

}


// ==========================================
// ADMIN ATTENDANCE SEARCH
// ==========================================

const adminAttendanceSearch =
    document.getElementById(
        "adminAttendanceSearch"
    );


if (adminAttendanceSearch) {

    adminAttendanceSearch.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .trim()
                    .toLowerCase();


            const cards =
                document.querySelectorAll(
                    ".admin-attendance-card"
                );


            cards.forEach(
                function (card) {

                    const searchableText =
                        card.dataset.search ||
                        "";


                    card.style.display =
                        searchableText.includes(
                            search
                        )
                            ? ""
                            : "none";

                }
            );

        }
    );

}


// ==========================================
// START ADMIN ATTENDANCE
// ==========================================

if (
    window.location.pathname.includes(
        "admin-attendance.html"
    )
) {

    loadAdminAttendance();

}

// ==========================================
// ADMIN GRADES
// ==========================================

async function loadAdminGrades() {
    console.log("Loading admin grades...");

    const studentList = document.getElementById("adminGradesStudentList");
    const searchInput = document.getElementById("adminGradesSearch");
    const studentSection = document.getElementById("adminStudentSection");
    const resultsSection = document.getElementById("adminStudentResultsSection");
    const backButton = document.getElementById("adminGradesBackButton");
    const selectedStudent = document.getElementById("adminSelectedStudent");
    const gradesContainer = document.getElementById("adminStudentGradesContainer");

    if (!studentList) return;

    const escapeHTML = (value) =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    // ------------------------------------------
    // LOAD STUDENTS
    // ------------------------------------------

    studentList.innerHTML = `
        <div class="grades-empty-state">Loading students...</div>
    `;

    const { data: students, error: studentsError } = await supabaseClient
        .from("students")
        .select("id, full_name, admission_number, class_name")
        .order("full_name", { ascending: true });

    if (studentsError) {
        console.error("ADMIN GRADES STUDENTS ERROR:", studentsError);
        studentList.innerHTML = `
            <div class="grades-empty-state">
                <h3>Unable to load students</h3>
                <p>Please refresh the page and try again.</p>
            </div>
        `;
        return;
    }

    const studentRecords = students || [];

    // ------------------------------------------
    // LOAD ALL GRADES FOR OVERVIEW
    // ------------------------------------------

    const { data: allGrades, error: allGradesError } = await supabaseClient
        .from("grades")
        .select("id, student_id, score, max_score");

    if (allGradesError) {
        console.error("ADMIN ALL GRADES ERROR:", allGradesError);
        studentList.innerHTML = `
            <div class="grades-empty-state">
                <h3>Unable to load grade statistics</h3>
                <p>Please check the grades access permissions.</p>
            </div>
        `;
        return;
    }

    const gradeRecords = allGrades || [];

    const totalScore = gradeRecords.reduce(
        (sum, grade) => sum + (Number(grade.score) || 0), 0
    );

    const totalMaxScore = gradeRecords.reduce(
        (sum, grade) => sum + (Number(grade.max_score) || 0), 0
    );

    const overallAverage = totalMaxScore > 0
        ? (totalScore / totalMaxScore) * 100
        : 0;

    const studentsWithGrades = new Set(
        gradeRecords.map(grade => grade.student_id)
    );

    setText("adminGradesTotalStudents", studentRecords.length);
    setText("adminGradesStudentsWithGrades", studentsWithGrades.size);
    setText("adminGradesTotalResults", gradeRecords.length);
    setText(
        "adminGradesOverallAverage",
        gradeRecords.length ? `${Math.round(overallAverage)}%` : "—"
    );

    // ------------------------------------------
    // STUDENT DIRECTORY
    // ------------------------------------------

    function renderStudents(searchTerm = "") {
        const search = searchTerm.trim().toLowerCase();

        const filteredStudents = studentRecords.filter(student => {
            const name = String(student.full_name || "").toLowerCase();
            const admission = String(student.admission_number || "").toLowerCase();
            const className = String(student.class_name || "").toLowerCase();

            return name.includes(search) ||
                admission.includes(search) ||
                className.includes(search);
        });

        if (filteredStudents.length === 0) {
            studentList.innerHTML = `
                <div class="grades-empty-state">
                    <h3>No students found</h3>
                    <p>Try another name, admission number or class.</p>
                </div>
            `;
            return;
        }

        studentList.innerHTML = "";

        filteredStudents.forEach(student => {
            const studentGradeRecords = gradeRecords.filter(
                grade => grade.student_id === student.id
            );

            const card = document.createElement("article");
            card.className = "admin-grade-student-card";

            card.innerHTML = `
                <div class="student-grade-info">
                    <div class="student-grade-avatar">
                        ${escapeHTML(
                            (student.full_name || "S").charAt(0).toUpperCase()
                        )}
                    </div>

                    <div>
                        <h3>${escapeHTML(student.full_name || "Unnamed Student")}</h3>
                        <p>Admission No: ${escapeHTML(student.admission_number || "N/A")}</p>
                        <p>Class: ${escapeHTML(student.class_name || "N/A")}</p>
                    </div>
                </div>

                <div class="student-grade-card-footer">
                    <span class="grade-record-count">
                        📝 ${studentGradeRecords.length} recorded results
                    </span>

                    <button type="button" class="view-grades-button">
                        View Grades →
                    </button>
                </div>
            `;

            card.querySelector(".view-grades-button").addEventListener(
                "click",
                () => loadAdminStudentGrades(student)
            );

            studentList.appendChild(card);
        });
    }

    renderStudents();

    if (searchInput && !searchInput.dataset.gradesSearchBound) {
        searchInput.dataset.gradesSearchBound = "true";

        searchInput.addEventListener("input", function () {
            renderStudents(this.value);
        });
    }

    // ------------------------------------------
    // BACK TO STUDENT DIRECTORY
    // ------------------------------------------

    if (backButton && !backButton.dataset.gradesBackBound) {
        backButton.dataset.gradesBackBound = "true";

        backButton.addEventListener("click", function () {
            if (resultsSection) resultsSection.style.display = "none";
            if (studentSection) studentSection.style.display = "block";

            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ------------------------------------------
    // LOAD ONE STUDENT'S GRADES
    // ------------------------------------------

async function loadAdminStudentGrades(student) {
    if (studentSection) studentSection.style.display = "none";
    if (resultsSection) resultsSection.style.display = "block";

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (selectedStudent) {
        selectedStudent.innerHTML = `
            <div class="selected-student-banner">
                <div class="selected-student-avatar">
                    ${escapeHTML(
                        (student.full_name || "S").charAt(0).toUpperCase()
                    )}
                </div>
                <div>
                    <h2>${escapeHTML(student.full_name || "Student")}</h2>
                    <p>Admission No: ${escapeHTML(student.admission_number || "N/A")}</p>
                    <p>Class: ${escapeHTML(student.class_name || "N/A")}</p>
                </div>
            </div>
        `;
    }

    gradesContainer.innerHTML = `
        <div class="grades-empty-state">Loading academic results...</div>
    `;

    const { data: grades, error } = await supabaseClient
        .from("grades")
        .select(`
            id,
            assessment,
            score,
            max_score,
            comments,
            created_at,
            subjects (
                id,
                name,
                code
            )
        `)
        .eq("student_id", student.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("ADMIN STUDENT GRADES ERROR:", error);

        gradesContainer.innerHTML = `
            <div class="grades-empty-state">
                <h3>Unable to load grades</h3>
                <p>Please try again later.</p>
            </div>
        `;
        return;
    }

    const results = grades || [];

    // Match assessment names to their categories.
    function getCategory(assessment) {
        const name = String(assessment || "").toLowerCase().trim();

        if (name.includes("opener")) return "Opener";
        if (name.includes("midterm")) return "Midterm";
        if (name.includes("end term") || name.includes("end-term") ||
            name.includes("endterm")) return "End Term";
        if (name.includes("internal")) return "Internal Test";

        return "Other";
    }

    const categories = [
        "Opener",
        "Midterm",
        "End Term",
        "Internal Test"
    ];

    // Build category selector.
    gradesContainer.innerHTML = `
        <div class="grade-category-panel">
            <h3>📚 Select Assessment Category</h3>
            <p>Choose an examination category to view its results.</p>

            <div class="grade-category-buttons">
                ${categories.map((category, index) => {
                    const count = results.filter(
                        grade => getCategory(grade.assessment) === category
                    ).length;

                    return `
                        <button
                            type="button"
                            class="grade-category-button category-${index}"
                            data-category="${category}"
                        >
                            <span>${category}</span>
                            <strong>${count} results</strong>
                        </button>
                    `;
                }).join("")}
            </div>
        </div>

        <div id="adminSelectedGradeCategory">
            <div class="grades-empty-state">
                <h3>Choose an examination category</h3>
                <p>Your selected category's results will appear here.</p>
            </div>
        </div>
    `;

    const categoryButtons = gradesContainer.querySelectorAll(
        ".grade-category-button"
    );

    const categoryResults = document.getElementById(
        "adminSelectedGradeCategory"
    );

    // Render results for the selected category.
    function renderCategory(category) {
        const filteredResults = results.filter(
            grade => getCategory(grade.assessment) === category
        );

        categoryButtons.forEach(button => {
            button.classList.toggle(
                "selected",
                button.dataset.category === category
            );
        });

        if (filteredResults.length === 0) {
            categoryResults.innerHTML = `
                <div class="grades-empty-state">
                    <h3>No ${escapeHTML(category)} results yet</h3>
                    <p>There are no recorded results in this category for this student.</p>
                </div>
            `;

            setText("adminStudentAverage", "—");
            setText("adminStudentResultCount", 0);
            setText("adminStudentHighest", "—");
            setText("adminStudentLowest", "—");
            return;
        }

        let totalScore = 0;
        let totalMaxScore = 0;
        let highest = null;
        let lowest = null;

        filteredResults.forEach(grade => {
            const score = Number(grade.score) || 0;
            const maxScore = Number(grade.max_score) || 0;

            totalScore += score;
            totalMaxScore += maxScore;

            if (maxScore > 0) {
                const percentage = (score / maxScore) * 100;

                highest = highest === null
                    ? percentage
                    : Math.max(highest, percentage);

                lowest = lowest === null
                    ? percentage
                    : Math.min(lowest, percentage);
            }
        });

        const average = totalMaxScore > 0
            ? (totalScore / totalMaxScore) * 100
            : null;

        setText(
            "adminStudentAverage",
            average === null ? "—" : `${Math.round(average)}%`
        );

        setText("adminStudentResultCount", filteredResults.length);

        setText(
            "adminStudentHighest",
            highest === null ? "—" : `${Math.round(highest)}%`
        );

        setText(
            "adminStudentLowest",
            lowest === null ? "—" : `${Math.round(lowest)}%`
        );

        let tableHTML = `
            <div class="grade-category-results-heading">
                <h3>${escapeHTML(category)} Examination Results</h3>
                <span>${filteredResults.length} recorded results</span>
            </div>

            <div class="grades-table-wrapper">
                <table class="admin-grades-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Assessment</th>
                            <th>Score</th>
                            <th>Percentage</th>
                            <th>Teacher's Comments</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        filteredResults.forEach(grade => {
            const score = Number(grade.score) || 0;
            const maxScore = Number(grade.max_score) || 0;

            const percentage = maxScore > 0
                ? (score / maxScore) * 100
                : null;

            let performanceClass = "low";

            if (percentage !== null) {
                if (percentage >= 80) performanceClass = "excellent";
                else if (percentage >= 70) performanceClass = "good";
                else if (percentage >= 50) performanceClass = "average";
            }

            const subjectName = grade.subjects?.name || "Unknown Subject";
            const subjectCode = grade.subjects?.code || "";

            const date = grade.created_at
                ? new Date(grade.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })
                : "N/A";

            tableHTML += `
                <tr>
                    <td>
                        <span class="grade-subject-name">
                            ${escapeHTML(subjectName)}
                        </span>
                        ${
                            subjectCode
                                ? `<span class="grade-subject-code">${escapeHTML(subjectCode)}</span>`
                                : ""
                        }
                    </td>

                    <td>
                        <span class="grade-assessment-badge">
                            ${escapeHTML(grade.assessment || "Assessment")}
                        </span>
                    </td>

                    <td>
                        <span class="grade-score-pill">
                            ${score} / ${maxScore}
                        </span>
                    </td>

                    <td>
                        <span class="grade-percentage ${performanceClass}">
                            ${percentage === null ? "—" : `${Math.round(percentage)}%`}
                        </span>
                    </td>

                    <td>
                        <div class="grade-comment">
                            ${escapeHTML(grade.comments || "No teacher comment provided.")}
                        </div>
                    </td>

                    <td>${escapeHTML(date)}</td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        categoryResults.innerHTML = tableHTML;
    }

    // Connect the four category buttons.
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            renderCategory(button.dataset.category);
        });
    });
}

// CLOSE loadAdminGrades()
}

// ==========================================
// START ADMIN GRADES
// ==========================================

if (window.location.pathname.includes("admin-grades.html")) {
    loadAdminGrades();
}

// ==========================================
// ADMIN CONDUCT
// ==========================================

async function loadAdminConduct() {
    const studentList = document.getElementById("adminConductStudentList");
    if (!studentList) return;

    const escapeHTML = (value) =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    console.log("Loading admin conduct records...");

    const { data: students, error: studentsError } =
        await supabaseClient
            .from("students")
            .select("id, full_name, admission_number, class_name")
            .order("full_name", { ascending: true });

    if (studentsError) {
        console.error("ADMIN CONDUCT STUDENTS ERROR:", studentsError);
        studentList.innerHTML = `<div class="empty-state">Unable to load students.</div>`;
        return;
    }

    const { data: conductRecords, error: conductError } =
        await supabaseClient
            .from("conduct_records")
            .select("id, student_id, type, title, description, points, created_at")
            .order("created_at", { ascending: false });

    if (conductError) {
        console.error("ADMIN CONDUCT ERROR:", conductError);
        studentList.innerHTML = `<div class="empty-state">Unable to load conduct records.</div>`;
        return;
    }

    const records = conductRecords || [];
    const allStudents = students || [];

    const positiveRecords = records.filter(
        record => String(record.type || "").toLowerCase() === "positive"
    );

    const negativeRecords = records.filter(
        record => String(record.type || "").toLowerCase() === "negative"
    );

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    setText("adminConductTotalRecords", records.length);

    setText(
        "adminConductStudents",
        new Set(records.map(record => record.student_id)).size
    );

    setText("adminConductPositive", positiveRecords.length);
    setText("adminConductNegativeRecords", negativeRecords.length);

    function getStudentRecords(studentId) {
        return records.filter(record => record.student_id === studentId);
    }

    function getNetPoints(studentRecords) {
        return studentRecords.reduce((total, record) => {
            const points = Number(record.points) || 0;
            return String(record.type || "").toLowerCase() === "negative"
                ? total - points
                : total + points;
        }, 0);
    }

    function renderStudents(searchTerm = "") {
        const search = searchTerm.trim().toLowerCase();

        const filteredStudents = allStudents.filter(student => {
            const name = String(student.full_name || "").toLowerCase();
            const admission = String(student.admission_number || "").toLowerCase();
            const className = String(student.class_name || "").toLowerCase();

            return name.includes(search) ||
                admission.includes(search) ||
                className.includes(search);
        });

        if (filteredStudents.length === 0) {
            studentList.innerHTML = `
                <div class="empty-state">No students found.</div>
            `;
            return;
        }

        studentList.innerHTML = "";

        filteredStudents.forEach(student => {
            const studentRecords = getStudentRecords(student.id);

            const positiveCount = studentRecords.filter(
                record => String(record.type || "").toLowerCase() === "positive"
            ).length;

            const negativeCount = studentRecords.filter(
                record => String(record.type || "").toLowerCase() === "negative"
            ).length;

            const netPoints = getNetPoints(studentRecords);

            const card = document.createElement("button");
            card.type = "button";
            card.className = "admin-conduct-student-card";

            card.innerHTML = `
                <div class="conduct-student-main">
                    <div class="conduct-student-avatar">
                        ${escapeHTML((student.full_name || "S").charAt(0).toUpperCase())}
                    </div>

                    <div class="conduct-student-info">
                        <h3>${escapeHTML(student.full_name || "Unnamed Student")}</h3>
                        <p>${escapeHTML(student.admission_number || "No admission number")}</p>
                        <p>${escapeHTML(student.class_name || "Class not assigned")}</p>
                    </div>
                </div>

                <div class="conduct-card-summary">
                    <strong>${studentRecords.length}</strong>
                    <span>Records</span>

                    <div class="conduct-card-breakdown">
                        <span class="positive-text">+${positiveCount} positive</span>
                        <span class="negative-text">${negativeCount} concerns</span>
                    </div>

                    <small>Net points: ${netPoints > 0 ? "+" : ""}${netPoints}</small>
                </div>

                <div class="conduct-card-arrow">View details →</div>
            `;

            card.addEventListener("click", () => {
                loadAdminStudentConduct(student);
            });

            studentList.appendChild(card);
        });
    }

    renderStudents();

    const searchInput = document.getElementById("adminConductSearch");

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            renderStudents(this.value);
        });
    }
}

// ==========================================
// ADMIN STUDENT CONDUCT
// ==========================================

async function loadAdminStudentConduct(student) {
    const resultsSection = document.getElementById("adminConductResultsSection");
    const selectedStudent = document.getElementById("adminSelectedConductStudent");
    const container = document.getElementById("adminStudentConductContainer");

    if (!resultsSection || !container) return;

    const escapeHTML = (value) =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    resultsSection.style.display = "block";

    if (selectedStudent) {
        selectedStudent.innerHTML = `
            <div class="conduct-selected-profile">
                <div class="conduct-student-avatar">
                    ${escapeHTML((student.full_name || "S").charAt(0).toUpperCase())}
                </div>

                <div>
                    <h2>${escapeHTML(student.full_name || "Student")}</h2>
                    <p>
                        Admission: ${escapeHTML(student.admission_number || "—")}
                        &nbsp; | &nbsp;
                        Class: ${escapeHTML(student.class_name || "—")}
                    </p>
                </div>
            </div>
        `;
    }

    container.innerHTML = "<p>Loading conduct records...</p>";

    const { data: records, error } = await supabaseClient
        .from("conduct_records")
        .select("id, student_id, type, title, description, points, created_at")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("ADMIN STUDENT CONDUCT ERROR:", error);
        container.innerHTML = `
            <div class="empty-state">Unable to load conduct records.</div>
        `;
        return;
    }

    const studentRecords = records || [];

    const positiveRecords = studentRecords.filter(
        record => String(record.type || "").toLowerCase() === "positive"
    );

    const negativeRecords = studentRecords.filter(
        record => String(record.type || "").toLowerCase() === "negative"
    );

    const netPoints = studentRecords.reduce((total, record) => {
        const points = Number(record.points) || 0;

        return String(record.type || "").toLowerCase() === "negative"
            ? total - points
            : total + points;
    }, 0);

    setText("adminStudentConductCount", studentRecords.length);
    setText("adminStudentPositive", positiveRecords.length);
    setText("adminStudentNegativeRecords", negativeRecords.length);
    setText(
        "adminStudentNetPoints",
        `${netPoints > 0 ? "+" : ""}${netPoints}`
    );

    if (studentRecords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No conduct records yet</h3>
                <p>There are currently no teacher-entered records for this student.</p>
            </div>
        `;
        return;
    }

    let tableHTML = `
        <div class="table-wrapper">
            <table class="admin-grades-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Teacher's Comments</th>
                        <th>Points</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
    `;

    studentRecords.forEach(record => {
        const type = String(record.type || "").toLowerCase();
        const points = Number(record.points) || 0;

        const displayPoints = type === "negative"
            ? `-${points}`
            : `+${points}`;

        const date = record.created_at
            ? new Date(record.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric"
            })
            : "—";

        const typeLabel = type === "positive" ? "Positive" :
            type === "negative" ? "Concern" : (record.type || "—");

        tableHTML += `
            <tr>
                <td>
                    <span class="conduct-type-label ${type === "negative" ? "negative" : "positive"}">
                        ${escapeHTML(typeLabel)}
                    </span>
                </td>

                <td><strong>${escapeHTML(record.title || "Untitled record")}</strong></td>

                <td>${escapeHTML(record.description || "No teacher comments provided.")}</td>

                <td><strong>${displayPoints}</strong></td>

                <td>${escapeHTML(date)}</td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>

        <div class="conduct-total-points">
            <strong>Net Conduct Points</strong>
            <span>${netPoints > 0 ? "+" : ""}${netPoints}</span>
        </div>
    `;

    container.innerHTML = tableHTML;
}

// ==========================================
// ADMIN CONDUCT BACK BUTTON
// ==========================================

const adminConductBackButton =
    document.getElementById(
        "adminConductBackButton"
    );


if (adminConductBackButton) {

    adminConductBackButton.addEventListener(
        "click",
        function () {

            const resultsSection =
                document.getElementById(
                    "adminConductResultsSection"
                );


            if (resultsSection) {

                resultsSection.style.display =
                    "none";

            }


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );
}


// ==========================================
// START ADMIN CONDUCT
// ==========================================

if (
    window.location.pathname.includes(
        "admin-conduct.html"
    )
) {

    loadAdminConduct();

}

// ==========================================
// ADMIN LOGOUT
// ==========================================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", async function () {

        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error("Logout error:", error);
            alert("Unable to log out. Please try again.");
            return;
        }

        window.location.href = "login.html";
    });
}

// ==========================================
// TEACHER DASHBOARD
// ==========================================

async function loadTeacherDashboard() {

    console.log("Loading teacher dashboard...");

    const teacherNameElement =
        document.getElementById("teacherName");

    const teacherStudentCount =
        document.getElementById("teacherStudentCount");

    const teacherSubjectCount =
        document.getElementById("teacherSubjectCount");

    const teacherAssignmentCount =
        document.getElementById("teacherAssignmentCount");

    const teacherDutyCount =
        document.getElementById("teacherDutyCount");

    const teacherTodayTimetable =
        document.getElementById("teacherTodayTimetable");

    const teacherUpcomingAssignments =
        document.getElementById("teacherUpcomingAssignments");

    if (!teacherNameElement) {
        return;
    }

    try {

        // ------------------------------------------
        // GET CURRENT USER
        // ------------------------------------------

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {

            console.error(
                "Teacher user error:",
                userError
            );

            window.location.href = "login.html";
            return;
        }


        // ------------------------------------------
        // GET TEACHER PROFILE
        // ------------------------------------------

        const {
            data: teacher,
            error: teacherError
        } = await supabaseClient
            .from("profiles")
            .select("id, full_name, email, role")
            .eq("id", user.id)
            .eq("role", "teacher")
            .single();


        if (teacherError || !teacher) {

            console.error(
                "Teacher profile error:",
                teacherError
            );

            teacherNameElement.textContent =
                "Teacher";

            return;
        }


        // ------------------------------------------
        // TEACHER NAME
        // ------------------------------------------

        teacherNameElement.textContent =
            teacher.full_name || "Teacher";


        // ------------------------------------------
        // GET TEACHER SUBJECTS
        // ------------------------------------------

        const {
            data: teacherSubjects,
            error: subjectsError
        } = await supabaseClient
            .from("teacher_subjects")
            .select(`
                subject_id,
                subjects (
                    id,
                    name,
                    code
                )
            `)
            .eq("teacher_id", teacher.id);


        if (subjectsError) {

            console.error(
                "Teacher subjects error:",
                subjectsError
            );

        }


        const subjects =
            teacherSubjects || [];


        teacherSubjectCount.textContent =
            subjects.length;


        // ------------------------------------------
        // GET TEACHER TIMETABLE
        // ------------------------------------------

        const {
            data: timetable,
            error: timetableError
        } = await supabaseClient
            .from("timetable")
            .select(`
                id,
                class_name,
                subject_id,
                teacher_name,
                room,
                day_of_week,
                start_time,
                end_time
            `)
            .eq("teacher_id", teacher.id)
            .order("start_time");


        if (timetableError) {

            console.error(
                "Teacher timetable error:",
                timetableError
            );

        }


        const teacherTimetable =
            timetable || [];


        // ------------------------------------------
        // TODAY'S TIMETABLE
        // ------------------------------------------

        const todayName =
            new Date().toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );


        const todayLessons =
            teacherTimetable.filter(
                lesson =>
                    lesson.day_of_week === todayName
            );


        if (todayLessons.length === 0) {

            teacherTodayTimetable.textContent =
                "No lessons scheduled for today.";

        } else {

            teacherTodayTimetable.innerHTML =
                todayLessons
                    .map(lesson => {

                        const subject =
                            subjects.find(
                                item =>
                                    item.subject_id ===
                                    lesson.subject_id
                            );

                        const subjectName =
                            subject?.subjects?.name ||
                            "Subject";

                        return `
                            ${lesson.start_time} -
                            ${lesson.end_time}
                            ${subjectName}
                            (${lesson.class_name})
                            ${lesson.room ? "• " + lesson.room : ""}
                        `;

                    })
                    .join("<br>");

        }


        // ------------------------------------------
        // STUDENT COUNT
        // ------------------------------------------

        const classNames =
            [
                ...new Set(
                    teacherTimetable
                        .map(item => item.class_name)
                        .filter(Boolean)
                )
            ];


        if (classNames.length === 0) {

            teacherStudentCount.textContent = "0";

        } else {

            const {
                count,
                error: studentsError
            } = await supabaseClient
                .from("students")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .in(
                    "class_name",
                    classNames
                );


            if (studentsError) {

                console.error(
                    "Teacher student count error:",
                    studentsError
                );

                teacherStudentCount.textContent =
                    "0";

            } else {

                teacherStudentCount.textContent =
                    count || 0;

            }

        }


        // ------------------------------------------
        // ASSIGNMENTS
        // ------------------------------------------

        const subjectIds =
            subjects.map(
                item => item.subject_id
            );


        if (subjectIds.length === 0) {

            teacherAssignmentCount.textContent =
                "0";

            teacherUpcomingAssignments.textContent =
                "No subjects assigned yet.";

        } else {

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            const {
                data: assignments,
                error: assignmentsError
            } = await supabaseClient
                .from("assignments")
                .select(`
                    id,
                    title,
                    due_date,
                    subject_id
                `)
                .in(
                    "subject_id",
                    subjectIds
                )
                .gte(
                    "due_date",
                    today
                )
                .order(
                    "due_date",
                    {
                        ascending: true
                    }
                );


            if (assignmentsError) {

                console.error(
                    "Teacher assignments error:",
                    assignmentsError
                );

                teacherAssignmentCount.textContent =
                    "0";

                teacherUpcomingAssignments.textContent =
                    "Unable to load assignments.";

            } else {

                teacherAssignmentCount.textContent =
                    assignments?.length || 0;


                if (!assignments ||
                    assignments.length === 0) {

                    teacherUpcomingAssignments.textContent =
                        "No upcoming assignments.";

                } else {

                    teacherUpcomingAssignments.innerHTML =
                        assignments
                            .slice(0, 3)
                            .map(
                                assignment =>
                                    `${assignment.title}
                                    — Due ${assignment.due_date}`
                            )
                            .join("<br>");

                }

            }

        }


        // ------------------------------------------
        // DUTY COUNT
        // ------------------------------------------

        teacherDutyCount.textContent = "0";


        console.log(
            "TEACHER DASHBOARD LOADED:",
            teacher
        );


    } catch (error) {

        console.error(
            "Teacher dashboard error:",
            error
        );

    }

}


// ==========================================
// START TEACHER DASHBOARD
// ==========================================

if (
    window.location.pathname.includes(
        "teacher-dashboard.html"
    )
) {

    loadTeacherDashboard();

}

// ==========================================
// TEACHER GRADES
// ==========================================

async function loadTeacherGrades() {

    console.log("Loading teacher grades...");

    const subjectSelect =
        document.getElementById(
            "teacherGradeSubject"
        );

    const gradesContainer =
        document.getElementById(
            "teacherGradesContainer"
        );

    const statusElement =
        document.getElementById(
            "teacherGradeStatus"
        );


    if (
        !subjectSelect ||
        !gradesContainer
    ) {
        return;
    }


    try {

        // ==========================================
        // GET CURRENT USER
        // ==========================================

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
                "Teacher grades user error:",
                userError
            );

            window.location.href =
                "login.html";

            return;
        }


        // ==========================================
        // GET TEACHER PROFILE
        // ==========================================

        const {
            data: teacher,
            error: teacherError
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "id, full_name, role"
                )
                .eq(
                    "id",
                    user.id
                )
                .eq(
                    "role",
                    "teacher"
                )
                .single();


        if (
            teacherError ||
            !teacher
        ) {

            console.error(
                "Teacher profile error:",
                teacherError
            );

            statusElement.textContent =
                "Teacher profile could not be found.";

            return;
        }


        // ==========================================
        // GET TEACHER SUBJECTS
        // ==========================================

        const {
            data: teacherSubjects,
            error: subjectsError
        } =
            await supabaseClient
                .from("teacher_subjects")
                .select(`
                    subject_id,
                    subjects (
                        id,
                        name,
                        code
                    )
                `)
                .eq(
                    "teacher_id",
                    teacher.id
                );


        if (subjectsError) {

            console.error(
                "Teacher subjects error:",
                subjectsError
            );

            subjectSelect.innerHTML =
                `<option value="">
                    Unable to load subjects
                </option>`;

            return;
        }


        const subjects =
            teacherSubjects || [];


        // ==========================================
        // NO SUBJECTS
        // ==========================================

        if (
            subjects.length === 0
        ) {

            subjectSelect.innerHTML =
                `<option value="">
                    No subjects assigned
                </option>`;

            statusElement.textContent =
                "No subjects have been assigned to you yet.";

            return;
        }


        // ==========================================
        // POPULATE SUBJECT DROPDOWN
        // ==========================================

        subjectSelect.innerHTML =
            `<option value="">
                Select a subject
            </option>`;


        subjects.forEach(
            item => {

                const subject =
                    item.subjects;

                if (!subject) {
                    return;
                }

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    subject.id;

                option.textContent =
                    subject.code
                        ? `${subject.name} (${subject.code})`
                        : subject.name;

                subjectSelect.appendChild(
                    option
                );

            }
        );


        // ==========================================
        // SUBJECT CHANGE
        // ==========================================

        subjectSelect.addEventListener(
            "change",
            function () {

                const subjectId =
                    this.value;

                if (!subjectId) {

                    gradesContainer.innerHTML = `
                        <div class="teacher-grades-empty">

                            <h3>No subject selected</h3>

                            <p>
                                Select a subject above to view grades.
                            </p>

                        </div>
                    `;

                    statusElement.textContent =
                        "Select a subject to view grades.";

                    return;
                }


                loadTeacherSubjectGrades(
                    subjectId
                );

            }
        );


        console.log(
            "TEACHER GRADES READY:",
            teacher
        );

    }

    catch (error) {

        console.error(
            "Teacher grades error:",
            error
        );

    }

}


// ==========================================
// LOAD GRADES FOR SELECTED SUBJECT
// ==========================================

async function loadTeacherSubjectGrades(subjectId) {

    const gradesContainer =
        document.getElementById("teacherGradesContainer");

    const statusElement =
        document.getElementById("teacherGradeStatus");

    gradesContainer.innerHTML = `
        <div class="teacher-grades-empty">
            <h3>Loading grades...</h3>
            <p>Please wait.</p>
        </div>
    `;

    statusElement.textContent =
        "Loading student grades...";

    try {

        // ==========================================
        // GET GRADES
        // ==========================================

        const {
            data: grades,
            error: gradesError
        } = await supabaseClient
            .from("grades")
            .select(`
                id,
                student_id,
                subject_id,
                assessment,
                score,
                max_score,
                comments,
                created_at
            `)
            .eq("subject_id", subjectId)
            .order("created_at", {
                ascending: false
            });


        if (gradesError) {

            console.error(
                "Teacher grades query error:",
                gradesError
            );

            gradesContainer.innerHTML = `
                <div class="teacher-grades-empty">

                    <h3>Unable to load grades</h3>

                    <p>
                        ${gradesError.message}
                    </p>

                </div>
            `;

            statusElement.textContent =
                "There was a problem loading the grades.";

            return;
        }


        // ==========================================
        // NO GRADES
        // ==========================================

        if (!grades || grades.length === 0) {

            gradesContainer.innerHTML = `
                <div class="teacher-grades-empty">

                    <h3>No grades found</h3>

                    <p>
                        There are no grades recorded for this subject yet.
                    </p>

                </div>
            `;

            statusElement.textContent =
                "No grades recorded.";

            return;
        }


        // ==========================================
        // GET STUDENTS
        // ==========================================

        const studentIds = [
            ...new Set(
                grades.map(
                    grade => grade.student_id
                )
            )
        ];


        const {
            data: students,
            error: studentsError
        } = await supabaseClient
            .from("students")
            .select(`
                id,
                full_name,
                admission_number,
                class_name
            `)
            .in("id", studentIds);


        if (studentsError) {

            console.error(
                "Teacher students query error:",
                studentsError
            );

            gradesContainer.innerHTML = `
                <div class="teacher-grades-empty">

                    <h3>Unable to load student information</h3>

                    <p>
                        ${studentsError.message}
                    </p>

                </div>
            `;

            statusElement.textContent =
                "Unable to load student information.";

            return;
        }


        // ==========================================
        // CREATE STUDENT LOOKUP
        // ==========================================

        const studentMap = {};

        students.forEach(
            student => {

                studentMap[student.id] =
                    student;

            }
        );


// ==========================================
// DISPLAY GRADES BY ASSESSMENT
// ==========================================

gradesContainer.innerHTML = "";

        // ==========================================
// UPDATE PERFORMANCE SUMMARY
// ==========================================

const uniqueStudents = new Set(
    grades.map(grade => grade.student_id)
);

const percentages = grades
    .filter(
        grade =>
            Number(grade.max_score) > 0
    )
    .map(
        grade =>
            (
                Number(grade.score) /
                Number(grade.max_score)
            ) * 100
    );

const studentsGradedElement =
    document.getElementById(
        "teacherStudentsGraded"
    );

const classAverageElement =
    document.getElementById(
        "teacherClassAverage"
    );

const highestScoreElement =
    document.getElementById(
        "teacherHighestScore"
    );

const lowestScoreElement =
    document.getElementById(
        "teacherLowestScore"
    );


if (studentsGradedElement) {

    studentsGradedElement.textContent =
        uniqueStudents.size;

}


if (percentages.length > 0) {

    const average =
        percentages.reduce(
            (total, value) =>
                total + value,
            0
        ) / percentages.length;

    const highest =
        Math.max(...percentages);

    const lowest =
        Math.min(...percentages);


    if (classAverageElement) {

        classAverageElement.textContent =
            `${average.toFixed(1)}%`;

    }


    if (highestScoreElement) {

        highestScoreElement.textContent =
            `${highest.toFixed(1)}%`;

    }


    if (lowestScoreElement) {

        lowestScoreElement.textContent =
            `${lowest.toFixed(1)}%`;

    }

}



/* ==========================================
   ASSESSMENT GROUPS
========================================== */

const assessmentGroups = {};

/* ==========================================
   GROUP ALL GRADES
   Standard assessments get their own sections.
   Other assessment names are shown too.
========================================== */

grades.forEach(grade => {
    const originalName =
        (grade.assessment || "").trim();

    const assessment =
        originalName.toLowerCase();

    let sectionName =
        originalName || "Other Assessments";

    if (assessment.includes("opener")) {
        sectionName = "Opener";
    } else if (
        assessment.includes("midterm") ||
        assessment.includes("mid-term")
    ) {
        sectionName = "Midterm";
    } else if (
        assessment.includes("end term") ||
        assessment.includes("end-term") ||
        assessment.includes("endterm")
    ) {
        sectionName = "End Term";
    } else if (assessment.includes("internal")) {
        sectionName = "Internal Test";
    }

    if (!assessmentGroups[sectionName]) {
        assessmentGroups[sectionName] = [];
    }

    assessmentGroups[sectionName].push(grade);
});

/* Keep the standard sections visible. */
["Opener", "Midterm", "End Term", "Internal Test"]
    .forEach(sectionName => {
        if (!assessmentGroups[sectionName]) {
            assessmentGroups[sectionName] = [];
        }
    });
        
// ==========================================
// CREATE SECTIONS
// ==========================================

Object.entries(assessmentGroups).forEach(
    ([sectionName, sectionGrades]) => {

                // ==========================================
        // ASSESSMENT STATISTICS
        // ==========================================

        const sectionPercentages =
            sectionGrades
                .filter(
                    grade =>
                        Number(grade.max_score) > 0
                )
                .map(
                    grade =>
                        (
                            Number(grade.score) /
                            Number(grade.max_score)
                        ) * 100
                );

        const sectionAverage =
            sectionPercentages.length > 0
                ? sectionPercentages.reduce(
                    (total, value) =>
                        total + value,
                    0
                ) / sectionPercentages.length
                : 0;

        const sectionHighest =
            sectionPercentages.length > 0
                ? Math.max(...sectionPercentages)
                : 0;

        const section =
            document.createElement("section");

        section.className =
            "teacher-grade-section";


        section.innerHTML = `

            <div class="teacher-grade-section-header">

    <div>

        <span class="teacher-section-label">
            ASSESSMENT
        </span>

        <h2>
            ${sectionName}
        </h2>

    </div>

    <div class="teacher-assessment-stats">

        <span>
            ${sectionGrades.length} student${sectionGrades.length === 1 ? "" : "s"}
        </span>

        ${
            sectionGrades.length > 0
                ? `
                    <span>
                        Avg ${sectionAverage.toFixed(1)}%
                    </span>

                    <span>
                        Best ${sectionHighest.toFixed(1)}%
                    </span>
                `
                : ""
        }

    </div>

</div>
            <div class="teacher-grade-section-content">
            </div>

        `;


        const sectionContent =
            section.querySelector(
                ".teacher-grade-section-content"
            );


        // ==========================================
        // NO RECORDS
        // ==========================================

        if (sectionGrades.length === 0) {

            sectionContent.innerHTML = `

                <div class="teacher-grades-empty">

                    <p>
                        No ${sectionName.toLowerCase()} grades recorded.
                    </p>

                </div>

            `;

            gradesContainer.appendChild(section);

            return;
        }


        // ==========================================
        // ADD GRADES
        // ==========================================

        sectionGrades.forEach(grade => {

            const student =
                studentMap[grade.student_id];


            const studentName =
                student?.full_name ||
                "Unknown student";


            const admissionNumber =
                student?.admission_number ||
                "No admission number";


            const percentage =
                Number(grade.max_score) > 0
                    ? (
                        Number(grade.score) /
                        Number(grade.max_score)
                    ) * 100
                    : 0;

            let performanceLabel = "Needs Improvement";

if (percentage >= 80) {
    performanceLabel = "Excellent";
} else if (percentage >= 70) {
    performanceLabel = "Good";
} else if (percentage >= 50) {
    performanceLabel = "Average";
}

            const card =
                document.createElement("div");

            card.className =
                "teacher-grade-card";


            card.innerHTML = `

               <div class="teacher-grade-header">

    <div>
        <h3>${studentName}</h3>
        <p>${admissionNumber}</p>
    </div>

    <div class="teacher-grade-score-summary">

        <span class="teacher-grade-score-label">
            Performance
        </span>

        <strong class="teacher-grade-percentage">
    ${percentage.toFixed(1)}%
</strong>

<span class="teacher-grade-performance-label">
    ${performanceLabel}
</span>

    </div>

</div>

<div class="teacher-grade-progress">

    <div class="teacher-grade-progress-track">

        <div
            class="teacher-grade-progress-fill"
            style="width: ${Math.min(percentage, 100)}%;"
        ></div>

    </div>

    <span>
        ${Number(grade.score).toFixed(1)}
        /
        ${Number(grade.max_score).toFixed(1)}
    </span>

</div>

                <div class="teacher-grade-fields">

                    <div class="teacher-grade-field">

                        <label>
                            Assessment
                        </label>

                        <input
                            type="text"
                            class="teacher-grade-assessment"
                            value="${grade.assessment || ""}"
                        >

                    </div>


                    <div class="teacher-grade-field">

                        <label>
                            Score
                        </label>

                        <input
                            type="number"
                            class="teacher-grade-score"
                            value="${grade.score ?? ""}"
                            min="0"
                            step="0.01"
                        >

                    </div>


                    <div class="teacher-grade-field">

                        <label>
                            Maximum Score
                        </label>

                        <input
                            type="number"
                            class="teacher-grade-max-score"
                            value="${grade.max_score ?? ""}"
                            min="1"
                            step="0.01"
                        >

                    </div>

                </div>


                <div class="teacher-grade-field">

                    <label>
                        Teacher Comment
                    </label>

                    <textarea
                        class="teacher-grade-comments"
                        rows="3"
                        placeholder="Add a comment about this student's performance..."
                    >${grade.comments || ""}</textarea>

                </div>


                <div class="teacher-grade-actions">

                    <button
                        type="button"
                        class="teacher-grade-save"
                        data-grade-id="${grade.id}"
                    >
                        Save Changes
                    </button>

                    <span
                        class="teacher-grade-message"
                    ></span>

                </div>

            `;


            sectionContent.appendChild(card);


            const saveButton =
                card.querySelector(
                    ".teacher-grade-save"
                );


            saveButton.addEventListener(
                "click",
                function () {

                    saveTeacherGrade(
                        grade.id,
                        card
                    );

                }
            );

        });


               gradesContainer.appendChild(section);

    }
);


// ==========================================
// GRADES LOADED SUCCESSFULLY
// ==========================================

statusElement.textContent =
    `${grades.length} grade records loaded.`;

console.log(
    "TEACHER SUBJECT GRADES LOADED:",
    grades
);

    }

    catch (error) {

        console.error(
            "Teacher grades loading error:",
            error
        );

        gradesContainer.innerHTML = `
            <div class="teacher-grades-empty">

                <h3>Unable to load grades</h3>

                <p>
                    Something went wrong while loading the grades.
                </p>

            </div>
        `;

        statusElement.textContent =
            "Unable to load grades.";

    }

}

        
// ==========================================
// SAVE TEACHER GRADE
// ==========================================

async function saveTeacherGrade(
    gradeId,
    card
) {

    const assessmentInput =
        card.querySelector(
            ".teacher-grade-assessment"
        );

    const scoreInput =
        card.querySelector(
            ".teacher-grade-score"
        );

    const maxScoreInput =
        card.querySelector(
            ".teacher-grade-max-score"
        );

    const commentsInput =
        card.querySelector(
            ".teacher-grade-comments"
        );

    const saveButton =
        card.querySelector(
            ".teacher-grade-save"
        );

    const message =
        card.querySelector(
            ".teacher-grade-message"
        );


    const assessment =
        assessmentInput.value.trim();

    const score =
        Number(
            scoreInput.value
        );

    const maxScore =
        Number(
            maxScoreInput.value
        );

    const comments =
        commentsInput.value.trim();


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!assessment) {

        message.textContent =
            "Enter an assessment name.";

        return;
    }


    if (
        Number.isNaN(score) ||
        Number.isNaN(maxScore)
    ) {

        message.textContent =
            "Enter valid scores.";

        return;
    }


    if (
        score < 0 ||
        maxScore <= 0
    ) {

        message.textContent =
            "Scores must be valid numbers.";

        return;
    }


    if (
        score > maxScore
    ) {

        message.textContent =
            "Score cannot be greater than maximum score.";

        return;
    }


    saveButton.disabled =
        true;

    saveButton.textContent =
        "Saving...";

    message.textContent =
        "";


    try {

        const {
            error
        } =
            await supabaseClient
                .from("grades")
                .update({

                    assessment:
                        assessment,

                    score:
                        score,

                    max_score:
                        maxScore,

                    comments:
                        comments || null

                })
                .eq(
                    "id",
                    gradeId
                );


        if (error) {

            console.error(
                "Save grade error:",
                error
            );

            message.textContent =
                "Unable to save changes.";

            return;
        }


        message.textContent =
            "✓ Saved successfully.";


        console.log(
            "GRADE UPDATED:",
            gradeId
        );

    }

    catch (error) {

        console.error(
            "Grade update error:",
            error
        );

        message.textContent =
            "Something went wrong.";

    }

    finally {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "Save Changes";

    }

}


// ==========================================
// START TEACHER GRADES
// ==========================================

if (
    window.location.pathname.includes(
        "teacher-grades.html"
    )
) {

    loadTeacherGrades();

}

console.log(
    "TEACHER GRADES PAGE CHECK:",
    window.location.pathname
);

// ==========================================
// TEACHER CONDUCT
// ==========================================


// ==========================================
// SELECTED TEACHER CONDUCT STUDENT
// ==========================================

let selectedTeacherConductStudent = null;


// ==========================================
// LOAD TEACHER CONDUCT STUDENTS
// ==========================================

async function loadTeacherConductStudents() {

    console.log(
        "Loading teacher conduct students..."
    );

    const studentList =
        document.getElementById(
            "teacherConductStudentList"
        );

    if (!studentList) {
        return;
    }

    studentList.innerHTML = `
        <div class="teacher-conduct-loading">
            Loading students...
        </div>
    `;

    try {

        const {
            data: students,
            error
        } = await supabaseClient
            .from("students")
            .select(`
                id,
                full_name,
                admission_number,
                class_name
            `)
            .order(
                "full_name",
                {
                    ascending: true
                }
            );


        if (error) {
            throw error;
        }


        if (
            !students ||
            students.length === 0
        ) {

            studentList.innerHTML = `
                <div class="teacher-conduct-empty">

                    <div class="teacher-conduct-empty-icon">
                        👨‍🎓
                    </div>

                    <h3>
                        No students found
                    </h3>

                    <p>
                        There are currently no students
                        available.
                    </p>

                </div>
            `;

            return;
        }


        renderTeacherConductStudents(
            students
        );


        const searchInput =
            document.getElementById(
                "teacherConductSearch"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                function () {

                    const searchTerm =
                        this.value
                            .trim()
                            .toLowerCase();


                    const filteredStudents =
                        students.filter(
                            student => {

                                const name =
                                    (
                                        student.full_name ||
                                        ""
                                    ).toLowerCase();


                                const admission =
                                    (
                                        student.admission_number ||
                                        ""
                                    ).toLowerCase();


                                return (
                                    name.includes(
                                        searchTerm
                                    ) ||
                                    admission.includes(
                                        searchTerm
                                    )
                                );

                            }
                        );


                    renderTeacherConductStudents(
                        filteredStudents
                    );

                }
            );

        }


    } catch (error) {

        console.error(
            "Teacher conduct student loading error:",
            error
        );


        studentList.innerHTML = `
            <div class="teacher-conduct-empty">

                <div class="teacher-conduct-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load students
                </h3>

                <p>
                    Something went wrong while
                    loading the student list.
                </p>

            </div>
        `;

    }

}


// ==========================================
// RENDER TEACHER CONDUCT STUDENTS
// ==========================================

function renderTeacherConductStudents(
    students
) {

    const studentList =
        document.getElementById(
            "teacherConductStudentList"
        );


    if (!studentList) {
        return;
    }


    if (
        !students ||
        students.length === 0
    ) {

        studentList.innerHTML = `
            <div class="teacher-conduct-empty">

                <div class="teacher-conduct-empty-icon">
                    🔎
                </div>

                <h3>
                    No matching students
                </h3>

                <p>
                    Try another name or admission number.
                </p>

            </div>
        `;

        return;
    }


    studentList.innerHTML = "";


    students.forEach(student => {

        const card =
            document.createElement("div");


        card.className =
            "teacher-conduct-student-card";


        card.innerHTML = `

            <h3>
                ${student.full_name}
            </h3>

            <p>
                ${student.admission_number || "No admission number"}
                •
                ${student.class_name || "No class"}
            </p>

        `;


        card.addEventListener(
            "click",
            function () {

                loadTeacherStudentConduct(
                    student
                );

            }
        );


        studentList.appendChild(
            card
        );

    });

}


// ==========================================
// LOAD SELECTED STUDENT CONDUCT
// ==========================================

async function loadTeacherStudentConduct(
    student
) {

    selectedTeacherConductStudent =
        student;


    const panel =
        document.getElementById(
            "teacherConductStudentPanel"
        );


    const formSection =
        document.getElementById(
            "teacherConductFormSection"
        );


    const studentName =
        document.getElementById(
            "teacherConductStudentName"
        );


    const studentDetails =
        document.getElementById(
            "teacherConductStudentDetails"
        );


    const recordsContainer =
        document.getElementById(
            "teacherConductRecords"
        );


    if (
        !panel ||
        !recordsContainer
    ) {
        return;
    }


    panel.style.display =
        "block";


    if (formSection) {

        formSection.style.display =
            "none";

    }


    studentName.textContent =
        student.full_name ||
        "Unknown student";


    studentDetails.textContent =
        `${student.admission_number || "No admission number"} • ${student.class_name || "No class"}`;


    recordsContainer.innerHTML = `
        <div class="teacher-conduct-loading">
            Loading conduct records...
        </div>
    `;


    try {

        const {
            data: records,
            error
        } = await supabaseClient
            .from("conduct_records")
            .select(`
                id,
                student_id,
                type,
                title,
                description,
                points,
                created_at
            `)
            .eq(
                "student_id",
                student.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {
            throw error;
        }


        // ==========================================
        // TOTAL POINTS
        // ==========================================

        const totalPoints =
            (records || []).reduce(
                (
                    total,
                    record
                ) => {

                    const rawPoints =
                        Number(
                            record.points || 0
                        );


                    const recordType =
                        (
                            record.type ||
                            "neutral"
                        ).toLowerCase();


                    const points =
                        recordType === "negative"
                            ? -Math.abs(rawPoints)
                            : recordType === "positive"
                                ? Math.abs(rawPoints)
                                : rawPoints;


                    return total + points;

                },
                0
            );


        const pointsElement =
            document.getElementById(
                "teacherConductPoints"
            );


        if (pointsElement) {

            pointsElement.textContent =
                `${totalPoints} points`;

        }


        // ==========================================
        // NO RECORDS
        // ==========================================

        if (
            !records ||
            records.length === 0
        ) {

            recordsContainer.innerHTML = `
                <div class="teacher-conduct-empty">

                    <div class="teacher-conduct-empty-icon">
                        📋
                    </div>

                    <h3>
                        No conduct records
                    </h3>

                    <p>
                        This student does not have
                        any conduct records yet.
                    </p>

                </div>
            `;

            return;
        }


        recordsContainer.innerHTML =
            "";


        // ==========================================
        // DISPLAY RECORDS
        // ==========================================

        records.forEach(
            record => {

                const recordElement =
                    document.createElement(
                        "div"
                    );


                recordElement.className =
                    "teacher-conduct-record";


                const recordType =
                    (
                        record.type ||
                        "neutral"
                    ).toLowerCase();


                const rawPoints =
                    Number(
                        record.points || 0
                    );


                const points =
                    recordType === "negative"
                        ? -Math.abs(rawPoints)
                        : recordType === "positive"
                            ? Math.abs(rawPoints)
                            : rawPoints;


                const pointsText =
                    points > 0
                        ? `+${points}`
                        : `${points}`;


                recordElement.innerHTML = `

                    <div class="teacher-conduct-record-header">

                        <div>

                            <h4>
                                ${record.title || "Untitled record"}
                            </h4>

                            <span
                                class="teacher-conduct-record-type ${recordType}"
                            >
                                ${recordType}
                            </span>

                        </div>

                        <strong class="teacher-conduct-record-points">
                            ${pointsText} points
                        </strong>

                    </div>


                    ${
                        record.description
                            ? `
                                <p class="teacher-conduct-record-description">
                                    ${record.description}
                                </p>
                            `
                            : ""
                    }


                    <div class="teacher-conduct-record-actions">

                        <button
                            type="button"
                            class="teacher-conduct-delete-button"
                            onclick="deleteTeacherConductRecord('${record.id}')"
                        >
                            Delete
                        </button>

                    </div>

                `;


                recordsContainer.appendChild(
                    recordElement
                );

            }
        );


    } catch (error) {

        console.error(
            "Teacher conduct loading error:",
            error
        );


        recordsContainer.innerHTML = `
            <div class="teacher-conduct-empty">

                <div class="teacher-conduct-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load conduct
                </h3>

                <p>
                    Something went wrong while
                    loading the conduct records.
                </p>

            </div>
        `;

    }

}


// ==========================================
// DELETE TEACHER CONDUCT RECORD
// ==========================================

async function deleteTeacherConductRecord(
    recordId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this conduct record?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("conduct_records")
            .delete()
            .eq(
                "id",
                recordId
            );


        if (error) {
            throw error;
        }


        console.log(
            "Conduct record deleted successfully."
        );


        if (
            selectedTeacherConductStudent
        ) {

            await loadTeacherStudentConduct(
                selectedTeacherConductStudent
            );

        }


    } catch (error) {

        console.error(
            "Delete conduct record error:",
            error
        );


        alert(
            "Unable to delete conduct record."
        );

    }

}


// ==========================================
// OPEN TEACHER CONDUCT FORM
// ==========================================

function openTeacherConductForm() {

    const formSection =
        document.getElementById(
            "teacherConductFormSection"
        );


    const formTitle =
        document.getElementById(
            "teacherConductFormTitle"
        );


    const recordId =
        document.getElementById(
            "teacherConductRecordId"
        );


    const type =
        document.getElementById(
            "teacherConductType"
        );


    const title =
        document.getElementById(
            "teacherConductTitle"
        );


    const description =
        document.getElementById(
            "teacherConductDescription"
        );


    const points =
        document.getElementById(
            "teacherConductPointsInput"
        );


    const message =
        document.getElementById(
            "teacherConductFormMessage"
        );


    if (!formSection) {
        return;
    }


    formSection.style.display =
        "block";


    formTitle.textContent =
        "Add Conduct Record";


    recordId.value =
        "";


    type.value =
        "";


    title.value =
        "";


    description.value =
        "";


    points.value =
        "";


    message.textContent =
        "";


    formSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// ADD CONDUCT BUTTON
// ==========================================

const teacherAddConductButton =
    document.getElementById(
        "teacherAddConductButton"
    );


if (teacherAddConductButton) {

    teacherAddConductButton.addEventListener(
        "click",
        function () {

            openTeacherConductForm();

        }
    );

}


// ==========================================
// SAVE TEACHER CONDUCT RECORD
// ==========================================

async function saveTeacherConductRecord() {

    const recordId =
        document.getElementById(
            "teacherConductRecordId"
        ).value.trim();


    const type =
        document.getElementById(
            "teacherConductType"
        ).value;


    const title =
        document.getElementById(
            "teacherConductTitle"
        ).value.trim();


    const description =
        document.getElementById(
            "teacherConductDescription"
        ).value.trim();


    const pointsValue =
        document.getElementById(
            "teacherConductPointsInput"
        ).value;


    const message =
        document.getElementById(
            "teacherConductFormMessage"
        );


    if (
        !type ||
        !title
    ) {

        message.textContent =
            "Please select a type and enter a title.";

        message.style.color =
            "#b91c1c";

        return;

    }


    if (
        !selectedTeacherConductStudent
    ) {

        message.textContent =
            "Please select a student first.";

        message.style.color =
            "#b91c1c";

        return;

    }


    const points =
        Number(
            pointsValue || 0
        );


    message.textContent =
        "Saving...";


    message.style.color =
        "#64748b";


    try {

        const recordData = {

            student_id:
                selectedTeacherConductStudent.id,

            type:
                type,

            title:
                title,

            description:
                description,

            points:
                points

        };


        let result;


        if (recordId) {

            result =
                await supabaseClient
                    .from("conduct_records")
                    .update(
                        recordData
                    )
                    .eq(
                        "id",
                        recordId
                    );

        } else {

            result =
                await supabaseClient
                    .from("conduct_records")
                    .insert(
                        recordData
                    );

        }


        if (result.error) {

            throw result.error;

        }


        message.textContent =
            recordId
                ? "Conduct record updated successfully."
                : "Conduct record added successfully.";


        message.style.color =
            "#15803d";


        await loadTeacherStudentConduct(
            selectedTeacherConductStudent
        );


        document.getElementById(
            "teacherConductFormSection"
        ).style.display =
            "none";


    } catch (error) {

        console.error(
            "Saving conduct record error:",
            error
        );


        message.textContent =
            "Unable to save conduct record.";

        message.style.color =
            "#b91c1c";

    }

}


// ==========================================
// TEACHER CONDUCT FORM SUBMIT
// ==========================================

const teacherConductForm =
    document.getElementById(
        "teacherConductForm"
    );


if (teacherConductForm) {

    teacherConductForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await saveTeacherConductRecord();

        }
    );

}


// ==========================================
// TEACHER CONDUCT PAGE ROUTE
// ==========================================

if (
    window.location.pathname.includes(
        "teacher-conduct.html"
    )
) {

    console.log(
        "Teacher Conduct page detected."
    );

    loadTeacherConductStudents();

}

// ==========================================
// TEACHER ASSIGNMENTS
// ==========================================

let teacherAssignmentSubjects = [];


// LOAD TEACHER SUBJECTS
async function loadTeacherAssignmentSubjects() {

    console.log("Loading teacher assignment subjects...");

    try {

        const {
            data: {
                user
            },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError) {
            throw userError;
        }

        if (!user) {
            console.error("No authenticated teacher found.");
            return;
        }


        // GET SUBJECTS ASSIGNED TO THIS TEACHER
        const {
            data,
            error
        } = await supabaseClient
            .from("teacher_subjects")
            .select(`
                subject_id,
                subjects (
                    id,
                    name,
                    code
                )
            `)
            .eq("teacher_id", user.id);

        if (error) {
            throw error;
        }


        teacherAssignmentSubjects =
            (data || [])
                .map(function (item) {
                    return item.subjects;
                })
                .filter(Boolean);


        const subjectSelect =
            document.getElementById(
                "teacherAssignmentSubject"
            );


        if (!subjectSelect) {
            return;
        }


        subjectSelect.innerHTML =
            `<option value="">
                Select subject
            </option>`;


        teacherAssignmentSubjects.forEach(
            function (subject) {

                const option =
                    document.createElement("option");

                option.value = subject.id;

                option.textContent =
                    subject.name +
                    (
                        subject.code
                            ? " (" +
                              subject.code +
                              ")"
                            : ""
                    );

                subjectSelect.appendChild(option);

            }
        );


        console.log(
            "Teacher assignment subjects loaded:",
            teacherAssignmentSubjects
        );

    } catch (error) {

        console.error(
            "Error loading teacher assignment subjects:",
            error
        );

    }

}


// TEACHER ASSIGNMENTS PAGE
if (
    window.location.pathname.includes(
        "teacher-assignments.html"
    )
) {

    loadTeacherAssignmentSubjects();

}

// ==========================================
// CREATE TEACHER ASSIGNMENT
// ==========================================

async function createTeacherAssignment() {

    console.log(
        "Saving teacher assignment..."
    );


    const form =
        document.getElementById(
            "teacherAssignmentForm"
        );


    const subjectId =
        document.getElementById(
            "teacherAssignmentSubject"
        ).value;

    const className =
        document.getElementById(
            "teacherAssignmentClass"
        ).value.trim();

    const title =
        document.getElementById(
            "teacherAssignmentTitle"
        ).value.trim();

    const description =
        document.getElementById(
            "teacherAssignmentDescription"
        ).value.trim();

    const dueDate =
        document.getElementById(
            "teacherAssignmentDueDate"
        ).value;

    const message =
        document.getElementById(
            "teacherAssignmentFormMessage"
        );


    if (
        !subjectId ||
        !className ||
        !title ||
        !dueDate
    ) {

        message.textContent =
            "Please complete all required fields.";

        return;
    }


    const assignmentData = {

        subject_id: subjectId,

        class_name: className,

        title: title,

        description: description,

        due_date: dueDate

    };


    try {

        const editingId =
            form.dataset.editingId;


        // ======================================
        // UPDATE
        // ======================================

        if (editingId) {

            const {
                error
            } = await supabaseClient
                .from("assignments")
                .update(
                    assignmentData
                )
                .eq(
                    "id",
                    editingId
                );


            if (error) {
                throw error;
            }


            message.textContent =
                "Assignment updated successfully.";

        }


        // ======================================
        // CREATE
        // ======================================

        else {

            const {
                error
            } = await supabaseClient
                .from("assignments")
                .insert([
                    assignmentData
                ]);


            if (error) {
                throw error;
            }


            message.textContent =
                "Assignment created successfully.";

        }


        form.reset();

        delete form.dataset.editingId;


        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );

        submitButton.textContent =
            "Create Assignment";

        const cancelButton =
    document.getElementById(
        "teacherAssignmentCancelButton"
    );

if (cancelButton) {

    cancelButton.style.display =
        "none";

}

        await loadTeacherAssignments();


    } catch (error) {

        console.error(
            "Save assignment error:",
            error
        );

        message.textContent =
            "Unable to save assignment. Check the console.";

    }

}


// ==========================================
// TEACHER ASSIGNMENT FORM
// ==========================================

const teacherAssignmentForm =
    document.getElementById(
        "teacherAssignmentForm"
    );


if (teacherAssignmentForm) {

    teacherAssignmentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await createTeacherAssignment();

        }
    );

}

// ==========================================
// LOAD TEACHER ASSIGNMENTS
// ==========================================

async function loadTeacherAssignments() {

    console.log("Loading teacher assignments...");

    const container =
        document.getElementById(
            "teacherAssignmentsContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        `<div class="teacher-loading">
            Loading assignments...
        </div>`;

    try {

        const {
            data: {
                user
            },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError) {
            throw userError;
        }

        if (!user) {
            throw new Error(
                "No authenticated teacher found."
            );
        }


        // ======================================
        // GET TEACHER'S SUBJECTS
        // ======================================

        const {
            data: teacherSubjects,
            error: subjectError
        } = await supabaseClient
            .from("teacher_subjects")
            .select(`
                subject_id,
                subjects (
                    id,
                    name,
                    code
                )
            `)
            .eq(
                "teacher_id",
                user.id
            );

        if (subjectError) {
            throw subjectError;
        }


        const subjectIds =
            (teacherSubjects || []).map(
                function (item) {
                    return item.subject_id;
                }
            );


        if (subjectIds.length === 0) {

            container.innerHTML =
                `<div class="teacher-empty">
                    You are not assigned to any subjects yet.
                </div>`;

            return;
        }


        // ======================================
        // GET ASSIGNMENTS
        // ======================================

        const {
            data: assignments,
            error: assignmentError
        } = await supabaseClient
            .from("assignments")
            .select(`
                id,
                subject_id,
                class_name,
                title,
                description,
                due_date,
                created_at,
                subjects (
                    id,
                    name,
                    code
                )
            `)
            .in(
                "subject_id",
                subjectIds
            )
            .order(
                "due_date",
                {
                    ascending: true
                }
            );


        if (assignmentError) {
            throw assignmentError;
        }


        if (
            !assignments ||
            assignments.length === 0
        ) {

            container.innerHTML =
                `<div class="teacher-empty">
                    No assignments have been created yet.
                </div>`;

            return;
        }


        container.innerHTML = "";


        // ======================================
        // DISPLAY ASSIGNMENTS
        // ======================================

        assignments.forEach(
            function (assignment) {

                const card =
                    document.createElement("div");

                card.className =
                    "teacher-assignment-card";


                const subject =
                    assignment.subjects;


                const formattedDate =
                    assignment.due_date
                        ? new Date(
                              assignment.due_date
                          ).toLocaleDateString(
                              "en-GB",
                              {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                              }
                          )
                        : "No due date";


                card.innerHTML = `

                    <div class="teacher-assignment-card-top">

                        <div>

                            <span class="teacher-assignment-subject">
                                ${
                                    subject
                                        ? subject.name
                                        : "Unknown Subject"
                                }
                            </span>

                            <h3>
                                ${assignment.title}
                            </h3>

                        </div>

                    </div>


                    <div class="teacher-assignment-details">

                        <p>
                            <strong>Class:</strong>
                            ${assignment.class_name}
                        </p>

                        <p>
                            <strong>Due:</strong>
                            ${formattedDate}
                        </p>

                    </div>


                    ${
                        assignment.description
                            ? `
                                <p class="teacher-assignment-description">
                                    ${assignment.description}
                                </p>
                            `
                            : ""
                    }


                    <div class="teacher-assignment-actions">

                        <button
                            type="button"
                            class="teacher-assignment-edit-button"
                            onclick="editTeacherAssignment('${assignment.id}')"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="teacher-assignment-delete-button"
                            onclick="deleteTeacherAssignment('${assignment.id}')"
                        >
                            Delete
                        </button>

                    </div>

                `;


                container.appendChild(card);

            }
        );


        console.log(
            "Teacher assignments loaded:",
            assignments
        );


    } catch (error) {

        console.error(
            "Load teacher assignments error:",
            error
        );

        container.innerHTML =
            `<div class="teacher-error">
                Unable to load assignments.
            </div>`;

    }

}


// ==========================================
// LOAD ASSIGNMENTS ON PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "teacher-assignments.html"
    )
) {

    loadTeacherAssignments();

}


// ==========================================
// EDIT TEACHER ASSIGNMENT
// ==========================================

async function editTeacherAssignment(
    assignmentId
) {

    const assignment =
        await getTeacherAssignmentById(
            assignmentId
        );


    if (!assignment) {
        return;
    }


    document.getElementById(
        "teacherAssignmentSubject"
    ).value =
        assignment.subject_id;


    document.getElementById(
        "teacherAssignmentClass"
    ).value =
        assignment.class_name;


    document.getElementById(
        "teacherAssignmentTitle"
    ).value =
        assignment.title;


    document.getElementById(
        "teacherAssignmentDescription"
    ).value =
        assignment.description || "";


    document.getElementById(
        "teacherAssignmentDueDate"
    ).value =
        assignment.due_date;


    const form =
        document.getElementById(
            "teacherAssignmentForm"
        );


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    submitButton.textContent =
        "Save Changes";


    form.dataset.editingId =
        assignmentId;


    const cancelButton =
        document.getElementById(
            "teacherAssignmentCancelButton"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "block";

    }


    form.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// GET ASSIGNMENT
// ==========================================

async function getTeacherAssignmentById(
    assignmentId
) {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("assignments")
            .select(`
                id,
                subject_id,
                class_name,
                title,
                description,
                due_date
            `)
            .eq(
                "id",
                assignmentId
            )
            .single();


        if (error) {
            throw error;
        }


        return data;


    } catch (error) {

        console.error(
            "Get assignment error:",
            error
        );

        return null;

    }

}


// ==========================================
// DELETE TEACHER ASSIGNMENT
// ==========================================

async function deleteTeacherAssignment(
    assignmentId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this assignment?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("assignments")
            .delete()
            .eq(
                "id",
                assignmentId
            );


        if (error) {
            throw error;
        }


        console.log(
            "Assignment deleted successfully."
        );


        await loadTeacherAssignments();


    } catch (error) {

        console.error(
            "Delete assignment error:",
            error
        );

        alert(
            "Unable to delete assignment."
        );

    }

}


// ==========================================
// CANCEL TEACHER ASSIGNMENT EDIT
// ==========================================

const teacherAssignmentCancelButton =
    document.getElementById(
        "teacherAssignmentCancelButton"
    );


if (teacherAssignmentCancelButton) {

    teacherAssignmentCancelButton.addEventListener(
        "click",
        function () {

            const form =
                document.getElementById(
                    "teacherAssignmentForm"
                );


            if (!form) {
                return;
            }


            form.reset();


            delete form.dataset.editingId;


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.textContent =
                    "Create Assignment";

            }


            teacherAssignmentCancelButton.style.display =
                "none";


            const message =
                document.getElementById(
                    "teacherAssignmentFormMessage"
                );


            if (message) {

                message.textContent =
                    "";

            }

        }
    );

}

// ==========================================
// TEACHER ANNOUNCEMENTS
// ==========================================

async function createTeacherAnnouncement() {

    console.log("Saving teacher announcement...");

    const title =
        document.getElementById("teacherAnnouncementTitle")
            .value.trim();

    const targetClass =
        document.getElementById("teacherAnnouncementClass")
            .value.trim();

    const targetRole =
        document.getElementById("teacherAnnouncementPortal")
            .value;

    const message =
        document.getElementById("teacherAnnouncementMessage")
            .value.trim();

    const form =
        document.getElementById("teacherAnnouncementForm");

    const formMessage =
        document.getElementById(
            "teacherAnnouncementFormMessage"
        );

    if (!title || !targetClass || !targetRole || !message) {

        formMessage.textContent =
            "Please complete all fields.";

        return;
    }

    const editingId =
        form.dataset.editingId;

    try {

        let result;

        // ==========================================
        // UPDATE EXISTING ANNOUNCEMENT
        // ==========================================

        if (editingId) {

            result = await supabaseClient
                .from("announcements")
                .update({
                    title: title,
                    message: message,
                    target_role: targetRole,
                    target_class: targetClass
                })
                .eq("id", editingId)
                .select()
                .single();

        }

        // ==========================================
        // CREATE NEW ANNOUNCEMENT
        // ==========================================

        else {

            result = await supabaseClient
                .from("announcements")
                .insert([{
                    title: title,
                    message: message,
                    target_role: targetRole,
                    target_class: targetClass
                }])
                .select()
                .single();

        }

        if (result.error) {
            throw result.error;
        }

        console.log(
            editingId
                ? "Teacher announcement updated:"
                : "Teacher announcement created:",
            result.data
        );

        formMessage.textContent =
            editingId
                ? "Announcement updated successfully."
                : "Announcement published successfully.";

        // Reset form
        form.reset();

        // Remove editing mode
        delete form.dataset.editingId;

        // Restore button
        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );

        if (submitButton) {

            submitButton.textContent =
                "Publish Announcement";

        }

        // Hide cancel button
        const cancelButton =
            document.getElementById(
                "teacherAnnouncementCancelButton"
            );

        if (cancelButton) {

            cancelButton.style.display =
                "none";

        }

        // Reload announcements
        await loadTeacherAnnouncements();

    } catch (error) {

        console.error(
            "Save teacher announcement error:",
            error
        );

        formMessage.textContent =
            "Unable to save announcement.";

    }

}
// ==========================================
// TEACHER ANNOUNCEMENT FORM
// ==========================================

const teacherAnnouncementForm =
    document.getElementById(
        "teacherAnnouncementForm"
    );

if (teacherAnnouncementForm) {

    teacherAnnouncementForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await createTeacherAnnouncement();

        }
    );

}

const teacherAnnouncementCancelButton =
    document.getElementById(
        "teacherAnnouncementCancelButton"
    );

if (teacherAnnouncementCancelButton) {

    teacherAnnouncementCancelButton.addEventListener(
        "click",
        function () {

            const form =
                document.getElementById(
                    "teacherAnnouncementForm"
                );

            if (!form) return;

            // Reset form
            form.reset();

            // Exit editing mode
            delete form.dataset.editingId;

            // Restore publish button
            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );

            if (submitButton) {

                submitButton.textContent =
                    "Publish Announcement";

            }

            // Hide cancel button
            teacherAnnouncementCancelButton.style.display =
                "none";

            // Clear message
            const message =
                document.getElementById(
                    "teacherAnnouncementFormMessage"
                );

            if (message) {

                message.textContent = "";

            }

            console.log(
                "Teacher announcement edit cancelled."
            );

        }
    );

}

// ==========================================
// LOAD TEACHER ANNOUNCEMENTS
// ==========================================

async function loadTeacherAnnouncements() {

    console.log("Loading teacher announcements...");

    const container =
        document.getElementById(
            "teacherAnnouncementsContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        `<div class="teacher-loading">
            Loading announcements...
        </div>`;

    try {

        const {
            data: announcements,
            error
        } = await supabaseClient
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
            );


        if (error) {
            throw error;
        }


        if (
            !announcements ||
            announcements.length === 0
        ) {

            container.innerHTML =
                `<div class="teacher-empty">
                    No announcements have been published yet.
                </div>`;

            return;
        }


        container.innerHTML = "";


        announcements.forEach(
            function (announcement) {

                const card =
                    document.createElement("div");

                card.className =
                    "teacher-announcement-card";


                const formattedDate =
                    new Date(
                        announcement.created_at
                    ).toLocaleDateString(
                        "en-GB",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    );


                let targetText =
                    "All Portals";


                if (
                    announcement.target_role ===
                    "student"
                ) {

                    targetText =
                        "Students";

                } else if (
                    announcement.target_role ===
                    "parent"
                ) {

                    targetText =
                        "Parents";

                }


               card.innerHTML = `

    <div class="teacher-announcement-card-top">

        <div>

            <span class="teacher-announcement-target">
                ${targetText}
            </span>

            <h3>
                ${announcement.title}
            </h3>

        </div>

    </div>


    <div class="teacher-announcement-details">

        <p>
            <strong>Class:</strong>
            ${announcement.target_class}
        </p>

        <p>
            <strong>Published:</strong>
            ${formattedDate}
        </p>

    </div>


    <p class="teacher-announcement-message">
        ${announcement.message}
    </p>


    <div class="teacher-announcement-actions">

        <button
            type="button"
            class="teacher-announcement-edit-button"
            onclick="editTeacherAnnouncement('${announcement.id}')"
        >
            Edit
        </button>


        <button
            type="button"
            class="teacher-announcement-delete-button"
            onclick="deleteTeacherAnnouncement('${announcement.id}')"
        >
            Delete
        </button>

    </div>

`;


                container.appendChild(card);

            }
        );


        console.log(
            "Teacher announcements loaded:",
            announcements
        );


    } catch (error) {

        console.error(
            "Load teacher announcements error:",
            error
        );

        container.innerHTML =
            `<div class="teacher-error">
                Unable to load announcements.
            </div>`;

    }

}

// ==========================================
// LOAD ANNOUNCEMENTS ON PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "teacher-announcements.html"
    )
) {

    loadTeacherAnnouncements();

}

// ==========================================
// EDIT TEACHER ANNOUNCEMENT
// ==========================================

async function editTeacherAnnouncement(announcementId) {

    console.log(
        "Editing teacher announcement:",
        announcementId
    );

    try {

        const {
            data: announcement,
            error
        } = await supabaseClient
            .from("announcements")
            .select(`
                id,
                title,
                message,
                target_role,
                target_class
            `)
            .eq("id", announcementId)
            .single();


        if (error) {
            throw error;
        }


        document.getElementById(
            "teacherAnnouncementTitle"
        ).value = announcement.title || "";


        document.getElementById(
            "teacherAnnouncementClass"
        ).value = announcement.target_class || "";


        document.getElementById(
            "teacherAnnouncementPortal"
        ).value = announcement.target_role || "";


        document.getElementById(
            "teacherAnnouncementMessage"
        ).value = announcement.message || "";


        const form =
            document.getElementById(
                "teacherAnnouncementForm"
            );


        if (!form) {
            return;
        }


        form.dataset.editingId =
            announcementId;


        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.textContent =
                "Save Changes";

        }


        const cancelButton =
            document.getElementById(
                "teacherAnnouncementCancelButton"
            );


        if (cancelButton) {

            cancelButton.style.display =
                "block";

        }


        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        console.error(
            "Edit announcement error:",
            error
        );

        alert(
            "Unable to load announcement for editing."
        );

    }

}

// ==========================================
// DELETE TEACHER ANNOUNCEMENT
// ==========================================

async function deleteTeacherAnnouncement(announcementId) {

    console.log(
        "Deleting teacher announcement:",
        announcementId
    );

    const confirmed =
        confirm(
            "Are you sure you want to delete this announcement?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const {
            error
        } = await supabaseClient
            .from("announcements")
            .delete()
            .eq("id", announcementId);

        if (error) {
            throw error;
        }

        console.log(
            "Teacher announcement deleted successfully."
        );

        await loadTeacherAnnouncements();

    } catch (error) {

        console.error(
            "Delete announcement error:",
            error
        );

        alert(
            "Unable to delete announcement."
        );

    }

}


async function loadTeacherTimetable() {

    console.log("Loading teacher timetable...");

    const subjectSelect =
        document.getElementById("subjectSelect");

    const timetableContainer =
        document.getElementById("teacherTimetableContainer");

    const timetableDescription =
        document.getElementById("timetableDescription");

    const teacherNameElement =
        document.getElementById("teacherName");

    const todayElement =
        document.getElementById("teacherToday");

    if (!subjectSelect || !timetableContainer) {
        console.log("Teacher timetable elements not found.");
        return;
    }

    // Safely display database text inside HTML.
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // Format database time.
    function formatTeacherTime(time) {
        if (!time) return "Not specified";

        const [hourPart, minutePart] = time.split(":");
        let hours = parseInt(hourPart, 10);

        const period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;

        return `${hours}:${minutePart} ${period}`;
    }

    // Give each subject a consistent colour.
    function getSubjectColour(subjectId) {
        const colours = [
            ["#2563eb", "#eff6ff"],
            ["#7c3aed", "#f5f3ff"],
            ["#059669", "#ecfdf5"],
            ["#ea580c", "#fff7ed"],
            ["#db2777", "#fdf2f8"],
            ["#0891b2", "#ecfeff"],
            ["#ca8a04", "#fefce8"],
            ["#4f46e5", "#eef2ff"]
        ];

        let hash = 0;

        String(subjectId || "subject").split("").forEach(char => {
            hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
        });

        return colours[hash % colours.length];
    }

    try {

        // GET LOGGED-IN USER
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError) throw userError;

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        // GET TEACHER PROFILE
        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select("full_name, email, role")
            .eq("id", user.id)
            .single();

        if (profileError) throw profileError;

        if (profile.role !== "teacher") {
            console.error("This account is not a teacher.");
            return;
        }

        if (teacherNameElement) {
            teacherNameElement.textContent =
                profile.full_name || "Teacher";
        }

        // TODAY'S DATE
        const today = new Date().toLocaleDateString(
            "en-US",
            { weekday: "long" }
        );

        if (todayElement) {
            todayElement.textContent =
                `${today} · ${new Date().toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "long", year: "numeric" }
                )}`;
        }

        // GET ONLY THIS TEACHER'S LESSONS
        const {
            data: timetable,
            error: timetableError
        } = await supabaseClient
            .from("timetable")
            .select(`
                id,
                class_name,
                subject_id,
                teacher_id,
                teacher_name,
                room,
                day_of_week,
                start_time,
                end_time,
                subjects (
                    id,
                    name,
                    code
                )
            `)
            .eq("teacher_id", user.id)
            .order("start_time", { ascending: true });

        if (timetableError) throw timetableError;

        console.log("Teacher timetable:", timetable);

        // HANDLE EMPTY TIMETABLE
        if (!timetable || timetable.length === 0) {

            subjectSelect.innerHTML =
                `<option value="">No subjects found</option>`;

            timetableContainer.innerHTML = `
                <div class="teacher-timetable-empty">
                    <h3>No lessons scheduled yet</h3>
                    <p>Your timetable will appear here once the
                    administrator adds your lessons.</p>
                </div>
            `;

            return;
        }

        // GET UNIQUE SUBJECTS
        const subjects = [];

        timetable.forEach(entry => {

            if (
                entry.subjects &&
                !subjects.some(subject =>
                    subject.id === entry.subjects.id
                )
            ) {
                subjects.push(entry.subjects);
            }

        });

        // FILL SUBJECT DROPDOWN
        subjectSelect.innerHTML =
            `<option value="">All subjects</option>`;

        subjects
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(subject => {

                const option = document.createElement("option");

                option.value = subject.id;

                option.textContent = subject.code
                    ? `${subject.name} (${subject.code})`
                    : subject.name;

                subjectSelect.appendChild(option);

            });

        // DISPLAY TIMETABLE
        function showTeacherTimetable(entries) {

            if (!entries || entries.length === 0) {

                timetableContainer.innerHTML = `
                    <div class="teacher-timetable-empty">
                        <h3>No lessons found</h3>
                        <p>There are no lessons for this selection.</p>
                    </div>
                `;

                return;
            }

            const days = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ];

            let html = "";

            days.forEach(day => {

                const dayEntries = entries
                    .filter(entry => entry.day_of_week === day)
                    .sort((a, b) =>
                        a.start_time.localeCompare(b.start_time)
                    );

                if (dayEntries.length === 0) return;

                html += `
                    <section class="teacher-timetable-day">

                        <div class="teacher-timetable-day-header
                            ${day === today ? "today" : ""}">

                            <div>
                                <h3>${day}</h3>
                                ${day === today
                                    ? `<span class="timetable-today-tag">
                                        TODAY
                                       </span>`
                                    : ""}
                            </div>

                            <span>
                                ${dayEntries.length}
                                ${dayEntries.length === 1
                                    ? "lesson"
                                    : "lessons"}
                            </span>

                        </div>

                        <div class="teacher-timetable-day-lessons">
                `;

                dayEntries.forEach(entry => {

                    const subjectName =
                        entry.subjects?.name || "Subject";

                    const className =
                        entry.class_name || "Class not specified";

                    const room =
                        entry.room || "Room not specified";

                    const [accent, tint] =
                        getSubjectColour(entry.subject_id);

                    const startTime =
                        formatTeacherTime(entry.start_time);

                    const endTime =
                        formatTeacherTime(entry.end_time);

                    html += `
                        <article class="teacher-timetable-entry
                            ${day === today ? "today-lesson" : ""}"
                            style="--lesson-accent:${accent};
                                   --lesson-tint:${tint}">

                            <div class="teacher-timetable-time">
                                <strong>${escapeHTML(startTime)}</strong>
                                <span>to</span>
                                <strong>${escapeHTML(endTime)}</strong>
                            </div>

                            <div class="teacher-timetable-details">

                                <span class="teacher-lesson-label">
                                    ${escapeHTML(className)}
                                </span>

                                <h4>${escapeHTML(subjectName)}</h4>

                                <p>
                                    <span>📍</span>
                                    ${escapeHTML(room)}
                                </p>

                            </div>

                            <div class="teacher-lesson-accent"></div>

                        </article>
                    `;

                });

                html += `
                        </div>
                    </section>
                `;

            });

            timetableContainer.innerHTML = html;
        }

        // SHOW ALL LESSONS INITIALLY
        showTeacherTimetable(timetable);

        if (timetableDescription) {
            timetableDescription.textContent =
                "View your weekly teaching schedule.";
        }

        // SUBJECT FILTER — ONE LISTENER ONLY
        subjectSelect.addEventListener("change", function () {

            const selectedSubject = this.value;

            if (!selectedSubject) {

                showTeacherTimetable(timetable);

                if (timetableDescription) {
                    timetableDescription.textContent =
                        "View your weekly teaching schedule.";
                }

                return;
            }

            const filteredEntries = timetable.filter(entry =>
                String(entry.subject_id) === String(selectedSubject)
            );

            showTeacherTimetable(filteredEntries);

            const selectedSubjectData = subjects.find(subject =>
                String(subject.id) === String(selectedSubject)
            );

            if (timetableDescription && selectedSubjectData) {
                timetableDescription.textContent =
                    `${selectedSubjectData.name} teaching schedule`;
            }

        });

    } catch (error) {

        console.error("Teacher timetable error:", error);

        timetableContainer.innerHTML = `
            <div class="teacher-timetable-empty">
                <h3>Unable to load timetable</h3>
                <p>Please refresh the page and try again.</p>
            </div>
        `;

    }

}

// ==========================================
// TEACHER TIMETABLE PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "teacher-timetable.html"
    )
) {

    loadTeacherTimetable();

}

// ==========================================
// TEACHER ON DUTY - RECURRING WEEKLY SYSTEM
// ==========================================

async function loadTeacherDuty() {

    console.log("Loading weekly teacher duty...");

    const teacherDutyContainer =
        document.getElementById("teacherDutyContainer");

    const teacherDutySchedule =
        document.getElementById("teacherDutySchedule");

    const teacherTodayDuty =
        document.getElementById("teacherTodayDuty");

    // ==========================================
    // GET CURRENT WEEKDAY
    // ==========================================

    const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const today = weekdays[new Date().getDay()];

    console.log("Today's duty day:", today);

    try {

        // ==========================================
        // GET TODAY'S DUTY
        // ==========================================

        const {
            data: todayData,
            error: todayError
        } = await supabaseClient
            .from("teacher_duty")
            .select(`
                id,
                teacher_name,
                duty_day,
                duty_area,
                start_time,
                end_time
            `)
            .eq("duty_day", today)
            .order("start_time", {
                ascending: true
            });

        if (todayError) throw todayError;

        console.log("Today's teacher duty:", todayData);

        // ==========================================
        // GET COMPLETE WEEKLY SCHEDULE
        // ==========================================

        const {
            data: scheduleData,
            error: scheduleError
        } = await supabaseClient
            .from("teacher_duty")
            .select(`
                id,
                teacher_name,
                duty_day,
                duty_area,
                start_time,
                end_time
            `)
            .not("duty_day", "is", null);

        if (scheduleError) throw scheduleError;

        console.log("Weekly duty schedule:", scheduleData);

        // ==========================================
        // FORMAT TIME
        // ==========================================

        function formatDutyTime(time) {

            if (!time) return "Not specified";

            const [hourPart, minutePart] = time.split(":");

            let hours = parseInt(hourPart, 10);

            const minutes = minutePart;

            const period = hours >= 12 ? "PM" : "AM";

            hours = hours % 12 || 12;

            return `${hours}:${minutes} ${period}`;
        }

        // ==========================================
        // TODAY'S DUTY
        // ==========================================

        if (!todayData || todayData.length === 0) {

            if (teacherDutyContainer) {
                teacherDutyContainer.innerHTML = `
                    <div class="empty-state">
                        <p>No teacher on duty has been assigned today.</p>
                    </div>
                `;
            }

            if (teacherTodayDuty) {
                teacherTodayDuty.textContent =
                    "No teacher on duty today.";
            }

        } else {

            const todayHTML = todayData.map(duty => {

                const dutyTime =
                    `${formatDutyTime(duty.start_time)} - ${formatDutyTime(duty.end_time)}`;

                return `
                    <div class="admin-activity-item">

                        <div class="admin-activity-dot"></div>

                        <div>
                            <strong>${duty.teacher_name}</strong>

                            <span>
                                ${duty.duty_area}
                                •
                                ${dutyTime}
                            </span>
                        </div>

                    </div>
                `;

            }).join("");

            if (teacherDutyContainer) {
                teacherDutyContainer.innerHTML = todayHTML;
            }

            if (teacherTodayDuty) {

                const names = todayData.map(duty =>
                    `${duty.teacher_name} — ${duty.duty_area}`
                );

                teacherTodayDuty.textContent = names.join(" | ");
            }
        }

// ==========================================
// COMPLETE WEEKLY SCHEDULE - DAY CARDS
// ==========================================

const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

if (teacherDutySchedule) {

    const scheduleHTML = dayOrder.map(day => {

        const duties = (scheduleData || []).filter(
            duty => duty.duty_day === day
        );

        const isToday = day === today;

        const teachersHTML = duties.length
            ? duties.map(duty => `
                <div class="duty-teacher-row">

                    <div class="duty-teacher-icon">
                        <i class="fas fa-user-tie"></i>
                    </div>

                    <div class="duty-teacher-info">
                        <strong>${duty.teacher_name}</strong>
                        <span>${duty.duty_area}</span>
                    </div>

                    <div class="duty-teacher-time">
                        ${formatDutyTime(duty.start_time)}
                        <span>to ${formatDutyTime(duty.end_time)}</span>
                    </div>

                </div>
            `).join("")
            : `<p class="duty-no-assignment">No teachers assigned.</p>`;

        return `
            <div class="teacher-duty-day-card ${isToday ? "today-duty-card" : ""}">

                <div class="duty-day-card-header">

                    <div>
                        <span class="duty-day-label">WEEKLY DUTY</span>
                        <h3>${day}</h3>
                    </div>

                    ${isToday
                        ? '<span class="duty-today-badge">TODAY</span>'
                        : ''
                    }

                </div>

                <div class="duty-teacher-count">
                    ${duties.length}
                    ${duties.length === 1 ? "Teacher assigned" : "Teachers assigned"}
                </div>

                <div class="duty-day-teachers">
                    ${teachersHTML}
                </div>

            </div>
        `;

    }).join("");

    teacherDutySchedule.innerHTML = scheduleHTML;
}
        
        console.log(
            "Weekly teacher duty loaded successfully."
        );

    } catch (error) {

        console.error("Teacher duty error:", error);

        if (teacherDutyContainer) {
            teacherDutyContainer.innerHTML = `
                <div class="empty-state">
                    <p>Unable to load today's teacher duty.</p>
                </div>
            `;
        }

        if (teacherDutySchedule) {
            teacherDutySchedule.innerHTML = `
                <div class="empty-state">
                    <p>Unable to load weekly duty schedule.</p>
                </div>
            `;
        }

        if (teacherTodayDuty) {
            teacherTodayDuty.textContent =
                "Unable to load duty information.";
        }
    }
}

// ==========================================
// LOAD TEACHER DUTY PAGE
// ==========================================

if (
    window.location.pathname.includes("teacher-duty.html")
) {
    loadTeacherDuty();
}

// ==========================================
// TEACHER PROFILE
// ==========================================

async function loadTeacherProfile() {

    console.log("Loading teacher profile...");


    // ==========================================
    // GET ELEMENTS
    // ==========================================

    const teacherProfileName =
        document.getElementById(
            "teacherProfileName"
        );

    const teacherProfileEmail =
        document.getElementById(
            "teacherProfileEmail"
        );

    const teacherProfileNameCard =
        document.getElementById(
            "teacherProfileNameCard"
        );

    const teacherProfileEmailCard =
        document.getElementById(
            "teacherProfileEmailCard"
        );

    const teacherProfileRole =
        document.getElementById(
            "teacherProfileRole"
        );

    const teacherProfileCreated =
        document.getElementById(
            "teacherProfileCreated"
        );

    const teacherProfilePhoto =
        document.getElementById(
            "teacherProfilePhoto"
        );

    const teacherProfilePlaceholder =
        document.getElementById(
            "teacherProfilePlaceholder"
        );

    const teacherPhotoInput =
        document.getElementById(
            "teacherPhotoInput"
        );


    try {

        // ==========================================
        // GET CURRENT USER
        // ==========================================

        const {
            data: {
                user
            },
            error: userError
        } =
            await supabaseClient.auth.getUser();


        if (userError) {
            throw userError;
        }


        if (!user) {

            console.error(
                "No logged-in user found."
            );

            return;

        }


        console.log(
            "Teacher user:",
            user
        );


        // ==========================================
        // GET TEACHER PROFILE
        // ==========================================

        const {
            data: profile,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select(`
                    id,
                    full_name,
                    email,
                    role,
                    created_at
                `)
                .eq(
                    "id",
                    user.id
                )
                .single();


        if (profileError) {
            throw profileError;
        }


        console.log(
            "Teacher profile:",
            profile
        );


        // ==========================================
        // DISPLAY NAME
        // ==========================================

        const teacherName =
            profile.full_name ||
            "Not provided";


        if (teacherProfileName) {

            teacherProfileName.textContent =
                teacherName;

        }


        if (teacherProfileNameCard) {

            teacherProfileNameCard.textContent =
                teacherName;

        }


        // ==========================================
        // DISPLAY EMAIL
        // ==========================================

        const teacherEmail =
            profile.email ||
            user.email ||
            "Not provided";


        if (teacherProfileEmail) {

            teacherProfileEmail.textContent =
                teacherEmail;

        }


        if (teacherProfileEmailCard) {

            teacherProfileEmailCard.textContent =
                teacherEmail;

        }


        // ==========================================
        // DISPLAY ROLE
        // ==========================================

        if (teacherProfileRole) {

            teacherProfileRole.textContent =
                profile.role
                    ? profile.role
                        .charAt(0)
                        .toUpperCase() +
                      profile.role.slice(1)
                    : "Teacher";

        }


        // ==========================================
        // DISPLAY CREATED DATE
        // ==========================================

        if (teacherProfileCreated) {

            if (profile.created_at) {

                const createdDate =
                    new Date(
                        profile.created_at
                    );


                teacherProfileCreated.textContent =
                    createdDate.toLocaleDateString(
                        "en-GB",
                        {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }
                    );

            } else {

                teacherProfileCreated.textContent =
                    "Not available";

            }

        }


        // ==========================================
        // LOAD SAVED PROFILE PHOTO
        // ==========================================

        const photoPath =
            user.id +
            "/profile.jpg";


        const {
            data: photoData
        } =
            supabaseClient.storage
                .from("profile-photos")
                .getPublicUrl(
                    photoPath
                );


        /*
         * The bucket is private, so we use a
         * signed URL instead of the public URL.
         */

        const {
            data: signedPhoto,
            error: signedPhotoError
        } =
            await supabaseClient.storage
                .from("profile-photos")
                .createSignedUrl(
                    photoPath,
                    3600
                );


        if (
            !signedPhotoError &&
            signedPhoto &&
            signedPhoto.signedUrl
        ) {

            if (teacherProfilePhoto) {

                teacherProfilePhoto.src =
                    signedPhoto.signedUrl;

                teacherProfilePhoto.style.display =
                    "block";

            }


            if (teacherProfilePlaceholder) {

                teacherProfilePlaceholder.style.display =
                    "none";

            }

        }


        // ==========================================
        // PHOTO UPLOAD
        // ==========================================

        if (teacherPhotoInput) {

            teacherPhotoInput.addEventListener(
                "change",
                async function () {

                    const file =
                        this.files[0];


                    if (!file) {
                        return;
                    }


                    // ==================================
                    // CHECK FILE TYPE
                    // ==================================

                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        alert(
                            "Please select an image file."
                        );

                        this.value = "";

                        return;

                    }


                    // ==================================
                    // CHECK FILE SIZE
                    // ==================================

                    if (
                        file.size >
                        5 * 1024 * 1024
                    ) {

                        alert(
                            "Please choose an image smaller than 5 MB."
                        );

                        this.value = "";

                        return;

                    }


                    console.log(
                        "Uploading teacher profile photo..."
                    );


                    try {

                        // ==============================
                        // UPLOAD PHOTO
                        // ==============================

                        const {
                            error: uploadError
                        } =
                            await supabaseClient.storage
                                .from("profile-photos")
                                .upload(
                                    photoPath,
                                    file,
                                    {
                                        upsert: true,
                                        contentType:
                                            file.type
                                    }
                                );


                        if (uploadError) {

                            throw uploadError;

                        }


                        console.log(
                            "Teacher profile photo uploaded."
                        );


                        // ==============================
                        // GET NEW SIGNED URL
                        // ==============================

                        const {
                            data: newPhoto,
                            error: newPhotoError
                        } =
                            await supabaseClient.storage
                                .from("profile-photos")
                                .createSignedUrl(
                                    photoPath,
                                    3600
                                );


                        if (newPhotoError) {

                            throw newPhotoError;

                        }


                        if (
                            newPhoto &&
                            newPhoto.signedUrl
                        ) {

                            if (
                                teacherProfilePhoto
                            ) {

                                teacherProfilePhoto.src =
                                    newPhoto.signedUrl;

                                teacherProfilePhoto.style.display =
                                    "block";

                            }


                            if (
                                teacherProfilePlaceholder
                            ) {

                                teacherProfilePlaceholder.style.display =
                                    "none";

                            }

                        }


                        alert(
                            "Profile photo updated successfully!"
                        );


                    } catch (uploadError) {

                        console.error(
                            "Profile photo upload error:",
                            uploadError
                        );


                        alert(
                            "Unable to update profile photo."
                        );

                    }


                    // Clear file input

                    this.value = "";

                }
            );

        }


        console.log(
            "Teacher profile loaded successfully."
        );


    } catch (error) {

        console.error(
            "Teacher profile error:",
            error
        );


        if (teacherProfileName) {

            teacherProfileName.textContent =
                "Unable to load";

        }


        if (teacherProfileNameCard) {

            teacherProfileNameCard.textContent =
                "Unable to load";

        }


        if (teacherProfileEmail) {

            teacherProfileEmail.textContent =
                "Unable to load";

        }


        if (teacherProfileEmailCard) {

            teacherProfileEmailCard.textContent =
                "Unable to load";

        }


        if (teacherProfileRole) {

            teacherProfileRole.textContent =
                "Unable to load";

        }


        if (teacherProfileCreated) {

            teacherProfileCreated.textContent =
                "Unable to load";

        }

    }

}


// ==========================================
// TEACHER PROFILE PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "teacher-profile.html"
    )
) {

    loadTeacherProfile();

}


 // ==========================================
 // TEACHER - MY STUDENTS
 // ==========================================

async function loadTeacherStudents() {
    console.log("Loading teacher students...");

    const tableBody = document.getElementById(
        "teacherStudentsTableBody"
    );

    const searchInput = document.getElementById(
        "teacherStudentSearch"
    );

    if (!tableBody) return;

    const table = tableBody.closest("table");

    if (!table) {
        console.error("Teacher students table not found.");
        return;
    }

    // Create the subject selector once.
    let subjectSelect = document.getElementById(
        "teacherStudentSubject"
    );

    if (!subjectSelect) {
        subjectSelect = document.createElement("select");
        subjectSelect.id = "teacherStudentSubject";
        subjectSelect.style.cssText =
            "width:100%;max-width:350px;padding:12px;margin:0 0 18px;border-radius:8px;";

        const label = document.createElement("label");
        label.htmlFor = "teacherStudentSubject";
        label.textContent = "Choose the subject you teach";

        table.parentElement.insertBefore(label, table);
        table.parentElement.insertBefore(subjectSelect, table);
    }

    const showMessage = (message) => {
        tableBody.innerHTML = "";

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.className = "empty-state";
        cell.textContent = message;

        row.appendChild(cell);
        tableBody.appendChild(row);
    };

    // Get the signed-in teacher.
    const { data: { user }, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !user) {
        console.error("Unable to identify teacher:", userError);
        showMessage("Please sign in again.");
        return;
    }

    // Get this teacher's assigned subjects.
    const { data: assignments, error: assignmentError } =
        await supabaseClient
            .from("teacher_subjects")
            .select("subject_id")
            .eq("teacher_id", user.id);

    if (assignmentError) {
        console.error("Teacher subjects error:", assignmentError);
        showMessage("Unable to load your assigned subjects.");
        return;
    }

    const subjectIds = [
        ...new Set((assignments || []).map(item => item.subject_id))
    ];

    if (subjectIds.length === 0) {
        subjectSelect.innerHTML =
            '<option value="">No subjects assigned</option>';
        showMessage("No subjects have been assigned to you yet.");
        return;
    }

    // Load subject names.
    const { data: subjects, error: subjectsError } =
        await supabaseClient
            .from("subjects")
            .select("id, name")
            .in("id", subjectIds)
            .order("name");

    if (subjectsError) {
        console.error("Subjects error:", subjectsError);
        showMessage("Unable to load subject names.");
        return;
    }

    subjectSelect.innerHTML =
        '<option value="">Select a subject</option>';

    (subjects || []).forEach(subject => {
        const option = document.createElement("option");
        option.value = subject.id;
        option.textContent = subject.name;
        subjectSelect.appendChild(option);
    });

    let currentStudents = [];

    // Load students enrolled in the selected subject only.
    async function loadSelectedSubject() {
        const subjectId = subjectSelect.value;
        currentStudents = [];

        if (!subjectId) {
            showMessage("Select a subject to view its students.");
            return;
        }

        showMessage("Loading students...");

        const { data: enrollments, error: enrollmentError } =
            await supabaseClient
                .from("student_subjects")
                .select("student_id")
                .eq("subject_id", subjectId);

        if (enrollmentError) {
            console.error("Student enrollment error:", enrollmentError);
            showMessage("Unable to load subject enrollments.");
            return;
        }

        const studentIds = [
            ...new Set(
                (enrollments || []).map(item => item.student_id)
            )
        ];

        if (studentIds.length === 0) {
            showMessage("No students are enrolled in this subject.");
            return;
        }

        const { data: students, error: studentsError } =
            await supabaseClient
                .from("students")
                .select(
                    "id, full_name, admission_number, class_name, email"
                )
                .in("id", studentIds)
                .order("full_name");

        if (studentsError) {
            console.error("Teacher students error:", studentsError);
            showMessage("Unable to load students.");
            return;
        }

        currentStudents = students || [];
        displayStudents(currentStudents);
    }

    // Display the filtered students.
    function displayStudents(list) {
        tableBody.innerHTML = "";

        if (!list.length) {
            showMessage("No students found for this search.");
            return;
        }

        list.forEach(student => {
            const row = document.createElement("tr");
            row.className = "teacher-student-row";
            row.style.cursor = "pointer";

            [
                student.full_name || "Unknown",
                student.admission_number || "—",
                student.class_name || "—",
                student.email || "—"
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            row.addEventListener("click", () => {
                showTeacherStudentDetails(student);
            });

            tableBody.appendChild(row);
        });
    }

    // Search only within the selected subject.
    if (searchInput && searchInput.dataset.subjectSearchBound !== "true") {
        searchInput.dataset.subjectSearchBound = "true";

        searchInput.addEventListener("input", () => {
            const term = searchInput.value.trim().toLowerCase();

            const filtered = currentStudents.filter(student =>
                (student.full_name || "").toLowerCase().includes(term) ||
                (student.admission_number || "").toLowerCase().includes(term)
            );

            displayStudents(filtered);
        });
    }

    if (subjectSelect.dataset.subjectChangeBound !== "true") {
        subjectSelect.dataset.subjectChangeBound = "true";
        subjectSelect.addEventListener("change", loadSelectedSubject);
    }

    const closeButton = document.getElementById("closeStudentDetails");

    if (closeButton && closeButton.dataset.closeBound !== "true") {
        closeButton.dataset.closeBound = "true";

        closeButton.addEventListener("click", () => {
            const details = document.getElementById("teacherStudentDetails");
            if (details) details.style.display = "none";
        });
    }

    console.log("Teacher students page ready.");
}


// ==========================================
// SHOW TEACHER STUDENT DETAILS
// ==========================================

function showTeacherStudentDetails(student) {
    const detailsCard = document.getElementById("teacherStudentDetails");

    if (!detailsCard) return;

    const fields = {
        selectedStudentName: student.full_name || "Unknown Student",
        selectedStudentAdmission: student.admission_number || "No admission number",
        selectedStudentClass: student.class_name || "—",
        selectedStudentEmail: student.email || "—"
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    detailsCard.style.display = "block";
    detailsCard.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// ==========================================
// TEACHER STUDENTS PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "teacher-students.html"
    )
) {

    loadTeacherStudents();

}

function escapeCredentialHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
}

// ==========================================
// ADMIN - LOGIN CREDENTIALS
// ==========================================

let adminCredentialAccounts = [];
let activeCredentialFilter = "all";

async function loadAdminCredentials() {

    const credentialsContainer =
        document.getElementById("credentialsContainer");

    const credentialsCount =
        document.getElementById("credentialsCount");

    const studentCount =
        document.getElementById("credentialsStudentCount");

    const teacherCount =
        document.getElementById("credentialsTeacherCount");

    if (!credentialsContainer) return;

    credentialsContainer.innerHTML = `
        <div class="credentials-loading">
            <div class="credentials-spinner"></div>
            <p>Loading student and teacher accounts...</p>
        </div>
    `;

    try {

        // FETCH STUDENTS
        const {
            data: students,
            error: studentError
        } = await supabaseClient
            .from("students")
            .select("id, user_id, full_name, admission_number, class_name, email")
            .order("full_name", { ascending: true });

        if (studentError) throw studentError;

        // FETCH TEACHERS
        const {
            data: teachers,
            error: teacherError
        } = await supabaseClient
            .from("teachers")
            .select("id, full_name, email, phone")
            .order("full_name", { ascending: true });

        if (teacherError) throw teacherError;

        const studentList = students || [];
        const teacherList = teachers || [];

        // FETCH SAVED PASSWORDS
        const {
            data: credentialData,
            error: credentialError
        } = await supabaseClient.functions.invoke(
            "get-admin-credentials",
            {
                method: "POST",
                body: {}
            }
        );

        if (credentialError) {

            console.error(
                "PASSWORD RETRIEVAL ERROR:",
                credentialError
            );

            throw new Error(
                "Could not retrieve saved passwords. Check the get-admin-credentials function."
            );
        }

        const savedCredentials =
            credentialData?.credentials || [];

        const passwordMap = {};

        savedCredentials.forEach(record => {

            const accountId =
                record.account_id || record.id;

            const accountType =
                record.account_type || record.type;

            if (accountId && accountType) {

                passwordMap[
                    `${accountType}:${accountId}`
                ] = {
                    password: record.password,
                    updated_at: record.updated_at
                };

            }

        });

        // FETCH PASSWORD RESET DATES
        const accountIds = [
            ...studentList.map(s => s.id),
            ...teacherList.map(t => t.id)
        ];

        let securityRecords = [];

        if (accountIds.length) {

            const {
                data,
                error: securityError
            } = await supabaseClient
                .from("admin_account_security")
                .select(
                    "account_id, account_type, last_password_reset_at"
                )
                .in("account_id", accountIds);

            if (securityError) {

                console.warn(
                    "Could not load reset dates:",
                    securityError
                );

            } else {

                securityRecords = data || [];

            }

        }

        const resetDates = {};

        securityRecords.forEach(record => {

            resetDates[
                `${record.account_type}:${record.account_id}`
            ] = record.last_password_reset_at;

        });

        // COMBINE ACCOUNTS
        adminCredentialAccounts = [

            ...studentList.map(student => ({
                id: student.id,
                name: student.full_name,
                email: student.email,
                type: "student",
                active: Boolean(student.user_id),

                extra: `
                    <p><strong>Admission:</strong>
                        ${escapeCredentialHTML(student.admission_number || "—")}
                    </p>

                    <p><strong>Class:</strong>
                        ${escapeCredentialHTML(student.class_name || "—")}
                    </p>
                `
            })),

            ...teacherList.map(teacher => ({
                id: teacher.id,
                name: teacher.full_name,
                email: teacher.email,
                type: "teacher",
                active: Boolean(teacher.id),

                extra: `
                    <p><strong>Phone:</strong>
                        ${escapeCredentialHTML(teacher.phone || "—")}
                    </p>
                `
            }))

        ];

        // UPDATE OVERVIEW COUNTS
        if (credentialsCount) {
            credentialsCount.textContent =
                adminCredentialAccounts.length;
        }

        if (studentCount) {
            studentCount.textContent =
                studentList.length;
        }

        if (teacherCount) {
            teacherCount.textContent =
                teacherList.length;
        }

        // RESET FILTER
        activeCredentialFilter = "all";

        document.querySelectorAll(
            ".credentials-filter"
        ).forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.filter === "all"
            );

        });

        // DISPLAY ACCOUNTS
        credentialsContainer.innerHTML = "";

        if (!adminCredentialAccounts.length) {

            credentialsContainer.innerHTML = `
                <div class="credentials-empty">
                    <h3>No accounts found</h3>
                    <p>There are currently no student or teacher accounts.</p>
                </div>
            `;

            updateAdminCredentialView();
            return;
        }

        adminCredentialAccounts.forEach(account => {

            const card = document.createElement("div");

            card.className = "credential-student-card";

            card.dataset.type = account.type;

            const initials = account.name
                ? account.name
                    .split(" ")
                    .map(part => part.charAt(0))
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "U";

            const accountKey =
                `${account.type}:${account.id}`;

            const savedPassword =
                passwordMap[accountKey]?.password || "";

            const resetDate =
                resetDates[accountKey] ||
                passwordMap[accountKey]?.updated_at;

            const formattedDate = resetDate
                ? new Date(resetDate).toLocaleString()
                : "No reset recorded";

            card.innerHTML = `

                <div class="credential-student-info">

                    <div class="student-admin-avatar">
                        ${escapeCredentialHTML(initials)}
                    </div>

                    <div class="credential-student-details">

                        <h3>
                            ${escapeCredentialHTML(account.name || "Unnamed account")}
                        </h3>

                        <span class="credential-type-label ${account.type}">
                            ${account.type === "student" ? "🎓 Student" : "👨‍🏫 Teacher"}
                        </span>

                        <p>
                            <strong>Email:</strong>
                            ${escapeCredentialHTML(account.email || "No email")}
                        </p>

                        ${account.extra}

                    </div>

                </div>

                <div class="credential-account">

                    <span class="credential-status ${account.active ? "active" : "inactive"}">
                        ${account.active ? "● Active Account" : "● No Login Account"}
                    </span>

                    <p>
                        <strong>Saved Password</strong>
                    </p>

                    ${
                        savedPassword
                        ? `
                            <div class="saved-password-box">

                                <code class="saved-password-text"
                                    data-password="${escapeCredentialHTML(savedPassword)}">
                                    •••••••••
                                </code>

                                <button
                                    type="button"
                                    class="toggle-saved-password"
                                    title="Show or hide password">
                                    <span>Show</span>
                                </button>

                                <button
                                    type="button"
                                    class="copy-saved-password">
                                    <span>Copy</span>
                                </button>

                            </div>
                        `
                        : `
                            <p class="no-account-text">
                                No saved password. Reset password to generate one.
                            </p>
                        `
                    }

                    <p class="credential-reset-date">
                        <strong>Last password reset:</strong><br>
                        ${escapeCredentialHTML(formattedDate)}
                    </p>

                    ${
                        account.active
                        ? `
                            <button
                                type="button"
                                class="reset-password-button">
                                ↻ Reset Password
                            </button>
                        `
                        : `
                            <span class="no-account-text">
                                No account
                            </span>
                        `
                    }

                </div>

            `;

            // SHOW / HIDE PASSWORD
            const toggleButton =
                card.querySelector(".toggle-saved-password");

            const passwordText =
                card.querySelector(".saved-password-text");

            if (toggleButton && passwordText) {

                let passwordVisible = false;

                toggleButton.addEventListener("click", () => {

                    passwordVisible = !passwordVisible;

                    passwordText.textContent =
                        passwordVisible
                            ? passwordText.dataset.password
                            : "•••••••••";

                    toggleButton.querySelector("span").textContent =
                        passwordVisible ? "Hide" : "Show";

                });

            }

            // COPY PASSWORD
            const copyButton =
                card.querySelector(".copy-saved-password");

            if (copyButton && savedPassword) {

                copyButton.addEventListener(
                    "click",
                    async () => {

                        try {

                            await navigator.clipboard.writeText(
                                savedPassword
                            );

                            copyButton.querySelector("span").textContent =
                                "Copied!";

                            setTimeout(() => {

                                copyButton.querySelector("span").textContent =
                                    "Copy";

                            }, 1500);

                        } catch (error) {

                            alert(
                                "Could not copy password. Please select and copy it manually."
                            );

                        }

                    }
                );

            }

            // RESET PASSWORD
            const resetButton =
                card.querySelector(".reset-password-button");

            if (resetButton) {

                resetButton.addEventListener("click", () => {

                    if (account.type === "student") {

                        resetStudentPassword(account.id);

                    } else {

                        resetTeacherPassword(account.id);

                    }

                });

            }

            credentialsContainer.appendChild(card);

        });

        updateAdminCredentialView();

    } catch (error) {

        console.error(
            "ADMIN CREDENTIALS ERROR:",
            error
        );

        credentialsContainer.innerHTML = `
            <div class="credentials-empty">
                <h3>Unable to load credentials</h3>
                <p>${escapeCredentialHTML(error.message)}</p>
            </div>
        `;

        if (credentialsCount) {
            credentialsCount.textContent =
                "Unavailable";
        }

    }

}


// ==========================================
// FILTER + SEARCH LOGIN CREDENTIALS
// ==========================================

function updateAdminCredentialView() {

    const searchInput =
        document.getElementById("credentialsSearch");

    const container =
        document.getElementById("credentialsContainer");

    const title =
        document.getElementById("credentialsListTitle");

    const visibleCount =
        document.getElementById("credentialsVisibleCount");

    if (!container) return;

    const search = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const cards = container.querySelectorAll(
        ".credential-student-card"
    );

    let visible = 0;

    cards.forEach(card => {

        const matchesFilter =
            activeCredentialFilter === "all" ||
            card.dataset.type === activeCredentialFilter;

        const matchesSearch =
            card.textContent.toLowerCase().includes(search);

        const shouldShow =
            matchesFilter && matchesSearch;

        card.style.display =
            shouldShow ? "" : "none";

        if (shouldShow) visible++;

    });

    // UPDATE HEADING
    if (title) {

        const titles = {
            all: "All Accounts",
            student: "Student Accounts",
            teacher: "Teacher Accounts"
        };

        title.textContent =
            titles[activeCredentialFilter] || "All Accounts";

    }

    // UPDATE VISIBLE COUNT
    if (visibleCount) {

        visibleCount.textContent =
            `Showing ${visible} of ${adminCredentialAccounts.length} accounts`;

    }

    // EMPTY SEARCH/FILTER MESSAGE
    let emptyMessage =
        container.querySelector(".credentials-no-results");

    if (visible === 0 && cards.length > 0) {

        if (!emptyMessage) {

            emptyMessage = document.createElement("div");

            emptyMessage.className =
                "credentials-empty credentials-no-results";

            emptyMessage.innerHTML = `
                <h3>No matching accounts</h3>
                <p>Try another search or select a different filter.</p>
            `;

            container.appendChild(emptyMessage);

        }

        emptyMessage.style.display = "";

    } else if (emptyMessage) {

        emptyMessage.style.display = "none";

    }

}


// SEARCH INPUT
const credentialsSearch =
    document.getElementById("credentialsSearch");

if (credentialsSearch) {

    credentialsSearch.addEventListener(
        "input",
        updateAdminCredentialView
    );

}


// FILTER BUTTONS
document.querySelectorAll(
    ".credentials-filter"
).forEach(button => {

    button.addEventListener("click", () => {

        activeCredentialFilter =
            button.dataset.filter || "all";

        document.querySelectorAll(
            ".credentials-filter"
        ).forEach(filterButton => {

            filterButton.classList.toggle(
                "active",
                filterButton === button
            );

        });

        updateAdminCredentialView();

    });

});

// ==========================================
// ADMIN CREDENTIALS PAGE STARTUP
// ==========================================

if (
    window.location.pathname.includes(
        "admin-credentials.html"
    )
) {

    loadAdminCredentials();

}

// ==========================================
// DELETE STUDENT
// ==========================================

async function deleteStudent(studentId) {

    const confirmed =
        confirm(
            "Are you sure you want to permanently delete this student?\n\n" +
            "This will remove the student's school record and login account."
        );

    if (!confirmed) {
        return;
    }

    try {

        // ==========================================
        // SHOW DELETING MESSAGE
        // ==========================================

        alert("Deleting student...");

        // ==========================================
        // CALL EDGE FUNCTION
        // ==========================================

        const {
            data,
            error
        } =
            await supabaseClient.functions.invoke(
                "delete-student",
                {
                    body: {
                        studentId:
                            studentId
                    }
                }
            );

        if (error) {

            console.error(
                "DELETE STUDENT ERROR:",
                error
            );

            alert(
                "Unable to delete student:\n" +
                error.message
            );

            return;
        }

        if (
            !data ||
            !data.success
        ) {

            console.error(
                "DELETE STUDENT RESPONSE:",
                data
            );

            alert(
                data?.error ||
                "Unable to delete student."
            );

            return;
        }

        // ==========================================
        // REFRESH STUDENT LIST
        // ==========================================

        await loadAdminStudents();

        alert(
            "Student deleted successfully."
        );

    } catch (error) {

        console.error(
            "DELETE STUDENT EXCEPTION:",
            error
        );

        alert(
            "Something went wrong while deleting the student."
        );

    }

}

// ==========================================
// ADMIN TEACHERS PAGE STARTUP
// ==========================================

if (
    window.location.pathname.includes(
        "admin-teachers.html"
    )
) {

    loadAdminTeachers();

}


/* ==========================================
   TEACHER GRADE ENTRY
   Keeps student-facing grades unchanged.
========================================== */

async function initTeacherGradeEntry() {
    const subjectSelect =
        document.getElementById("teacherGradeSubject");

    const studentList =
        document.getElementById("teacherAssessmentStudentList");

    const assessmentForm =
        document.getElementById("teacherAssessmentForm");

    const assessmentMessage =
        document.getElementById("teacherAssessmentMessage");

    const maxScoreInput =
        document.getElementById("teacherAssessmentMaxScore");

    if (
        !subjectSelect ||
        !studentList ||
        !assessmentForm ||
        !assessmentMessage ||
        !maxScoreInput
    ) {
        return;
    }

    const {
        data: { user },
        error: authError
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
        subjectSelect.innerHTML =
            '<option value="">Please sign in again</option>';

        studentList.textContent =
            "Your session could not be verified. Please sign in again.";

        return;
    }

    // Load only this teacher's assigned subjects.
    const { data: assignments, error: assignmentError } =
        await supabaseClient
            .from("teacher_subjects")
            .select("subject_id")
            .eq("teacher_id", user.id);

    if (assignmentError) {
        console.error("Teacher subjects:", assignmentError);

        subjectSelect.innerHTML =
            '<option value="">Unable to load subjects</option>';

        studentList.textContent =
            "Could not load your assigned subjects.";

        return;
    }

    const subjectIds = [
        ...new Set(
            (assignments || [])
                .map(item => item.subject_id)
                .filter(Boolean)
        )
    ];

    if (subjectIds.length === 0) {
        subjectSelect.innerHTML =
            '<option value="">No assigned subjects</option>';

        studentList.textContent =
            "No subjects have been assigned to your teacher account.";

        return;
    }

    const { data: subjects, error: subjectsError } =
        await supabaseClient
            .from("subjects")
            .select("id, name, code")
            .in("id", subjectIds)
            .order("name");

    if (subjectsError) {
        console.error("Subjects:", subjectsError);

        subjectSelect.innerHTML =
            '<option value="">Unable to load subjects</option>';

        return;
    }

    subjectSelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a subject";
    subjectSelect.appendChild(placeholder);

    (subjects || []).forEach(subject => {
        const option = document.createElement("option");

        option.value = subject.id;
        option.textContent = subject.code
            ? `${subject.name} (${subject.code})`
            : subject.name;

        subjectSelect.appendChild(option);
    });

    // Load students when the teacher selects a subject.
    async function loadAssessmentStudents() {
        const subjectId = subjectSelect.value;

        studentList.replaceChildren();

        if (!subjectId) {
            studentList.textContent =
                "Select a subject above to load its enrolled students.";

            return;
        }

        studentList.textContent = "Loading enrolled students...";

        assessmentMessage.textContent = "";

        const { data: enrollments, error: enrollmentError } =
            await supabaseClient
                .from("student_subjects")
                .select("student_id")
                .eq("subject_id", subjectId);

        if (enrollmentError) {
            console.error("Student enrollments:", enrollmentError);

            studentList.textContent =
                "Could not load enrolled students. Check your Supabase permissions.";

            return;
        }

        const studentIds = [
            ...new Set(
                (enrollments || [])
                    .map(item => item.student_id)
                    .filter(Boolean)
            )
        ];

        if (studentIds.length === 0) {
            studentList.textContent =
                "No students are enrolled in this subject yet.";

            return;
        }

        const { data: students, error: studentsError } =
            await supabaseClient
                .from("students")
                .select("id, full_name, admission_number, class_name")
                .in("id", studentIds)
                .order("full_name");

        if (studentsError) {
            console.error("Enrolled students:", studentsError);

            studentList.textContent =
                "Could not load student details. Check the teacher's student-view permissions.";

            return;
        }

        studentList.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent =
            `Enrolled Students (${students.length})`;

        studentList.appendChild(heading);

        students.forEach(student => {
            const row = document.createElement("div");
            row.className = "teacher-assessment-student";

            const identity = document.createElement("div");
            identity.className = "teacher-assessment-student-info";

            const name = document.createElement("strong");
            name.textContent = student.full_name || "Unnamed student";

            const details = document.createElement("p");
            details.textContent = [
                student.admission_number || "No admission number",
                student.class_name || "No class"
            ].join(" • ");

            identity.append(name, details);

            const scoreField = document.createElement("div");
            scoreField.className = "teacher-assessment-score-field";

            const scoreLabel = document.createElement("label");
            scoreLabel.textContent = "Score";
            scoreLabel.htmlFor = `teacher-score-${student.id}`;

            const scoreInput = document.createElement("input");
            scoreInput.type = "number";
            scoreInput.id = `teacher-score-${student.id}`;
            scoreInput.className = "teacher-student-score";
            scoreInput.dataset.studentId = student.id;
            scoreInput.min = "0";
            scoreInput.step = "any";
            scoreInput.placeholder = "Enter marks";
            scoreInput.setAttribute(
                "aria-label",
                `Score for ${student.full_name || "student"}`
            );

            scoreField.append(scoreLabel, scoreInput);

            const commentField = document.createElement("div");
            commentField.className = "teacher-assessment-comment-field";

            const commentLabel = document.createElement("label");
            commentLabel.textContent = "Comment (optional)";
            commentLabel.htmlFor = `teacher-comment-${student.id}`;

            const commentInput = document.createElement("input");
            commentInput.type = "text";
            commentInput.id = `teacher-comment-${student.id}`;
            commentInput.className = "teacher-student-comment";
            commentInput.dataset.studentId = student.id;
            commentInput.maxLength = 500;
            commentInput.placeholder = "Feedback for this student";

            commentField.append(commentLabel, commentInput);

            row.append(identity, scoreField, commentField);
            studentList.appendChild(row);
        });

        // Store the subject's enrolled students for validation on save.
        studentList.dataset.subjectId = subjectId;
    }

    subjectSelect.addEventListener("change", loadAssessmentStudents);

   
    // Save marks for the selected assessment.
    assessmentForm.addEventListener("submit", async function (event) {
        console.log("SAVE BUTTON HANDLER TRIGGERED");
        event.preventDefault();

        assessmentMessage.textContent = "";

        const subjectId = subjectSelect.value;
        const assessmentName = document
            .getElementById("teacherAssessmentName")
            .value.trim();

        const maxScore = Number(maxScoreInput.value);

        if (!subjectId || !assessmentName) {
            assessmentMessage.textContent =
                "Please select a subject and enter an assessment name.";
            return;
        }

        if (!Number.isFinite(maxScore) || maxScore <= 0) {
            assessmentMessage.textContent =
                "Maximum marks must be greater than zero.";
            return;
        }

        if (studentList.dataset.subjectId !== subjectId) {
            assessmentMessage.textContent =
                "Please wait for the selected subject's students to finish loading.";
            return;
        }

        const scoreInputs = [
            ...studentList.querySelectorAll(".teacher-student-score")
        ];

        const commentInputs = [
            ...studentList.querySelectorAll(".teacher-student-comment")
        ];

        const commentsByStudent = new Map(
            commentInputs.map(input => [
                input.dataset.studentId,
                input.value.trim()
            ])
        );

        const rows = [];
        let invalidScore = false;

        for (const input of scoreInputs) {
            const rawScore = input.value.trim();

            // Blank means no mark recorded for this student.
            if (rawScore === "") {
                continue;
            }

            const score = Number(rawScore);

            if (
                !Number.isFinite(score) ||
                score < 0 ||
                score > maxScore
            ) {
                input.focus();
                invalidScore = true;
                break;
            }

            rows.push({
                student_id: input.dataset.studentId,
                subject_id: subjectId,
                assessment: assessmentName,
                score: score,
                max_score: maxScore,
                comments: commentsByStudent.get(input.dataset.studentId) || null
            });
        }

        if (invalidScore) {
            assessmentMessage.textContent =
                `Every score must be between 0 and ${maxScore}.`;
            return;
        }

        if (rows.length === 0) {
            assessmentMessage.textContent =
                "Enter at least one student's mark before saving.";
            return;
        }

        // Prevent accidental duplicate assessment entries.
        const { data: existingGrades, error: duplicateCheckError } =
            await supabaseClient
                .from("grades")
                .select("student_id")
                .eq("subject_id", subjectId)
                .ilike("assessment", assessmentName);

        if (duplicateCheckError) {
            console.error("Duplicate assessment check:", duplicateCheckError);

            assessmentMessage.textContent =
                "Could not check existing assessments. Nothing was saved.";
            return;
        }

        const existingStudentIds = new Set(
            (existingGrades || []).map(grade => grade.student_id)
        );

        const duplicates = rows.filter(row =>
            existingStudentIds.has(row.student_id)
        );

        if (duplicates.length > 0) {
            assessmentMessage.textContent =
                "This assessment already has marks for one or more students in this subject. No marks were saved. Use a different assessment name or check the existing gradebook.";
            return;
        }

        const saveButton = document.getElementById(
            "teacherSaveAssessmentButton"
        );

        saveButton.disabled = true;
        saveButton.textContent = "Saving marks...";

        try {
            const { error: saveError } = await supabaseClient
                .from("grades")
                .insert(rows);

            if (saveError) {
                console.error("Saving teacher grades:", saveError);

                assessmentMessage.textContent =
                    "Marks were not saved. Check the console for the Supabase error.";
                return;
            }

            assessmentMessage.textContent =
                `Successfully saved marks for ${rows.length} student(s).`;

            // Clear entered marks and comments after successful saving.
            scoreInputs.forEach(input => {
                input.value = "";
            });

            commentInputs.forEach(input => {
                input.value = "";
            });

            // Refresh the existing gradebook if its loader is available.
            if (typeof loadTeacherGrades === "function") {
                await loadTeacherGrades();
            }

        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Save Assessment Marks";
        }
    });
}

if (
    window.location.pathname
        .toLowerCase()
        .endsWith("/teacher-grades.html")
) {
    initTeacherGradeEntry();
}


 // ==========================================
 // TEACHER - LESSON ATTENDANCE
 // ==========================================

async function initTeacherAttendance() {
    const lessonSelect = document.getElementById("attendanceLesson");
    const dateInput = document.getElementById("attendanceDate");
    const tableBody = document.getElementById("teacherAttendanceTableBody");
    const loadButton = document.getElementById("loadAttendanceButton");
    const saveButton = document.getElementById("saveAttendanceButton");
    const markAllButton = document.getElementById("markAllPresentButton");
    const messageBox = document.getElementById("attendanceMessage");
    const lessonInfo = document.getElementById("attendanceLessonInfo");

    if (
        !lessonSelect || !dateInput || !tableBody ||
        !loadButton || !saveButton || !markAllButton
    ) return;

    if (lessonSelect.dataset.initialized === "true") return;
    lessonSelect.dataset.initialized = "true";

    let teacherLessons = [];
    let currentStudents = [];

    function showMessage(message, isError = false) {
        messageBox.textContent = message;
        messageBox.style.display = "block";
        messageBox.style.background = isError ? "#fee2e2" : "#dcfce7";
        messageBox.style.color = isError ? "#991b1b" : "#166534";
    }

    function hideMessage() {
        messageBox.style.display = "none";
        messageBox.textContent = "";
    }

    function showTableMessage(message) {
        tableBody.innerHTML = "";
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.className = "attendance-empty";
        cell.textContent = message;
        row.appendChild(cell);
        tableBody.appendChild(row);
    }

    function localToday() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    dateInput.value = localToday();

    // Get the signed-in teacher.
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        showMessage("Please sign in again to take attendance.", true);
        showTableMessage("Teacher login required.");
        return;
    }

    // Load only this teacher's scheduled lessons.
    const {
        data: lessons,
        error: lessonsError
    } = await supabaseClient
        .from("timetable")
        .select(`
            id,
            class_name,
            subject_id,
            teacher_id,
            day_of_week,
            start_time,
            end_time,
            room,
            subjects (
                name
            )
        `)
        .eq("teacher_id", user.id)
        .order("day_of_week")
        .order("start_time");

    if (lessonsError) {
        console.error("Attendance timetable error:", lessonsError);
        showMessage("Could not load your timetable. Check the console.", true);
        showTableMessage("Unable to load lessons.");
        return;
    }

    teacherLessons = lessons || [];

    lessonSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = teacherLessons.length
        ? "Select a lesson"
        : "No lessons assigned";
    lessonSelect.appendChild(defaultOption);

    teacherLessons.forEach(lesson => {
        const subject = Array.isArray(lesson.subjects)
            ? lesson.subjects[0]
            : lesson.subjects;

        const subjectName = subject?.name || "Unknown subject";
        const label = [
            subjectName,
            lesson.class_name || "No class",
            lesson.day_of_week || "",
            lesson.start_time
                ? String(lesson.start_time).slice(0, 5)
                : ""
        ].filter(Boolean).join(" — ");

        const option = document.createElement("option");
        option.value = lesson.id;
        option.textContent = label;
        lessonSelect.appendChild(option);
    });

    if (!teacherLessons.length) {
        showMessage(
            "No lessons were found for your teacher account. Check your timetable assignments.",
            true
        );
        showTableMessage("No scheduled lessons available.");
        return;
    }

    function getSelectedLesson() {
        return teacherLessons.find(
            lesson => String(lesson.id) === String(lessonSelect.value)
        );
    }

    function updateLessonInfo() {
        const lesson = getSelectedLesson();

        if (!lesson) {
            lessonInfo.textContent = "Select a lesson to view its details.";
            return;
        }

        const subject = Array.isArray(lesson.subjects)
            ? lesson.subjects[0]
            : lesson.subjects;

        lessonInfo.textContent =
            `${subject?.name || "Subject"} | Class: ${lesson.class_name || "—"} | ` +
            `Room: ${lesson.room || "—"} | ` +
            `${lesson.start_time ? String(lesson.start_time).slice(0, 5) : ""}` +
            `${lesson.end_time ? "–" + String(lesson.end_time).slice(0, 5) : ""}`;
    }

    function renderStudents(students, savedStatuses = {}) {
        tableBody.innerHTML = "";

        if (!students.length) {
            showTableMessage(
                "No enrolled students were found for this subject and class."
            );
            saveButton.disabled = true;
            return;
        }

        students.forEach(student => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = student.full_name || "Unknown";

            const admissionCell = document.createElement("td");
            admissionCell.textContent = student.admission_number || "—";

            const classCell = document.createElement("td");
            classCell.textContent = student.class_name || "—";

            const statusCell = document.createElement("td");
            const statusSelect = document.createElement("select");

            statusSelect.className = "attendance-status";
            statusSelect.dataset.studentId = student.id;
            statusSelect.setAttribute(
                "aria-label",
                `Attendance for ${student.full_name || "student"}`
            );

            [
                ["present", "Present"],
                ["absent", "Absent"],
                ["late", "Late"],
                ["excused", "Excused"]
            ].forEach(([value, label]) => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = label;
                statusSelect.appendChild(option);
            });

            statusSelect.value = savedStatuses[student.id] || "present";

            statusCell.appendChild(statusSelect);
            row.append(nameCell, admissionCell, classCell, statusCell);
            tableBody.appendChild(row);
        });

        saveButton.disabled = false;
    }

    // Load enrolled students and any attendance already saved.
    async function loadLessonStudents() {
        hideMessage();

        const lesson = getSelectedLesson();
        const date = dateInput.value;

        currentStudents = [];
        saveButton.disabled = true;

        if (!lesson || !date) {
            showTableMessage("Choose a lesson and date first.");
            return;
        }

        showTableMessage("Loading enrolled students...");
        loadButton.disabled = true;

        try {
            // Get students enrolled in the lesson's subject.
            const {
                data: enrollments,
                error: enrollmentError
            } = await supabaseClient
                .from("student_subjects")
                .select("student_id")
                .eq("subject_id", lesson.subject_id);

            if (enrollmentError) throw enrollmentError;

            const studentIds = [
                ...new Set((enrollments || []).map(item => item.student_id))
            ];

            if (!studentIds.length) {
                showTableMessage("No students are enrolled in this subject.");
                return;
            }

            const {
                data: students,
                error: studentsError
            } = await supabaseClient
                .from("students")
                .select("id, full_name, admission_number, class_name")
                .in("id", studentIds)
                .order("full_name");

            if (studentsError) throw studentsError;

            // Keep students belonging to this lesson's class only.
            currentStudents = (students || []).filter(student =>
                String(student.class_name || "").trim() ===
                String(lesson.class_name || "").trim()
            );

            // Load records already saved for this lesson and date.
            const {
                data: records,
                error: recordsError
            } = await supabaseClient
                .from("attendance")
                .select("id, student_id, status")
                .eq("timetable_id", lesson.id)
                .eq("date", date);

            if (recordsError) throw recordsError;

            const savedStatuses = {};

            (records || []).forEach(record => {
                savedStatuses[record.student_id] = record.status;
            });

            renderStudents(currentStudents, savedStatuses);

            showMessage(
                `Loaded ${currentStudents.length} student(s). ` +
                "Review the statuses before saving."
            );

        } catch (error) {
            console.error("Load lesson attendance error:", error);
            showTableMessage("Unable to load attendance. Check the console.");
            showMessage(
                error.message || "Could not load lesson attendance.",
                true
            );
        } finally {
            loadButton.disabled = false;
        }
    }

    // Load students when requested.
    loadButton.addEventListener("click", loadLessonStudents);

    lessonSelect.addEventListener("change", () => {
        updateLessonInfo();
        showTableMessage("Click Load Students to open this lesson's register.");
        saveButton.disabled = true;
    });

    dateInput.addEventListener("change", () => {
        showTableMessage("Click Load Students to load attendance for this date.");
        saveButton.disabled = true;
    });

    markAllButton.addEventListener("click", () => {
        tableBody.querySelectorAll(".attendance-status").forEach(select => {
            select.value = "present";
        });
    });

    // Insert new attendance records or update existing ones.
    saveButton.addEventListener("click", async () => {
        const lesson = getSelectedLesson();
        const date = dateInput.value;

        if (!lesson || !date || !currentStudents.length) {
            showMessage("Load a lesson's students before saving.", true);
            return;
        }

        const statusSelects = [
            ...tableBody.querySelectorAll(".attendance-status")
        ];

        if (statusSelects.length !== currentStudents.length) {
            showMessage("The student register is incomplete. Reload it first.", true);
            return;
        }

        saveButton.disabled = true;
        loadButton.disabled = true;
        markAllButton.disabled = true;

        let savedCount = 0;

        try {
            for (const select of statusSelects) {
                const studentId = select.dataset.studentId;
                const status = select.value;

                // Look for an existing record for this student, lesson and date.
                const {
                    data: existing,
                    error: existingError
                } = await supabaseClient
                    .from("attendance")
                    .select("id")
                    .eq("student_id", studentId)
                    .eq("timetable_id", lesson.id)
                    .eq("date", date)
                    .maybeSingle();

                if (existingError) throw existingError;

                if (existing) {
                    const { error: updateError } = await supabaseClient
                        .from("attendance")
                        .update({
                            status,
                            subject_id: lesson.subject_id
                        })
                        .eq("id", existing.id);

                    if (updateError) throw updateError;

                } else {
                    const { error: insertError } = await supabaseClient
                        .from("attendance")
                        .insert({
                            student_id: studentId,
                            date,
                            status,
                            subject_id: lesson.subject_id,
                            timetable_id: lesson.id
                        });

                    if (insertError) throw insertError;
                }

                savedCount++;
            }

            showMessage(
                `Saved attendance for ${savedCount} student(s).`
            );

        } catch (error) {
            console.error("Save lesson attendance error:", error);
            showMessage(
                `Attendance save stopped after ${savedCount} student(s). ` +
                (error.message || "Check the console for details."),
                true
            );

        } finally {
            saveButton.disabled = false;
            loadButton.disabled = false;
            markAllButton.disabled = false;
        }
    });

    updateLessonInfo();
    showTableMessage("Select a lesson and click Load Students.");
    console.log("Teacher lesson attendance initialized.");
}


// ==========================================
// INITIALIZE TEACHER ATTENDANCE PAGE
// ==========================================

if (
    window.location.pathname.includes("teacher-attendance.html")
) {
    initTeacherAttendance();
}

function createSubjectAssignmentModal() {

    if (document.getElementById("subjectAssignmentModal")) return;

    const modal = document.createElement("div");

    modal.id = "subjectAssignmentModal";
    modal.className = "student-modal";

    modal.innerHTML = `
        <div class="student-modal-content">

            <div class="student-modal-header">
                <div>
                    <h2>Assign Subjects</h2>
                    <p id="subjectAssignmentSubtitle"></p>
                </div>

                <button
                    type="button"
                    id="closeSubjectAssignment"
                    class="modal-close">
                    ×
                </button>
            </div>

            <div id="subjectAssignmentMessage"></div>

            <div id="subjectAssignmentList">
                Loading subjects...
            </div>

            <div class="student-admin-actions">
                <button
                    type="button"
                    id="saveSubjectAssignments"
                    class="add-student-button">
                    Save Assignments
                </button>

                <button
                    type="button"
                    id="cancelSubjectAssignments"
                    class="secondary-button">
                    Cancel
                </button>
            </div>

        </div>
    `;

   document.body.appendChild(modal);

const closeModal = () => {
    modal.classList.remove("active");
};

document.getElementById("closeSubjectAssignment")
    .addEventListener("click", closeModal);

document.getElementById("cancelSubjectAssignments")
    .addEventListener("click", closeModal);

document.getElementById("saveSubjectAssignments")
    .addEventListener("click", saveTeacherSubjectAssignments);

}
// ==========================================
// OPEN SUBJECT ASSIGNMENT WINDOW
// ==========================================

let currentSubjectTeacher = null;

async function openSubjectAssignment(type, teacher) {

    createSubjectAssignmentModal();

    currentSubjectTeacher = teacher;

    const modal = document.getElementById("subjectAssignmentModal");
    const subtitle = document.getElementById("subjectAssignmentSubtitle");
    const list = document.getElementById("subjectAssignmentList");
    const message = document.getElementById("subjectAssignmentMessage");

    modal.classList.add("active");

    subtitle.textContent = teacher.name;
    message.textContent = "";
    list.textContent = "Loading subjects...";

    try {

        // Get all available subjects
        const { data: subjects, error: subjectsError } =
            await supabaseClient
                .from("subjects")
                .select("id, name, code")
                .order("name");

        if (subjectsError) throw subjectsError;

// Teacher table ID matches profile ID
currentSubjectTeacher = teacher;
        
        // Get subjects already assigned to this teacher
        const { data: assigned, error: assignedError } =
            await supabaseClient
                .from("teacher_subjects")
                .select("subject_id")
                .eq("teacher_id", teacher.id);

        if (assignedError) throw assignedError;

        const assignedIds = (assigned || []).map(
            item => item.subject_id
        );

        list.innerHTML = "";

        if (!subjects || subjects.length === 0) {
            list.textContent = "No subjects found.";
            return;
        }

        subjects.forEach(subject => {

            const label = document.createElement("label");
            label.className = "subject-assignment-option";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = subject.id;
            checkbox.checked = assignedIds.includes(subject.id);

            const name = document.createElement("span");
            name.textContent = subject.code
                ? `${subject.name} (${subject.code})`
                : subject.name;

            label.appendChild(checkbox);
            label.appendChild(name);

            list.appendChild(label);

        });

    } catch (error) {

        console.error("SUBJECT LOADING ERROR:", error);

        message.textContent = error.message;
        list.textContent = "Could not load subjects.";

    }
}

// ==========================================
// SAVE TEACHER SUBJECT ASSIGNMENTS
// ==========================================

async function saveTeacherSubjectAssignments() {

    if (!currentSubjectTeacher) return;

    const saveButton = document.getElementById(
        "saveSubjectAssignments"
    );

    const message = document.getElementById(
        "subjectAssignmentMessage"
    );

    const selectedSubjects = Array.from(
        document.querySelectorAll(
            "#subjectAssignmentList input[type='checkbox']:checked"
        )
    ).map(input => input.value);

    saveButton.disabled = true;
    message.textContent = "Saving assignments...";

    try {

        const teacherId = currentSubjectTeacher.id;

        // Get existing assignments
        const { data: existing, error: fetchError } =
            await supabaseClient
                .from(type === "student" ? "student_subjects" : "teacher_subjects")
.select("subject_id")
.eq(type === "student" ? "student_id" : "teacher_id", teacher.id);

        if (fetchError) throw fetchError;

        const existingIds = (existing || []).map(
            item => item.subject_id
        );

        // Identify new and removed subjects
        const toAdd = selectedSubjects.filter(
            id => !existingIds.includes(id)
        );

        const toRemove = existingIds.filter(
            id => !selectedSubjects.includes(id)
        );

        // Insert new assignments
        if (toAdd.length > 0) {

            const rows = toAdd.map(subjectId => ({
                teacher_id: teacherId,
                subject_id: subjectId
            }));

            const { error: insertError } =
                await supabaseClient
                    .from("teacher_subjects")
                    .insert(rows);

            if (insertError) throw insertError;
        }

        // Remove unchecked assignments
        if (toRemove.length > 0) {

            const { error: deleteError } =
                await supabaseClient
                    .from("teacher_subjects")
                    .delete()
                    .eq("teacher_id", teacherId)
                    .in("subject_id", toRemove);

            if (deleteError) throw deleteError;
        }

        message.textContent =
            "Teacher subjects saved successfully!";

        setTimeout(() => {
            document.getElementById("subjectAssignmentModal")
                ?.classList.remove("active");
        }, 1200);

    } catch (error) {

        console.error("SAVE TEACHER SUBJECTS ERROR:", error);

        message.textContent =
            error.message || "Unable to save subjects.";

    } finally {

        saveButton.disabled = false;

    }
}


// ==========================================
// ADMIN TIMETABLE MANAGEMENT
// ==========================================

const SCHOOL_CLASSES = [
    "Year 7",
    "Year 8",
    "Year 9",
    "Year 10A",
    "Year 10B",
    "Year 11A",
    "Year 11B",
    "Year 12",
    "Year 13A",
    "Year 13B"
];

const SCHOOL_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

let adminTimetableLessons = [];
let adminTimetableTeachers = [];
let adminTimetableSubjects = [];
let editingTimetableId = null;


// SAFE HTML DISPLAY
function timetableEscape(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


// TIME FORMATTING
function timetableFormatTime(value) {
    if (!value) return "";

    const parts = value.slice(0, 5).split(":");
    let hour = Number(parts[0]);
    const minute = parts[1];

    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${minute} ${suffix}`;
}


// COLOURFUL SUBJECT CARDS
function timetableSubjectColor(subject) {
    const colors = [
        "#e0f2fe",
        "#fce7f3",
        "#ede9fe",
        "#dcfce7",
        "#fef3c7",
        "#ffedd5",
        "#cffafe",
        "#f3e8ff"
    ];

    let hash = 0;

    for (let i = 0; i < subject.length; i++) {
        hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}


// LOAD TEACHERS AND SUBJECTS
async function loadAdminTimetableOptions() {

    const teacherSelect =
        document.getElementById("timetableTeacher");

    const subjectSelect =
        document.getElementById("timetableSubject");

    const teacherFilter =
        document.getElementById("filterTimetableTeacher");

    const { data: teachers, error: teacherError } =
        await supabaseClient
            .from("teachers")
            .select("id, full_name")
            .order("full_name");

    if (teacherError) {
        console.error("Teacher loading error:", teacherError);
        teacherSelect.innerHTML =
            '<option value="">Could not load teachers</option>';
        return;
    }

    adminTimetableTeachers = teachers || [];

    teacherSelect.innerHTML =
        '<option value="">Select teacher</option>' +
        adminTimetableTeachers.map(teacher => `
            <option value="${timetableEscape(teacher.id)}">
                ${timetableEscape(teacher.full_name)}
            </option>
        `).join("");

    teacherFilter.innerHTML =
        '<option value="">All Teachers</option>' +
        adminTimetableTeachers.map(teacher => `
            <option value="${timetableEscape(teacher.id)}">
                ${timetableEscape(teacher.full_name)}
            </option>
        `).join("");


    const { data: subjects, error: subjectError } =
        await supabaseClient
            .from("subjects")
            .select("id, name, code")
            .order("name");

    if (subjectError) {
        console.error("Subject loading error:", subjectError);
        subjectSelect.innerHTML =
            '<option value="">Could not load subjects</option>';
        return;
    }

    adminTimetableSubjects = subjects || [];

    subjectSelect.innerHTML =
        '<option value="">Select subject</option>' +
        adminTimetableSubjects.map(subject => `
            <option value="${timetableEscape(subject.id)}">
                ${timetableEscape(subject.name)}
            </option>
        `).join("");
}


// LOAD ALL TIMETABLE LESSONS
async function loadAdminTimetable() {

    const container =
        document.getElementById("adminTimetableContainer");

    container.innerHTML = "<p>Loading timetable...</p>";

    const { data, error } = await supabaseClient
        .from("timetable")
        .select("*");

    if (error) {
        console.error("Timetable loading error:", error);

        container.innerHTML =
            "<p>Unable to load timetable. Check your permissions.</p>";

        return;
    }

    adminTimetableLessons = data || [];

    renderAdminTimetable();
    updateAdminTimetableStats();
}


// UPDATE STATISTICS
function updateAdminTimetableStats() {

    document.getElementById("timetableTotalLessons").textContent =
        adminTimetableLessons.length;

    const teachers = new Set(
        adminTimetableLessons
            .map(lesson => lesson.teacher_id)
            .filter(Boolean)
    );

    const classes = new Set(
        adminTimetableLessons
            .map(lesson => lesson.class_name)
            .filter(Boolean)
    );

    document.getElementById("timetableTotalTeachers").textContent =
        teachers.size;

    document.getElementById("timetableTotalClasses").textContent =
        classes.size;
}


// DISPLAY TIMETABLE CARDS
function renderAdminTimetable() {

    const container =
        document.getElementById("adminTimetableContainer");

    const classFilter =
        document.getElementById("filterTimetableClass").value;

    const dayFilter =
        document.getElementById("filterTimetableDay").value;

    const teacherFilter =
        document.getElementById("filterTimetableTeacher").value;

    const filtered = adminTimetableLessons.filter(lesson => {

        return (
            (!classFilter || lesson.class_name === classFilter) &&
            (!dayFilter || lesson.day_of_week === dayFilter) &&
            (!teacherFilter || lesson.teacher_id === teacherFilter)
        );

    });

    const dayOrder = SCHOOL_DAYS;

    filtered.sort((a, b) => {

        const dayDifference =
            dayOrder.indexOf(a.day_of_week) -
            dayOrder.indexOf(b.day_of_week);

        if (dayDifference !== 0) return dayDifference;

        return a.start_time.localeCompare(b.start_time);
    });

    if (!filtered.length) {
        container.innerHTML = `
            <div class="timetable-empty">
                <h3>📚 No lessons found</h3>
                <p>Try changing your filters or add a new lesson.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="admin-timetable-card-grid">

            ${filtered.map(lesson => {

                const teacher = adminTimetableTeachers.find(
                    item => item.id === lesson.teacher_id
                );

                const subject = adminTimetableSubjects.find(
                    item => item.id === lesson.subject_id
                );

                const teacherName =
                    teacher?.full_name ||
                    lesson.teacher_name ||
                    "Unassigned";

                const subjectName =
                    subject?.name || "Unknown Subject";

                const background =
                    timetableSubjectColor(subjectName);

                return `
                    <div class="admin-timetable-card"
                         style="--lesson-color:${background}">

                        <div class="admin-timetable-card-top">
                            <span class="timetable-day">
                                ${timetableEscape(lesson.day_of_week)}
                            </span>

                            <span class="timetable-class">
                                ${timetableEscape(lesson.class_name)}
                            </span>
                        </div>

                        <h3>
                            ${timetableEscape(subjectName)}
                        </h3>

                        <p>
                            👨‍🏫 ${timetableEscape(teacherName)}
                        </p>

                        <p>
                            🕒 ${timetableFormatTime(lesson.start_time)}
                            – ${timetableFormatTime(lesson.end_time)}
                        </p>

                        <p>
                            📍 ${timetableEscape(lesson.room || "No room assigned")}
                        </p>

                        <div class="timetable-card-actions">

                            <button type="button"
                                class="edit-timetable-lesson"
                                data-id="${timetableEscape(lesson.id)}">
                                ✏️ Edit
                            </button>

                            <button type="button"
                                class="delete-timetable-lesson"
                                data-id="${timetableEscape(lesson.id)}">
                                🗑️ Delete
                            </button>

                        </div>

                    </div>
                `;

            }).join("")}

        </div>
    `;
}


// CHECK FOR OVERLAPPING LESSONS
function timetableHasConflict(newLesson) {

    const newStart = newLesson.start_time.slice(0, 5);
    const newEnd = newLesson.end_time.slice(0, 5);

    return adminTimetableLessons.some(existing => {

        if (existing.id === editingTimetableId) return false;

        if (existing.day_of_week !== newLesson.day_of_week) {
            return false;
        }

        const existingStart = existing.start_time.slice(0, 5);
        const existingEnd = existing.end_time.slice(0, 5);

        const overlaps =
            newStart < existingEnd &&
            newEnd > existingStart;

        if (!overlaps) return false;

        const sameTeacher =
            existing.teacher_id === newLesson.teacher_id;

        const sameClass =
            existing.class_name === newLesson.class_name;

        return sameTeacher || sameClass;
    });
}


// SAVE OR UPDATE LESSON
async function saveAdminTimetableLesson(event) {

    event.preventDefault();

    const message =
        document.getElementById("timetableFormMessage");

    const teacherId =
        document.getElementById("timetableTeacher").value;

    const subjectId =
        document.getElementById("timetableSubject").value;

    const teacher = adminTimetableTeachers.find(
        item => item.id === teacherId
    );

    const lesson = {

        class_name:
            document.getElementById("timetableClass").value,

        teacher_id: teacherId,

        teacher_name: teacher?.full_name || "",

        subject_id: subjectId,

        day_of_week:
            document.getElementById("timetableDay").value,

        start_time:
            document.getElementById("timetableStart").value,

        end_time:
            document.getElementById("timetableEnd").value,

        room:
            document.getElementById("timetableRoom").value.trim()

    };

    if (!teacherId || !subjectId) {
        message.textContent =
            "Please select a teacher and subject.";
        return;
    }

    if (lesson.end_time <= lesson.start_time) {
        message.textContent =
            "The ending time must be later than the starting time.";
        return;
    }

    if (timetableHasConflict(lesson)) {
        message.textContent =
            "Conflict detected! This teacher or class already has a lesson during that time.";
        return;
    }

    const saveButton =
        document.getElementById("saveTimetableLesson");

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    let result;

    if (editingTimetableId) {

        result = await supabaseClient
            .from("timetable")
            .update(lesson)
            .eq("id", editingTimetableId);

    } else {

        result = await supabaseClient
            .from("timetable")
            .insert([lesson]);

    }

    saveButton.disabled = false;
    saveButton.textContent = "Add Lesson";

    if (result.error) {

        console.error("Timetable save error:", result.error);

        message.textContent =
            "Could not save lesson: " + result.error.message;

        return;
    }

    message.textContent = editingTimetableId
        ? "Lesson updated successfully!"
        : "Lesson added successfully!";

    resetAdminTimetableForm();

    await loadAdminTimetable();
}


// EDIT LESSON
function editAdminTimetableLesson(id) {

    const lesson = adminTimetableLessons.find(
        item => item.id === id
    );

    if (!lesson) return;

    editingTimetableId = id;

    document.getElementById("timetableClass").value =
        lesson.class_name;

    document.getElementById("timetableTeacher").value =
        lesson.teacher_id || "";

    document.getElementById("timetableSubject").value =
        lesson.subject_id || "";

    document.getElementById("timetableDay").value =
        lesson.day_of_week;

    document.getElementById("timetableStart").value =
        lesson.start_time.slice(0, 5);

    document.getElementById("timetableEnd").value =
        lesson.end_time.slice(0, 5);

    document.getElementById("timetableRoom").value =
        lesson.room || "";

    document.getElementById("saveTimetableLesson").textContent =
        "Update Lesson";

    document.getElementById("cancelTimetableEdit").style.display =
        "inline-block";

    document.getElementById("timetableFormMessage").textContent =
        "Editing lesson...";

    document.getElementById("adminTimetableForm")
        .scrollIntoView({ behavior: "smooth" });
}


// DELETE LESSON
async function deleteAdminTimetableLesson(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this lesson?"
    );

    if (!confirmed) return;

    const { error } = await supabaseClient
        .from("timetable")
        .delete()
        .eq("id", id);

    if (error) {

        console.error("Timetable delete error:", error);

        alert("Could not delete lesson: " + error.message);

        return;
    }

    await loadAdminTimetable();
}


// RESET FORM
function resetAdminTimetableForm() {

    editingTimetableId = null;

    document.getElementById("adminTimetableForm").reset();

    document.getElementById("saveTimetableLesson").textContent =
        "Add Lesson";

    document.getElementById("cancelTimetableEdit").style.display =
        "none";

    document.getElementById("timetableFormMessage").textContent =
        "";
}


// INITIALISE ADMIN TIMETABLE
async function initialiseAdminTimetable() {

    await loadAdminTimetableOptions();

    await loadAdminTimetable();

    document.getElementById("adminTimetableForm")
        .addEventListener("submit", saveAdminTimetableLesson);

    document.getElementById("cancelTimetableEdit")
        .addEventListener("click", resetAdminTimetableForm);

    document.getElementById("filterTimetableClass")
        .addEventListener("change", renderAdminTimetable);

    document.getElementById("filterTimetableDay")
        .addEventListener("change", renderAdminTimetable);

    document.getElementById("filterTimetableTeacher")
        .addEventListener("change", renderAdminTimetable);

    document.getElementById("adminTimetableContainer")
        .addEventListener("click", event => {

            const editButton =
                event.target.closest(".edit-timetable-lesson");

            const deleteButton =
                event.target.closest(".delete-timetable-lesson");

            if (editButton) {
                editAdminTimetableLesson(editButton.dataset.id);
            }

            if (deleteButton) {
                deleteAdminTimetableLesson(deleteButton.dataset.id);
            }

        });
}


// PAGE INITIALISATION
if (window.location.pathname.includes("admin-timetable.html")) {
    initialiseAdminTimetable();
}



/* ==========================================
   THREE RIVERS ACADEMY
   PARENT PORTAL - COMPLETE DASHBOARD
========================================== */

let parentLinkedChildren = [];
let selectedParentChild = null;


async function initialiseParentDashboard() {

    const getElement = id => document.getElementById(id);

    const setText = (id, value) => {
        const element = getElement(id);
        if (element) element.textContent = value;
    };

    const formatDate = date => {
        if (!date) return "Date unavailable";

        const value = String(date);
        const parsed = new Date(
            value.length === 10 ? value + "T00:00:00" : value
        );

        return Number.isNaN(parsed.getTime())
            ? "Date unavailable"
            : parsed.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
    };

    const showError = (id, message) => {
        const container = getElement(id);
        if (!container) return;

        container.innerHTML = "";
        const p = document.createElement("p");
        p.className = "parent-loading";
        p.textContent = message;
        container.appendChild(p);
    };

    const addText = (parent, tag, value, className = "") => {
        const element = document.createElement(tag);
        element.textContent = value ?? "";

        if (className) element.className = className;

        parent.appendChild(element);
        return element;
    };

    const showList = (containerId, items, emptyMessage, renderItem) => {
        const container = getElement(containerId);
        if (!container) return;

        container.innerHTML = "";

        if (!items || items.length === 0) {
            addText(container, "p", emptyMessage, "parent-loading");
            return;
        }

        items.forEach(item => {
            const element = document.createElement("div");
            element.className = "parent-data-item";

            renderItem(element, item);
            container.appendChild(element);
        });
    };

    try {

        // 1. VERIFY PARENT LOGIN

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            window.location.href = "login.html";
            return;
        }

        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select("id, full_name, email, role")
            .eq("id", user.id)
            .single();

        if (profileError || !profile || profile.role !== "parent") {
            console.error("Parent verification error:", profileError);

            alert("This account is not authorised to access the Parent Portal.");

            await supabaseClient.auth.signOut();
            window.location.href = "login.html";
            return;
        }

        // 2. PARENT INFORMATION

        const parentName = profile.full_name || "Parent";

        setText("parentName", parentName);
        setText("parentWelcomeName", parentName);
        setText("parentInitial", parentName.charAt(0).toUpperCase());

        setText(
            "parentTodayDate",
            new Date().toLocaleDateString("en-KE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            })
        );

        // 3. GET LINKED CHILDREN

        const {
            data: links,
            error: linksError
        } = await supabaseClient
            .from("parent_students")
            .select("student_id, relationship")
            .eq("parent_id", user.id);

        if (linksError) throw linksError;

        const childSelect = getElement("parentChildSelect");

        if (!links || links.length === 0) {

            parentLinkedChildren = [];

            if (childSelect) {
                childSelect.innerHTML =
                    '<option value="">No children linked yet</option>';
            }

            setText("parentStudentName", "No linked students");
            setText("parentAcademicAverage", "—");
            setText("parentAttendance", "—");
            setText("parentUpcomingAssignments", "—");
            setText("parentConduct", "—");

            showError("parentAcademicContent", "No linked student available.");
            showError("parentAttendanceContent", "No linked student available.");
            showError("parentAssignmentsList", "No linked student available.");
            showError("parentAnnouncementsList", "No linked student available.");
            showError("parentAchievementsContent", "No linked student available.");

            return;
        }

        const studentIds = links.map(link => link.student_id);

        const {
            data: students,
            error: studentsError
        } = await supabaseClient
            .from("students")
            .select("id, full_name, admission_number, class_name")
            .in("id", studentIds)
            .order("full_name");

        if (studentsError) throw studentsError;

        if (!students || students.length === 0) {
            throw new Error("No linked student records were found.");
        }

        parentLinkedChildren = students.map(student => {
            const link = links.find(
                item => item.student_id === student.id
            );

            return {
                ...student,
                relationship: link?.relationship || "Parent"
            };
        });

        // 4. POPULATE CHILD SELECTOR

        if (childSelect) {
            childSelect.innerHTML = "";

            parentLinkedChildren.forEach(student => {
                const option = document.createElement("option");

                option.value = student.id;
                option.textContent =
                    `${student.full_name} (${student.admission_number})`;

                childSelect.appendChild(option);
            });
        }

        // 5. LOAD SELECTED CHILD

        async function loadSelectedChild(studentId) {

            const student = parentLinkedChildren.find(
                item => item.id === studentId
            );

            if (!student) return;

            selectedParentChild = student;

// ==================================
// PARENT ACTION CENTRE DATA
// ==================================

const parentActionItems = [];

const addParentAction = (
    type,
    title,
    message,
    priority = "normal"
) => {
    parentActionItems.push({
        type,
        title,
        message,
        priority
    });
};

            setText("parentStudentName", student.full_name);
            setText(
                "parentStudentInitial",
                (student.full_name || "S").charAt(0).toUpperCase()
            );
            setText(
                "parentStudentClass",
                student.class_name || "Class not assigned"
            );
            setText(
                "parentAdmission",
                student.admission_number || "—"
            );
            setText("parentRelationship", student.relationship);

            setText("parentAcademicAverage", "Loading...");
            setText("parentAttendance", "Loading...");
            setText("parentUpcomingAssignments", "Loading...");
            setText("parentConduct", "Loading...");

            // Clear old child information immediately.

            [
                "parentAcademicContent",
                "parentAttendanceContent",
                "parentAssignmentsList",
                "parentAnnouncementsList",
                "parentAchievementsContent"
            ].forEach(id => {
                const element = getElement(id);
                if (element) element.textContent = "Loading...";
            });

            // Each section has its own error handling.
            // One failed query will not stop the others.

            const loadGrades = async () => {
                try {
                    const { data, error } = await supabaseClient
                        .from("grades")
                        .select(`
                            id,
                            assessment,
                            score,
                            max_score,
                            comments,
                            created_at,
                            subjects (
                                name,
                                code
                            )
                        `)
                        .eq("student_id", student.id)
                        .order("created_at", { ascending: false });

                    if (error) throw error;

                    const gradeList = data || [];

                    // Add latest academic result to Parent Action Centre
if (gradeList.length > 0) {

    const latestGrade = gradeList[0];

    const score = Number(latestGrade.score) || 0;
    const maximum = Number(latestGrade.max_score) || 0;

    const percentage = maximum > 0
        ? Math.round((score / maximum) * 100)
        : null;

    const subject = Array.isArray(latestGrade.subjects)
        ? latestGrade.subjects[0]
        : latestGrade.subjects;

    addParentAction(
        "academic",
        "Latest academic result",
        `${subject?.name || "Subject"}: ${
            percentage === null ? score : percentage + "%"
        } — ${latestGrade.assessment || "Assessment"}`,
        percentage !== null && percentage < 50
            ? "attention"
            : "normal"
    );
}

                    const totalScore = gradeList.reduce(
                        (sum, grade) =>
                            sum + (Number(grade.score) || 0),
                        0
                    );

                    const totalMaximum = gradeList.reduce(
                        (sum, grade) =>
                            sum + (Number(grade.max_score) || 0),
                        0
                    );

                    const average = totalMaximum > 0
                        ? (totalScore / totalMaximum) * 100
                        : null;

                    setText(
                        "parentAcademicAverage",
                        average === null
                            ? "No grades"
                            : Math.round(average) + "%"
                    );

                  
const academicContainer = getElement("parentAcademicContent");

if (academicContainer) {

    const categories = [
        { id: "opener", label: "Opener Exams", pattern: /opener/i },
        { id: "midterm", label: "Midterm Exams", pattern: /mid.?term/i },
        { id: "endterm", label: "End Term Exams", pattern: /end.?term/i },
        { id: "internal", label: "Internal Tests", pattern: /internal/i }
    ];

    const getCategory = grade => {
        const assessment = String(grade.assessment || "")
            .replace(/[_-]/g, " ");

        return categories.find(category =>
            category.pattern.test(assessment)
        );
    };

    const groupedResults = {};

    categories.forEach(category => {
        groupedResults[category.id] = gradeList.filter(
            grade => getCategory(grade)?.id === category.id
        );
    });

    academicContainer.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "parent-grade-results-heading";

    const title = document.createElement("h3");
    title.textContent = "Academic Results";

    const description = document.createElement("p");
    description.textContent = "Choose an examination category to view results.";

    heading.appendChild(title);
    heading.appendChild(description);
    academicContainer.appendChild(heading);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "parent-grade-category-buttons";

    const resultsContainer = document.createElement("div");
    resultsContainer.className = "parent-grade-category-results";

    categories.forEach(category => {

        const results = groupedResults[category.id];

        const button = document.createElement("button");
        button.type = "button";
        button.className = "parent-grade-category-button";

        const label = document.createElement("span");
        label.textContent = category.label;

        const count = document.createElement("span");
        count.className = "parent-grade-count";
        count.textContent = results.length;

        button.appendChild(label);
        button.appendChild(count);

        button.addEventListener("click", () => {

            buttonsContainer.querySelectorAll("button").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            resultsContainer.innerHTML = "";

            if (results.length === 0) {
                const empty = document.createElement("p");
                empty.className = "parent-loading";
                empty.textContent =
                    `No ${category.label.toLowerCase()} results available yet.`;

                resultsContainer.appendChild(empty);
                return;
            }

            results.forEach(grade => {

                const resultCard = document.createElement("div");
                resultCard.className = "parent-grade-result-card";

                const subject = Array.isArray(grade.subjects)
                    ? grade.subjects[0]
                    : grade.subjects;

                const score = Number(grade.score) || 0;
                const maximum = Number(grade.max_score) || 0;

                addText(
                    resultCard,
                    "strong",
                    subject?.name || "Subject"
                );

                addText(
                    resultCard,
                    "span",
                    grade.assessment || category.label
                );

                addText(
                    resultCard,
                    "strong",
                    maximum > 0
                        ? `${score} / ${maximum} (${Math.round(score / maximum * 100)}%)`
                        : String(score)
                );

                if (grade.comments) {
                    addText(resultCard, "small", grade.comments);
                }

                addText(
                    resultCard,
                    "small",
                    formatDate(grade.created_at)
                );

                resultsContainer.appendChild(resultCard);
            });
        });

        buttonsContainer.appendChild(button);
    });

    academicContainer.appendChild(buttonsContainer);
    academicContainer.appendChild(resultsContainer);

    // ==========================================
// ACADEMIC PERFORMANCE TREND GRAPH
// ==========================================

const academicGraphSection = document.createElement("div");
academicGraphSection.className = "parent-academic-graph-section";

const graphHeader = document.createElement("div");
graphHeader.className = "parent-academic-graph-header";

const graphTitle = document.createElement("h3");
graphTitle.textContent = "Academic Performance Trend";

const graphDescription = document.createElement("p");
graphDescription.textContent =
    "Track your child's results across recent assessments.";

graphHeader.appendChild(graphTitle);
graphHeader.appendChild(graphDescription);

const graphContainer = document.createElement("div");
graphContainer.className = "parent-academic-chart";

academicGraphSection.appendChild(graphHeader);
academicGraphSection.appendChild(graphContainer);

const renderAcademicGraph = () => {

    graphContainer.innerHTML = "";

    const datedGrades = gradeList
        .filter(grade =>
            grade.created_at &&
            Number(grade.max_score) > 0
        )
        .map(grade => ({
            ...grade,
            percentage: Math.round(
                (Number(grade.score) / Number(grade.max_score)) * 100
            )
        }))
        .sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        )
        .slice(-8);

    if (datedGrades.length === 0) {
        addText(
            graphContainer,
            "p",
            "Not enough dated assessment results to display a trend.",
            "parent-loading"
        );
        return;
    }

    const chart = document.createElement("div");
    chart.className = "parent-academic-chart-bars";

    const maximum = 100;

    datedGrades.forEach(grade => {

        const column = document.createElement("div");
        column.className = "parent-academic-chart-column";

        const percentage = document.createElement("strong");
        percentage.textContent = grade.percentage + "%";

        const barArea = document.createElement("div");
        barArea.className = "parent-academic-chart-bar-area";

        const bar = document.createElement("div");
        bar.className = "parent-academic-chart-bar";

        bar.style.height =
            `${Math.max(grade.percentage, 2) / maximum * 150}px`;

        bar.title = `${grade.percentage}%`;

        if (grade.percentage >= 80) {
            bar.classList.add("excellent");
        } else if (grade.percentage >= 50) {
            bar.classList.add("average");
        } else {
            bar.classList.add("needs-improvement");
        }

        barArea.appendChild(bar);

        const subject = Array.isArray(grade.subjects)
            ? grade.subjects[0]
            : grade.subjects;

        const label = document.createElement("span");
        label.textContent = subject?.name || "Subject";
        label.title = subject?.name || "Subject";

        const date = document.createElement("small");
        date.textContent = formatDate(grade.created_at);

        column.appendChild(percentage);
        column.appendChild(barArea);
        column.appendChild(label);
        column.appendChild(date);

        chart.appendChild(column);
    });

    graphContainer.appendChild(chart);

    const note = document.createElement("p");
    note.className = "parent-academic-chart-note";
    note.textContent =
        "Showing the latest " + datedGrades.length +
        " assessments, in chronological order.";

    graphContainer.appendChild(note);
};

renderAcademicGraph();

    console.log("GRAPH CHECK:", {
    academicContainer: academicContainer,
    graphSection: academicGraphSection,
    buttonsContainer: buttonsContainer,
    grades: gradeList.length
});

    academicContainer.insertBefore(
    academicGraphSection,
    buttonsContainer
);

  // Open Opener Exams by default
buttonsContainer.querySelector("button")?.click();

} // Closes if (academicContainer)

} catch (error) { // Closes try and handles errors
    console.error("Parent grades error:", error);
    setText("parentAcademicAverage", "Unavailable");
    showError(
        "parentAcademicContent",
        "Unable to load academic records."
    );
}
};
            
            const loadAttendance = async () => {
                try {
                    const { data, error } = await supabaseClient
                        .from("attendance")
                        .select("id, date, status")
                        .eq("student_id", student.id)
                        .order("date", { ascending: false });

                    if (error) throw error;

                    const records = data || [];

                    const present = records.filter(record =>
                        String(record.status).toLowerCase() === "present"
                    ).length;

                    const late = records.filter(record =>
                        String(record.status).toLowerCase() === "late"
                    ).length;

                    const absent = records.filter(record =>
                        String(record.status).toLowerCase() === "absent"
                    ).length;

                    const percentage = records.length > 0
                        ? Math.round(
                            ((present + late) / records.length) * 100
                        )
                        : null;

                    // Add attendance alert to Parent Action Centre
if (percentage !== null && percentage < 90) {

    addParentAction(
        "attendance",
        "Attendance needs attention",
        `Attendance is currently ${percentage}%. There are ${absent} absences and ${late} late arrivals.`,
        "attention"
    );

}

                   
setText(
    "parentAttendance",
    percentage === null ? "No records" : percentage + "%"
);

// BUILD ATTENDANCE CENTRE
const container = getElement("parentAttendanceContent");

if (container) {
    container.innerHTML = "";

    // SUMMARY CARDS
    const summaryGrid = document.createElement("div");
    summaryGrid.className = "parent-attendance-summary-grid";

    const summaryItems = [
        {
            label: "Attendance Rate",
            value: percentage === null ? "—" : percentage + "%",
            icon: "📊"
        },
        { label: "Present", value: present, icon: "✅" },
        { label: "Late", value: late, icon: "🕒" },
        { label: "Absent", value: absent, icon: "❌" }
    ];

    summaryItems.forEach(item => {
        const card = document.createElement("div");
        card.className = "parent-attendance-stat-card";

        addText(card, "span", item.icon, "attendance-stat-icon");
        addText(card, "small", item.label);
        addText(card, "strong", String(item.value));

        summaryGrid.appendChild(card);
    });

    container.appendChild(summaryGrid);

        // ==================================
    // WEEKLY / MONTHLY ATTENDANCE GRAPH
    // ==================================

    const graphSection = document.createElement("div");
    graphSection.className = "parent-attendance-graph-section";

    const graphHeader = document.createElement("div");
    graphHeader.className = "parent-attendance-graph-header";

    const graphTitle = document.createElement("h4");
    graphTitle.textContent = "Attendance Trends";

    const graphControls = document.createElement("div");
    graphControls.className = "parent-attendance-graph-controls";

    const weeklyButton = document.createElement("button");
    weeklyButton.type = "button";
    weeklyButton.textContent = "Weekly";
    weeklyButton.className = "active";

    const monthlyButton = document.createElement("button");
    monthlyButton.type = "button";
    monthlyButton.textContent = "Monthly";

    graphControls.appendChild(weeklyButton);
    graphControls.appendChild(monthlyButton);

    graphHeader.appendChild(graphTitle);
    graphHeader.appendChild(graphControls);

    const graphLegend = document.createElement("div");
    graphLegend.className = "parent-attendance-graph-legend";

    [
        { label: "Present", color: "#16834a" },
        { label: "Late", color: "#e49a28" },
        { label: "Absent", color: "#d95353" }
    ].forEach(item => {
        const legendItem = document.createElement("span");
        legendItem.className = "attendance-legend-item";

        const dot = document.createElement("i");
        dot.style.backgroundColor = item.color;

        const label = document.createElement("span");
        label.textContent = item.label;

        legendItem.appendChild(dot);
        legendItem.appendChild(label);
        graphLegend.appendChild(legendItem);
    });

    const chartContainer = document.createElement("div");
    chartContainer.className = "parent-attendance-chart";

    graphSection.appendChild(graphHeader);
    graphSection.appendChild(graphLegend);
    graphSection.appendChild(chartContainer);

    container.appendChild(graphSection);

    const renderAttendanceGraph = view => {

        chartContainer.innerHTML = "";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const buckets = [];

        if (view === "weekly") {

            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);

                buckets.push({
                    key: [
                        date.getFullYear(),
                        String(date.getMonth() + 1).padStart(2, "0"),
                        String(date.getDate()).padStart(2, "0")
                    ].join("-"),
                    label: date.toLocaleDateString("en-KE", {
                        weekday: "short"
                    })
                });
            }

        } else {

            // Last 6 calendar months
            for (let i = 5; i >= 0; i--) {
                const date = new Date(
                    today.getFullYear(),
                    today.getMonth() - i,
                    1
                );

                buckets.push({
                    key: `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`,
                    label: date.toLocaleDateString("en-KE", {
                        month: "short"
                    })
                });
            }
        }

        const chartData = buckets.map(bucket => {

            const matchingRecords = records.filter(record => {
                if (!record.date) return false;

                return view === "weekly"
                    ? record.date === bucket.key
                    : record.date.startsWith(bucket.key);
            });

            return {
                ...bucket,
                present: matchingRecords.filter(
                    record => String(record.status).toLowerCase() === "present"
                ).length,
                late: matchingRecords.filter(
                    record => String(record.status).toLowerCase() === "late"
                ).length,
                absent: matchingRecords.filter(
                    record => String(record.status).toLowerCase() === "absent"
                ).length
            };
        });

        const maximumTotal = Math.max(
            1,
            ...chartData.map(item =>
                item.present + item.late + item.absent
            )
        );

        const chartHeight = 150;

        chartData.forEach(item => {

            const column = document.createElement("div");
            column.className = "parent-attendance-chart-column";

            const total = item.present + item.late + item.absent;

            const totalLabel = document.createElement("small");
            totalLabel.className = "attendance-chart-total";
            totalLabel.textContent = total;

            const barArea = document.createElement("div");
            barArea.className = "attendance-chart-bar-area";

            const bar = document.createElement("div");
            bar.className = "attendance-chart-bar";

            [
                { label: "Present", value: item.present, color: "#16834a" },
                { label: "Late", value: item.late, color: "#e49a28" },
                { label: "Absent", value: item.absent, color: "#d95353" }
            ].forEach(segmentData => {

                if (segmentData.value === 0) return;

                const segment = document.createElement("div");
                segment.className = "attendance-chart-segment";

                segment.style.height =
                    `${(segmentData.value / maximumTotal) * chartHeight}px`;

                segment.style.backgroundColor = segmentData.color;

                segment.title =
                    `${segmentData.label}: ${segmentData.value}`;

                bar.appendChild(segment);
            });

            if (total === 0) {
                const emptyBar = document.createElement("div");
                emptyBar.className = "attendance-chart-empty";
                emptyBar.style.height = "5px";
                bar.appendChild(emptyBar);
            }

            barArea.appendChild(bar);

            const label = document.createElement("span");
            label.className = "attendance-chart-label";
            label.textContent = item.label;

            column.appendChild(totalLabel);
            column.appendChild(barArea);
            column.appendChild(label);

            chartContainer.appendChild(column);
        });
    };

    weeklyButton.addEventListener("click", () => {
        weeklyButton.classList.add("active");
        monthlyButton.classList.remove("active");
        renderAttendanceGraph("weekly");
    });

    monthlyButton.addEventListener("click", () => {
        monthlyButton.classList.add("active");
        weeklyButton.classList.remove("active");
        renderAttendanceGraph("monthly");
    });

    // Show weekly graph first
    renderAttendanceGraph("weekly");

    // HISTORY HEADING
    const historyHeader = document.createElement("div");
    historyHeader.className = "parent-attendance-history-header";

    addText(historyHeader, "h4", "Attendance History");

    const monthFilter = document.createElement("select");
    monthFilter.className = "parent-attendance-month-filter";

    // GROUP RECORDS BY MONTH
    const months = new Map();

    records.forEach(record => {
        if (!record.date) return;

        const date = new Date(record.date + "T00:00:00");

        if (Number.isNaN(date.getTime())) return;

        const key = record.date.slice(0, 7);

        if (!months.has(key)) {
            months.set(
                key,
                date.toLocaleDateString("en-KE", {
                    month: "long",
                    year: "numeric"
                })
            );
        }
    });

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All months";
    monthFilter.appendChild(allOption);

    months.forEach((label, key) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = label;
        monthFilter.appendChild(option);
    });

    historyHeader.appendChild(monthFilter);
    container.appendChild(historyHeader);

    // HISTORY RECORDS
    const historyList = document.createElement("div");
    historyList.className = "parent-attendance-history-list";

    const renderHistory = () => {
        historyList.innerHTML = "";

        const selectedMonth = monthFilter.value;

        const filteredRecords = records.filter(record => {
            if (selectedMonth === "all") return true;
            return record.date?.startsWith(selectedMonth);
        });

        if (filteredRecords.length === 0) {
            addText(
                historyList,
                "p",
                "No attendance records for this month.",
                "parent-loading"
            );
            return;
        }

        filteredRecords.forEach(record => {
            const status = String(record.status || "unknown")
                .toLowerCase();

            const item = document.createElement("div");
            item.className =
                `parent-attendance-record-card status-${status}`;

            const dateInfo = document.createElement("div");
            dateInfo.className = "attendance-record-date";

            addText(
                dateInfo,
                "strong",
                formatDate(record.date)
            );

            addText(
                dateInfo,
                "small",
                new Date(record.date + "T00:00:00")
                    .toLocaleDateString("en-KE", {
                        weekday: "long"
                    })
            );

            const statusBadge = document.createElement("span");
            statusBadge.className = "attendance-status-badge";
            statusBadge.textContent =
                status.charAt(0).toUpperCase() + status.slice(1);

            item.appendChild(dateInfo);
            item.appendChild(statusBadge);

            historyList.appendChild(item);
        });
    };

    monthFilter.addEventListener("change", renderHistory);

    container.appendChild(historyList);
    renderHistory();
}

                } catch (error) {
                    console.error("Parent attendance error:", error);
                    setText("parentAttendance", "Unavailable");
                    showError(
                        "parentAttendanceContent",
                        "Unable to load attendance records."
                    );
                }
            };

            const loadAssignments = async () => {
                try {
                    const now = new Date();

                    const today = [
                        now.getFullYear(),
                        String(now.getMonth() + 1).padStart(2, "0"),
                        String(now.getDate()).padStart(2, "0")
                    ].join("-");

                    const { data, error } = await supabaseClient
                        .from("assignments")
                        .select(`
                            id,
                            title,
                            description,
                            due_date,
                            subjects (
                                name,
                                code
                            )
                        `)
                        .eq("class_name", student.class_name)
                        .gte("due_date", today)
                        .order("due_date", { ascending: true });

                    if (error) throw error;

                    const assignments = data || [];

                    // Add upcoming assignment alerts to Parent Action Centre
assignments.forEach(assignment => {

    const dueDate = new Date(
        assignment.due_date + "T00:00:00"
    );

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const daysUntilDue = Math.ceil(
        (dueDate - todayDate) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue <= 3) {

        const subject = Array.isArray(assignment.subjects)
            ? assignment.subjects[0]
            : assignment.subjects;

        addParentAction(
            "assignment",
            "Upcoming assignment",
            `${assignment.title || "Assignment"} — ${subject?.name || "Subject"} is due ${
                daysUntilDue === 0
                    ? "today"
                    : daysUntilDue === 1
                        ? "tomorrow"
                        : `in ${daysUntilDue} days`
            }.`,
            daysUntilDue <= 1 ? "attention" : "normal"
        );

    }

});

                    setText(
                        "parentUpcomingAssignments",
                        String(assignments.length)
                    );

                    showList(
                        "parentAssignmentsList",
                        assignments,
                        "No upcoming assignments.",
                        (element, assignment) => {

                            const subject = Array.isArray(assignment.subjects)
                                ? assignment.subjects[0]
                                : assignment.subjects;

                            addText(
                                element,
                                "strong",
                                assignment.title || "Assignment"
                            );

                            addText(
                                element,
                                "span",
                                subject?.name || "Subject"
                            );

                            if (assignment.description) {
                                addText(
                                    element,
                                    "small",
                                    assignment.description
                                );
                            }

                            addText(
                                element,
                                "small",
                                "Due: " + formatDate(assignment.due_date)
                            );
                        }
                    );

                } catch (error) {
                    console.error("Parent assignments error:", error);
                    setText("parentUpcomingAssignments", "Unavailable");
                    showError(
                        "parentAssignmentsList",
                        "Unable to load assignments."
                    );
                }
            };

            const loadConduct = async () => {
                try {
                    const { data, error } = await supabaseClient
                        .from("conduct_records")
                        .select("id, type, title, description, points, created_at")
                        .eq("student_id", student.id)
                        .order("created_at", { ascending: false });

                    if (error) throw error;

                    const records = data || [];

                    
// GROUP REPEATED POSITIVE ACHIEVEMENTS
const positiveRecords = records.filter(record =>
    String(record.type).toLowerCase() === "positive"
);

const achievementGroups = new Map();

positiveRecords.forEach(record => {
    const title = record.title || "Achievement";
    const key = title.trim().toLowerCase();

    if (!achievementGroups.has(key)) {
        achievementGroups.set(key, {
            title,
            totalPoints: 0,
            count: 0,
            hasPoints: false
        });
    }

    const group = achievementGroups.get(key);

    group.count++;

    if (record.points !== null && record.points !== undefined) {
        group.totalPoints += Number(record.points) || 0;
        group.hasPoints = true;
    }
});

Array.from(achievementGroups.values())
    .slice(0, 3)
    .forEach(group => {
        addParentAction(
            "achievement",
            group.title,
            group.hasPoints
                ? `+${group.totalPoints} points${
                    group.count > 1
                        ? ` across ${group.count} records`
                        : ""
                }`
                : `${group.count} achievement record${
                    group.count > 1 ? "s" : ""
                }`,
            "positive"
        );
    });

                    setText("parentConduct", String(records.length));

                    showList(
                        "parentAchievementsContent",
                        records.slice(0, 8),
                        "No achievements or conduct records have been added yet.",
                        (element, record) => {

                            addText(
                                element,
                                "strong",
                                record.title || record.type || "Conduct record"
                            );

                            addText(
                                element,
                                "span",
                                record.type || "Record"
                            );

                            if (record.description) {
                                addText(
                                    element,
                                    "p",
                                    record.description
                                );
                            }

                            if (
                                record.points !== null &&
                                record.points !== undefined
                            ) {
                                addText(
                                    element,
                                    "strong",
                                    `${record.points > 0 ? "+" : ""}${record.points} points`
                                );
                            }

                            addText(
                                element,
                                "small",
                                formatDate(record.created_at)
                            );
                        }
                    );

                } catch (error) {
                    console.error("Parent conduct error:", error);
                    setText("parentConduct", "Unavailable");
                    showError(
                        "parentAchievementsContent",
                        "Unable to load conduct records."
                    );
                }
            };

            const loadAnnouncements = async () => {
                try {
                    const classTargets = ["all"];

                    if (student.class_name) {
                        classTargets.push(student.class_name);
                    }

                    const { data, error } = await supabaseClient
                        .from("announcements")
                        .select("id, title, message, target_role, target_class, created_at")
                        .in("target_role", ["parent", "all"])
                        .in("target_class", classTargets)
                        .order("created_at", { ascending: false })
                        .limit(10);

                    if (error) throw error;

                    const announcements = data || [];

                    // Add recent school announcements to Parent Action Centre
announcements.slice(0, 3).forEach(announcement => {

    const announcementText = (
        (announcement.title || "") + " " +
        (announcement.message || "")
    ).toLowerCase();

    const needsAttention =
        /urgent|important|action required|meeting|deadline/.test(
            announcementText
        );

    addParentAction(
        "announcement",
        needsAttention
            ? "Important school announcement"
            : "School update",
        announcement.title || "New school announcement",
        needsAttention ? "attention" : "normal"
    );

});

                    setText(
                        "parentNotificationCount",
                        String(announcements.length)
                    );

                    showList(
                        "parentAnnouncementsList",
                        announcements,
                        "No announcements for this child at the moment.",
                        (element, announcement) => {

                            addText(
                                element,
                                "strong",
                                announcement.title || "School announcement"
                            );

                            addText(
                                element,
                                "p",
                                announcement.message || ""
                            );

                            addText(
                                element,
                                "small",
                                formatDate(announcement.created_at)
                            );
                        }
                    );

                } catch (error) {
                    console.error("Parent announcements error:", error);
                    setText("parentNotificationCount", "—");
                    showError(
                        "parentAnnouncementsList",
                        "Unable to load announcements."
                    );
                }
            };

         
// ==========================================
// PARENT SCHOOL CALENDAR
// ==========================================

const loadSchoolCalendar = async () => {
    const calendarContainer = getElement("parentSchoolCalendar");

    if (!calendarContainer) return;

    try {
        const { data, error } = await supabaseClient
            .from("school_events")
            .select(`
                id,
                title,
                description,
                event_date,
                start_time,
                end_time,
                location,
                category
            `)
            .order("event_date", { ascending: true })
            .limit(200);

        if (error) throw error;

        const events = data || [];

        calendarContainer.innerHTML = "";

        // Local date helpers
        const makeDateKey = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        const today = new Date();
        const todayKey = makeDateKey(today);

        let displayedMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        let selectedDate = todayKey;

        const eventsByDate = {};

        events.forEach(event => {
            if (!eventsByDate[event.event_date]) {
                eventsByDate[event.event_date] = [];
            }

            eventsByDate[event.event_date].push(event);
        });

        // Main calendar layout
        const calendarView = document.createElement("div");
        calendarView.className = "parent-monthly-calendar";

        const calendarHeader = document.createElement("div");
        calendarHeader.className = "parent-monthly-calendar-header";

        const previousButton = document.createElement("button");
        previousButton.type = "button";
        previousButton.textContent = "‹";
        previousButton.className = "parent-calendar-nav-button";

        const monthTitle = document.createElement("h3");

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.textContent = "›";
        nextButton.className = "parent-calendar-nav-button";

        calendarHeader.appendChild(previousButton);
        calendarHeader.appendChild(monthTitle);
        calendarHeader.appendChild(nextButton);

        const weekdayRow = document.createElement("div");
        weekdayRow.className = "parent-calendar-weekdays";

        ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            .forEach(day => {
                const weekday = document.createElement("span");
                weekday.textContent = day;
                weekdayRow.appendChild(weekday);
            });

        const daysGrid = document.createElement("div");
        daysGrid.className = "parent-calendar-days-grid";

        const selectedEventsSection = document.createElement("div");
        selectedEventsSection.className =
            "parent-calendar-selected-events";

        calendarView.appendChild(calendarHeader);
        calendarView.appendChild(weekdayRow);
        calendarView.appendChild(daysGrid);
        calendarView.appendChild(selectedEventsSection);

        // Selected date events
        const renderSelectedEvents = () => {
            selectedEventsSection.innerHTML = "";

            const heading = document.createElement("h4");
            const selectedDateObject = new Date(
                selectedDate + "T00:00:00"
            );

            heading.textContent = selectedDateObject.toLocaleDateString(
                "en-GB",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

            selectedEventsSection.appendChild(heading);

            const selectedEvents = eventsByDate[selectedDate] || [];

            if (selectedEvents.length === 0) {
                const emptyMessage = document.createElement("p");
                emptyMessage.textContent =
                    "No school events scheduled for this date.";

                selectedEventsSection.appendChild(emptyMessage);
                return;
            }

            selectedEvents.forEach(event => {
                const card = document.createElement("div");
                card.className = "parent-calendar-selected-event";

                const title = document.createElement("strong");
                title.textContent = event.title || "School event";

                card.appendChild(title);

                if (event.description) {
                    const description = document.createElement("p");
                    description.textContent = event.description;
                    card.appendChild(description);
                }

                if (event.start_time) {
                    const time = document.createElement("small");

                    time.textContent =
                        "Time: " + event.start_time.slice(0, 5) +
                        (event.end_time
                            ? " – " + event.end_time.slice(0, 5)
                            : "");

                    card.appendChild(time);
                }

                if (event.location) {
                    const location = document.createElement("small");
                    location.textContent = "Location: " + event.location;
                    card.appendChild(location);
                }

                selectedEventsSection.appendChild(card);
            });
        };

        // Monthly grid
        const renderMonth = () => {
            daysGrid.innerHTML = "";

            monthTitle.textContent = displayedMonth.toLocaleDateString(
                "en-GB",
                {
                    month: "long",
                    year: "numeric"
                }
            );

            const year = displayedMonth.getFullYear();
            const month = displayedMonth.getMonth();

            const firstDay = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const startingOffset = (firstDay.getDay() + 6) % 7;

            // Empty spaces before the first day
            for (let i = 0; i < startingOffset; i++) {
                const emptyDay = document.createElement("div");
                emptyDay.className = "parent-calendar-empty-day";
                daysGrid.appendChild(emptyDay);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateKey = makeDateKey(date);

                const dayEvents = eventsByDate[dateKey] || [];

                const dayButton = document.createElement("button");
                dayButton.type = "button";
                dayButton.className = "parent-calendar-day";
                dayButton.textContent = day;

                if (dateKey === todayKey) {
                    dayButton.classList.add("today");
                }

                if (dateKey === selectedDate) {
                    dayButton.classList.add("selected");
                }

                if (dayEvents.length > 0) {
                    dayButton.classList.add("has-events");

                    const eventDot = document.createElement("span");
                    eventDot.className = "parent-calendar-event-dot";
                    dayButton.appendChild(eventDot);
                }

                dayButton.addEventListener("click", () => {
                    selectedDate = dateKey;
                    renderMonth();
                    renderSelectedEvents();
                });

                daysGrid.appendChild(dayButton);
            }

            renderSelectedEvents();
        };

        previousButton.addEventListener("click", () => {
            displayedMonth = new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth() - 1,
                1
            );

            selectedDate = makeDateKey(displayedMonth);
            renderMonth();
        });

        nextButton.addEventListener("click", () => {
            displayedMonth = new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth() + 1,
                1
            );

            selectedDate = makeDateKey(displayedMonth);
            renderMonth();
        });

        calendarContainer.appendChild(calendarView);

        renderMonth();

        // Upcoming events section
        const upcomingSection = document.createElement("div");
        upcomingSection.className = "parent-calendar-upcoming";

        const upcomingHeading = document.createElement("h3");
        upcomingHeading.textContent = "Upcoming School Events";

        upcomingSection.appendChild(upcomingHeading);

        const upcomingEvents = events.filter(
            event => event.event_date >= todayKey
        ).slice(0, 20);

        if (upcomingEvents.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent =
                "There are no upcoming school events.";

            upcomingSection.appendChild(emptyMessage);
        }

        upcomingEvents.forEach(event => {
            const card = document.createElement("div");
            card.className = "parent-calendar-event-card";

            const dateBox = document.createElement("div");
            dateBox.className = "parent-calendar-event-date";

            const date = new Date(event.event_date + "T00:00:00");

            const dateNumber = document.createElement("strong");
            dateNumber.textContent = date.getDate();

            const dateMonth = document.createElement("span");
            dateMonth.textContent = date.toLocaleDateString(
                "en-GB",
                { month: "short" }
            );

            dateBox.appendChild(dateNumber);
            dateBox.appendChild(dateMonth);

            const details = document.createElement("div");
            details.className = "parent-calendar-event-details";

            const title = document.createElement("strong");
            title.textContent = event.title || "School event";
            details.appendChild(title);

            if (event.description) {
                const description = document.createElement("p");
                description.textContent = event.description;
                details.appendChild(description);
            }

            const dateText = document.createElement("small");
            dateText.textContent = date.toLocaleDateString(
                "en-GB",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
            details.appendChild(dateText);

            if (event.start_time) {
                const time = document.createElement("small");
                time.textContent =
                    "Time: " + event.start_time.slice(0, 5) +
                    (event.end_time
                        ? " – " + event.end_time.slice(0, 5)
                        : "");

                details.appendChild(time);
            }

            if (event.location) {
                const location = document.createElement("small");
                location.textContent = "Location: " + event.location;
                details.appendChild(location);
            }

            card.appendChild(dateBox);
            card.appendChild(details);
            upcomingSection.appendChild(card);
        });

        calendarContainer.appendChild(upcomingSection);

    } catch (error) {
        console.error("Parent school calendar error:", error);

        calendarContainer.innerHTML = "";

        addText(
            calendarContainer,
            "p",
            "Unable to load school calendar events.",
            "parent-loading"
        );
    }
};

            // LOAD ALL FIVE SECTIONS INDEPENDENTLY.

      await Promise.all([
    loadGrades(),
    loadAttendance(),
    loadAssignments(),
    loadConduct(),
    loadAnnouncements(),
    loadSchoolCalendar(),
    loadParentFeeStatements(student.id),

    // PARENT TEACHER COMMUNICATION
    loadParentTeacherDirectory(student.id),
    loadParentTeacherMessages(student.id)
]);

          
// DISPLAY PARENT ACTION CENTRE
const actionCentre = getElement("parentActionCentre");

if (actionCentre) {
    actionCentre.innerHTML = "";

    if (parentActionItems.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "parent-action-empty";
        emptyMessage.textContent =
            "You're all caught up! There are no important updates right now.";

        actionCentre.appendChild(emptyMessage);
    } else {
        const icons = {
            academic: "📚",
            attendance: "📅",
            assignment: "📝",
            achievement: "🏆",
            announcement: "📢"
        };

        const labels = {
            academic: "ACADEMIC PERFORMANCE",
            attendance: "ATTENDANCE",
            assignment: "UPCOMING WORK",
            achievement: "ACHIEVEMENT",
            announcement: "SCHOOL UPDATE"
        };

        parentActionItems.forEach(item => {
            const card = document.createElement("div");
            card.className = `parent-action-card action-${item.type} priority-${item.priority}`;

            const cardHeader = document.createElement("div");
            cardHeader.className = "parent-action-card-header";

            const icon = document.createElement("span");
            icon.className = "parent-action-icon";
            icon.textContent = icons[item.type] || "✦";

            const category = document.createElement("span");
            category.className = "parent-action-category";
            category.textContent = labels[item.type] || "SCHOOL UPDATE";

            cardHeader.appendChild(icon);
            cardHeader.appendChild(category);

            const content = document.createElement("div");
            content.className = "parent-action-content";

            const heading = document.createElement("h4");
            heading.textContent = item.title;

            const message = document.createElement("p");
            message.textContent = item.message;

            content.appendChild(heading);
            content.appendChild(message);

            card.appendChild(cardHeader);
            card.appendChild(content);

            actionCentre.appendChild(card);
        });
    }
}

            console.log(
                "Parent child information loaded:",
                student.full_name
            );
        }


        // ======================================
        // PARENT PORTAL SECTION NAVIGATION
        // ======================================

        const parentViews = {
            "#overview": {
                id: "parentViewOverview",
                title: "Parent Overview"
            },
            "#academics": {
                id: "parentViewAcademics",
                title: "Academic Progress"
            },
            "#attendance": {
                id: "parentViewAttendance",
                title: "Attendance"
            },
            "#assignments": {
                id: "parentViewAssignments",
                title: "Assignments"
            },
            "#communication": {
                id: "parentViewAnnouncements",
                title: "Announcements"
            },
            "#achievements": {
                id: "parentViewAchievements",
                title: "Achievement Portfolio"
            },
            "#family": {
                id: "parentViewFamily",
                title: "Family Centre"
            },
            "#profile": {
                id: "parentViewProfile",
                title: "My Profile"
            }
        };

        const parentSidebarLinks = document.querySelectorAll(
            ".parent-sidebar .nav-item[href^='#']"
        );

        function showParentView(hash) {

            const selectedView = parentViews[hash] || parentViews["#overview"];

            document.querySelectorAll(".parent-view").forEach(view => {
                view.classList.remove("active");
            });

            const targetView = document.getElementById(selectedView.id);

            if (targetView) {
                targetView.classList.add("active");
            }

            parentSidebarLinks.forEach(link => {
                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === hash
                );
            });

            const pageTitle = document.getElementById("parentPageTitle");

            if (pageTitle) {
                pageTitle.textContent = selectedView.title;
            }

            if (hash === "#profile") {
                setText("parentProfileName", profile.full_name || "Parent");
                setText("parentProfileEmail", profile.email || user.email || "Not available");
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

        parentSidebarLinks.forEach(link => {

            link.addEventListener("click", event => {

                event.preventDefault();

                const hash = link.getAttribute("href");

                showParentView(hash);

                history.replaceState(null, "", hash);
            });
        });

        // Always open Overview when the parent dashboard loads.
        showParentView("#overview");

        // ==========================================
// FAMILY CENTRE CATEGORY NAVIGATION
// ==========================================

const familyCategoryMenu = document.getElementById(
    "parentFamilyCategories"
);

const familyCategoryPanels = {
    fees: document.getElementById("parentFamilyFeesPanel"),
    calendar: document.getElementById("parentFamilyCalendarPanel"),
    teacher: document.getElementById("parentFamilyTeacherPanel")
};

const familySection = document.getElementById("parentViewFamily");
if (familyCategoryMenu && familySection) {

    const backButton = document.createElement("button");

    backButton.type = "button";
    backButton.className = "parent-family-back-button";
    backButton.textContent = "← Back to Family Centre";

    backButton.addEventListener("click", () => {

        Object.values(familyCategoryPanels).forEach(panel => {
            if (panel) panel.hidden = true;
        });

        familyCategoryMenu.hidden = false;

        backButton.remove();

        familyCategoryMenu.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

    familyCategoryMenu
        .querySelectorAll("[data-family-category]")
        .forEach(card => {

            card.addEventListener("click", () => {

                const category = card.dataset.familyCategory;

                const selectedPanel = familyCategoryPanels[category];

                if (!selectedPanel) return;

                Object.values(familyCategoryPanels).forEach(panel => {
                    if (panel) panel.hidden = true;
                });

                familyCategoryMenu.hidden = true;

                backButton.remove();

                selectedPanel.prepend(backButton);

                selectedPanel.hidden = false;

                selectedPanel.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });

        });

}

        // ======================================
        // 6. SELECT FIRST CHILD
        // ======================================

        if (childSelect) {
            childSelect.value = parentLinkedChildren[0].id;

            await loadSelectedChild(childSelect.value);

            // 7. SWITCH BETWEEN CHILDREN

            if (!childSelect.dataset.initialized) {
                childSelect.dataset.initialized = "true";

                childSelect.addEventListener("change", async () => {
                    await loadSelectedChild(childSelect.value);
                });
            }
        }

        // 8. LOGOUT

        const logoutButton = getElement("parentLogout");

        if (logoutButton && !logoutButton.dataset.initialized) {
            logoutButton.dataset.initialized = "true";

            logoutButton.addEventListener("click", async event => {
                event.preventDefault();

                const { error } = await supabaseClient.auth.signOut();

                if (error) {
                    alert("Unable to log out. Please try again.");
                    return;
                }

                window.location.href = "login.html";
            });
        }

        console.log(
            "Parent Portal successfully loaded.",
            parentLinkedChildren
        );

    } catch (error) {

        console.error("Parent Portal error:", error);

        setText("parentStudentName", "Unable to load family information");

        showError(
            "parentAcademicContent",
            error.message || "An error occurred while loading the Parent Portal."
        );
    }
}

        
// ==========================================
// START PARENT PORTAL
// ==========================================

if (
    window.location.pathname
        .toLowerCase()
        .includes("parent-dashboard.html")
) {
    initialiseParentDashboard();
}


// ==========================================
// ADMIN FEE MANAGEMENT - LOAD STUDENTS
// ==========================================

let feeManagementStudents = [];


async function loadFeeManagementStudents() {

    const container = document.getElementById(
        "feeStudentsContainer"
    );

    const countElement = document.getElementById(
        "feeStudentCount"
    );

    if (!container) return;

    container.innerHTML = "<p>Loading students...</p>";

    try {

        // LOAD STUDENTS
        const { data: students, error } = await supabaseClient
            .from("students")
            .select(`
                id,
                full_name,
                admission_number,
                class_name,
                email,
                profile_photo_url
            `)
            .order("full_name", { ascending: true });

        if (error) throw error;

        feeManagementStudents = students || [];

        // LOAD ALL FEE STATEMENTS
        const { data: statements, error: statementError } =
            await supabaseClient
                .from("fee_statements")
                .select("id, student_id, previous_balance");

        if (statementError) throw statementError;

        const statementList = statements || [];

        const statementIds = statementList.map(
            statement => statement.id
        );

        let items = [];
        let payments = [];

        // LOAD CHARGES AND PAYMENTS
        if (statementIds.length > 0) {

            const { data: itemData, error: itemError } =
                await supabaseClient
                    .from("fee_statement_items")
                    .select("statement_id, amount")
                    .in("statement_id", statementIds);

            if (itemError) throw itemError;

            items = itemData || [];

            const { data: paymentData, error: paymentError } =
                await supabaseClient
                    .from("fee_payments")
                    .select("statement_id, amount")
                    .in("statement_id", statementIds);

            if (paymentError) throw paymentError;

            payments = paymentData || [];
        }

        // CALCULATE EACH STUDENT'S PAYMENT STATUS
        feeManagementStudents.forEach(student => {

            const studentStatements = statementList.filter(
                statement => statement.student_id === student.id
            );

            let totalCharges = 0;
            let totalPaid = 0;

            studentStatements.forEach(statement => {

                totalCharges += Number(
                    statement.previous_balance || 0
                );

                const statementItems = items.filter(
                    item => item.statement_id === statement.id
                );

                statementItems.forEach(item => {
                    totalCharges += Number(item.amount || 0);
                });

                const statementPayments = payments.filter(
                    payment => payment.statement_id === statement.id
                );

                statementPayments.forEach(payment => {
                    totalPaid += Number(payment.amount || 0);
                });

            });

            const outstanding = totalCharges - totalPaid;

            let paymentStatus = "none";

            if (studentStatements.length > 0) {

                if (outstanding <= 0) {
                    paymentStatus = "paid";

                } else if (totalPaid > 0) {
                    paymentStatus = "partial";

                } else {
                    paymentStatus = "unpaid";
                }

            }

            student.paymentStatus = paymentStatus;
            student.totalFeeCharges = totalCharges;
            student.totalFeePaid = totalPaid;
            student.totalFeeOutstanding = Math.max(0, outstanding);

               });

        // ======================================
        // UPDATE FEE PAYMENT OVERVIEW
        // ======================================

        const paidCount = feeManagementStudents.filter(
            student => student.paymentStatus === "paid"
        ).length;

        const partialCount = feeManagementStudents.filter(
            student => student.paymentStatus === "partial"
        ).length;

        const unpaidCount = feeManagementStudents.filter(
            student => student.paymentStatus === "unpaid"
        ).length;

        const totalCollected = feeManagementStudents.reduce(
            (total, student) =>
                total + Number(student.totalFeePaid || 0),
            0
        );

        document.getElementById("feeOverviewPaid").textContent =
            paidCount;

        document.getElementById("feeOverviewPartial").textContent =
            partialCount;

        document.getElementById("feeOverviewUnpaid").textContent =
            unpaidCount;

        document.getElementById("feeOverviewCollected").textContent =
            "KSh " + totalCollected.toLocaleString("en-KE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        if (countElement) {
            countElement.textContent = feeManagementStudents.length;
        }

        renderFeeManagementStudents(feeManagementStudents);

    } catch (error) {

        console.error("FEE STUDENTS ERROR:", error);

        container.innerHTML =
            "<p>Unable to load student fee records. Please refresh the page.</p>";

    }
}

// ==========================================
// RENDER STUDENT DIRECTORY
// ==========================================

function renderFeeManagementStudents(students) {

    const container = document.getElementById(
        "feeStudentsContainer"
    );

    if (!container) return;

    container.innerHTML = "";

    if (students.length === 0) {

        container.innerHTML =
            "<p>No students found.</p>";

        return;
    }

    students.forEach(student => {

        const card = document.createElement("div");
        card.className = "student-admin-card";

        const info = document.createElement("div");
        info.className = "student-admin-info";

        if (student.profile_photo_url) {

            const photo = document.createElement("img");

            photo.src = student.profile_photo_url;
            photo.alt = student.full_name || "Student";
            photo.className = "student-admin-photo";

            info.appendChild(photo);

        } else {

            const avatar = document.createElement("div");

            avatar.className = "student-admin-avatar";

            avatar.textContent = student.full_name
                ? student.full_name.charAt(0).toUpperCase()
                : "S";

            info.appendChild(avatar);
        }

        const details = document.createElement("div");
        details.className = "student-admin-details";

        const name = document.createElement("h3");
        name.textContent = student.full_name || "Unnamed Student";

        const meta = document.createElement("div");
        meta.className = "student-meta";

        const admission = document.createElement("span");
        admission.textContent =
            "Admission: " + (student.admission_number || "—");

        const studentClass = document.createElement("span");
        studentClass.textContent =
            "Class: " + (student.class_name || "—");

        meta.appendChild(admission);
        meta.appendChild(studentClass);

        const email = document.createElement("p");
        email.textContent = student.email || "No email available";

       details.appendChild(name);
details.appendChild(meta);
details.appendChild(email);

// PAYMENT STATUS BADGE
const statusBadge = document.createElement("span");

const statusLabels = {
    paid: "✓ Fully Paid",
    partial: "◐ Partially Paid",
    unpaid: "! Unpaid",
    none: "No Statement"
};

statusBadge.className =
    "fee-payment-status-badge fee-status-" +
    (student.paymentStatus || "none");

statusBadge.textContent =
    statusLabels[student.paymentStatus] || "No Statement";

details.appendChild(statusBadge);

info.appendChild(details);

        const actions = document.createElement("div");
        actions.className = "student-admin-actions";

        const selectButton = document.createElement("button");

        selectButton.type = "button";
        selectButton.className = "edit-student-button";
        selectButton.textContent = "Select Student";

        selectButton.addEventListener("click", () => {
            selectFeeManagementStudent(student);
        });

        actions.appendChild(selectButton);

        card.appendChild(info);
        card.appendChild(actions);

        container.appendChild(card);
    });
}


// ==========================================
// SELECT STUDENT FOR FEE MANAGEMENT
// ==========================================


function selectFeeManagementStudent(student) {

    const workspace = document.getElementById(
        "feeStudentWorkspace"
    );

    const nameElement = document.getElementById(
        "feeSelectedStudentName"
    );

    const detailsElement = document.getElementById(
        "feeSelectedStudentDetails"
    );

    if (!workspace) return;

    window.selectedFeeStudent = student;

    nameElement.textContent = student.full_name || "Student";

    detailsElement.textContent =
        "Admission: " + (student.admission_number || "—") +
        " | Class: " + (student.class_name || "—");

    workspace.style.display = "block";

    workspace.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    loadStudentFeeStatements(student.id);
}


// ==========================================
// SEARCH AND FILTER FEE MANAGEMENT STUDENTS
// ==========================================

const feeStudentSearch = document.getElementById(
    "feeStudentSearch"
);

const feePaymentStatusFilter = document.getElementById(
    "feePaymentStatusFilter"
);

function filterFeeManagementStudents() {

    const search = feeStudentSearch
        ? feeStudentSearch.value.trim().toLowerCase()
        : "";

    const selectedStatus = feePaymentStatusFilter
        ? feePaymentStatusFilter.value
        : "all";

    const filteredStudents = feeManagementStudents.filter(student => {

        const matchesSearch =
            (student.full_name || "").toLowerCase().includes(search) ||
            (student.admission_number || "").toLowerCase().includes(search) ||
            (student.class_name || "").toLowerCase().includes(search);

        const matchesStatus =
            selectedStatus === "all" ||
            student.paymentStatus === selectedStatus;

        return matchesSearch && matchesStatus;

    });

    renderFeeManagementStudents(filteredStudents);
}

if (feeStudentSearch) {
    feeStudentSearch.addEventListener(
        "input",
        filterFeeManagementStudents
    );
}

if (feePaymentStatusFilter) {
    feePaymentStatusFilter.addEventListener(
        "change",
        filterFeeManagementStudents
    );
}


// ==========================================
// FINANCIAL AUDIT TRAIL
// ==========================================

let feeAuditLogsCache = [];

async function loadFeeAuditLogs() {

    const tableBody = document.getElementById("feeAuditLogsBody");
    const countElement = document.getElementById("feeAuditLogsCount");

    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6">Loading financial audit records...</td>
        </tr>
    `;

    try {

        // LOAD AUDIT RECORDS
        const { data: logs, error: logsError } =
            await supabaseClient
                .from("fee_audit_logs")
                .select("*")
                .order("performed_at", { ascending: false })
                .limit(500);

        if (logsError) throw logsError;

        feeAuditLogsCache = logs || [];

        // LOAD RELATED STUDENT RECORDS
        const studentIds = [
            ...new Set(
                feeAuditLogsCache
                    .map(log => log.student_id)
                    .filter(Boolean)
            )
        ];

        let students = [];

        if (studentIds.length > 0) {

            const { data, error } = await supabaseClient
                .from("students")
                .select("id, full_name, admission_number, class_name")
                .in("id", studentIds);

            if (error) throw error;

            students = data || [];
        }

        // LOAD ADMIN PROFILES
        const adminIds = [
            ...new Set(
                feeAuditLogsCache
                    .map(log => log.performed_by)
                    .filter(Boolean)
            )
        ];

        let admins = [];

        if (adminIds.length > 0) {

            const { data, error } = await supabaseClient
                .from("profiles")
                .select("id, full_name, email")
                .in("id", adminIds);

            if (error) throw error;

            admins = data || [];
        }

        // ATTACH RELATED INFORMATION
        feeAuditLogsCache = feeAuditLogsCache.map(log => ({
            ...log,
            student: students.find(
                student => student.id === log.student_id
            ),
            admin: admins.find(
                admin => admin.id === log.performed_by
            )
        }));

        renderFeeAuditLogs();

    } catch (error) {

        console.error("FEE AUDIT LOADING ERROR:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load audit records: ${error.message}
                </td>
            </tr>
        `;

        if (countElement) {
            countElement.textContent = "Unable to load records";
        }
    }
}


// ==========================================
// RENDER AUDIT RECORDS
// ==========================================

function renderFeeAuditLogs() {

    const tableBody = document.getElementById("feeAuditLogsBody");
    const countElement = document.getElementById("feeAuditLogsCount");

    if (!tableBody) return;

    const search =
        document.getElementById("feeAuditSearch")?.value
            .trim().toLowerCase() || "";

    const action =
        document.getElementById("feeAuditAction")?.value || "all";

    const entity =
        document.getElementById("feeAuditEntity")?.value || "all";

    const fromDate =
        document.getElementById("feeAuditDate")?.value || "";

    const filteredLogs = feeAuditLogsCache.filter(log => {

        const student = log.student;

        const matchesSearch =
            !search ||
            (student?.full_name || "").toLowerCase().includes(search) ||
            (student?.admission_number || "").toLowerCase().includes(search) ||
            (student?.class_name || "").toLowerCase().includes(search);

        const matchesAction =
            action === "all" || log.action === action;

        const matchesEntity =
            entity === "all" || log.entity_type === entity;

        const logDate = log.performed_at
            ? log.performed_at.substring(0, 10)
            : "";

        const matchesDate =
            !fromDate || logDate >= fromDate;

        return matchesSearch &&
            matchesAction &&
            matchesEntity &&
            matchesDate;
    });

    tableBody.innerHTML = "";

    if (countElement) {
        countElement.textContent =
            `${filteredLogs.length} audit record(s)`;
    }

    if (filteredLogs.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No matching financial activity found.
                </td>
            </tr>
        `;

        return;
    }

    filteredLogs.forEach(log => {

        const row = document.createElement("tr");

        const date = log.performed_at
            ? new Date(log.performed_at).toLocaleString("en-KE")
            : "Unknown date";

        const studentName =
            log.student?.full_name || "Student record unavailable";

        const admission =
            log.student?.admission_number || "—";

        const adminName =
            log.admin?.full_name ||
            log.admin?.email ||
            "User record unavailable";

        const recordNames = {
            fee_statements: "Fee Statement",
            fee_statement_items: "Fee Charge",
            fee_payments: "Payment"
        };

        const actionLabels = {
            INSERT: "Created",
            UPDATE: "Updated",
            DELETE: "Deleted"
        };

        row.innerHTML = `
            <td>${date}</td>
            <td></td>
            <td>${recordNames[log.entity_type] || log.entity_type}</td>
            <td>${actionLabels[log.action] || log.action}</td>
            <td></td>
            <td></td>
        `;

        row.cells[1].textContent =
            `${studentName} (${admission})`;

        row.cells[4].textContent = adminName;

        const detailsButton = document.createElement("button");
        detailsButton.type = "button";
        detailsButton.textContent = "View Details";
        detailsButton.className = "fee-audit-details-button";

        row.cells[5].appendChild(detailsButton);

        
        // ==========================================
        // PROFESSIONAL AUDIT DETAILS PANEL
        // ==========================================

        const detailsRow = document.createElement("tr");
        detailsRow.style.display = "none";

        const detailsCell = document.createElement("td");
        detailsCell.colSpan = 6;

        const detailsContainer = document.createElement("div");
        detailsContainer.className = "fee-audit-details-content";

        const heading = document.createElement("h3");

        heading.textContent =
            log.action === "UPDATE"
                ? "Record Changes"
                : log.action === "INSERT"
                    ? "New Record Created"
                    : "Deleted Record Information";

        detailsContainer.appendChild(heading);

        const oldData = log.old_data || {};
        const newData = log.new_data || {};

        // FRIENDLY FIELD NAMES
        const fieldLabels = {
            academic_year: "Academic Year",
            term: "Term",
            previous_balance: "Previous Balance",
            due_date: "Payment Due Date",
            notes: "Additional Notes",
            description: "Charge Description",
            amount: "Amount",
            payment_date: "Payment Date",
            payment_method: "Payment Method",
            reference_number: "Reference Number",
            recorded_by: "Recorded By",
            created_by: "Created By",
            created_at: "Created At"
        };

        // HIDE TECHNICAL DATABASE IDENTIFIERS
        const hiddenFields = [
            "id",
            "student_id",
            "statement_id"
        ];

        const formatFieldValue = (key, value) => {

            if (value === null || value === undefined || value === "") {
                return "Not provided";
            }

            if (
                ["amount", "previous_balance"].includes(key)
                && !isNaN(Number(value))
            ) {
                return "KSh " + Number(value).toLocaleString("en-KE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }

            if (
                ["due_date", "payment_date", "created_at"].includes(key)
            ) {
                const date = new Date(value);

                if (!isNaN(date.getTime())) {
                    return date.toLocaleString("en-KE");
                }
            }

            if (typeof value === "object") {
                return JSON.stringify(value, null, 2);
            }

            return String(value);
        };

        // IDENTIFY CHANGED FIELDS
        let fields = [];

        if (log.action === "UPDATE") {

            fields = [
                ...new Set([
                    ...Object.keys(oldData),
                    ...Object.keys(newData)
                ])
            ].filter(key => {

                return (
                    !hiddenFields.includes(key) &&
                    JSON.stringify(oldData[key]) !==
                    JSON.stringify(newData[key])
                );
            });

        } else {

            const sourceData =
                log.action === "INSERT" ? newData : oldData;

            fields = Object.keys(sourceData).filter(
                key => !hiddenFields.includes(key)
            );
        }

        // CREATE BEFORE / AFTER CARDS
        const comparisonGrid = document.createElement("div");
        comparisonGrid.className = "fee-audit-comparison-grid";

        const createSnapshotCard = (title, data, type) => {

            const card = document.createElement("div");
            card.className = "fee-audit-snapshot " + type;

            const cardHeading = document.createElement("h4");
            cardHeading.textContent = title;

            card.appendChild(cardHeading);

            fields.forEach(key => {

                const fieldRow = document.createElement("div");
                fieldRow.className = "fee-audit-field-row";

                const label = document.createElement("span");
                label.textContent =
                    fieldLabels[key] ||
                    key.replace(/_/g, " ").replace(/\b\w/g, letter =>
                        letter.toUpperCase()
                    );

                const value = document.createElement("strong");
                value.textContent = formatFieldValue(key, data[key]);

                fieldRow.append(label, value);
                card.appendChild(fieldRow);
            });

            return card;
        };

        if (log.action === "UPDATE") {

            comparisonGrid.append(
                createSnapshotCard("BEFORE", oldData, "before"),
                createSnapshotCard("AFTER", newData, "after")
            );

        } else if (log.action === "INSERT") {

            comparisonGrid.appendChild(
                createSnapshotCard("CREATED INFORMATION", newData, "after")
            );

        } else {

            comparisonGrid.appendChild(
                createSnapshotCard("DELETED INFORMATION", oldData, "before")
            );
        }

        if (fields.length === 0) {

            const emptyMessage = document.createElement("p");
            emptyMessage.textContent =
                "No field-level differences were detected.";

            detailsContainer.appendChild(emptyMessage);

        } else {

            detailsContainer.appendChild(comparisonGrid);
        }

        detailsCell.appendChild(detailsContainer);
        detailsRow.appendChild(detailsCell);

        detailsButton.addEventListener("click", () => {

            const isHidden =
                detailsRow.style.display === "none";

            detailsRow.style.display =
                isHidden ? "table-row" : "none";

            detailsButton.textContent =
                isHidden ? "Hide Details" : "View Details";
        });

        tableBody.append(row, detailsRow);
    });
}


// ==========================================
// AUDIT FILTER EVENTS
// ==========================================

[
    "feeAuditSearch",
    "feeAuditAction",
    "feeAuditEntity",
    "feeAuditDate"
].forEach(id => {

    document.getElementById(id)
        ?.addEventListener("input", renderFeeAuditLogs);

    document.getElementById(id)
        ?.addEventListener("change", renderFeeAuditLogs);

});


// REFRESH AUDIT RECORDS

document.getElementById("refreshFeeAuditLogs")
    ?.addEventListener("click", loadFeeAuditLogs);

// ==========================================
// FINANCIAL REPORTS - PAYMENT CSV EXPORT
// ==========================================

async function exportFeePaymentsCSV() {

    const exportButton = document.getElementById(
        "exportFeePaymentsButton"
    );

    const statusElement = document.getElementById(
        "feeExportStatus"
    );

    const startDate = document.getElementById(
        "feeExportStartDate"
    )?.value;

    const endDate = document.getElementById(
        "feeExportEndDate"
    )?.value;

    if (startDate && endDate && startDate > endDate) {
        alert("The start date cannot be after the end date.");
        return;
    }

    exportButton.disabled = true;
    exportButton.textContent = "Preparing Export...";

    statusElement.textContent = "Loading payment records...";

    try {

        // LOAD ALL PAYMENT RECORDS IN PAGES
        let payments = [];
        let page = 0;
        const pageSize = 1000;

        while (true) {

            let query = supabaseClient
                .from("fee_payments")
                .select(`
                    id,
                    statement_id,
                    amount,
                    payment_date,
                    payment_method,
                    reference_number,
                    notes,
                    recorded_by
                `)
                .order("payment_date", { ascending: false })
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (startDate) {
                query = query.gte("payment_date", startDate);
            }

            if (endDate) {
                query = query.lte("payment_date", endDate);
            }

            const { data, error } = await query;

            if (error) throw error;

            payments.push(...(data || []));

            if (!data || data.length < pageSize) break;

            page++;
        }

        if (payments.length === 0) {
            statusElement.textContent =
                "No payment records found for the selected dates.";

            return;
        }

        // LOAD RELATED STATEMENTS
        const statementIds = [
            ...new Set(payments.map(payment => payment.statement_id))
        ];

        const { data: statements, error: statementError } =
            await supabaseClient
                .from("fee_statements")
                .select("id, student_id, academic_year, term")
                .in("id", statementIds);

        if (statementError) throw statementError;

        const statementMap = new Map(
            (statements || []).map(statement => [
                statement.id,
                statement
            ])
        );

        // LOAD STUDENTS
        const studentIds = [
            ...new Set((statements || []).map(statement => statement.student_id))
        ];

        const { data: students, error: studentError } =
            await supabaseClient
                .from("students")
                .select("id, full_name, admission_number, class_name")
                .in("id", studentIds);

        if (studentError) throw studentError;

        const studentMap = new Map(
            (students || []).map(student => [
                student.id,
                student
            ])
        );

        // LOAD ADMINISTRATORS WHO RECORDED PAYMENTS
        const recorderIds = [
            ...new Set(
                payments
                    .map(payment => payment.recorded_by)
                    .filter(Boolean)
            )
        ];

        let profiles = [];

        if (recorderIds.length > 0) {

            const { data, error } = await supabaseClient
                .from("profiles")
                .select("id, full_name")
                .in("id", recorderIds);

            if (error) throw error;

            profiles = data || [];
        }

        const profileMap = new Map(
            profiles.map(profile => [
                profile.id,
                profile.full_name
            ])
        );

        // PREPARE CSV VALUES
        const escapeCSV = value => {

            let text = String(value ?? "");

            // Prevent spreadsheet formula interpretation
            if (/^[=+\-@]/.test(text)) {
                text = "'" + text;
            }

            return '"' + text.replace(/"/g, '""') + '"';
        };

        const headers = [
            "Student Name",
            "Admission Number",
            "Class",
            "Academic Year",
            "Term",
            "Payment Date",
            "Amount (KSh)",
            "Payment Method",
            "Reference Number",
            "Notes",
            "Recorded By"
        ];

        const rows = payments.map(payment => {

            const statement = statementMap.get(payment.statement_id);
            const student = statement
                ? studentMap.get(statement.student_id)
                : null;

            return [
                student?.full_name || "Unknown Student",
                student?.admission_number || "",
                student?.class_name || "",
                statement?.academic_year || "",
                statement?.term || "",
                payment.payment_date || "",
                Number(payment.amount || 0).toFixed(2),
                payment.payment_method || "",
                payment.reference_number || "",
                payment.notes || "",
                profileMap.get(payment.recorded_by) || "Unavailable"
            ];
        });

        const csvContent = [
            headers,
            ...rows
        ].map(row => row.map(escapeCSV).join(",")).join("\r\n");

        // DOWNLOAD CSV
        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");

        downloadLink.href = url;
        downloadLink.download =
            "Three_Rivers_Payment_Records_" +
            new Date().toISOString().split("T")[0] +
            ".csv";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        URL.revokeObjectURL(url);

        statusElement.textContent =
            `Successfully exported ${payments.length} payment records.`;

    } catch (error) {

        console.error("PAYMENT EXPORT ERROR:", error);

        statusElement.textContent =
            "Export failed: " + error.message;

        alert("Unable to export payment records: " + error.message);

    } finally {

        exportButton.disabled = false;
        exportButton.textContent = "↓ Export Payment Records (CSV)";

    }
}


// CONNECT EXPORT BUTTON

document.getElementById("exportFeePaymentsButton")
    ?.addEventListener("click", exportFeePaymentsCSV);

// ==========================================
// CLASS FEE REPORTS
// ==========================================

async function loadClassFeeReport() {

    const tableBody = document.getElementById(
        "classFeeReportBody"
    );

    const statusElement = document.getElementById(
        "classFeeReportStatus"
    );

    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="8">Loading class reports...</td>
        </tr>
    `;

    try {

        // LOAD STUDENTS
        const { data: students, error: studentsError } =
            await supabaseClient
                .from("students")
                .select("id, class_name");

        if (studentsError) throw studentsError;

        // LOAD FEE STATEMENTS
        const { data: statements, error: statementsError } =
            await supabaseClient
                .from("fee_statements")
                .select("id, student_id, previous_balance");

        if (statementsError) throw statementsError;

        const statementList = statements || [];

        const statementIds = statementList.map(
            statement => statement.id
        );

        let items = [];
        let payments = [];

        if (statementIds.length > 0) {

            const { data: itemData, error: itemError } =
                await supabaseClient
                    .from("fee_statement_items")
                    .select("statement_id, amount")
                    .in("statement_id", statementIds);

            if (itemError) throw itemError;

            items = itemData || [];

            const { data: paymentData, error: paymentError } =
                await supabaseClient
                    .from("fee_payments")
                    .select("statement_id, amount")
                    .in("statement_id", statementIds);

            if (paymentError) throw paymentError;

            payments = paymentData || [];
        }

        // GROUP STUDENTS BY CLASS
        const classReports = {};

        (students || []).forEach(student => {

            const className = student.class_name || "Unassigned";

            if (!classReports[className]) {

                classReports[className] = {
                    students: 0,
                    paid: 0,
                    partial: 0,
                    unpaid: 0,
                    charged: 0,
                    collected: 0,
                    outstanding: 0
                };

            }

            const report = classReports[className];

            report.students++;

            const studentStatements = statementList.filter(
                statement => statement.student_id === student.id
            );

            let totalCharges = 0;
            let totalPaid = 0;

            studentStatements.forEach(statement => {

                totalCharges += Number(
                    statement.previous_balance || 0
                );

                items
                    .filter(item => item.statement_id === statement.id)
                    .forEach(item => {
                        totalCharges += Number(item.amount || 0);
                    });

                payments
                    .filter(payment => payment.statement_id === statement.id)
                    .forEach(payment => {
                        totalPaid += Number(payment.amount || 0);
                    });

            });

            const outstanding = Math.max(
                0,
                totalCharges - totalPaid
            );

            report.charged += totalCharges;
            report.collected += totalPaid;
            report.outstanding += outstanding;

            if (studentStatements.length > 0) {

                if (outstanding <= 0) {
                    report.paid++;

                } else if (totalPaid > 0) {
                    report.partial++;

                } else {
                    report.unpaid++;
                }

            }

        });

        // FORMAT CURRENCY
        const formatMoney = amount =>
            "KSh " + amount.toLocaleString("en-KE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

       // ALL SCHOOL CLASSES
const schoolClasses = [
    "Year 7",
    "Year 8",
    "Year 9",
    "Year 10A",
    "Year 10B",
    "Year 11A",
    "Year 11B",
    "Year 12",
    "Year 13A",
    "Year 13B"
];

// ENSURE EVERY CLASS APPEARS
schoolClasses.forEach(className => {

    if (!classReports[className]) {

        classReports[className] = {
            students: 0,
            paid: 0,
            partial: 0,
            unpaid: 0,
            charged: 0,
            collected: 0,
            outstanding: 0
        };

    }

});

const classNames = schoolClasses;

        tableBody.innerHTML = "";

        if (classNames.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">No student records found.</td>
                </tr>
            `;

        } else {

            classNames.forEach(className => {

                const report = classReports[className];

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td><strong>${className}</strong></td>
                    <td>${report.students}</td>
                    <td>${report.paid}</td>
                    <td>${report.partial}</td>
                    <td>${report.unpaid}</td>
                    <td>${formatMoney(report.charged)}</td>
                    <td>${formatMoney(report.collected)}</td>
                    <td>${formatMoney(report.outstanding)}</td>
                `;

                tableBody.appendChild(row);

            });

        }

        // UPDATE SUMMARY CARDS
        const totalStudents = (students || []).length;

        const totalCollected = Object.values(classReports)
            .reduce((sum, report) => sum + report.collected, 0);

        const totalOutstanding = Object.values(classReports)
            .reduce((sum, report) => sum + report.outstanding, 0);

        document.getElementById("classFeeTotalClasses").textContent =
            classNames.length;

        document.getElementById("classFeeTotalStudents").textContent =
            totalStudents;

        document.getElementById("classFeeTotalCollected").textContent =
            formatMoney(totalCollected);

        document.getElementById("classFeeTotalOutstanding").textContent =
            formatMoney(totalOutstanding);

        if (statusElement) {
            statusElement.textContent =
                "Class financial reports updated successfully.";
        }

    } catch (error) {

        console.error("CLASS FEE REPORT ERROR:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Unable to load class reports.
                </td>
            </tr>
        `;

        if (statusElement) {
            statusElement.textContent =
                "Error loading reports: " + error.message;
        }

    }

}

// REFRESH CLASS REPORT
document.getElementById("refreshClassFeeReport")
    ?.addEventListener("click", loadClassFeeReport);

// ==========================================
// TERMLY FINANCIAL SUMMARIES
// ==========================================

const schoolReportClasses = [
    "Year 7",
    "Year 8",
    "Year 9",
    "Year 10A",
    "Year 10B",
    "Year 11A",
    "Year 11B",
    "Year 12",
    "Year 13A",
    "Year 13B"
];

const termReportYearSelect = document.getElementById(
    "termReportAcademicYear"
);

// LOAD AVAILABLE ACADEMIC YEARS
async function loadTermReportAcademicYears() {

    if (!termReportYearSelect) return;

    try {

        const { data, error } = await supabaseClient
            .from("fee_statements")
            .select("academic_year");

        if (error) throw error;

        const years = [...new Set(
            (data || [])
                .map(item => String(item.academic_year))
                .filter(Boolean)
        )].sort((a, b) => b.localeCompare(a, undefined, {
            numeric: true
        }));

        termReportYearSelect.innerHTML =
            '<option value="">Select academic year</option>';

        years.forEach(year => {

            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;

            termReportYearSelect.appendChild(option);

        });

    } catch (error) {

        console.error("ACADEMIC YEARS ERROR:", error);

        termReportYearSelect.innerHTML =
            '<option value="">Unable to load years</option>';

    }

}


// GENERATE TERMLY REPORT
async function generateTermFinancialReport() {

    const year = document.getElementById(
        "termReportAcademicYear"
    ).value;

    const term = document.getElementById(
        "termReportTerm"
    ).value;

    const status = document.getElementById(
        "termFinancialReportStatus"
    );

    const output = document.getElementById(
        "termFinancialReportOutput"
    );

    const generateButton = document.getElementById(
        "generateTermFinancialReport"
    );

    if (!year || !term) {

        alert("Please select both the academic year and term.");
        return;

    }

    generateButton.disabled = true;
    generateButton.textContent = "Generating Report...";

    status.textContent = "Calculating financial performance...";
    output.style.display = "none";

    try {

        // LOAD SELECTED TERM STATEMENTS
        const { data: statements, error: statementError } =
            await supabaseClient
                .from("fee_statements")
                .select("id, student_id, previous_balance")
                .eq("academic_year", year)
                .eq("term", term);

        if (statementError) throw statementError;

        const statementList = statements || [];

        const statementIds = statementList.map(
            statement => statement.id
        );

        const studentIds = [
            ...new Set(statementList.map(
                statement => statement.student_id
            ))
        ];

        let students = [];
        let items = [];
        let payments = [];

        if (statementIds.length > 0) {

            // LOAD STUDENTS
            const { data: studentData, error: studentError } =
                await supabaseClient
                    .from("students")
                    .select("id, class_name")
                    .in("id", studentIds);

            if (studentError) throw studentError;

            students = studentData || [];

            // LOAD FEE CHARGES
            const { data: itemData, error: itemError } =
                await supabaseClient
                    .from("fee_statement_items")
                    .select("statement_id, amount")
                    .in("statement_id", statementIds);

            if (itemError) throw itemError;

            items = itemData || [];

            // LOAD PAYMENTS
            const { data: paymentData, error: paymentError } =
                await supabaseClient
                    .from("fee_payments")
                    .select("statement_id, amount")
                    .in("statement_id", statementIds);

            if (paymentError) throw paymentError;

            payments = paymentData || [];

        }

        // INITIALISE ALL SCHOOL CLASSES
        const classReports = {};

        schoolReportClasses.forEach(className => {

            classReports[className] = {
                students: new Set(),
                paid: 0,
                partial: 0,
                unpaid: 0,
                charged: 0,
                collected: 0,
                outstanding: 0
            };

        });

        let totalCharged = 0;
        let totalCollected = 0;
        let totalOutstanding = 0;

        let totalPaidStudents = 0;
        let totalPartialStudents = 0;
        let totalUnpaidStudents = 0;

        // CALCULATE EACH STUDENT'S FINANCES
        const studentTotals = {};

        statementList.forEach(statement => {

            const student = students.find(
                item => item.id === statement.student_id
            );

            if (!student) return;

            const className = student.class_name;

            if (!classReports[className]) return;

            const statementCharges = items
                .filter(item => item.statement_id === statement.id)
                .reduce(
                    (sum, item) => sum + Number(item.amount || 0),
                    0
                );

            const statementPayments = payments
                .filter(payment => payment.statement_id === statement.id)
                .reduce(
                    (sum, payment) => sum + Number(payment.amount || 0),
                    0
                );

            const statementTotal =
                Number(statement.previous_balance || 0) +
                statementCharges;

            if (!studentTotals[student.id]) {

                studentTotals[student.id] = {
                    className,
                    charged: 0,
                    collected: 0
                };

            }

            studentTotals[student.id].charged += statementTotal;
            studentTotals[student.id].collected += statementPayments;

        });

        // CLASS AND SCHOOL TOTALS
        Object.entries(studentTotals).forEach(
            ([studentId, studentData]) => {

                const report = classReports[studentData.className];

                const outstanding = Math.max(
                    0,
                    studentData.charged - studentData.collected
                );

                report.students.add(studentId);

                report.charged += studentData.charged;
                report.collected += studentData.collected;
                report.outstanding += outstanding;

                totalCharged += studentData.charged;
                totalCollected += studentData.collected;
                totalOutstanding += outstanding;

                if (outstanding <= 0) {

                    report.paid++;
                    totalPaidStudents++;

                } else if (studentData.collected > 0) {

                    report.partial++;
                    totalPartialStudents++;

                } else {

                    report.unpaid++;
                    totalUnpaidStudents++;

                }

            }
        );

        // FORMAT CURRENCY
        const money = amount =>
            "KSh " + Number(amount).toLocaleString("en-KE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        // UPDATE REPORT HEADING
        document.getElementById(
            "termReportHeading"
        ).textContent = `${year} — ${term} Financial Summary`;

        document.getElementById(
            "termReportGeneratedDate"
        ).textContent =
            "Generated on " +
            new Date().toLocaleDateString("en-KE");

        // UPDATE SUMMARY CARDS
        document.getElementById(
            "termReportTotalCharged"
        ).textContent = money(totalCharged);

        document.getElementById(
            "termReportTotalCollected"
        ).textContent = money(totalCollected);

        document.getElementById(
            "termReportOutstanding"
        ).textContent = money(totalOutstanding);

        document.getElementById(
            "termReportStudents"
        ).textContent = Object.keys(studentTotals).length;

        // UPDATE PAYMENT PERFORMANCE
        document.getElementById(
            "termReportPaid"
        ).textContent = totalPaidStudents;

        document.getElementById(
            "termReportPartial"
        ).textContent = totalPartialStudents;

        document.getElementById(
            "termReportUnpaid"
        ).textContent = totalUnpaidStudents;

        // UPDATE CLASS BREAKDOWN
        const tableBody = document.getElementById(
            "termReportClassBody"
        );

        tableBody.innerHTML = "";

        schoolReportClasses.forEach(className => {

            const report = classReports[className];

            const row = document.createElement("tr");

            const values = [
                className,
                report.students.size,
                report.paid,
                report.partial,
                report.unpaid,
                money(report.charged),
                money(report.collected),
                money(report.outstanding)
            ];

            values.forEach((value, index) => {

                const cell = document.createElement("td");

                if (index === 0) {

                    const strong = document.createElement("strong");
                    strong.textContent = value;
                    cell.appendChild(strong);

                } else {

                    cell.textContent = value;

                }

                row.appendChild(cell);

            });

            tableBody.appendChild(row);

        });

        output.style.display = "block";

        document.getElementById(
            "printTermFinancialReport"
        ).style.display = "inline-flex";

        status.textContent =
            "Financial report generated successfully.";

    } catch (error) {

        console.error("TERM FINANCIAL REPORT ERROR:", error);

        status.textContent =
            "Unable to generate report: " + error.message;

    } finally {

        generateButton.disabled = false;
        generateButton.textContent =
            "📊 Generate Financial Report";

    }

}


// GENERATE REPORT BUTTON
document.getElementById("generateTermFinancialReport")
    ?.addEventListener("click", generateTermFinancialReport);

// ==========================================
// PRINT TERMLY FINANCIAL REPORT
// ==========================================

function printTermFinancialReport() {

    const report = document.getElementById(
        "termFinancialReportOutput"
    );

    if (!report || report.style.display === "none") {
        alert("Please generate a financial report first.");
        return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Please allow pop-ups for this website.");
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Three Rivers Academy - Financial Report</title>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 25px;
                    color: #263b32;
                }

                .term-report-title {
                    text-align: center;
                    background: #173f34;
                    color: white;
                    padding: 20px;
                }

                .term-report-summary-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin: 20px 0;
                }

                .term-report-stat {
                    padding: 15px;
                    border: 1px solid #ddd;
                }

                .term-report-stat span,
                .term-report-stat strong {
                    display: block;
                    margin-bottom: 8px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10px;
                }

                th {
                    background: #173f34;
                    color: white;
                }

                th, td {
                    padding: 9px 6px;
                    border: 1px solid #ddd;
                    text-align: left;
                }

                @page {
                    size: A4 landscape;
                    margin: 12mm;
                }

                @media print {
                    * {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            ${report.innerHTML}
        </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
    };
}

// ==========================================
// FEE MANAGEMENT CATEGORY NAVIGATION
// ==========================================

const feeCategoryDashboard = document.querySelector(
    ".fee-category-dashboard"
);

const feeCategoryCards = document.querySelectorAll(
    ".fee-category-card"
);

const feeCategoryViews = document.querySelectorAll(
    ".fee-category-view"
);

const feeCategoryBackButtons = document.querySelectorAll(
    ".fee-category-back"
);


// OPEN SELECTED CATEGORY

feeCategoryCards.forEach(card => {

    card.addEventListener("click", () => {

        const target = card.dataset.feeTarget;

        const selectedView = document.querySelector(
            `.fee-category-view[data-fee-view="${target}"]`
        );

        if (!selectedView) return;

        // Hide category landing page
        feeCategoryDashboard.style.display = "none";

        // Hide all category views
        feeCategoryViews.forEach(view => {
            view.style.display = "none";
        });

        // Show selected category
        selectedView.style.display = "block";

        // Update active card
        feeCategoryCards.forEach(item => {
            item.classList.remove("active");
        });

        card.classList.add("active");

        // Scroll to the selected category
        document.querySelector(".admin-dashboard-header")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    });

});


// RETURN TO CATEGORY LANDING PAGE

feeCategoryBackButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Hide all category views
        feeCategoryViews.forEach(view => {
            view.style.display = "none";
        });

        // Show category landing page
        feeCategoryDashboard.style.display = "block";

        // Remove active card styling
        feeCategoryCards.forEach(card => {
            card.classList.remove("active");
        });

        // Return to category cards
        feeCategoryDashboard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});

// ==========================================
// FEE MANAGEMENT PAGE STARTUP
// ==========================================

if (
    window.location.pathname.includes("admin-fees.html")
) {
    loadFeeManagementStudents();
    loadFeeAuditLogs();
    loadClassFeeReport();
    loadTermReportAcademicYears();
}

// ==========================================
// ADMIN FEE MANAGEMENT - STATEMENT FORM
// ==========================================

const feeModal = document.getElementById("feeStatementModal");
const feeForm = document.getElementById("feeStatementForm");
const feeItemsContainer = document.getElementById("feeItemsContainer");


// ==========================================
// OPEN AND CLOSE MODAL
// ==========================================

const openFeeStatementModal = () => {

    if (!window.selectedFeeStudent) {
        alert("Please select a student first.");
        return;
    }

    document.getElementById("feeModalStudentName").textContent =
    window.selectedFeeStudent.full_name || "Selected Student";

    feeForm.reset();

    feeItemsContainer.innerHTML = "";

    addFeeItemRow();

    document.getElementById("feeAcademicYear").value =
        new Date().getFullYear();

    document.getElementById("feePreviousBalance").value = 0;

    updateFeeChargesTotal();

    feeModal.style.display = "flex";
};


const closeFeeStatementModal = () => {
    feeModal.style.display = "none";
};


document.getElementById("createFeeStatementButton")
    ?.addEventListener("click", openFeeStatementModal);

document.getElementById("closeFeeModal")
    ?.addEventListener("click", closeFeeStatementModal);

document.getElementById("cancelFeeStatement")
    ?.addEventListener("click", closeFeeStatementModal);


// ==========================================
// ADD FEE CHARGE ROW
// ==========================================

function addFeeItemRow() {

    const row = document.createElement("div");
    row.className = "fee-item-row";

    const description = document.createElement("input");

    description.type = "text";
    description.className = "fee-item-description";
    description.placeholder = "Charge description";
    description.required = true;

    const amount = document.createElement("input");

    amount.type = "number";
    amount.className = "fee-item-amount";
    amount.placeholder = "Amount (KSh)";
    amount.min = "0.01";
    amount.step = "0.01";
    amount.required = true;

    const removeButton = document.createElement("button");

    removeButton.type = "button";
    removeButton.className = "remove-fee-item";
    removeButton.textContent = "×";

    amount.addEventListener("input", updateFeeChargesTotal);

    removeButton.addEventListener("click", () => {

        row.remove();

        updateFeeChargesTotal();

    });

    row.appendChild(description);
    row.appendChild(amount);
    row.appendChild(removeButton);

    feeItemsContainer.appendChild(row);
}


// ==========================================
// ADD CHARGE BUTTON
// ==========================================

document.getElementById("addFeeItemButton")
    ?.addEventListener("click", addFeeItemRow);



function updateFeeChargesTotal() {

    const amountInputs = document.querySelectorAll(
        "#feeItemsContainer .fee-item-amount"
    );

    let newCharges = 0;

    amountInputs.forEach(input => {
        newCharges += Number(input.value) || 0;
    });

    const previousBalance =
        Number(document.getElementById("feePreviousBalance")?.value) || 0;

    const totalPayable = previousBalance + newCharges;

    const formatCurrency = amount =>
        "KSh " + amount.toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const previousElement = document.getElementById(
        "feePreviewPreviousBalance"
    );

    const chargesElement = document.getElementById(
        "feePreviewNewCharges"
    );

    const totalElement = document.getElementById(
        "feePreviewTotalPayable"
    );

    if (previousElement) {
        previousElement.textContent = formatCurrency(previousBalance);
    }

    if (chargesElement) {
        chargesElement.textContent = formatCurrency(newCharges);
    }

    if (totalElement) {
        totalElement.textContent = formatCurrency(totalPayable);
    }
}

// Update summary when previous balance changes
document.getElementById("feePreviousBalance")
    ?.addEventListener("input", updateFeeChargesTotal);


// ==========================================
// SAVE FEE STATEMENT
// ==========================================

feeForm?.addEventListener("submit", async function (event) {

    event.preventDefault();

    const student = window.selectedFeeStudent;

    if (!student) {
        alert("Please select a student.");
        return;
    }

    const saveButton = document.getElementById("saveFeeStatement");

    const academicYear = document.getElementById(
        "feeAcademicYear"
    ).value.trim();

    const term = document.getElementById(
        "feeTerm"
    ).value;

    const previousBalance = Number(
        document.getElementById("feePreviousBalance").value
    );

    const dueDate = document.getElementById(
        "feeDueDate"
    ).value || null;

    const notes = document.getElementById(
        "feeStatementNotes"
    ).value.trim();

    const itemRows = document.querySelectorAll(".fee-item-row");

    const feeItems = [];

    itemRows.forEach(row => {

        const description = row.querySelector(
            ".fee-item-description"
        ).value.trim();

        const amount = Number(
            row.querySelector(".fee-item-amount").value
        );

        if (description && amount > 0) {

            feeItems.push({
                description,
                amount
            });

        }

    });


    // VALIDATION

    if (!academicYear || !term) {
        alert("Please enter the academic year and term.");
        return;
    }

    if (!Number.isFinite(previousBalance) || previousBalance < 0) {
        alert("Please enter a valid previous balance.");
        return;
    }

    if (feeItems.length === 0) {
        alert("Please add at least one valid fee charge.");
        return;
    }

    if (feeItems.length !== itemRows.length) {
        alert("Please complete every fee charge row or remove the empty rows.");
        return;
    }


    const totalCharges = feeItems.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    saveButton.disabled = true;
    saveButton.textContent = "Saving Statement...";


    try {

        // CREATE STATEMENT

        const { data: statement, error: statementError } =
            await supabaseClient
                .from("fee_statements")
                .insert({
                    student_id: student.id,
                    academic_year: academicYear,
                    term: term,
                    previous_balance: previousBalance,
                    due_date: dueDate,
                    notes: notes || null,
                    created_by: (await supabaseClient.auth.getUser()).data.user?.id
                })
                .select()
                .single();


        if (statementError) {
            throw statementError;
        }


        // SAVE INDIVIDUAL CHARGES

        const feeItemsToInsert = feeItems.map(item => ({
            statement_id: statement.id,
            description: item.description,
            amount: item.amount
        }));


        const { error: itemsError } = await supabaseClient
            .from("fee_statement_items")
            .insert(feeItemsToInsert);


        if (itemsError) {

            // Remove incomplete statement if charge insertion fails

            await supabaseClient
                .from("fee_statements")
                .delete()
                .eq("id", statement.id);

            throw itemsError;
        }


        alert(
            "Fee statement successfully created for " +
            student.full_name +
            "!\n\nTotal new charges: KSh " +
            totalCharges.toLocaleString("en-KE")
        );

        closeFeeStatementModal();

        feeForm.reset();

        feeItemsContainer.innerHTML = "";

        addFeeItemRow();

        // Refresh the selected student's statements
        if (typeof loadStudentFeeStatements === "function") {
            await loadStudentFeeStatements(student.id);
        }

    } catch (error) {

        console.error("FEE STATEMENT SAVE ERROR:", error);

        if (error.code === "23505") {

            alert(
                "A fee statement already exists for this student, academic year and term."
            );

        } else {

            alert(
                "Unable to save the fee statement: " +
                (error.message || "Unknown error")
            );

        }

    } finally {

        saveButton.disabled = false;
        saveButton.textContent = "Save Fee Statement";

    }

});

// ==========================================
// GENERATE PRINTABLE FEE STATEMENT
// ==========================================

function openFeeStatementPrintView(
    student,
    statement,
    items,
    payments,
    totals
) {

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Please allow pop-ups to print the fee statement.");
        return;
    }

    const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    const money = amount =>
        "KSh " + Number(amount || 0).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const formatDate = date =>
        date
            ? new Date(date + (String(date).length === 10 ? "T00:00:00" : ""))
                .toLocaleDateString("en-KE")
            : "Not specified";

    const chargeRows = items.map(item => `
        <tr>
            <td>${escapeHTML(item.description)}</td>
            <td>${money(item.amount)}</td>
        </tr>
    `).join("");

    const paymentRows = payments.map(payment => `
        <tr>
            <td>${formatDate(payment.payment_date)}</td>
            <td>${escapeHTML(payment.payment_method || "—")}</td>
            <td>${escapeHTML(payment.reference_number || "—")}</td>
            <td>${money(payment.amount)}</td>
        </tr>
    `).join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Fee Statement - ${escapeHTML(student.full_name)}</title>

        <style>
            body {
                font-family: Arial, sans-serif;
                color: #183b2e;
                padding: 35px;
                max-width: 850px;
                margin: auto;
            }

            .header {
                background: #104b36;
                color: white;
                padding: 25px;
                border-radius: 12px;
                margin-bottom: 25px;
            }

            .header h1 {
                margin: 0 0 8px;
            }

            .header p {
                margin: 0;
                color: #d8eadf;
            }

            .section {
                margin: 25px 0;
            }

            .details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                background: #f1f6f2;
                padding: 18px;
                border-radius: 10px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 12px;
            }

            th, td {
                padding: 12px;
                border-bottom: 1px solid #dce7df;
                text-align: left;
            }

            th {
                background: #eaf2ec;
                color: #104b36;
            }

            .summary {
                background: #f1f6f2;
                padding: 20px;
                border-radius: 10px;
            }

            .summary p {
                display: flex;
                justify-content: space-between;
                gap: 15px;
            }

            .balance {
                color: #a16207;
                font-size: 20px;
                font-weight: bold;
                border-top: 2px solid #cbded0;
                padding-top: 15px;
            }

            .notes {
                background: #fff8e8;
                padding: 15px;
                border-radius: 8px;
            }

            .print-button {
                background: #104b36;
                color: white;
                border: none;
                padding: 13px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                margin-bottom: 25px;
            }

            @media print {
                body {
                    padding: 0;
                }

                .print-button {
                    display: none;
                }

                .header {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }

                th, .details, .summary {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
            }
        </style>
    </head>

    <body>

        <button class="print-button" onclick="window.print()">
            Print / Save as PDF
        </button>

        <div class="header">
            <h1>THREE RIVERS ACADEMY</h1>
            <p>Official Student Fee Statement</p>
        </div>

        <div class="section">
            <h2>Student Information</h2>

            <div class="details">
                <div><strong>Name:</strong> ${escapeHTML(student.full_name)}</div>
                <div><strong>Admission No:</strong> ${escapeHTML(student.admission_number)}</div>
                <div><strong>Class:</strong> ${escapeHTML(student.class_name)}</div>
                <div><strong>Academic Year:</strong> ${escapeHTML(statement.academic_year)}</div>
                <div><strong>Term:</strong> ${escapeHTML(statement.term)}</div>
                <div><strong>Due Date:</strong> ${formatDate(statement.due_date)}</div>
            </div>
        </div>

        <div class="section">
            <h2>Fee Charges</h2>

            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>

                <tbody>
                    ${chargeRows || "<tr><td colspan='2'>No charges recorded</td></tr>"}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Payment Records</h2>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th>Amount</th>
                    </tr>
                </thead>

                <tbody>
                    ${paymentRows || "<tr><td colspan='4'>No payments recorded</td></tr>"}
                </tbody>
            </table>
        </div>

        <div class="section summary">
            <h2>Financial Summary</h2>

            <p><span>Previous Balance</span><strong>${money(totals.previousBalance)}</strong></p>
            <p><span>New Charges</span><strong>${money(totals.itemTotal)}</strong></p>
            <p><span>Total Payable</span><strong>${money(totals.statementTotal)}</strong></p>
            <p><span>Total Paid</span><strong>${money(totals.paidTotal)}</strong></p>

            <p class="balance">
                <span>Outstanding Balance</span>
                <strong>${money(totals.outstanding)}</strong>
            </p>
        </div>

        ${statement.notes ? `
            <div class="section notes">
                <strong>Additional Notes:</strong>
                <p>${escapeHTML(statement.notes)}</p>
            </div>
        ` : ""}

        <p style="margin-top:35px; color:#64748b; font-size:12px;">
            Generated on ${new Date().toLocaleDateString("en-KE")}
            | Three Rivers Academy
        </p>

    </body>
    </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}


// ==========================================
// ADMIN FEE MANAGEMENT - LOAD STATEMENTS
// ==========================================

async function loadStudentFeeStatements(studentId) {

    const container = document.getElementById(
        "feeStatementsContainer"
    );

    if (!container) return;

    container.innerHTML = "<p>Loading fee statements...</p>";

    try {

        const { data: statements, error } = await supabaseClient
            .from("fee_statements")
            .select("*")
            .eq("student_id", studentId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        const statementList = statements || [];

        const statementIds = statementList.map(
            statement => statement.id
        );

        let items = [];
        let payments = [];

        if (statementIds.length > 0) {

            const { data: itemData, error: itemError } =
                await supabaseClient
                    .from("fee_statement_items")
                    .select("*")
                    .in("statement_id", statementIds);

            if (itemError) throw itemError;

            items = itemData || [];

            const { data: paymentData, error: paymentError } =
                await supabaseClient
                    .from("fee_payments")
                    .select("*")
                    .in("statement_id", statementIds);

            if (paymentError) throw paymentError;

            payments = paymentData || [];
        }

        let totalCharges = 0;
        let totalPaid = 0;

        container.innerHTML = "";

        if (statementList.length === 0) {

            container.innerHTML =
                "<p>No fee statements have been created for this student yet.</p>";

        }

        statementList.forEach(statement => {

            const statementItems = items.filter(
                item => item.statement_id === statement.id
            );

            const statementPayments = payments.filter(
                payment => payment.statement_id === statement.id
            );

            const itemTotal = statementItems.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0
            );

            const previousBalance = Number(
                statement.previous_balance || 0
            );

            const paidTotal = statementPayments.reduce(
                (sum, payment) => sum + Number(payment.amount || 0),
                0
            );

            const statementTotal = previousBalance + itemTotal;

            const outstanding = statementTotal - paidTotal;

            totalCharges += statementTotal;
            totalPaid += paidTotal;

            const card = document.createElement("div");
            card.className = "fee-statement-card";

            const heading = document.createElement("h3");

            heading.textContent =
                statement.academic_year + " — " + statement.term;

            card.appendChild(heading);

            const dueDate = document.createElement("p");

            dueDate.textContent =
                "Due date: " + (statement.due_date || "Not specified");

            card.appendChild(dueDate);

            const itemsHeading = document.createElement("h4");
            itemsHeading.textContent = "Fee Charges";

            card.appendChild(itemsHeading);

            statementItems.forEach(item => {

                const row = document.createElement("p");

                row.textContent =
                    item.description + ": KSh " +
                    Number(item.amount).toLocaleString("en-KE");

                card.appendChild(row);

            });

            const previous = document.createElement("p");

            previous.textContent =
                "Previous balance: KSh " +
                previousBalance.toLocaleString("en-KE");

            card.appendChild(previous);

            const total = document.createElement("p");

            total.textContent =
                "Total charges: KSh " +
                statementTotal.toLocaleString("en-KE");

            card.appendChild(total);

            const paid = document.createElement("p");

            paid.textContent =
                "Total paid: KSh " +
                paidTotal.toLocaleString("en-KE");

            card.appendChild(paid);

            const balance = document.createElement("p");

            balance.textContent =
                "Outstanding balance: KSh " +
                outstanding.toLocaleString("en-KE");

            card.appendChild(balance);

            if (statement.notes) {

                const notes = document.createElement("p");

                notes.textContent = "Notes: " + statement.notes;

                card.appendChild(notes);
            }

            // RECORD PAYMENT BUTTON

const paymentButton = document.createElement("button");

paymentButton.type = "button";
paymentButton.className = "record-fee-payment-button";
paymentButton.textContent = "Record Payment";

paymentButton.addEventListener("click", () => {
    openFeePaymentModal(statement.id);
});

card.appendChild(paymentButton);

            // DOWNLOAD PDF BUTTON
const downloadButton = document.createElement("button");

downloadButton.type = "button";
downloadButton.className = "download-fee-statement-button";
downloadButton.textContent = "Download PDF";

downloadButton.addEventListener("click", () => {
    if (!window.selectedFeeStudent) {
        alert("Please select a student first.");
        return;
    }

    openFeeStatementPrintView(
        window.selectedFeeStudent,
        statement,
        statementItems,
        statementPayments,
        {
            previousBalance,
            itemTotal,
            statementTotal,
            paidTotal,
            outstanding
        }
    );
});

card.appendChild(downloadButton);

            // SEND FEE REMINDER BUTTON
if (outstanding > 0) {

    const reminderButton = document.createElement("button");

    reminderButton.type = "button";
    reminderButton.className = "send-fee-reminder-button";
    reminderButton.textContent = "Send Fee Reminder";

    reminderButton.addEventListener("click", async () => {

        const student = window.selectedFeeStudent;

        if (!student) {
            alert("Please select a student first.");
            return;
        }

        const confirmed = confirm(
            `Send a fee reminder for ${student.full_name}?\n\n` +
            `Outstanding balance: KSh ${outstanding.toLocaleString("en-KE")}`
        );

        if (!confirmed) return;

        reminderButton.disabled = true;
        reminderButton.textContent = "Sending...";

        try {

            const { data: parentLinks, error: parentError } =
                await supabaseClient
                    .from("parent_students")
                    .select("parent_id")
                    .eq("student_id", student.id);

            if (parentError) throw parentError;

            if (!parentLinks || parentLinks.length === 0) {
                alert("No parent account is linked to this student.");
                return;
            }

          // GET PREVIOUS REMINDERS FOR THIS STUDENT
const { data: previousReminders, error: previousError } =
    await supabaseClient
        .from("parent_fee_reminders")
        .select("id")
        .eq("student_id", student.id);

if (previousError) throw previousError;

// PREPARE NEW REMINDERS
const reminders = parentLinks.map(link => ({
    parent_id: link.parent_id,
    student_id: student.id,
    statement_id: statement.id,
    title: "Fee Payment Reminder",
    message:
        `A fee balance remains outstanding for ${student.full_name} ` +
        `(${statement.academic_year} — ${statement.term}).`,
    amount: outstanding,
    status: "active"
}));

// SEND NEW REMINDERS
const { error: newReminderError } = await supabaseClient
    .from("parent_fee_reminders")
    .insert(reminders);

if (newReminderError) throw newReminderError;

// DELETE PREVIOUS REMINDERS
const previousReminderIds = (previousReminders || [])
    .map(reminder => reminder.id);

if (previousReminderIds.length > 0) {

    const { data: deletedReminders, error: deleteError } =
        await supabaseClient
            .from("parent_fee_reminders")
            .delete()
            .in("id", previousReminderIds)
            .select("id");

    if (deleteError) throw deleteError;

    if ((deletedReminders || []).length !== previousReminderIds.length) {
        throw new Error("Not all previous fee reminders could be deleted.");
    }
}

            alert("Fee reminder successfully sent to the linked parent account(s)!");

        } catch (error) {

            console.error("FEE REMINDER ERROR:", error);
            alert("Unable to send reminder: " + error.message);

        } finally {

            reminderButton.disabled = false;
            reminderButton.textContent = "Send Fee Reminder";

        }
    });

    card.appendChild(reminderButton);
}

            container.appendChild(card);

        });


        // UPDATE SUMMARY CARDS

        document.getElementById("feeTotalCharges").textContent =
            "KSh " + totalCharges.toLocaleString("en-KE");

        document.getElementById("feeTotalPaid").textContent =
            "KSh " + totalPaid.toLocaleString("en-KE");

        document.getElementById("feeOutstandingBalance").textContent =
            "KSh " + (totalCharges - totalPaid).toLocaleString("en-KE");


    } catch (error) {

        console.error("LOAD FEE STATEMENTS ERROR:", error);

        container.innerHTML =
            "<p>Unable to load fee statements. Please try again.</p>";

    }

}


// ==========================================
// ADMIN FEE MANAGEMENT - PAYMENT MODAL
// ==========================================

let selectedPaymentStatementId = null;

async function openFeePaymentModal(statementId) {

    const modal = document.getElementById("feePaymentModal");
    const select = document.getElementById("paymentStatementSelect");

    if (!modal || !select) return;

    selectedPaymentStatementId = statementId;

    select.innerHTML = "";

    const { data: statement, error } = await supabaseClient
        .from("fee_statements")
        .select("id, academic_year, term")
        .eq("id", statementId)
        .single();

    if (error || !statement) {
        console.error("PAYMENT STATEMENT ERROR:", error);
        alert("Unable to load the selected fee statement.");
        return;
    }

    const option = document.createElement("option");

    option.value = statement.id;
    option.textContent =
        statement.academic_year + " — " + statement.term;

    option.selected = true;

    select.appendChild(option);

    document.getElementById("feePaymentForm").reset();

    // Restore the selected statement after resetting the form
    select.value = statement.id;

    document.getElementById("paymentDate").value =
        new Date().toISOString().split("T")[0];

    modal.style.display = "flex";
}


// ==========================================
// CLOSE PAYMENT MODAL
// ==========================================

function closeFeePaymentModal() {

    document.getElementById("feePaymentModal").style.display = "none";

    selectedPaymentStatementId = null;
}


document.getElementById("closeFeePaymentModal")
    ?.addEventListener("click", closeFeePaymentModal);

document.getElementById("cancelFeePayment")
    ?.addEventListener("click", closeFeePaymentModal);


// ==========================================
// ADMIN FEE MANAGEMENT - SAVE PAYMENT
// ==========================================

document.getElementById("feePaymentForm")
    ?.addEventListener("submit", async function(event) {

    event.preventDefault();

    const statementId = selectedPaymentStatementId;

    const amount = Number(
        document.getElementById("paymentAmount").value
    );

    const paymentDate = document.getElementById(
        "paymentDate"
    ).value;

    const paymentMethod = document.getElementById(
        "paymentMethod"
    ).value;

    const referenceNumber = document.getElementById(
        "paymentReference"
    ).value.trim();

    const notes = document.getElementById(
        "paymentNotes"
    ).value.trim();

    const saveButton = document.getElementById("saveFeePayment");

    if (!statementId) {
        alert("Please select a fee statement.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid payment amount.");
        return;
    }

    if (!paymentDate || !paymentMethod) {
        alert("Please complete the payment date and method.");
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving Payment...";

    try {

        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError) throw userError;

        const { error } = await supabaseClient
            .from("fee_payments")
            .insert({
                statement_id: statementId,
                amount: amount,
                payment_date: paymentDate,
                payment_method: paymentMethod,
                reference_number: referenceNumber || null,
                notes: notes || null,
                recorded_by: userData.user?.id
            });

        if (error) throw error;

       // ==========================================
// UPDATE PARENT FEE REMINDERS
// ==========================================

// LOAD THE FEE STATEMENT
const { data: feeStatement, error: statementError } =
    await supabaseClient
        .from("fee_statements")
        .select("previous_balance")
        .eq("id", statementId)
        .single();

if (statementError) throw statementError;

// LOAD STATEMENT CHARGES
const { data: statementItems, error: itemsError } =
    await supabaseClient
        .from("fee_statement_items")
        .select("amount")
        .eq("statement_id", statementId);

if (itemsError) throw itemsError;

const itemTotalNow = (statementItems || []).reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
);

// LOAD ALL PAYMENTS FOR THIS STATEMENT
const { data: updatedPayments, error: updatedPaymentsError } =
    await supabaseClient
        .from("fee_payments")
        .select("amount")
        .eq("statement_id", statementId);

if (updatedPaymentsError) throw updatedPaymentsError;

const totalPaidNow = (updatedPayments || []).reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
);

// CALCULATE NEW OUTSTANDING BALANCE
const newOutstanding = Math.max(
    0,
    Number(feeStatement.previous_balance || 0) +
    itemTotalNow -
    totalPaidNow
);

// UPDATE LINKED PARENT REMINDERS
const { error: reminderUpdateError } =
    await supabaseClient
        .from("parent_fee_reminders")
        .update({
            amount: newOutstanding,
            status: newOutstanding <= 0 ? "resolved" : "active",
            message: newOutstanding <= 0
                ? "The fee balance for this statement has been fully paid."
                : `The updated outstanding fee balance is KSh ${newOutstanding.toLocaleString("en-KE")}.`
        })
        .eq("statement_id", statementId);

if (reminderUpdateError) throw reminderUpdateError;

        alert("Payment successfully recorded!");

        const studentId = window.selectedFeeStudent?.id;

        closeFeePaymentModal();

        if (studentId) {
            await loadStudentFeeStatements(studentId);
        }

    } catch (error) {

        console.error("SAVE FEE PAYMENT ERROR:", error);

        alert(
            "Unable to save payment: " +
            (error.message || "Unknown error")
        );

    } finally {

        saveButton.disabled = false;
        saveButton.textContent = "Save Payment";

    }

});


// ==========================================
// PARENT PORTAL - FEE STATEMENTS
// ==========================================

async function loadParentFeeStatements(studentId) {

    const container = document.getElementById(
        "parentFeeStatementsList"
    );

    if (!container) return;

    const totalChargesElement = document.getElementById(
        "parentFeeTotalCharges"
    );

    const totalPaidElement = document.getElementById(
        "parentFeeTotalPaid"
    );

    const outstandingElement = document.getElementById(
        "parentFeeOutstanding"
    );

    const formatMoney = amount =>
        "KSh " + Number(amount || 0).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const addFeeText = (parent, tag, value, className = "") => {

        const element = document.createElement(tag);

        element.textContent = value;

        if (className) {
            element.className = className;
        }

        parent.appendChild(element);

        return element;
    };

    container.innerHTML = "<p>Loading fee statements...</p>";

    if (totalChargesElement) totalChargesElement.textContent = formatMoney(0);
    if (totalPaidElement) totalPaidElement.textContent = formatMoney(0);
    if (outstandingElement) outstandingElement.textContent = formatMoney(0);

    try {

        // GET THIS CHILD'S FEE STATEMENTS

        const { data: statements, error: statementError } =
            await supabaseClient
                .from("fee_statements")
                .select("*")
                .eq("student_id", studentId)
                .order("created_at", { ascending: false });

        if (statementError) throw statementError;

        const statementList = statements || [];

        // LOAD PRIVATE PARENT FEE REMINDERS
const { data: feeReminders, error: reminderError } =
    await supabaseClient
        .from("parent_fee_reminders")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

if (reminderError) {
    console.error("Fee reminder loading error:", reminderError);
}

        if (statementList.length === 0) {
    container.innerHTML = "";
    addFeeText(
        container,
        "p",
        "No fee statements have been issued for this student yet.",
        "parent-loading"
    );
}

        const statementIds = statementList.map(
            statement => statement.id
        );

        // GET ALL STATEMENT CHARGES

        const { data: items, error: itemsError } =
            await supabaseClient
                .from("fee_statement_items")
                .select("*")
                .in("statement_id", statementIds);

        if (itemsError) throw itemsError;

        // GET ALL PAYMENTS

        const { data: payments, error: paymentsError } =
            await supabaseClient
                .from("fee_payments")
                .select("*")
                .in("statement_id", statementIds)
                .order("payment_date", { ascending: false });

        if (paymentsError) throw paymentsError;

        const feeItems = items || [];
        const feePayments = payments || [];

        let grandTotalCharges = 0;
        let grandTotalPaid = 0;

        container.innerHTML = "";

        // DISPLAY PARENT FEE REMINDERS
if (feeReminders && feeReminders.length > 0) {

    const reminderSection = document.createElement("div");
    reminderSection.className = "parent-fee-reminders-section";

    const reminderHeading = document.createElement("h3");
    reminderHeading.textContent = "Fee Payment Reminders";
    reminderSection.appendChild(reminderHeading);

    feeReminders.forEach(reminder => {

        const reminderCard = document.createElement("div");
        reminderCard.className = "parent-fee-reminder-card";

        const title = document.createElement("h4");
        title.textContent = reminder.title;

        const message = document.createElement("p");
        message.textContent = reminder.message;

        const amount = document.createElement("strong");
        amount.textContent =
            "Outstanding Amount: KSh " +
            Number(reminder.amount).toLocaleString("en-KE");

        const date = document.createElement("small");
        date.textContent =
            "Received: " +
            new Date(reminder.created_at).toLocaleDateString("en-KE");

        reminderCard.append(title, message, amount, date);

        if (!reminder.read_at) {
            reminderCard.classList.add("unread");
        }

        reminderSection.appendChild(reminderCard);
    });

    container.appendChild(reminderSection);
}

        // DISPLAY EACH STATEMENT

        statementList.forEach(statement => {

            const statementItems = feeItems.filter(
                item => item.statement_id === statement.id
            );

            const statementPayments = feePayments.filter(
                payment => payment.statement_id === statement.id
            );

            const previousBalance = Number(
                statement.previous_balance || 0
            );

            const newCharges = statementItems.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0
            );

            const total = previousBalance + newCharges;

            const paid = statementPayments.reduce(
                (sum, payment) => sum + Number(payment.amount || 0),
                0
            );

            const outstanding = total - paid;

            grandTotalCharges += total;
            grandTotalPaid += paid;

            // STATEMENT CARD

            const card = document.createElement("div");

            card.className = "parent-fee-statement-card";

            // HEADER

            const header = document.createElement("div");

            header.className = "parent-fee-statement-header";

            addFeeText(
                header,
                "h3",
                `${statement.academic_year} — ${statement.term}`
            );

            addFeeText(
                header,
                "span",
                outstanding <= 0 ? "Paid" : "Outstanding",
                outstanding <= 0
                    ? "parent-fee-paid-status"
                    : "parent-fee-outstanding-status"
            );

            card.appendChild(header);

            // DUE DATE

            addFeeText(
                card,
                "p",
                "Due date: " +
                (statement.due_date
                    ? new Date(statement.due_date + "T00:00:00")
                        .toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        })
                    : "Not specified")
            );

            // CHARGES

            const chargesSection = document.createElement("div");

            chargesSection.className = "parent-fee-charge-section";

            addFeeText(
                chargesSection,
                "h4",
                "Fee Breakdown"
            );

            if (previousBalance > 0) {

                const previousRow = document.createElement("div");

                previousRow.className = "parent-fee-row";

                addFeeText(
                    previousRow,
                    "span",
                    "Previous Balance"
                );

                addFeeText(
                    previousRow,
                    "strong",
                    formatMoney(previousBalance)
                );

                chargesSection.appendChild(previousRow);
            }

            statementItems.forEach(item => {

                const row = document.createElement("div");

                row.className = "parent-fee-row";

                addFeeText(
                    row,
                    "span",
                    item.description
                );

                addFeeText(
                    row,
                    "strong",
                    formatMoney(item.amount)
                );

                chargesSection.appendChild(row);

            });

            card.appendChild(chargesSection);

            // FINANCIAL SUMMARY

            const summary = document.createElement("div");

            summary.className = "parent-fee-statement-summary";

            const summaryRows = [
                ["Total Charges", formatMoney(total)],
                ["Total Paid", formatMoney(paid)],
                ["Outstanding Balance", formatMoney(outstanding)]
            ];

            summaryRows.forEach(([label, value]) => {

                const row = document.createElement("div");

                row.className = "parent-fee-row";

                addFeeText(row, "span", label);

                addFeeText(row, "strong", value);

                summary.appendChild(row);

            });

            card.appendChild(summary);

            // PAYMENT HISTORY

            const paymentSection = document.createElement("div");

            paymentSection.className = "parent-fee-payment-history";

            addFeeText(
                paymentSection,
                "h4",
                "Payment History"
            );

            if (statementPayments.length === 0) {

                addFeeText(
                    paymentSection,
                    "p",
                    "No payments have been recorded yet.",
                    "parent-loading"
                );

            } else {

                statementPayments.forEach(payment => {

                    const paymentCard = document.createElement("div");

                    paymentCard.className = "parent-fee-payment-item";

                    addFeeText(
                        paymentCard,
                        "strong",
                        formatMoney(payment.amount)
                    );

                    addFeeText(
                        paymentCard,
                        "span",
                        payment.payment_method || "Payment"
                    );

                    addFeeText(
                        paymentCard,
                        "small",
                        payment.payment_date
                            ? new Date(payment.payment_date + "T00:00:00")
                                .toLocaleDateString("en-KE", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })
                            : "Date unavailable"
                    );

                    if (payment.reference_number) {

                        addFeeText(
                            paymentCard,
                            "small",
                            "Reference: " + payment.reference_number
                        );

                    }

                    paymentSection.appendChild(paymentCard);

                });

            }

            card.appendChild(paymentSection);

            // ADDITIONAL NOTES

            if (statement.notes) {

                addFeeText(
                    card,
                    "p",
                    "School notes: " + statement.notes,
                    "parent-fee-notes"
                );

            }

            container.appendChild(card);

        });

        // UPDATE OVERALL SUMMARY

        if (totalChargesElement) {
            totalChargesElement.textContent =
                formatMoney(grandTotalCharges);
        }

        if (totalPaidElement) {
            totalPaidElement.textContent =
                formatMoney(grandTotalPaid);
        }

        if (outstandingElement) {
            outstandingElement.textContent =
                formatMoney(grandTotalCharges - grandTotalPaid);
        }

    } catch (error) {

        console.error("PARENT FEE STATEMENTS ERROR:", error);

        container.innerHTML = "";

        addFeeText(
            container,
            "p",
            "Unable to load fee statements. Please try again later.",
            "parent-loading"
        );

    }

}

// ==========================================
// PARENT PORTAL - TEACHER COMMUNICATION
// ==========================================

let parentTeacherDirectory = [];
let parentTeacherSubjects = [];


// ==========================================
// LOAD TEACHERS FOR SELECTED CHILD
// ==========================================

async function loadParentTeacherDirectory(studentId) {

    const teacherSelect = document.getElementById(
        "parentContactTeacher"
    );

    const subjectSelect = document.getElementById(
        "parentContactSubject"
    );

    if (!teacherSelect || !subjectSelect) return;

    teacherSelect.innerHTML =
        '<option value="">Loading teachers...</option>';

    subjectSelect.innerHTML =
        '<option value="">Select a teacher first</option>';

    try {

        // GET SUBJECTS BELONGING TO THIS STUDENT

        const { data: studentSubjects, error: studentSubjectsError } =
            await supabaseClient
                .from("student_subjects")
                .select(`
                    subject_id,
                    subjects (
                        id,
                        name,
                        code
                    )
                `)
                .eq("student_id", studentId);

        if (studentSubjectsError) throw studentSubjectsError;

        const subjects = studentSubjects || [];

        const subjectIds = [
            ...new Set(
                subjects.map(item => item.subject_id).filter(Boolean)
            )
        ];

        if (subjectIds.length === 0) {

            teacherSelect.innerHTML =
                '<option value="">No teachers available</option>';

            subjectSelect.innerHTML =
                '<option value="">No subjects available</option>';

            parentTeacherDirectory = [];
            parentTeacherSubjects = [];

            return;
        }


        // GET TEACHERS ASSIGNED TO THESE SUBJECTS

        const { data: teacherAssignments, error: assignmentsError } =
            await supabaseClient
                .from("teacher_subjects")
                .select("teacher_id, subject_id")
                .in("subject_id", subjectIds);

        if (assignmentsError) throw assignmentsError;

        const assignments = teacherAssignments || [];

        const teacherIds = [
            ...new Set(
                assignments.map(item => item.teacher_id).filter(Boolean)
            )
        ];

        if (teacherIds.length === 0) {

            teacherSelect.innerHTML =
                '<option value="">No teachers assigned yet</option>';

            subjectSelect.innerHTML =
                '<option value="">No subjects available</option>';

            parentTeacherDirectory = [];
            parentTeacherSubjects = [];

            return;
        }


        // GET TEACHER DETAILS

        const { data: teachers, error: teachersError } =
            await supabaseClient
                .from("teachers")
                .select("id, full_name, email")
                .in("id", teacherIds)
                .order("full_name", { ascending: true });

        if (teachersError) throw teachersError;


        // STORE THE DIRECTORY

        parentTeacherDirectory = teachers || [];

        parentTeacherSubjects = assignments.map(assignment => {

            const subjectRecord = subjects.find(
                item => item.subject_id === assignment.subject_id
            );

            const subject = Array.isArray(subjectRecord?.subjects)
                ? subjectRecord.subjects[0]
                : subjectRecord?.subjects;

            return {
                teacher_id: assignment.teacher_id,
                subject_id: assignment.subject_id,
                subject_name: subject?.name || "Subject",
                subject_code: subject?.code || ""
            };

        });


        // POPULATE TEACHER SELECT

        teacherSelect.innerHTML =
            '<option value="">Choose a teacher</option>';

        parentTeacherDirectory.forEach(teacher => {

            const option = document.createElement("option");

            option.value = teacher.id;
            option.textContent = teacher.full_name || "Teacher";

            teacherSelect.appendChild(option);

        });


        // RESET SUBJECT SELECT

        subjectSelect.innerHTML =
            '<option value="">Choose a teacher first</option>';


        // FILTER SUBJECTS WHEN TEACHER CHANGES

        if (!teacherSelect.dataset.communicationInitialized) {

            teacherSelect.dataset.communicationInitialized = "true";

            teacherSelect.addEventListener("change", () => {

                const teacherId = teacherSelect.value;

                subjectSelect.innerHTML =
                    '<option value="">Choose a subject</option>';

                if (!teacherId) return;

                const teacherSubjects = parentTeacherSubjects.filter(
                    item => item.teacher_id === teacherId
                );

                teacherSubjects.forEach(item => {

                    const option = document.createElement("option");

                    option.value = item.subject_id;

                    option.textContent = item.subject_code
                        ? `${item.subject_name} (${item.subject_code})`
                        : item.subject_name;

                    subjectSelect.appendChild(option);

                });

                if (teacherSubjects.length === 0) {

                    subjectSelect.innerHTML =
                        '<option value="">No subjects found</option>';

                }

            });

        }

    } catch (error) {

        console.error(
            "PARENT TEACHER DIRECTORY ERROR:",
            error
        );

        teacherSelect.innerHTML =
            '<option value="">Unable to load teachers</option>';

        subjectSelect.innerHTML =
            '<option value="">Unavailable</option>';

    }

}


// ==========================================
// LOAD PARENT COMMUNICATION HISTORY
// ==========================================

async function loadParentTeacherMessages(studentId) {

    const container = document.getElementById(
        "parentTeacherMessagesList"
    );

    if (!container) return;

    container.innerHTML =
        "<p>Loading communication history...</p>";

    try {

        const { data, error } = await supabaseClient
            .from("parent_teacher_messages")
            .select(`
                id,
                request_type,
                message,
                preferred_meeting_date,
                preferred_meeting_time,
                status,
                teacher_response,
                response_at,
                created_at,
                teachers (
                    full_name
                ),
                subjects (
                    name
                )
            `)
            .eq("student_id", studentId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        const messages = data || [];

        container.innerHTML = "";

        if (messages.length === 0) {

            const empty = document.createElement("p");

            empty.className = "parent-loading";

            empty.textContent =
                "You have not sent any messages or meeting requests for this child yet.";

            container.appendChild(empty);

            return;
        }


        // DISPLAY EACH COMMUNICATION

        messages.forEach(record => {

            const card = document.createElement("div");

            card.className = "parent-teacher-message-card";


            // HEADER

            const header = document.createElement("div");

            header.className = "parent-teacher-message-header";

            const heading = document.createElement("h4");

            heading.textContent =
                record.request_type === "meeting"
                    ? "Meeting Request"
                    : "Message to Teacher";

            const status = document.createElement("span");

            const statusValue = String(
                record.status || "pending"
            ).toLowerCase();

            status.className =
                `parent-communication-status status-${statusValue}`;

            status.textContent =
                statusValue.charAt(0).toUpperCase() +
                statusValue.slice(1);

            header.appendChild(heading);
            header.appendChild(status);

            card.appendChild(header);


            // TEACHER AND SUBJECT

            const teacher = document.createElement("p");

            teacher.textContent =
                "Teacher: " +
                (record.teachers?.full_name || "Teacher");

            card.appendChild(teacher);

            if (record.subjects?.name) {

                const subject = document.createElement("p");

                subject.textContent =
                    "Subject: " + record.subjects.name;

                card.appendChild(subject);

            }


            // MESSAGE

            const message = document.createElement("div");

            message.className = "parent-teacher-message-content";

            const messageHeading = document.createElement("strong");

            messageHeading.textContent = "Your message";

            const messageText = document.createElement("p");

            messageText.textContent = record.message;

            message.appendChild(messageHeading);
            message.appendChild(messageText);

            card.appendChild(message);


            // MEETING DETAILS

            if (
                record.request_type === "meeting" &&
                record.preferred_meeting_date
            ) {

                const meetingDetails = document.createElement("p");

                const meetingDate = new Date(
                    record.preferred_meeting_date + "T00:00:00"
                ).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                });

                meetingDetails.textContent =
                    "Preferred meeting: " +
                    meetingDate +
                    (
                        record.preferred_meeting_time
                            ? " at " + record.preferred_meeting_time.slice(0, 5)
                            : ""
                    );

                card.appendChild(meetingDetails);

            }


            // TEACHER RESPONSE

            const responseSection = document.createElement("div");

            responseSection.className =
                "parent-teacher-response-section";

            const responseHeading = document.createElement("strong");

            responseHeading.textContent = "Teacher's Response";

            responseSection.appendChild(responseHeading);

            const responseText = document.createElement("p");

            responseText.textContent =
                record.teacher_response ||
                "Your teacher has not responded yet.";

            responseSection.appendChild(responseText);

            if (record.response_at) {

                const responseDate = document.createElement("small");

                responseDate.textContent =
                    "Responded: " +
                    new Date(record.response_at).toLocaleString("en-KE");

                responseSection.appendChild(responseDate);

            }

            card.appendChild(responseSection);


            // SUBMISSION DATE

            const submitted = document.createElement("small");

            submitted.className = "parent-teacher-submitted-date";

            submitted.textContent =
                "Submitted: " +
                new Date(record.created_at).toLocaleString("en-KE");

            card.appendChild(submitted);

            container.appendChild(card);

        });

    } catch (error) {

        console.error(
            "PARENT COMMUNICATION HISTORY ERROR:",
            error
        );

        container.innerHTML =
            "<p>Unable to load communication history.</p>";

    }

}


// ==========================================
// PARENT COMMUNICATION FORM
// ==========================================

const parentTeacherMessageForm = document.getElementById(
    "parentTeacherMessageForm"
);

const parentContactType = document.getElementById(
    "parentContactType"
);

const parentMeetingDateGroup = document.getElementById(
    "parentMeetingDateGroup"
);

const parentMeetingTimeGroup = document.getElementById(
    "parentMeetingTimeGroup"
);

const parentMeetingDate = document.getElementById(
    "parentMeetingDate"
);

const parentMeetingTime = document.getElementById(
    "parentMeetingTime"
);

const parentTeacherMessageStatus = document.getElementById(
    "parentTeacherMessageStatus"
);


// ==========================================
// SHOW OR HIDE MEETING FIELDS
// ==========================================

function updateParentMeetingFields() {

    if (!parentContactType) return;

    const isMeeting = parentContactType.value === "meeting";

    if (parentMeetingDateGroup) {
        parentMeetingDateGroup.style.display =
            isMeeting ? "block" : "none";
    }

    if (parentMeetingTimeGroup) {
        parentMeetingTimeGroup.style.display =
            isMeeting ? "block" : "none";
    }

    if (parentMeetingDate) {
        parentMeetingDate.required = isMeeting;
    }

    if (parentMeetingTime) {
        parentMeetingTime.required = isMeeting;
    }

}


if (
    parentContactType &&
    !parentContactType.dataset.communicationInitialized
) {

    parentContactType.dataset.communicationInitialized = "true";

    parentContactType.addEventListener(
        "change",
        updateParentMeetingFields
    );

    updateParentMeetingFields();

}


// ==========================================
// SEND MESSAGE OR MEETING REQUEST
// ==========================================

if (
    parentTeacherMessageForm &&
    !parentTeacherMessageForm.dataset.communicationInitialized
) {

    parentTeacherMessageForm.dataset.communicationInitialized = "true";

    parentTeacherMessageForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const teacherId = document.getElementById(
                "parentContactTeacher"
            )?.value;

            const subjectId = document.getElementById(
                "parentContactSubject"
            )?.value;

            const requestType = parentContactType?.value;

            const message = document.getElementById(
                "parentTeacherMessage"
            )?.value.trim();

            const meetingDate = parentMeetingDate?.value || null;

            const meetingTime = parentMeetingTime?.value || null;

            const submitButton = document.getElementById(
                "parentTeacherSendButton"
            );


            // VALIDATION

            if (!selectedParentChild) {

                alert("Please select a child first.");

                return;
            }

            if (!teacherId) {

                alert("Please select a teacher.");

                return;
            }

            if (!subjectId) {

                alert("Please select a subject.");

                return;
            }

            if (!message) {

                alert("Please enter your message.");

                return;
            }

            if (
                requestType === "meeting" &&
                (!meetingDate || !meetingTime)
            ) {

                alert(
                    "Please select your preferred meeting date and time."
                );

                return;
            }


            submitButton.disabled = true;

            submitButton.textContent = "Sending...";

            if (parentTeacherMessageStatus) {

                parentTeacherMessageStatus.textContent =
                    "Sending your communication...";

            }


            try {

                // GET SIGNED-IN PARENT

                const { data: userData, error: userError } =
                    await supabaseClient.auth.getUser();

                if (userError) throw userError;

                const parentId = userData.user?.id;

                if (!parentId) {

                    throw new Error(
                        "Your parent session has expired. Please log in again."
                    );

                }


                // SAVE COMMUNICATION

                const { error } = await supabaseClient
                    .from("parent_teacher_messages")
                    .insert({

                        parent_id: parentId,

                        student_id: selectedParentChild.id,

                        teacher_id: teacherId,

                        subject_id: subjectId,

                        request_type: requestType,

                        message: message,

                        preferred_meeting_date:
                            requestType === "meeting"
                                ? meetingDate
                                : null,

                        preferred_meeting_time:
                            requestType === "meeting"
                                ? meetingTime
                                : null

                    });

                if (error) throw error;


                // RESET FORM

                parentTeacherMessageForm.reset();

                updateParentMeetingFields();


                // SUCCESS MESSAGE

                if (parentTeacherMessageStatus) {

                    parentTeacherMessageStatus.textContent =
                        "Your communication was sent successfully.";

                }


                // REFRESH HISTORY

                await loadParentTeacherMessages(
                    selectedParentChild.id
                );


            } catch (error) {

                console.error(
                    "PARENT COMMUNICATION SEND ERROR:",
                    error
                );

                if (parentTeacherMessageStatus) {

                    parentTeacherMessageStatus.textContent =
                        "Unable to send your communication: " +
                        (error.message || "Please try again.");

                }

            } finally {

                submitButton.disabled = false;

                submitButton.textContent = "Send Communication";

            }

        }
    );

}


// ==========================================
// TEACHER PARENT COMMUNICATION INBOX
// ==========================================

async function initialiseTeacherMessages() {

    const messagesContainer =
        document.getElementById("teacherMessagesList");

    const statusElement =
        document.getElementById("teacherMessagesStatus");

    const filterElement =
        document.getElementById("teacherMessageFilter");

    const refreshButton =
        document.getElementById("teacherRefreshMessages");

    const totalElement =
        document.getElementById("teacherMessageTotal");

    const pendingElement =
        document.getElementById("teacherMessagePending");

    const respondedElement =
        document.getElementById("teacherMessageResponded");

    if (!messagesContainer) return;

    // GET LOGGED-IN TEACHER

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        window.location.href = "login.html";
        return;
    }

    const {
        data: profile,
        error: profileError
    } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile || profile.role !== "teacher") {
        window.location.href = "login.html";
        return;
    }

    // LOGOUT

    const logoutButton =
        document.getElementById("teacherLogoutButton");

    if (logoutButton && !logoutButton.dataset.initialized) {

        logoutButton.dataset.initialized = "true";

        logoutButton.addEventListener("click", async () => {
            await supabaseClient.auth.signOut();
            window.location.href = "login.html";
        });
    }

    let teacherMessages = [];

    // LOAD MESSAGES

    async function loadTeacherMessages() {

        messagesContainer.innerHTML =
            "<p>Loading parent messages...</p>";

        if (statusElement) {
            statusElement.textContent = "";
        }

        const {
            data,
            error
        } = await supabaseClient
            .from("parent_teacher_messages")
            .select("*")
            .eq("teacher_id", user.id)
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error(
                "Teacher messages loading error:",
                error
            );

            messagesContainer.textContent =
                "Unable to load parent messages. Please check your permissions.";

            return;
        }

        teacherMessages = data || [];

        // LOAD STUDENT NAMES

        const studentIds = [
            ...new Set(
                teacherMessages.map(message => message.student_id)
            )
        ];

        let studentMap = {};

        if (studentIds.length > 0) {

            const {
                data: students,
                error: studentsError
            } = await supabaseClient
                .from("students")
                .select("id, full_name, admission_number, class_name")
                .in("id", studentIds);

            if (studentsError) {
                console.error(
                    "Student details error:",
                    studentsError
                );
            } else {

                (students || []).forEach(student => {
                    studentMap[student.id] = student;
                });
            }
        }

        // LOAD SUBJECT NAMES

        const subjectIds = [
            ...new Set(
                teacherMessages
                    .map(message => message.subject_id)
                    .filter(Boolean)
            )
        ];

        let subjectMap = {};

        if (subjectIds.length > 0) {

            const {
                data: subjects,
                error: subjectsError
            } = await supabaseClient
                .from("subjects")
                .select("id, name, code")
                .in("id", subjectIds);

            if (subjectsError) {
                console.error(
                    "Subject details error:",
                    subjectsError
                );
            } else {

                (subjects || []).forEach(subject => {
                    subjectMap[subject.id] = subject;
                });
            }
        }

        // UPDATE STATISTICS

        if (totalElement) {
            totalElement.textContent =
                teacherMessages.length;
        }

        if (pendingElement) {
            pendingElement.textContent =
                teacherMessages.filter(
                    message => message.status === "pending"
                ).length;
        }

        if (respondedElement) {
            respondedElement.textContent =
                teacherMessages.filter(
                    message => message.status !== "pending"
                ).length;
        }

        // DISPLAY FILTERED MESSAGES

        renderTeacherMessages(studentMap, subjectMap);
    }

    // RENDER MESSAGES

    function renderTeacherMessages(studentMap, subjectMap) {

        messagesContainer.innerHTML = "";

        const selectedFilter =
            filterElement ? filterElement.value : "all";

        const filteredMessages =
            teacherMessages.filter(message => {

                return selectedFilter === "all" ||
                    message.status === selectedFilter;
            });

        if (filteredMessages.length === 0) {

            const emptyMessage =
                document.createElement("p");

            emptyMessage.textContent =
                teacherMessages.length === 0
                    ? "You have no parent messages yet."
                    : "No messages match this filter.";

            messagesContainer.appendChild(emptyMessage);
            return;
        }

        filteredMessages.forEach(message => {

            const card =
                document.createElement("div");

            card.className = "teacher-message-card";

            const student =
                studentMap[message.student_id];

            const subject =
                subjectMap[message.subject_id];

            const studentName =
                student?.full_name || "Student";

            const subjectName =
                subject?.name || "General Enquiry";

            const date =
                message.created_at
                    ? new Date(message.created_at)
                        .toLocaleString("en-KE")
                    : "Date unavailable";

            const heading =
                document.createElement("h3");

            heading.textContent =
                message.request_type === "meeting"
                    ? "Meeting Request"
                    : "Parent Message";

            const details =
                document.createElement("p");

            details.textContent =
                "Student: " + studentName +
                (student?.admission_number
                    ? " (" + student.admission_number + ")"
                    : "") +
                (student?.class_name
                    ? " • " + student.class_name
                    : "");

            const subjectDetails =
                document.createElement("p");

            subjectDetails.textContent =
                "Subject: " + subjectName;

            const messageText =
                document.createElement("p");

            messageText.textContent =
                message.message || "";

            messageText.className =
                "teacher-message-text";

            const typeDetails =
                document.createElement("p");

            typeDetails.textContent =
                "Type: " +
                (message.request_type === "meeting"
                    ? "Meeting Request"
                    : "Message");

            const dateDetails =
                document.createElement("small");

            dateDetails.textContent =
                "Received: " + date;

            const statusDetails =
                document.createElement("p");

            statusDetails.textContent =
                "Current Status: " +
                (message.status || "pending").toUpperCase();

            statusDetails.className =
                "teacher-message-status";

            card.appendChild(heading);
            card.appendChild(details);
            card.appendChild(subjectDetails);
            card.appendChild(typeDetails);
            card.appendChild(messageText);

            // MEETING DETAILS

            if (message.request_type === "meeting") {

                const meetingDetails =
                    document.createElement("p");

                meetingDetails.textContent =
                    "Preferred meeting: " +
                    (message.preferred_meeting_date || "Not specified") +
                    " at " +
                    (message.preferred_meeting_time || "Not specified");

                card.appendChild(meetingDetails);
            }

            card.appendChild(dateDetails);
            card.appendChild(statusDetails);

            // EXISTING RESPONSE

            const responseLabel =
                document.createElement("label");

            responseLabel.textContent =
                "Your Response";

            const responseInput =
                document.createElement("textarea");

            responseInput.className =
                "teacher-message-response";

            responseInput.placeholder =
                "Write your response to the parent...";

            responseInput.value =
                message.teacher_response || "";

            responseInput.rows = 4;

            // STATUS SELECT

            const statusLabel =
                document.createElement("label");

            statusLabel.textContent =
                "Update Status";

            const statusSelect =
                document.createElement("select");

            statusSelect.className =
                "teacher-message-status-select";

            const statuses = [
                ["pending", "Pending"],
                ["responded", "Responded"],
                ["approved", "Approved"],
                ["declined", "Declined"],
                ["completed", "Completed"]
            ];

            statuses.forEach(([value, label]) => {

                const option =
                    document.createElement("option");

                option.value = value;
                option.textContent = label;

                statusSelect.appendChild(option);
            });

            statusSelect.value =
                message.status || "pending";

            // SAVE RESPONSE

            const saveButton =
                document.createElement("button");

            saveButton.type = "button";
            saveButton.textContent = "Save Response";
            saveButton.className =
                "teacher-message-save-button";

            const saveStatus =
                document.createElement("small");

            saveButton.addEventListener("click", async () => {

                const response =
                    responseInput.value.trim();

                const newStatus =
                    statusSelect.value;

                if (!response) {

                    saveStatus.textContent =
                        "Please enter a response first.";

                    return;
                }

                saveButton.disabled = true;
                saveButton.textContent = "Saving...";

                const {
                    error: updateError
                } = await supabaseClient
                    .from("parent_teacher_messages")
                    .update({
                        teacher_response: response,
                        status: newStatus,
                        response_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", message.id)
                    .eq("teacher_id", user.id);

                if (updateError) {

                    console.error(
                        "Saving teacher response error:",
                        updateError
                    );

                    saveStatus.textContent =
                        "Unable to save response: " +
                        updateError.message;

                    saveButton.disabled = false;
                    saveButton.textContent = "Save Response";

                    return;
                }

                saveStatus.textContent =
                    "Response saved successfully.";

                await loadTeacherMessages();
            });

            card.appendChild(responseLabel);
            card.appendChild(responseInput);
            card.appendChild(statusLabel);
            card.appendChild(statusSelect);
            card.appendChild(saveButton);
            card.appendChild(saveStatus);

            // EXISTING TEACHER RESPONSE DISPLAY

            if (message.teacher_response) {

                const previousResponse =
                    document.createElement("p");

                previousResponse.textContent =
                    "Previously saved response: " +
                    message.teacher_response;

                card.appendChild(previousResponse);
            }

            messagesContainer.appendChild(card);
        });
    }

    // FILTER

    if (filterElement && !filterElement.dataset.initialized) {

        filterElement.dataset.initialized = "true";

        filterElement.addEventListener("change", () => {

            loadTeacherMessages();
        });
    }

    // REFRESH

    if (refreshButton && !refreshButton.dataset.initialized) {

        refreshButton.dataset.initialized = "true";

        refreshButton.addEventListener("click", () => {
            loadTeacherMessages();
        });
    }

    await loadTeacherMessages();
}


// ==========================================
// INITIALISE TEACHER MESSAGES PAGE
// ==========================================

if (
    window.location.pathname
        .toLowerCase()
        .includes("teacher-messages.html")
) {
    initialiseTeacherMessages();
}


// ==========================================
// TEACHER DASHBOARD PARENT MESSAGE NOTIFICATIONS
// ==========================================

async function loadTeacherParentMessageCount() {

    const countElement = document.getElementById(
        "teacherParentMessageCount"
    );

    if (!countElement) return;

    try {

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) return;

        const {
            count,
            error
        } = await supabaseClient
            .from("parent_teacher_messages")
            .select("id", {
                count: "exact",
                head: true
            })
            .eq("teacher_id", user.id)
            .eq("status", "pending");

        if (error) throw error;

        countElement.textContent = count ?? 0;

    } catch (error) {

        console.error(
            "Parent message notification error:",
            error
        );

        countElement.textContent = "—";
    }
}


// ==========================================
// START TEACHER DASHBOARD NOTIFICATIONS
// ==========================================

if (
    window.location.pathname
        .toLowerCase()
        .includes("teacher-dashboard.html")
) {
    loadTeacherParentMessageCount();
}


// ==========================================
// REAL-TIME PARENT MESSAGE NOTIFICATIONS
// ==========================================

let teacherMessageNotificationChannel = null;

async function startTeacherMessageNotifications() {

    const countElement = document.getElementById(
        "teacherParentMessageCount"
    );

    if (!countElement) return;

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) return;

    // REMOVE AN EXISTING CHANNEL

    if (teacherMessageNotificationChannel) {

        await supabaseClient.removeChannel(
            teacherMessageNotificationChannel
        );
    }

    // LISTEN FOR NEW OR UPDATED MESSAGES

    teacherMessageNotificationChannel =
        supabaseClient
            .channel("teacher-parent-messages-" + user.id)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "parent_teacher_messages",
                    filter: "teacher_id=eq." + user.id
                },
                () => {

                    loadTeacherParentMessageCount();

                }
            )
            .subscribe((status) => {

                console.log(
                    "Teacher message notifications:",
                    status
                );

            });
}


// START ONLY ON TEACHER DASHBOARD

if (
    window.location.pathname
        .toLowerCase()
        .includes("teacher-dashboard.html")
) {
    startTeacherMessageNotifications();
}


// ==========================================
// TEACHER NOTIFICATION CENTRE
// ==========================================

async function initialiseTeacherNotificationCentre() {

    const bell = document.getElementById(
        "teacherNotificationBell"
    );

    const badge = document.getElementById(
        "teacherUnreadBadge"
    );

    const panel = document.getElementById(
        "teacherNotificationPanel"
    );

    const notificationList = document.getElementById(
        "teacherNotificationList"
    );

    const closeButton = document.getElementById(
        "teacherCloseNotifications"
    );

    if (!bell || !badge || !panel || !notificationList) {
        return;
    }

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) return;

    let notificationChannel = null;

    // LOAD UNREAD NOTIFICATIONS

    async function loadNotifications() {

        const {
            data,
            error
        } = await supabaseClient
            .from("parent_teacher_messages")
            .select(`
                id,
                student_id,
                message,
                request_type,
                created_at,
                teacher_read_at
            `)
            .eq("teacher_id", user.id)
            .is("teacher_read_at", null)
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error(
                "Notification loading error:",
                error
            );

            notificationList.textContent =
                "Unable to load notifications.";

            return;
        }

        const notifications = data || [];

        badge.textContent = notifications.length;

        badge.hidden = notifications.length === 0;

        notificationList.innerHTML = "";

        if (notifications.length === 0) {

            const empty = document.createElement("p");

            empty.textContent = "You're all caught up!";

            notificationList.appendChild(empty);

            return;
        }

        // LOAD STUDENT NAMES

        const studentIds = [
            ...new Set(
                notifications.map(item => item.student_id)
            )
        ];

        let studentMap = {};

        const {
            data: students,
            error: studentError
        } = await supabaseClient
            .from("students")
            .select("id, full_name")
            .in("id", studentIds);

        if (!studentError) {

            (students || []).forEach(student => {
                studentMap[student.id] = student.full_name;
            });
        }

        // RENDER NOTIFICATIONS

        notifications.forEach(item => {

            const notification = document.createElement("button");

            notification.type = "button";

            notification.className =
                "teacher-notification-item";

            const title = document.createElement("strong");

            title.textContent =
                item.request_type === "meeting"
                    ? "New meeting request"
                    : "New parent message";

            const description = document.createElement("p");

            description.textContent =
                (studentMap[item.student_id] || "A student") +
                " — " +
                (item.message || "").slice(0, 100);

            const date = document.createElement("small");

            date.textContent = item.created_at
                ? new Date(item.created_at).toLocaleString("en-KE")
                : "";

            notification.appendChild(title);
            notification.appendChild(description);
            notification.appendChild(date);

            notification.addEventListener("click", async () => {

                notification.disabled = true;

                const {
                    error: updateError
                } = await supabaseClient
                    .from("parent_teacher_messages")
                    .update({
                        teacher_read_at: new Date().toISOString()
                    })
                    .eq("id", item.id)
                    .eq("teacher_id", user.id);

                if (updateError) {

                    console.error(
                        "Mark notification as read error:",
                        updateError
                    );

                    notification.disabled = false;

                    return;
                }

                window.location.href = "teacher-messages.html";
            });

            notificationList.appendChild(notification);
        });
    }

    // OPEN AND CLOSE PANEL

    if (!bell.dataset.initialized) {

        bell.dataset.initialized = "true";

        bell.addEventListener("click", async () => {

            panel.hidden = !panel.hidden;

            if (!panel.hidden) {
                await loadNotifications();
            }
        });
    }

    if (closeButton && !closeButton.dataset.initialized) {

        closeButton.dataset.initialized = "true";

        closeButton.addEventListener("click", () => {
            panel.hidden = true;
        });
    }

    // INITIAL LOAD

    await loadNotifications();

    // REALTIME UPDATES

    notificationChannel = supabaseClient
        .channel("teacher-notification-centre-" + user.id)
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "parent_teacher_messages",
                filter: "teacher_id=eq." + user.id
            },
            async () => {
                await loadNotifications();
                await loadTeacherParentMessageCount();
            }
        )
        .subscribe(status => {

            console.log(
                "Teacher notification centre:",
                status
            );
        });
}


// ==========================================
// START NOTIFICATION CENTRE
// ==========================================

if (
    window.location.pathname
        .toLowerCase()
        .includes("teacher-dashboard.html")
) {
    initialiseTeacherNotificationCentre();
}
