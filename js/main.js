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

        <button
            class="edit-student-button"
            onclick="openEditStudentModal('${student.id}')">

            Edit

        </button>
    `;

    studentsContainer.appendChild(card);
});

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

    // Only fill these if the fields exist
    const phoneInput =
        document.getElementById("studentPhone");

    if (phoneInput) {
        phoneInput.value =
            student.phone || "";
    }

    const genderInput =
        document.getElementById("studentGender");

    if (genderInput) {
        genderInput.value =
            student.gender || "";
    }

    document.getElementById("studentModal")
        .classList.add("active");
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

                const { error } =
                    await supabaseClient
                        .from("students")
                        .insert([studentData]);


                if (error) {

                    console.error(
                        "STUDENT INSERT ERROR:",
                        error
                    );

                    message.textContent =
                        "Error adding student: " +
                        error.message;

                    return;
                }


                message.textContent =
                    "Student added successfully.";

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


// ==========================================
// ASSESSMENT GROUPS
// ==========================================

const assessmentGroups = {
    "Opener": [],
    "Midterm": [],
    "End Term": [],
    "Internal Test": []
};


// ==========================================
// GROUP GRADES
// ==========================================

grades.forEach(grade => {

    const assessment =
        (grade.assessment || "").toLowerCase();

    if (assessment.includes("opener")) {

        assessmentGroups["Opener"].push(grade);

    } else if (assessment.includes("midterm") ||
               assessment.includes("mid-term")) {

        assessmentGroups["Midterm"].push(grade);

    } else if (assessment.includes("end term") ||
               assessment.includes("end-term")) {

        assessmentGroups["End Term"].push(grade);

    } else if (assessment.includes("internal")) {

        assessmentGroups["Internal Test"].push(grade);

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
