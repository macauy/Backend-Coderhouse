const usersList = document.getElementById("usersList");

function confirmDeleteUser(id) {
	Swal.fire({
		title: "Confirma eliminar el usuario?",
		text: "No podrás revertir esta acción",
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: "#3085d6",
		cancelButtonColor: "#d33",
		confirmButtonText: "Sí",
		cancelButtonText: "No",
	}).then((result) => {
		if (result.isConfirmed) {
			deleteUser(id);
		}
	});
}

async function deleteInactiveUsers() {
	toggleOverlay(true);

	try {
		const response = await fetch(`/api/users`, {
			method: "DELETE",
		});

		const result = await response.json();

		if (response.ok) {
			location.reload();

			Swal.fire({
				text: "Usuarios eliminados",
				icon: "success",
			});
		} else {
			Swal.fire({
				text: result.error || "Error al eliminar usuarios inactivos",
				icon: "error",
			});
		}
	} catch (error) {
		Swal.fire({
			text: error.message || "Error al eliminar los usuarios inactivos",
			icon: "error",
		});
	} finally {
		toggleOverlay(false);
	}
}

async function deleteUser(id) {
	toggleOverlay(true);

	try {
		const response = await fetch(`/api/users/${id}`, {
			method: "DELETE",
		});

		const result = await response.json();

		if (response.ok) {
			Swal.fire({
				text: "Usuario eliminado",
				icon: "success",
			});

			const fila = document.getElementById(`user${id}`);
			if (fila) {
				usersList.removeChild(fila);
			}
		} else {
			Swal.fire({
				text: result.error || "Error al eliminar el usuario",
				icon: "error",
			});
		}
	} catch (error) {
		Swal.fire({
			text: error.message || "Error al eliminar el producto",
			icon: "error",
		});
	} finally {
		toggleOverlay(false);
	}
}

async function confirmChangeRole(id) {
	try {
		// primero obtengo el rol actual
		const response = await fetch(`/api/users/${id}`, {
			method: "GET",
		});
		const result = await response.json();
		const role = result.data.role;

		// Obtengo el rol al cual cambiar
		if (role == "admin") {
			Swal.fire({
				text: "No es posible cambiar el rol de un usuario admin",
				icon: "warning",
			});
			return;
		}
		role == "user" ? (nextRole = "premium") : (nextRole = "user");

		// Disparo popup para confirmar
		Swal.fire({
			html: `¿Confirmas cambiar el rol del usuario de <b>${role}</b> a <b>${nextRole}</b>?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Sí",
			cancelButtonText: "No",
		}).then((result) => {
			if (result.isConfirmed) {
				changeRole(id);
			}
		});
	} catch (error) {
		Swal.fire({
			text: error.message || "Error al cambiar el rol del usuario",
			icon: "error",
		});
	}
}

async function changeRole(id) {
	toggleOverlay(true);
	try {
		const response = await fetch(`/api/users/role/${id}`, {
			method: "PUT",
		});

		const result = await response.json();

		if (response.ok) {
			if (result.status == "warning")
				Swal.fire({
					text: result.message || "No se realizaron cambios",
					icon: "warning",
				});
			else {
				Swal.fire({
					text: result.message || "Usuario actualizado",
					icon: "success",
				});

				const item = document.getElementById(`role${id}`);
				if (item) item.innerText = result.data;
			}
		} else {
			Swal.fire({
				text: result.error || "Error al cambiar el rol del usuario",
				icon: "error",
			});
		}
	} catch (error) {
		Swal.fire({
			text: error.message || "Error al cambiar el rol del usuario",
			icon: "error",
		});
	} finally {
		toggleOverlay(false);
	}
}

function toggleOverlay(active) {
	const overlay = document.getElementById("overlay");
	if (active) {
		overlay.classList.add("active");
	} else {
		overlay.classList.remove("active");
	}
}
