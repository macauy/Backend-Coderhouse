const wsServer = "ws://localhost:8080";
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

// --------- SOCKETS ----------

// Escucha evento de nuevo producto
socketClient.on("newProduct", (product) => {
	const item = `<tr id="product${product.id}">
	<td>${product.code}</td>
	<td>${product.category}</td>
	<td>${product.title}</td>
	<td>${product.description}</td>
	<td>${product.price}</td>
	<td>${product.stock}</td>
	<td>
		<button	class="delete-btn" title="Eliminar producto" onclick="deleteProduct(${product.id})">
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

// Esucha evento de respuesta
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

	const fila = document.getElementById(`product${id}`);
	productsList.removeChild(fila);
});
