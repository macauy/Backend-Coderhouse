const wsServer = "ws://localhost:5000";
const socketClient = io(wsServer);

const productsList = document.getElementById("productsList");
const productForm = document.getElementById("productForm");

// Evento del formulario - Agregar producto

productForm?.addEventListener("submit", async (e) => {
	e.preventDefault();
	toggleOverlay(true);

	const formData = new FormData(e.target);

	try {
		const response = await fetch("/api/products", {
			method: "POST",
			body: formData, // Envía el FormData directamente
		});

		if (response.ok) {
			Swal.fire({
				text: response.statusText,
				allowOutsideClick: false,
				icon: "success",
			});
			location.reload();
		} else {
			Swal.fire({
				text: response.statusText || "Error al crear el producto",
				allowOutsideClick: false,
				icon: "error",
			});
		}
		toggleOverlay(false);
	} catch (error) {
		console.error("Error: ", error);
		Swal.fire({
			text: error.message || "Error al crear el producto",
			allowOutsideClick: false,
			icon: "error",
		});
	} finally {
		toggleOverlay(false); // Desactivar la capa de bloqueo
		productForm.reset();
	}
});

// Botón Eliminar
// const deleteProduct = async (id) => {
// 	socketClient.emit("deleteProduct", id);
// };

// Botón Eliminar
const deleteProduct = async (id) => {
	try {
		const response = await fetch(`/api/products/${id}`, {
			method: "DELETE",
		});

		const result = await response.json();

		if (response.ok) {
			Swal.fire({
				text: "Producto eliminado",
				allowOutsideClick: false,
				icon: "success",
			});

			socketClient.emit("deleteProduct", id);
		} else {
			Swal.fire({
				text: result.error || "Error al eliminar el producto",
				allowOutsideClick: false,
				icon: "error",
			});
		}
	} catch (error) {
		Swal.fire({
			text: error.message || "Error al eliminar el producto",
			allowOutsideClick: false,
			icon: "error",
		});
	}
};

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
				// socketClient.emit("cartUpdated", { itemCount: 5 });
				// socketClient.emit("cartUpdated", { cartId, uid });

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
function deleteProductFromCart(button) {
	toggleOverlay(true); // Activar la capa de bloqueo

	const cid = button.dataset.cid;
	const pid = button.dataset.pid;

	// Enviar solicitud al endpoint para eliminar el producto del carrito
	fetch(`/api/carts/${cid}/products/${pid}`, {
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

// Actualiza el ícono del carrito
function updateCartCount() {
	fetch("/api/carts/count")
		.then((response) => response.json())
		.then((data) => {
			document.getElementById("cart-count").innerText = data.count;
		})
		.catch((error) => console.error("Error al obtener la cantidad del carrito:", error));
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
	if (active) {
		overlay.classList.add("active");
	} else {
		overlay.classList.remove("active");
	}
}

// --------- SOCKETS ----------

// Escucha evento de nuevo producto
socketClient.on("newProductAdded", (product) => {
	console.log("cliente - newProductAdded", product);
	const item = `<tr id="product${product._id}">
	<td>${product.code}</td>
	<td>${product.category}</td>
	<td>${product.title}</td>
	<td>${product.description}</td>
	<td>${product.price}</td>
	<td>${product.stock}</td>
	<td>
		<button	class="delete-btn" title="Eliminar producto" onclick="deleteProduct('${product._id}')">
		Eliminar
		</button>
	</td>
	</tr>`;
	productsList.innerHTML += item;
	toggleOverlay(false);
});

// Escucha evento de eliminar producto
socketClient.on("deleteProduct", (id) => {
	const fila = document.getElementById(`product${id}`);
	if (fila) {
		productsList.removeChild(fila);
	}
	toggleOverlay(false);
});

// socketClient.on("updateCartCount", (data) => {
// 	console.log("cliente- cartUpdated");
// 	document.getElementById("cart-count").textContent = data.itemCount;
// });

// socketClient.on("cartUpdated", (data) => {
// 	console.log("cliente- cartUpdated");
// 	fetch("/api/carts/count")
// 		.then((response) => response.json())
// 		.then((data) => {
// 			document.getElementById("cart-count").innerText = data.count;
// 		})
// 		.catch((error) => console.error("Error al obtener la cantidad del carrito:", error));
// });

// Escucha evento genérico de respuesta
socketClient.on("response", (result) => {
	if (result.err) {
		Swal.fire({
			text: result.msg,
			allowOutsideClick: false,
			icon: "error",
		});
	} else {
		Swal.fire({
			text: result.msg,
			allowOutsideClick: false,
			icon: "success",
		});
	}
	toggleOverlay(false);
});
