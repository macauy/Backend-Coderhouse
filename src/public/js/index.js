// Archivo para manejo de ecommerce

// Botón Agregar producto al carrito
async function addProductToCart(button) {
	console.log("addProductToCart");
	toggleOverlay(true); // Activar la capa de bloqueo

	const pid = button.dataset.pid;
	const uid = button.dataset.uid;
	if (!uid) {
		Swal.fire({
			text: "Usuario no registrado",
			allowOutsideClick: false,
			icon: "error",
		});
		toggleOverlay(false);
	} else {
		try {
			const cartId = await getCartId(uid);

			if (!cartId) {
				throw new Error("No se pudo obtener el carrito");
			}
			// Send request to add product to cart
			const response = await fetch(`/api/carts/${cartId}/products/${pid}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});
			console.log("Luego del fetch.");
			const data = await response.json();
			if (response.ok) {
				console.log("response ok");

				updateCartCount();

				Swal.fire({
					text: data.message,
					allowOutsideClick: false,
					icon: "success",
				});
			} else {
				console.log("error en el add. data: ", data);
				Swal.fire({
					text: data.error || "Error al agregar producto al carrito",
					allowOutsideClick: false,
					icon: "error",
				});
			}
			toggleOverlay(false);
		} catch (error) {
			console.error("Catch addProductToCart - Error:", error);
			Swal.fire({
				text: error.message || "Error al agregar producto al carrito",
				allowOutsideClick: false,
				icon: "error",
			});
		} finally {
			toggleOverlay(false); // Desactivar la capa de bloqueo
		}
	}
}

// Botón Eliminar producto del carrito
async function deleteProductFromCart(button) {
	toggleOverlay(true); // Activar la capa de bloqueo

	const cid = button.dataset.cid;
	const pid = button.dataset.pid;

	// Enviar solicitud al endpoint para eliminar el producto del carrito
	await fetch(`/api/carts/${cid}/products/${pid}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Error al eliminar producto del carrito");
			}
			return response.json();
		})
		.then((data) => {
			updateCartCount();

			Swal.fire({
				text: data.message,
				allowOutsideClick: false,
				icon: "success",
			}).then((result) => {
				if (result.isConfirmed) {
					location.reload(); // Recargar la página si el usuario hizo clic en "OK"
				}
			});
		})
		.catch((error) => {
			console.error(error);
			Swal.fire({
				text: error.message || "Error al eliminar producto del carrito",
				allowOutsideClick: false,
				icon: "error",
			});
			toggleOverlay(false); // Desactivar la capa de bloqueo
		});
}

// Obtiene el carrito de sesión o crea uno
async function getCartId(userId) {
	try {
		// Intenta obtener el carrito de la sesión
		const response = await fetch("/api/sessions/cart", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		const data = await response.json();
		if (data.cart) {
			return data.cart;
		} else {
			console.log("no hay carrito en sesion, creo uno");
			// Si no hay carrito en la sesión, intenta crear uno nuevo
			const createResponse = await fetch("/api/carts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ user_id: userId }),
			});
			const result = await createResponse.json();
			if (createResponse.ok) {
				return result.data._id;
			} else {
				throw new Error(result.error || "Failed to create cart");
			}
		}
	} catch (error) {
		console.error("Error: ", error);
		Swal.fire({
			text: error.message || "Error al obtener/crear carrito",
			allowOutsideClick: false,
			icon: "error",
		});
	}
}

// Actualiza el ícono del carrito
async function updateCartCount() {
	await fetch("/api/carts/count")
		.then((response) => response.json())
		.then((data) => {
			document.getElementById("cart-count").innerText = data.count;
		})
		.catch((error) => console.error("Error al obtener la cantidad del carrito:", error));
}

// Proceso de compra
async function purchase(button) {
	const cid = button.dataset.cid;
	toggleOverlay(true); // Activar capa de bloqueo
	try {
		const response = await fetch(`/api/carts/${cid}/purchase`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});

		const result = await response.json();

		if (response.ok) {
			Swal.fire({
				icon: "success",
				title: "Compra confirmada",
				text: "La compra se ha realizado con éxito.",
			}).then(() => {
				window.location.reload();
			});
		} else {
			Swal.fire({
				icon: "error",
				title: result.error.message,
				text: result.error.detail || "Error al confirmar la compra. Intenta de nuevo.",
			});
		}
	} catch (error) {
		Swal.fire({
			icon: "error",
			title: "Error",
			text: error.message || "Error al confirmar la compra. Intenta de nuevo.",
		});
	} finally {
		toggleOverlay(false); // Desactivar la capa de bloqueo
	}
}

function toggleOverlay(active) {
	const overlay = document.getElementById("overlay");
	active ? overlay.classList.add("active") : overlay.classList.remove("active");
}
