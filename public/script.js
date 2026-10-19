const loginForm = document.getElementById("loginForm");

const loginButton = document.getElementById("loginButton");

const message = document.getElementById("message");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;


    loginButton.disabled = true;

    loginButton.textContent = "Logging in...";

    message.textContent = "";

    message.className = "";


    try {

        const response = await fetch("/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });


        const data = await response.json();


        if (response.ok) {

            message.textContent =
                "Login successful!";

            message.className = "success";


            // Store JWT
            localStorage.setItem(
                "token",
                data.token
            );


            console.log("JWT Token:", data.token);

        } else {

            message.textContent =
                data.message ||
                data.error ||
                "Login failed";

            message.className = "error";

        }


    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server";

        message.className = "error";

    }


    loginButton.disabled = false;

    loginButton.textContent = "Login";

});