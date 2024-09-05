const userId = document.getElementById("user-data").getAttribute("data-user-id"); // Obtener el userId

document.getElementById("profile-pic-input").addEventListener("change", async function () {
	toggleOverlay(true);

	const form = document.getElementById("profile-pic-form");
	const fileInput = document.getElementById("profile-pic-input");

	const formData = new FormData();
	formData.append("profile", fileInput.files[0]); // Añadir la imagen seleccionada al FormData

	try {
		const response = await fetch(`/api/users/${userId}/profile`, {
			method: "POST",
			body: formData,
		});

		const result = await response.json();

		if (response.ok) {
			// Actualiza la imagen de perfil en la página
			document.getElementById("profile-pic-display").src = result.data;
		} else {
			Swal.fire({
				text: result.message || "Error al actualizar la imagen",
				allowOutsideClick: false,
				icon: "error",
			});
		}
	} catch (error) {
		console.error("Error al subir la imagen", error);
		Swal.fire({
			text: error.message || "Error al subir la imagen",
			allowOutsideClick: false,
			icon: "error",
		});
	} finally {
		toggleOverlay(false);
	}
});

const documentUploadForm = document.getElementById("documentUploadForm");
const documentList = document.getElementById("documentList");

// Manejar la subida de documentos
documentUploadForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	toggleOverlay(true);

	const formData = new FormData(documentUploadForm);

	try {
		const response = await fetch(documentUploadForm.action, {
			method: "POST",
			body: formData,
		});

		const result = await response.json();

		if (result.status === "success") {
			// Actualizar la lista de documentos
			updateDocumentList(result.data);
			documentUploadForm.reset();
			Swal.fire({
				icon: "success",
				text: result.message || "Documentos cargados exitosamente",
			});
		} else {
			Swal.fire({
				text: result.message || "Error al subir documento",
				allowOutsideClick: false,
				icon: "error",
			});
		}
	} catch (error) {
		console.error("Error:", error);
		Swal.fire({
			text: error.message || "Ocurrió un error al subir los documentos",
			allowOutsideClick: false,
			icon: "error",
		});
	} finally {
		toggleOverlay(false);
	}
});

// Manejar la eliminación de documentos
documentList.addEventListener("click", async (event) => {
	if (event.target.classList.contains("delete-doc")) {
		const li = event.target.closest("li");
		const documentId = li.dataset.id;

		try {
			const response = await fetch(`/api/users/{{user._id}}/documents/${documentId}`, {
				method: "DELETE",
			});

			const result = await response.json();

			if (result.status === "success") {
				// Eliminar el documento de la lista
				li.remove();
			} else {
				alert("Error al eliminar documento: " + result.message);
			}
		} catch (error) {
			console.error("Error:", error);
			alert("Ocurrió un error al eliminar documento.");
		}
	}
});

// Función para actualizar la lista de documentos
function updateDocumentList(documents) {
	documentList.innerHTML = "";
	documents?.forEach((doc) => {
		const li = document.createElement("li");
		li.className = "list-group-item d-flex justify-content-between align-items-center";
		li.dataset.id = doc._id;
		li.innerHTML = `
			<i class="fas fa-file-alt"></i>
			${doc.name}
		`;
		documentList.appendChild(li);
	});
}

const userRole = document.getElementById("user-role");
const requestPremiumButton = document.getElementById("requestPremium");

requestPremiumButton?.addEventListener("click", function () {
	fetch(`/api/users/premium/${userId}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.status === "success") {
				console.log("data", data);

				userRole.value = data.role;
				data.role === "premium" ? (requestPremiumButton.disabled = true) : (requestPremiumButton.disabled = false);

				Swal.fire({
					icon: "success",
					text: data.message || "Tu solicitud para convertirte en premium ha sido enviada.",
				}).then((result) => location.reload());
			} else {
				Swal.fire({
					icon: "error",
					title: "Error",
					text: data.message || "No se pudo procesar la solicitud.",
				});
			}
		})
		.catch((error) => {
			console.error("Error:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Ocurrió un error inesperado.",
			});
		});
});

function toggleOverlay(active) {
	const overlay = document.getElementById("overlay");
	if (active) {
		overlay.classList.add("active");
	} else {
		overlay.classList.remove("active");
	}
}
