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
    window.location.pathname.includes(
        "attendance.html"
    )
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

    <div class="teacher-password-box">

        <label>
            Temporary Password
        </label>

        <input
            type="text"
            id="teacher-password-${teacher.id}"
            value="${sessionStorage.getItem(`teacherPassword_${teacher.id}`) || ""}"
            placeholder="No password stored"
            readonly
        >

        <button
            type="button"
            class="secondary-button"
            onclick="copyTeacherPassword('${teacher.id}')">

            Copy Password

        </button>

    </div>


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

window.resetTeacherPassword = async function (teacherId) {

    console.log(
        "RESET TEACHER PASSWORD:",
        teacherId
    );

    const confirmed =
        confirm(
            "Are you sure you want to reset this teacher's password?\n\n" +
            "The current password will stop working."
        );

    if (!confirmed) {
        return;
    }

    try {

        alert("Resetting teacher password...");

        const {
            data,
            error
        } =
            await supabaseClient
                .functions
                .invoke(
                    "reset-teacher-password",
                    {
                        body: {
                            teacherId: teacherId
                        }
                    }
                );

        console.log(
            "RESET TEACHER PASSWORD DATA:",
            data
        );

        console.log(
            "RESET TEACHER PASSWORD ERROR:",
            error
        );

        if (error) {

            alert(
                "Unable to reset password:\n\n" +
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
                "Unable to reset password."
            );

            return;
        }

        const newPassword =
            data.teacher.temporary_password;

        // Store password in this browser session
        sessionStorage.setItem(
            `teacherPassword_${teacherId}`,
            newPassword
        );

        // Put password directly into the box
        const passwordInput =
            document.getElementById(
                `teacher-password-${teacherId}`
            );

        if (passwordInput) {

            passwordInput.value =
                newPassword;
        }

        alert(
            "Teacher password reset successfully!\n\n" +
            "Teacher: " +
            data.teacher.full_name +
            "\n\n" +
            "Email: " +
            data.teacher.email +
            "\n\n" +
            "New Temporary Password: " +
            newPassword
        );

    } catch (error) {

        console.error(
            "RESET TEACHER PASSWORD ERROR:",
            error
        );

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
// STORE NEW TEACHER PASSWORD
// ==========================================

if (
    data &&
    data.temporaryPassword
) {

    const {
        data: createdTeacher,
        error: createdTeacherError
    } =
        await supabaseClient
            .from("teachers")
            .select("id")
            .eq("email", email)
            .single();

    if (
        !createdTeacherError &&
        createdTeacher
    ) {

        sessionStorage.setItem(
            `teacherPassword_${createdTeacher.id}`,
            data.temporaryPassword
        );

        console.log(
            "Teacher temporary password stored."
        );
    }
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

    const confirmed =
        confirm(
            "Are you sure you want to reset this student's password?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const {
            data: accountData,
            error: accountError
        } = await supabaseClient.functions.invoke(
            "reset-student-password",
            {
                body: {
                    studentId: studentId
                }
            }
        );

        if (accountError) {

            console.error(
                "PASSWORD RESET ERROR:",
                accountError
            );

            alert(
                "Password reset failed: " +
                accountError.message
            );

            return;
        }

        if (
            !accountData ||
            !accountData.success
        ) {

            console.error(
                "PASSWORD RESET RESPONSE:",
                accountData
            );

            alert(
                accountData?.error ||
                "Password reset failed."
            );

            return;
        }
        
       // ==========================================
// SHOW AND COPY NEW PASSWORD
// ==========================================

const newPassword =
    accountData.student.temporary_password;

        // Save password for this browser session
sessionStorage.setItem(
    `studentPassword_${studentId}`,
    newPassword
);

// Find this student's password box
const passwordInput =
    document.getElementById(
        `student-password-${studentId}`
    );

// Put the new password into the box
if (passwordInput) {

    passwordInput.value =
        newPassword;

}


if (passwordInput) {

    passwordInput.value =
        newPassword;

}

const copyPassword =
    confirm(
        "Password reset successfully!\n\n" +
        "Student: " +
        accountData.student.full_name +
        "\n\n" +
        "Login email: " +
        accountData.student.email +
        "\n\n" +
        "New temporary password:\n" +
        newPassword +
        "\n\n" +
        "Press OK to copy the password."
    );

if (copyPassword) {

    try {

        await navigator.clipboard.writeText(
            newPassword
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
            "The password could not be copied automatically.\n\n" +
            "Password:\n" +
            newPassword
        );
    }
}

    } catch (error) {

        console.error(
            "PASSWORD RESET ERROR:",
            error
        );

        alert(
            "An unexpected error occurred."
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

    const studentList =
        document.getElementById(
            "adminGradesStudentList"
        );

    const searchInput =
        document.getElementById(
            "adminGradesSearch"
        );

    const studentSection =
        document.getElementById(
            "adminStudentSection"
        );

    const resultsSection =
        document.getElementById(
            "adminStudentResultsSection"
        );

    const backButton =
        document.getElementById(
            "adminGradesBackButton"
        );

    const selectedStudent =
        document.getElementById(
            "adminSelectedStudent"
        );

    const gradesContainer =
        document.getElementById(
            "adminStudentGradesContainer"
        );


    // ==========================================
    // CHECK ELEMENTS
    // ==========================================

    if (!studentList) {

        console.error(
            "Admin grades student list not found."
        );

        return;
    }


    // ==========================================
    // GET STUDENTS
    // ==========================================

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
        .order(
            "full_name",
            {
                ascending: true
            }
        );


    console.log(
        "ADMIN GRADES STUDENTS:",
        students
    );

    console.log(
        "ADMIN GRADES STUDENT ERROR:",
        studentsError
    );


   // ==========================================
// ADMIN GRADES OVERVIEW
// ==========================================

const totalStudentsElement =
    document.getElementById("adminGradesTotalStudents");

const studentsWithGradesElement =
    document.getElementById("adminGradesStudentsWithGrades");

const totalResultsElement =
    document.getElementById("adminGradesTotalResults");

const overallAverageElement =
    document.getElementById("adminGradesOverallAverage");


/* TOTAL STUDENTS */

if (totalStudentsElement) {

    totalStudentsElement.textContent =
        students.length;

}


/* GET ALL GRADES */

const {
    data: allGrades,
    error: allGradesError
} = await supabaseClient
    .from("grades")
    .select(`
        id,
        student_id,
        score,
        max_score
    `);


console.log(
    "ADMIN ALL GRADES:",
    allGrades
);

console.log(
    "ADMIN ALL GRADES ERROR:",
    allGradesError
);


if (allGradesError) {

    console.error(
        "Unable to load admin grade statistics:",
        allGradesError
    );

}
else {

    /* TOTAL RESULTS */

    if (totalResultsElement) {

        totalResultsElement.textContent =
            allGrades.length;

    }


    /* STUDENTS WITH GRADES */

    const studentsWithGrades =
        new Set(
            allGrades.map(
                function (grade) {
                    return grade.student_id;
                }
            )
        );


    if (studentsWithGradesElement) {

        studentsWithGradesElement.textContent =
            studentsWithGrades.size;

    }


    /* OVERALL AVERAGE */

    let totalScore = 0;
    let totalMaxScore = 0;


    allGrades.forEach(
        function (grade) {

            const score =
                Number(grade.score) || 0;

            const maxScore =
                Number(grade.max_score) || 0;


            totalScore += score;
            totalMaxScore += maxScore;

        }
    );


    const overallAverage =
        totalMaxScore > 0
            ? (totalScore / totalMaxScore) * 100
            : 0;


    if (overallAverageElement) {

        overallAverageElement.textContent =
            Math.round(overallAverage) + "%";

    }

}
    
// ======================================
// EXTRA ADMIN GRADE STATISTICS
// ======================================

const classAverageElement =
    document.getElementById("adminClassAverage");

const highestStudentAverageElement =
    document.getElementById(
        "adminHighestStudentAverage"
    );

const subjectsGradedElement =
    document.getElementById(
        "adminSubjectsGraded"
    );

if (allGrades && allGrades.length > 0) {

    // ------------------------------
    // CLASS AVERAGE
    // ------------------------------

    if (classAverageElement) {
        classAverageElement.textContent =
            Math.round(overallAverage) + "%";
    }


    // ------------------------------
    // SUBJECTS GRADED
    // ------------------------------

    const subjectIds =
        new Set();

    allGrades.forEach(
        function (grade) {

            if (grade.subject_id) {
                subjectIds.add(
                    grade.subject_id
                );
            }

        }
    );

    if (subjectsGradedElement) {
        subjectsGradedElement.textContent =
            subjectIds.size;
    }

}

    
    // ==========================================
    // DISPLAY STUDENTS
    // ==========================================

    function displayStudents(
        studentArray
    ) {

        studentList.innerHTML = "";


        if (
            !studentArray ||
            studentArray.length === 0
        ) {

            studentList.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No students found
                    </h3>

                    <p>
                        Try a different name or admission number.
                    </p>

                </div>
            `;

            return;
        }


        studentArray.forEach(
            function (student) {

                const studentCard =
                    document.createElement(
                        "div"
                    );


                studentCard.className =
                    "admin-grade-student-card";


                studentCard.innerHTML = `

                    <div class="student-grade-info">

                        <div class="student-grade-avatar">

                            ${
                                student.full_name
                                    ? student.full_name
                                        .charAt(0)
                                        .toUpperCase()
                                    : "S"
                            }

                        </div>


                        <div>

                            <h3>
                                ${student.full_name}
                            </h3>

                            <p>
                                Admission No:
                                ${student.admission_number || "N/A"}
                            </p>

                            <p>
                                Class:
                                ${student.class_name || "N/A"}
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="view-grades-button"
                    >
                        View Grades →
                    </button>

                `;


                const viewButton =
                    studentCard.querySelector(
                        ".view-grades-button"
                    );


                viewButton.addEventListener(
                    "click",
                    function () {

                        loadAdminStudentGrades(
                            student
                        );

                    }
                );


                studentList.appendChild(
                    studentCard
                );

            }
        );

    }


    displayStudents(
        students
    );


    // ==========================================
    // SEARCH STUDENTS
    // ==========================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                const searchTerm =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                const filteredStudents =
                    students.filter(
                        function (student) {

                            const name =
                                (
                                    student.full_name || ""
                                ).toLowerCase();


                            const admission =
                                (
                                    student.admission_number || ""
                                ).toLowerCase();


                            return (
                                name.includes(searchTerm) ||
                                admission.includes(searchTerm)
                            );

                        }
                    );


                displayStudents(
                    filteredStudents
                );

            }
        );

    }


    // ==========================================
    // BACK BUTTON
    // ==========================================

    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                resultsSection.style.display =
                    "none";

                studentSection.style.display =
                    "block";

                if (searchInput) {

                    searchInput.focus();

                }

            }
        );

    }


    // ==========================================
    // LOAD STUDENT GRADES
    // ==========================================

    async function loadAdminStudentGrades(
        student
    ) {

        studentSection.style.display =
            "none";

        resultsSection.style.display =
            "block";


        selectedStudent.innerHTML = `

            <div>

                <h2>
                    ${student.full_name}
                </h2>

                <p>
                    Admission No:
                    ${student.admission_number || "N/A"}
                </p>

                <p>
                    Class:
                    ${student.class_name || "N/A"}
                </p>

            </div>

        `;


        gradesContainer.innerHTML = `
            <p>
                Loading grades...
            </p>
        `;


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
                    id,
                    name,
                    code
                )
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


        console.log(
            "ADMIN STUDENT GRADES:",
            grades
        );

        console.log(
            "ADMIN STUDENT GRADES ERROR:",
            gradesError
        );

        // ======================================
// INDIVIDUAL STUDENT GRADE SUMMARY
// ======================================

const studentAverageElement =
    document.getElementById("adminStudentAverage");

const studentResultCountElement =
    document.getElementById("adminStudentResultCount");

const studentHighestElement =
    document.getElementById("adminStudentHighest");

const studentLowestElement =
    document.getElementById("adminStudentLowest");

if (grades && grades.length > 0) {

    let totalScore = 0;
    let totalMaxScore = 0;

    let highestPercentage = 0;
    let lowestPercentage = 100;

    grades.forEach(function (grade) {

        const score =
            Number(grade.score) || 0;

        const maxScore =
            Number(grade.max_score) || 0;

        totalScore += score;
        totalMaxScore += maxScore;

        if (maxScore > 0) {

            const percentage =
                (score / maxScore) * 100;

            if (percentage > highestPercentage) {
                highestPercentage = percentage;
            }

            if (percentage < lowestPercentage) {
                lowestPercentage = percentage;
            }
        }
    });

    const average =
        totalMaxScore > 0
            ? (totalScore / totalMaxScore) * 100
            : 0;

    if (studentAverageElement) {
        studentAverageElement.textContent =
            Math.round(average) + "%";
    }

    if (studentResultCountElement) {
        studentResultCountElement.textContent =
            grades.length;
    }

    if (studentHighestElement) {
        studentHighestElement.textContent =
            Math.round(highestPercentage) + "%";
    }

    if (studentLowestElement) {
        studentLowestElement.textContent =
            Math.round(lowestPercentage) + "%";
    }

} else {

    if (studentAverageElement) {
        studentAverageElement.textContent = "—";
    }

    if (studentResultCountElement) {
        studentResultCountElement.textContent = "0";
    }

    if (studentHighestElement) {
        studentHighestElement.textContent = "—";
    }

    if (studentLowestElement) {
        studentLowestElement.textContent = "—";
    }
}

        // ======================================
        // ERROR
        // ======================================

        if (gradesError) {

            console.error(
                gradesError
            );

            gradesContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Unable to load grades
                    </h3>

                    <p>
                        Please try again later.
                    </p>

                </div>
            `;

            return;
        }


        // ======================================
        // NO GRADES
        // ======================================

        if (
            !grades ||
            grades.length === 0
        ) {

            gradesContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No grades found
                    </h3>

                    <p>
                        This student does not have any recorded grades yet.
                    </p>

                </div>
            `;

            return;
        }


        // ======================================
        // DISPLAY GRADES
        // ======================================

        gradesContainer.innerHTML = `

            <div class="grades-table-wrapper">

                <table class="admin-grades-table">

                    <thead>

                        <tr>

                            <th>
                                Subject
                            </th>

                            <th>
                                Assessment
                            </th>

                            <th>
                                Score
                            </th>

                            <th>
                                Percentage
                            </th>

                            <th>
                                Date
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                    </tbody>

                </table>

            </div>

        `;


        const tableBody =
            gradesContainer.querySelector(
                "tbody"
            );


        grades.forEach(
            function (grade) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const score =
                    Number(
                        grade.score
                    );


                const maxScore =
                    Number(
                        grade.max_score
                    );


                let percentage = 0;


                if (maxScore > 0) {

                    percentage =
                        (
                            score /
                            maxScore
                        ) * 100;

                }


                const gradeDate =
                    grade.created_at
                        ? new Date(
                            grade.created_at
                        ).toLocaleDateString(
                            "en-GB",
                            {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            }
                        )
                        : "N/A";


                row.innerHTML = `

                    <td>

                        <strong>
                            ${
                                grade.subjects
                                    ? grade.subjects.name
                                    : "Unknown Subject"
                            }
                        </strong>

                        ${
                            grade.subjects &&
                            grade.subjects.code
                                ? `
                                    <small>
                                        ${grade.subjects.code}
                                    </small>
                                `
                                : ""
                        }

                    </td>


                    <td>
                        ${grade.assessment || "N/A"}
                    </td>


                    <td>
                        ${score} / ${maxScore}
                    </td>


                    <td>
                        ${Math.round(percentage)}%
                    </td>


                    <td>
                        ${gradeDate}
                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );

    }

}

// ==========================================
// START ADMIN GRADES
// ==========================================

console.log("CURRENT PAGE:", window.location.pathname);

if (
    window.location.pathname.includes(
        "admin-grades.html"
    )
) {
    console.log("ADMIN GRADES PAGE DETECTED");
    loadAdminGrades();
}

// ==========================================
// ADMIN CONDUCT
// ==========================================

async function loadAdminConduct() {

    const studentList =
        document.getElementById("adminConductStudentList");

    if (!studentList) return;

    console.log("Loading admin conduct records...");

    // ------------------------------------------
    // LOAD STUDENTS
    // ------------------------------------------

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
        .order("full_name", { ascending: true });

    if (studentsError) {

        console.error(
            "ADMIN CONDUCT STUDENTS ERROR:",
            studentsError
        );

        studentList.innerHTML = `
            <div class="empty-state">
                Unable to load students.
            </div>
        `;

        return;
    }


    // ------------------------------------------
    // LOAD CONDUCT RECORDS
    // ------------------------------------------

    const {
        data: conductRecords,
        error: conductError
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
        .order("created_at", {
            ascending: false
        });

    console.log(
        "ADMIN CONDUCT RECORDS:",
        conductRecords
    );

    console.log(
        "ADMIN CONDUCT ERROR:",
        conductError
    );

    if (conductError) {

        studentList.innerHTML = `
            <div class="empty-state">
                Unable to load conduct records.
            </div>
        `;

        return;
    }


    // ------------------------------------------
    // OVERVIEW STATISTICS
    // ------------------------------------------

    const totalRecordsElement =
        document.getElementById(
            "adminConductTotalRecords"
        );

    const studentsElement =
        document.getElementById(
            "adminConductStudents"
        );

    const positiveElement =
        document.getElementById(
            "adminConductPositive"
        );

    const concernsElement =
        document.getElementById(
            "adminConductConcerns"
        );


    // Total records

    if (totalRecordsElement) {

        totalRecordsElement.textContent =
            conductRecords.length;
    }


    // Students with records

    const studentsWithRecords =
        new Set(
            conductRecords.map(function (record) {

                return record.student_id;

            })
        );


    if (studentsElement) {

        studentsElement.textContent =
            studentsWithRecords.size;
    }


    // Positive records

    const positiveRecords =
        conductRecords.filter(function (record) {

            return String(
                record.type || ""
            ).toLowerCase() === "positive";

        });


    // Negative records

    const negativeRecords =
        conductRecords.filter(function (record) {

            return String(
                record.type || ""
            ).toLowerCase() === "negative";

        });


    if (positiveElement) {

        positiveElement.textContent =
            positiveRecords.length;
    }


    if (concernsElement) {

        concernsElement.textContent =
            negativeRecords.length;
    }


    // ------------------------------------------
    // RENDER STUDENTS
    // ------------------------------------------

    function renderStudents(searchTerm = "") {

        const search =
            searchTerm.trim().toLowerCase();


        const filteredStudents =
            students.filter(function (student) {

                const name =
                    String(
                        student.full_name || ""
                    ).toLowerCase();


                const admission =
                    String(
                        student.admission_number || ""
                    ).toLowerCase();


                return (
                    name.includes(search) ||
                    admission.includes(search)
                );

            });


        if (filteredStudents.length === 0) {

            studentList.innerHTML = `
                <div class="empty-state">
                    No students found.
                </div>
            `;

            return;
        }


        studentList.innerHTML = "";


        filteredStudents.forEach(
            function (student) {

                const studentConduct =
                    conductRecords.filter(
                        function (record) {

                            return (
                                record.student_id ===
                                student.id
                            );

                        }
                    );


                const positiveCount =
                    studentConduct.filter(
                        function (record) {

                            return String(
                                record.type || ""
                            ).toLowerCase() ===
                            "positive";

                        }
                    ).length;


                const negativeCount =
                    studentConduct.filter(
                        function (record) {

                            return String(
                                record.type || ""
                            ).toLowerCase() ===
                            "negative";

                        }
                    ).length;


                const totalPoints =
                    studentConduct.reduce(
                        function (total, record) {

                            return (
                                total +
                                Number(
                                    record.points || 0
                                )
                            );

                        },
                        0
                    );


                const card =
                    document.createElement("div");


                card.className =
                    "admin-conduct-student-card";


                card.innerHTML = `
                    <div>

                        <h3>
                            ${
                                student.full_name ||
                                "Unnamed Student"
                            }
                        </h3>

                        <p>
                            Admission:
                            ${
                                student.admission_number ||
                                "—"
                            }
                        </p>

                        <p>
                            Class:
                            ${
                                student.class_name ||
                                "—"
                            }
                        </p>

                    </div>


                    <div class="conduct-card-summary">

                        <strong>
                            ${studentConduct.length}
                        </strong>

                        <span>
                            Records
                        </span>

                        <small>
                            +${positiveCount}
                            positive
                            •
                            ${negativeCount}
                            negative
                        </small>

                        <small>
                            ${totalPoints}
                            points
                        </small>

                    </div>
                `;


                card.addEventListener(
                    "click",
                    function () {

                        loadAdminStudentConduct(
                            student
                        );

                    }
                );


                studentList.appendChild(card);

            }
        );
    }


    renderStudents();


    // ------------------------------------------
    // SEARCH
    // ------------------------------------------

    const searchInput =
        document.getElementById(
            "adminConductSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                renderStudents(
                    this.value
                );

            }
        );

    }
}


// ==========================================
// ADMIN STUDENT CONDUCT
// ==========================================

async function loadAdminStudentConduct(student) {

    const resultsSection =
        document.getElementById(
            "adminConductResultsSection"
        );


    const selectedStudent =
        document.getElementById(
            "adminSelectedConductStudent"
        );


    const container =
        document.getElementById(
            "adminStudentConductContainer"
        );


    if (
        !resultsSection ||
        !container
    ) {
        return;
    }


    resultsSection.style.display =
        "block";


    if (selectedStudent) {

        selectedStudent.innerHTML = `

            <h2>
                ${
                    student.full_name ||
                    "Student"
                }
            </h2>

            <p>
                Admission:
                ${
                    student.admission_number ||
                    "—"
                }

                &nbsp; | &nbsp;

                Class:
                ${
                    student.class_name ||
                    "—"
                }
            </p>

        `;
    }


    container.innerHTML =
        "<p>Loading conduct records...</p>";


    // ------------------------------------------
    // LOAD STUDENT CONDUCT
    // ------------------------------------------

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
        .eq("student_id", student.id)
        .order("created_at", {
            ascending: false
        });


    console.log(
        "ADMIN STUDENT CONDUCT:",
        records
    );

    console.log(
        "ADMIN STUDENT CONDUCT ERROR:",
        error
    );


    if (error) {

        container.innerHTML = `
            <div class="empty-state">
                Unable to load conduct records.
            </div>
        `;

        return;
    }


    // ------------------------------------------
    // STUDENT SUMMARY
    // ------------------------------------------

    const countElement =
        document.getElementById(
            "adminStudentConductCount"
        );


    const positiveElement =
        document.getElementById(
            "adminStudentPositive"
        );


    const concernsElement =
        document.getElementById(
            "adminStudentConcerns"
        );


    const positiveRecords =
        records.filter(function (record) {

            return String(
                record.type || ""
            ).toLowerCase() === "positive";

        });


    const negativeRecords =
        records.filter(function (record) {

            return String(
                record.type || ""
            ).toLowerCase() === "negative";

        });


    if (countElement) {

        countElement.textContent =
            records.length;
    }


    if (positiveElement) {

        positiveElement.textContent =
            positiveRecords.length;
    }


    if (concernsElement) {

        concernsElement.textContent =
            negativeRecords.length;
    }


    // ------------------------------------------
    // NO RECORDS
    // ------------------------------------------

    if (records.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No conduct records found
                for this student.
            </div>
        `;

        return;
    }


    // ------------------------------------------
    // CALCULATE POINTS
    // ------------------------------------------

    const totalPoints =
        records.reduce(
            function (total, record) {

                const points =
                    Number(
                        record.points || 0
                    );

                if (
                    String(
                        record.type || ""
                    ).toLowerCase() ===
                    "negative"
                ) {

                    return total - points;

                }

                return total + points;

            },
            0
        );


    // ------------------------------------------
    // CONDUCT TABLE
    // ------------------------------------------

    let tableHTML = `

        <div class="table-wrapper">

            <table class="admin-grades-table">

                <thead>

                    <tr>

                        <th>Type</th>

                        <th>Title</th>

                        <th>Description</th>

                        <th>Points</th>

                        <th>Date</th>

                    </tr>

                </thead>

                <tbody>
    `;


    records.forEach(
        function (record) {

            const date =
                record.created_at
                    ? new Date(
                        record.created_at
                    ).toLocaleDateString(
                        "en-GB"
                    )
                    : "—";


            const type =
                String(
                    record.type || ""
                ).toLowerCase();


            const points =
                Number(
                    record.points || 0
                );


            const displayPoints =
                type === "negative"
                    ? `-${points}`
                    : `+${points}`;


            tableHTML += `

                <tr>

                    <td>
                        <strong>
                            ${
                                record.type ||
                                "—"
                            }
                        </strong>
                    </td>


                    <td>
                        ${
                            record.title ||
                            "—"
                        }
                    </td>


                    <td>
                        ${
                            record.description ||
                            "No description"
                        }
                    </td>


                    <td>
                        ${displayPoints}
                    </td>


                    <td>
                        ${date}
                    </td>

                </tr>

            `;
        }
    );


    tableHTML += `

                </tbody>

            </table>

        </div>


        <div class="conduct-total-points">

            <strong>
                Conduct Points:
            </strong>

            <span>
                ${totalPoints}
            </span>

        </div>

    `;


    container.innerHTML =
        tableHTML;
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

// ==========================================
// TEACHER TIMETABLE
// ==========================================

async function loadTeacherTimetable() {

    console.log("Loading teacher timetable...");

    const subjectSelect =
        document.getElementById("subjectSelect");

    const timetableContainer =
        document.getElementById(
            "teacherTimetableContainer"
        );

    const timetableDescription =
        document.getElementById(
            "timetableDescription"
        );

    const teacherNameElement =
        document.getElementById("teacherName");


    if (!subjectSelect || !timetableContainer) {

        console.log(
            "Teacher timetable elements not found."
        );

        return;

    }


    try {

        // ==========================================
        // GET CURRENT LOGGED-IN USER
        // ==========================================

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

            console.error(
                "No logged-in teacher found."
            );

            window.location.href =
                "login.html";

            return;

        }


        console.log(
            "Logged-in teacher:",
            user.id
        );


        // ==========================================
        // GET TEACHER PROFILE
        // ==========================================

        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select(`
                full_name,
                email,
                role
            `)
            .eq("id", user.id)
            .single();


        if (profileError) {
            throw profileError;
        }


        console.log(
            "Teacher profile:",
            profile
        );


        if (
            profile.role !== "teacher"
        ) {

            console.error(
                "Logged-in account is not a teacher."
            );

            return;

        }


        // Show teacher name

        if (teacherNameElement) {

            teacherNameElement.textContent =
                profile.full_name ||
                "Teacher";

        }


       // ==========================================
// GET TEACHER'S TIMETABLE
// ==========================================

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
    .eq(
        "teacher_id",
        user.id
    )
    .order(
        "day_of_week",
        {
            ascending: true
        }
    )
    .order(
        "start_time",
        {
            ascending: true
        }
    );


if (timetableError) {
    throw timetableError;
}


console.log(
    "Teacher timetable:",
    timetable
);
        // ==========================================
        // NO TIMETABLE
        // ==========================================

        if (
            !timetable ||
            timetable.length === 0
        ) {

            subjectSelect.innerHTML = `
                <option value="">
                    No subjects found
                </option>
            `;


            timetableContainer.innerHTML = `
                <div class="empty-state">
                    <p>
                        No timetable records were found for this teacher.
                    </p>
                </div>
            `;

            return;

        }


        // ==========================================
        // CREATE UNIQUE SUBJECT LIST
        // ==========================================

        const subjects = [];


        timetable.forEach(entry => {

            if (
                entry.subjects &&
                !subjects.some(
                    subject =>
                        subject.id ===
                        entry.subjects.id
                )
            ) {

                subjects.push(
                    entry.subjects
                );

            }

        });

// ==========================================
// FILL SUBJECT DROPDOWN
// ==========================================

subjectSelect.innerHTML = `
    <option value="">
        All subjects
    </option>
`;


subjects.forEach(subject => {

    const option =
        document.createElement("option");

    option.value = subject.id;

    option.textContent =
        `${subject.name} (${subject.code})`;

    subjectSelect.appendChild(option);

});

// ==========================================
// SHOW TIMETABLE
// ==========================================

function showTeacherTimetable(entries) {

    if (!entries || entries.length === 0) {

        timetableContainer.innerHTML = `
            <div class="teacher-timetable-empty">

                <h3>No lessons found</h3>

                <p>
                    There are no timetable entries
                    for this selection.
                </p>

            </div>
        `;

        return;
    }


    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];


    const today =
        new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long"
            }
        );


    let html = "";


    days.forEach(day => {

        const dayEntries =
            entries.filter(
                entry =>
                    entry.day_of_week === day
            );


        if (dayEntries.length === 0) {
            return;
        }


        html += `

            <div class="teacher-timetable-day">

                <div class="
                    teacher-timetable-day-header
                    ${day === today ? "today" : ""}
                ">

                    <h3>
                        ${day}
                    </h3>

                    <span>
                        ${dayEntries.length}
                        ${dayEntries.length === 1
                            ? "lesson"
                            : "lessons"}
                    </span>

                </div>
        `;


      dayEntries.forEach(entry => {

    const subjectName =
        entry.subjects?.name ||
        "Subject";

    const className =
        entry.class_name ||
        "Class not specified";

    const room =
        entry.room ||
        "Room not specified";

    const startTime =
        formatTeacherTime(
            entry.start_time
        );

    const endTime =
        formatTeacherTime(
            entry.end_time
        );


    html += `

        <div class="
            teacher-timetable-entry
            ${day === today
                ? "today-lesson"
                : ""}
        ">

            <div class="teacher-timetable-time">

                <strong>
                    ${startTime}
                </strong>

                <span>
                    ${endTime}
                </span>

            </div>


            <div class="teacher-timetable-details">

                <h4>
                    ${subjectName}
                </h4>

                <p>
                    <strong>Class:</strong>
                    ${className}
                </p>

                <p>
                    <strong>Room:</strong>
                    ${room}
                </p>

            </div>

        </div>

    `;

});


html += `
    </div>
`;

});


timetableContainer.innerHTML =
    html;

}

// ==========================================
// FORMAT TEACHER TIME
// ==========================================

function formatTeacherTime(time) {

    if (!time) {
        return "";
    }

    const parts =
        time.split(":");

    let hours =
        parseInt(parts[0], 10);

    const minutes =
        parts[1];

    const period =
        hours >= 12
            ? "PM"
            : "AM";

    hours =
        hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;

}


// ==========================================
// SHOW INITIAL TIMETABLE
// ==========================================

showTeacherTimetable(
    timetable
);


// ==========================================
// SUBJECT CHANGE
// ==========================================

subjectSelect.addEventListener(
    "change",
    function () {

        const selectedSubject =
            this.value;


        if (!selectedSubject) {

            showTeacherTimetable(
                timetable
            );

            if (timetableDescription) {

                timetableDescription.textContent =
                    "View your weekly teaching schedule.";

            }

            return;

        }


        const filteredEntries =
            timetable.filter(
                entry =>
                    String(entry.subject_id) ===
                    String(selectedSubject)
            );


        showTeacherTimetable(
            filteredEntries
        );


        const selectedSubjectData =
            subjects.find(
                subject =>
                    String(subject.id) ===
                    String(selectedSubject)
            );


        if (
            timetableDescription &&
            selectedSubjectData
        ) {

            timetableDescription.textContent =
                `${selectedSubjectData.name} teaching schedule`;

        }

    }
);

// ==========================================
// SUBJECT CHANGE
// ==========================================

subjectSelect.addEventListener(
    "change",
    function () {

        const selectedSubject =
            this.value;


        if (!selectedSubject) {

            showTeacherTimetable(
                timetable
            );

            if (timetableDescription) {

                timetableDescription.textContent =
                    "View your weekly teaching schedule.";

            }

            return;

        }


        const filteredEntries =
            timetable.filter(
                entry =>
                    String(entry.subject_id) ===
                    String(selectedSubject)
            );


        showTeacherTimetable(
            filteredEntries
        );


        const selectedSubjectData =
            subjects.find(
                subject =>
                    String(subject.id) ===
                    String(selectedSubject)
            );


        if (
            timetableDescription &&
            selectedSubjectData
        ) {

            timetableDescription.textContent =
                `${selectedSubjectData.name} teaching schedule`;

        }

    }
);
    }

    catch (error) {

        console.error(
            "Teacher timetable error:",
            error
        );

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
// TEACHER ON DUTY
// ==========================================

async function loadTeacherDuty() {

    console.log("Loading teacher on duty...");

    const teacherDutyContainer =
        document.getElementById(
            "teacherDutyContainer"
        );

    const teacherDutySchedule =
        document.getElementById(
            "teacherDutySchedule"
        );

    const teacherTodayDuty =
        document.getElementById(
            "teacherTodayDuty"
        );


    // ==========================================
    // GET TODAY'S DATE
    // ==========================================

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    console.log(
        "Teacher duty date being searched:",
        today
    );


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
                duty_date,
                duty_area,
                start_time,
                end_time
            `)
            .eq(
                "duty_date",
                today
            )
            .order(
                "start_time",
                {
                    ascending: true
                }
            );


        if (todayError) {
            throw todayError;
        }


        console.log(
            "Today's teacher duty:",
            todayData
        );


        // ==========================================
        // GET DUTY SCHEDULE
        // ==========================================

        const {
            data: scheduleData,
            error: scheduleError
        } = await supabaseClient
            .from("teacher_duty")
            .select(`
                id,
                teacher_name,
                duty_date,
                duty_area,
                start_time,
                end_time
            `)
            .gte(
                "duty_date",
                today
            )
            .order(
                "duty_date",
                {
                    ascending: true
                }
            )
            .order(
                "start_time",
                {
                    ascending: true
                }
            );


        if (scheduleError) {
            throw scheduleError;
        }


        console.log(
            "Teacher duty schedule:",
            scheduleData
        );


        // ==========================================
        // FORMAT TIME
        // ==========================================

        function formatDutyTime(time) {

            if (!time) {
                return "";
            }

            const parts =
                time.split(":");

            let hours =
                parseInt(
                    parts[0],
                    10
                );

            const minutes =
                parts[1];

            const period =
                hours >= 12
                    ? "PM"
                    : "AM";

            hours =
                hours % 12 || 12;

            return `${hours}:${minutes} ${period}`;

        }


        // ==========================================
        // FORMAT DATE
        // ==========================================

        function formatDutyDate(date) {

            if (!date) {
                return "";
            }

            const parts =
                date.split("-");

            const year =
                parseInt(
                    parts[0],
                    10
                );

            const month =
                parseInt(
                    parts[1],
                    10
                ) - 1;

            const day =
                parseInt(
                    parts[2],
                    10
                );

            const dutyDate =
                new Date(
                    year,
                    month,
                    day
                );

            return dutyDate.toLocaleDateString(
                "en-GB",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

        }


        // ==========================================
        // TODAY'S DUTY
        // ==========================================

        if (
            !todayData ||
            todayData.length === 0
        ) {

            if (teacherDutyContainer) {

                teacherDutyContainer.innerHTML = `
                    <div class="empty-state">

                        <p>
                            No teacher on duty has been
                            assigned today.
                        </p>

                    </div>
                `;

            }


            if (teacherTodayDuty) {

                teacherTodayDuty.textContent =
                    "No teacher on duty today.";

            }

        } else {

            const todayHTML =
                todayData.map(
                    duty => {

                        const startTime =
                            formatDutyTime(
                                duty.start_time
                            );

                        const endTime =
                            formatDutyTime(
                                duty.end_time
                            );

                        const dutyTime =
                            startTime && endTime
                                ? `${startTime} - ${endTime}`
                                : "Time not specified";


                        return `

                            <div class="admin-activity-item">

                                <div class="admin-activity-dot"></div>

                                <div>

                                    <strong>
                                        ${duty.teacher_name}
                                    </strong>

                                    <span>
                                        ${duty.duty_area}
                                        •
                                        ${dutyTime}
                                    </span>

                                </div>

                            </div>

                        `;

                    }
                ).join("");


            if (teacherDutyContainer) {

                teacherDutyContainer.innerHTML =
                    todayHTML;

            }


            if (teacherTodayDuty) {

                const names =
                    todayData.map(
                        duty =>
                            `${duty.teacher_name} — ${duty.duty_area}`
                    );

                teacherTodayDuty.textContent =
                    names.join(" | ");

            }

        }


        // ==========================================
        // DUTY SCHEDULE
        // ==========================================

        if (
            !scheduleData ||
            scheduleData.length === 0
        ) {

            if (teacherDutySchedule) {

                teacherDutySchedule.innerHTML = `
                    <div class="empty-state">

                        <p>
                            No upcoming duty assignments
                            have been scheduled.
                        </p>

                    </div>
                `;

            }

        } else {

            const scheduleHTML =
                scheduleData.map(
                    duty => {

                        const dutyDate =
                            formatDutyDate(
                                duty.duty_date
                            );

                        const startTime =
                            formatDutyTime(
                                duty.start_time
                            );

                        const endTime =
                            formatDutyTime(
                                duty.end_time
                            );

                        const dutyTime =
                            startTime && endTime
                                ? `${startTime} - ${endTime}`
                                : "Time not specified";


                        return `

                            <div class="admin-activity-item">

                                <div class="admin-activity-dot"></div>

                                <div>

                                    <strong>
                                        ${duty.teacher_name}
                                    </strong>

                                    <span>
                                        ${dutyDate}
                                        •
                                        ${duty.duty_area}
                                        •
                                        ${dutyTime}
                                    </span>

                                </div>

                            </div>

                        `;

                    }
                ).join("");


            if (teacherDutySchedule) {

                teacherDutySchedule.innerHTML =
                    scheduleHTML;

            }

        }


        console.log(
            "Teacher on duty loaded successfully."
        );

    } catch (error) {

        console.error(
            "Teacher duty error:",
            error
        );


        if (teacherDutyContainer) {

            teacherDutyContainer.innerHTML = `
                <div class="empty-state">

                    <p>
                        Unable to load teacher duty information.
                    </p>

                </div>
            `;

        }


        if (teacherDutySchedule) {

            teacherDutySchedule.innerHTML = `
                <div class="empty-state">

                    <p>
                        Unable to load duty schedule.
                    </p>

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
// TEACHER DUTY PAGE
// ==========================================

if (
    window.location.pathname.includes(
        "teacher-duty.html"
    )
) {

    loadTeacherDuty();

}


// ==========================================
// TEACHER DASHBOARD DUTY
// ==========================================

if (
    window.location.pathname.includes(
        "teacher-dashboard.html"
    )
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

// ==========================================
// ADMIN - LOGIN CREDENTIALS
// ==========================================

async function loadAdminCredentials() {

    const credentialsContainer =
        document.getElementById(
            "credentialsContainer"
        );

    const credentialsCount =
        document.getElementById(
            "credentialsCount"
        );

    if (!credentialsContainer) {
        return;
    }

    credentialsContainer.innerHTML =
        "<p>Loading student accounts...</p>";

    const {
        data: students,
        error
    } = await supabaseClient
        .from("students")
        .select(
            "id, user_id, full_name, admission_number, class_name, email"
        )
        .order(
            "full_name",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "ADMIN CREDENTIALS ERROR:",
            error
        );

        credentialsContainer.innerHTML =
            "<p>Unable to load student accounts.</p>";

        return;
    }

    credentialsCount.textContent =
        `${students.length} student${students.length === 1 ? "" : "s"}`;

    if (students.length === 0) {

        credentialsContainer.innerHTML =
            "<p>No students found.</p>";

        return;
    }

    credentialsContainer.innerHTML = "";

    students.forEach(student => {

        const card =
            document.createElement("div");

        card.className =
            "credential-student-card";

        const initials =
            student.full_name
                ? student.full_name
                    .split(" ")
                    .map(name =>
                        name.charAt(0)
                    )
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "S";

        const accountStatus =
            student.user_id
                ? "Active"
                : "No login account";

        // Get temporary password from this browser session
        const savedPassword =
            sessionStorage.getItem(
                `studentPassword_${student.id}`
            ) || "";

        card.innerHTML = `

            <div class="credential-student-info">

                <div class="student-admin-avatar">
                    ${initials}
                </div>

                <div class="credential-student-details">

                    <h3>
                        ${student.full_name || "Unnamed Student"}
                    </h3>

                    <p>
                        <strong>Admission:</strong>
                        ${student.admission_number || "—"}
                    </p>

                    <p>
                        <strong>Class:</strong>
                        ${student.class_name || "—"}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${student.email || "No email"}
                    </p>

                </div>

            </div>


            <div class="credential-account">

                <span class="credential-status">
                    ${accountStatus}
                </span>

                ${
                    student.user_id
                    ? `
                        <div class="student-password-box">

                            <label>
                                Student Password
                            </label>

                            <div class="password-input-row">

                                <input
                                    type="text"
                                    id="student-password-${student.id}"
                                    value="${savedPassword}"
                                    placeholder="No password available"
                                    readonly
                                >

                                <button
                                    type="button"
                                    onclick="copyStudentPassword('${student.id}')">
                                    Copy
                                </button>

                            </div>

                        </div>

                        <button
                            class="reset-password-button"
                            onclick="resetStudentPassword('${student.id}')">
                            Reset Password
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

        credentialsContainer.appendChild(
            card
        );

    });

}

// ==========================================
// SEARCH LOGIN CREDENTIALS
// ==========================================

const credentialsSearch =
    document.getElementById(
        "credentialsSearch"
    );

if (credentialsSearch) {

    credentialsSearch.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .trim()
                    .toLowerCase();

            const cards =
                document.querySelectorAll(
                    "#credentialsContainer > *"
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
        // REMOVE SAVED PASSWORD
        // ==========================================

        sessionStorage.removeItem(
            `studentPassword_${studentId}`
        );

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
