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
