const wsServer = "ws://localhost:5000";
const socketClient = io(wsServer);

const productsList = document.getElementById("productsList");
const productForm = document.getElementById("productForm");

// Evento del formulario - Agregar producto
productForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	const title = document.getElementById("title").value;
	const description = document.getElementById("description").value;
	const code = document.getElementById("code").value;
	const category = document.getElementById("category").value;
	const stock = document.getElementById("stock").value;
	const price = document.getElementById("price").value;

	const product = {
		title,
		description,
		code,
		price,
		stock,
		category,
	};

	// Emite evento de nuevo producto
	socketClient.emit("newProduct", product);

	productForm.reset();
});

// Boton Eliminar
const deleteProduct = async (id) => {
	socketClient.emit("deleteProduct", id);
};

// Boton Agregar producto al carrito
function addProductToCart(button) {
	const cid = button.dataset.cid;
	const pid = button.dataset.pid;

	// Enviar solicitud al endpoint para agregar el producto al carrito
	fetch(`/api/carts/${cid}/products/${pid}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((response) => {
			if (!response.ok) {
				Swal.fire({
					text: "Error al agregar producto al carrito",
					allowOutsideClick: false,
					icon: "error",
				});
			}
			return response.json();
		})
		.then((data) => {
			console.log(data);
			Swal.fire({
				text: data.message,
				allowOutsideClick: false,
				icon: "success",
			});
		})
		.catch((error) => {
			console.error(error);
			Swal.fire({
				text: "Error al agregar producto al carrito",
				allowOutsideClick: false,
				icon: "error",
			});
		});
}

// Boton Eliminar producto al carrito
function deleteProductFromCart(button) {
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
				Swal.fire({
					text: "Error al eliminar producto del carrito",
					allowOutsideClick: false,
					icon: "error",
				});
			}
			return response.json();
		})
		.then((data) => {
			console.log(data);
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
				text: "Error al eliminar producto del carrito",
				allowOutsideClick: false,
				icon: "error",
			});
		});
}

// --------- SOCKETS ----------

// Escucha evento de nuevo producto
socketClient.on("newProduct", (product) => {
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
});

// Esucha evento de eliminar producto
socketClient.on("deleteProduct", (id) => {
	const fila = document.getElementById(`product${id}`);
	productsList.removeChild(fila);
});

// Esucha evento genérico de respuesta
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
});
