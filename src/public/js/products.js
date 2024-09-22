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

		if (response.ok) {
			location.reload();
			Swal.fire({
				text: response.statusText || "Producto agregado",
				allowOutsideClick: false,
				icon: "success",
			});
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

function toggleOverlay(active) {
	const overlay = document.getElementById("overlay");
	active ? overlay.classList.add("active") : overlay.classList.remove("active");
}
