const form = document.getElementById("login-form");

document.addEventListener("submit", async (event) => {
	event.preventDefault();

	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;
	const url = form.action;
	const errorMessageElement = document.getElementById("error-message");

	errorMessageElement.style.display = "none";
	errorMessageElement.innerText = "";

	try {
		// Deshabilitar boton submit
		const submitButton = form.querySelector("button[type='submit']");
		submitButton.disabled = true;

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		console.log("response login", response);

		if (!response.ok) {
			const errorMessage = await response.text();
			errorMessageElement.innerText = errorMessage;
			errorMessageElement.style.display = "block";
		} else {
			window.location.href = response.url;
		}
	} catch (error) {
		console.error("Error:", error);
	} finally {
		const submitButton = form.querySelector("button[type='submit']");
		submitButton.disabled = false;
	}
});
