// Archivo para admin de productos

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
			body: formData,
		});
		console.log(response);
		const result = await response.json();

		if (response.ok) {
			location.reload();
			Swal.fire({
				text: "Producto agregado",
				allowOutsideClick: false,
				icon: "success",
			});
			productForm.reset();
		} else {
			Swal.fire({
				text: result.error || "Error al crear el producto",
				allowOutsideClick: false,
				icon: "error",
			});
		}
		toggleOverlay(false);
	} catch (error) {
		Swal.fire({
			text: error.message || "Error al crear el producto",
			allowOutsideClick: false,
			icon: "error",
		});
	} finally {
		toggleOverlay(false); // Desactivar la capa de bloqueo
	}
});

// Botón Eliminar
const deleteProduct = async (id) => {
	toggleOverlay(true);
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

			renderDeleteProduct(id);
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
	} finally {
		toggleOverlay(false);
	}
};

function renderDeleteProduct(id) {
	const fila = document.getElementById(`product${id}`);
	if (fila) {
		productsList.removeChild(fila);
	}
}

// Limpiar el formulario cuando el modal se cierre
document.getElementById("productModal").addEventListener("hidden.bs.modal", function () {
	document.getElementById("productForm").reset();
});

function toggleOverlay(active) {
	const overlay = document.getElementById("overlay");
	active ? overlay.classList.add("active") : overlay.classList.remove("active");
}

// Filtros
document.getElementById("clearFilters").addEventListener("click", function () {
	document.getElementById("category").selectedIndex = 0;
	document.getElementById("search").value = "";
	window.location.href = window.location.pathname;
});
