const form = document.getElementById("login-form");

document.addEventListener("submit", async (event) => {
	event.preventDefault();

	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;
	const url = form.action;

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		if (!response.ok) {
			const errorMessage = await response.text();
			document.getElementById("error-message").innerText = errorMessage;
			document.getElementById("error-message").style.display = "block";
		} else {
			window.location.href = response.url;
		}
	} catch (error) {
		console.error("Error:", error);
	}
});
