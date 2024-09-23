// Archivo para manejo de ecommerce

updateCartTotal();

// Botón Agregar producto al carrito
async function addProductToCart(button) {
	toggleOverlay(true); // Activar la capa de bloqueo

	const quantity = button.parentElement.querySelector("#quantity").value;
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
				body: JSON.stringify({ quantity }),
			});

			const data = await response.json();
			if (response.ok) {
				updateCartCount();

				Swal.fire({
					text: data.message,
					allowOutsideClick: false,
					icon: "success",
				});
			} else {
				Swal.fire({
					text: data.error || "Error al agregar producto al carrito",
					allowOutsideClick: false,
					icon: "error",
				});
			}
			toggleOverlay(false);
		} catch (error) {
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
		Swal.fire({
			text: error.message || "Error al obtener/crear carrito",
			allowOutsideClick: false,
			icon: "error",
		});
	}
}

// Actualiza el ícono del carrito
async function updateCartCount() {
	try {
		const response = await fetch("/api/carts/count");
		const data = await response.json();

		const cartCount = document.getElementById("cart-count");
		if (data.count > 0) {
			cartCount.innerText = data.count;
			cartCount.classList.remove("d-none");
		} else {
			cartCount.classList.add("d-none");
		}
	} catch (error) {
		console.error("Error al obtener la cantidad del carrito:", error);
	}
}

// Cambiar cantidad (desde /Products)
function changeQuantity(button, change) {
	const input = button.parentElement.querySelector("#quantity");
	let currentValue = parseInt(input.value);
	currentValue += change;

	if (currentValue < 1) currentValue = 1;
	if (currentValue > parseInt(input.max)) currentValue = parseInt(input.max);
	input.value = currentValue;
}

// Cambiar cantidad (desde el carrito) y actualizar el precio total del producto y del carrito
async function changeQuantityFromCart(button, change, unitPrice, productId, cartId) {
	const input = document.getElementById(`quantity-${productId}`);
	let currentValue = parseInt(input.value);
	currentValue += change;

	if (currentValue < 1) currentValue = 1;
	if (currentValue > parseInt(input.max)) currentValue = parseInt(input.max);
	input.value = currentValue;

	try {
		// Actualizar el cart en la base de datos
		const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ quantity: currentValue }),
		});
		const result = await response.json();

		// Actualiza el precio total del producto
		const totalPriceElement = document.getElementById(`total-price-${productId}`);
		const newTotalPrice = unitPrice * currentValue;
		totalPriceElement.textContent = `$${newTotalPrice.toFixed(2)}`; // Formato con dos decimales

		// Actualiza el total del carrito
		updateCartTotal();
	} catch (error) {
		Swal.fire({
			text: error.message || "Error al actualizar el carrito",
			allowOutsideClick: false,
			icon: "error",
		});
	}
}

// Función para actualizar el total del carrito
function updateCartTotal() {
	let total = 0;
	const totalPriceElements = document.querySelectorAll("[id^='total-price-']");

	totalPriceElements.forEach((priceElement) => {
		total += parseFloat(priceElement.textContent.replace("$", ""));
	});

	const cartTotalElement = document.getElementById("cart-total");
	cartTotalElement.textContent = `$${total.toFixed(2)}`;
	return total;
}

// Proceso de compra
function confirmPurchase(button) {
	const total = updateCartTotal();
	Swal.fire({
		title: "Confirmar compra",
		text: `Confirma la compra por un total de ${total}`,
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: "#3085d6",
		cancelButtonColor: "#d33",
		confirmButtonText: "Sí, confirmo",
		cancelButtonText: "No",
	}).then((result) => {
		if (result.isConfirmed) {
			purchase(button);
		}
	});
}

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
