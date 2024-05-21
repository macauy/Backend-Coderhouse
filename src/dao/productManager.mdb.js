import Product from "./models/product.model.js";

class ProductManager {
	constructor() {}

	getAllProducts = async (limit) => {
		try {
			// Trae todos los productos con un límite especificado
			const productos = await Product.find().lean().limit(limit);
			return productos;
		} catch (error) {
			console.error("Error al obtener los productos:", error);
		}
	};

	addProduct = async (product) => {
		try {
			// Guarda el nuevo producto en la base de datos
			const producto = new Product(product);
			const productoGuardado = await producto.save();
			return {
				err: 0,
				msg: `Producto ${product.code} agregado`,
				payload: productoGuardado,
			};
		} catch (error) {
			if (error.code && error.code === 11000) {
				// Si el error es de clave duplicada
				const campoDuplicado = Object.keys(error.keyValue)[0];
				const valorDuplicado = error.keyValue[campoDuplicado];
				return {
					err: 1,
					msg: `Ya existe un producto con '${campoDuplicado}' con valor '${valorDuplicado}'`,
				};
			}
			return { err: 1, msg: "Error al agregar el producto" };
		}
	};

	getProductById = async (id) => {
		try {
			const product = await Product.findOne({ _id: id });
			if (!product)
				return { err: 1, msg: "No se encontró un producto con id: " + id };
			else {
				return { err: 0, payload: product };
			}
		} catch (error) {
			return { err: 1, msg: "Error al obtener el producto: " + error };
		}
	};

	updateProduct = async (id, updProd) => {
		try {
			let newProduct = await Product.updateOne({ _id: id }, updProd);
			return {
				err: 0,
				msg: `Se ha actualizado el producto de id ${id}`,
				payload: newProduct,
			};
		} catch (error) {
			if (error.code && error.code === 11000) {
				const campoDuplicado = Object.keys(error.keyValue)[0];
				const valorDuplicado = error.keyValue[campoDuplicado];
				return {
					err: 1,
					msg: `Ya existe un producto con '${campoDuplicado}' con valor '${valorDuplicado}'`,
				};
			}
			return { err: 1, msg: "Error al actualizar el producto: " + error };
		}
	};

	deleteProduct = async (id) => {
		try {
			const product = await Product.findOneAndDelete({ _id: id });
			if (!product)
				return { err: 1, msg: "No se encontró un proudcto con id: " + id };
			else {
				return {
					err: 0,
					msg: `Producto ${product.code} eliminado`,
					payload: product,
				};
			}
		} catch (error) {
			return { err: 1, msg: "Error al eliminar el producto: " + error };
		}
	};
}

export default ProductManager;
