import ProductsService from "../services/products.dao.mdb.js";
import { validatePage, validatePageSize, validateSort } from "../utils/http.utils.js";

const service = new ProductsService();

class ProductsDTO {
	constructor(product) {
		this.product = product;
		this.product.code = this.product.code.toUpperCase();
	}
}

class ProductManager {
	constructor() {}

	getAllProducts = async (page, limit, category, stock, sort) => {
		page = validatePage(page);
		limit = validatePageSize(limit);
		let sortFil = {};
		let query = {};
		if (sort) sortFil = { price: validateSort(sort) };
		if (category) query.category = category;
		if (stock) {
			stock = parseInt(stock);
			query.stock = { $gte: stock };
		}

		try {
			// Trae todos los productos con un límite especificado
			const productos = await service.getPaginated(query, limit, page, sort);

			let filters = "";
			if (query.category) filters += `&category=${category}`;
			if (query.stock) filters += `&stock=${stock}`;
			if (sort) filters += `&sort=${sort}`;
			productos.hasPrevPage ? (productos.prevLink = `?limit=${limit}&page=${productos.prevPage}${filters}`) : (productos.prevLink = null);
			productos.hasNextPage ? (productos.nextLink = `?limit=${limit}&page=${productos.nextPage}${filters}`) : (productos.nextLink = null);
			return productos;
		} catch (error) {
			console.error("Error al obtener los productos:", error);
		}
	};

	addProduct = async (product) => {
		try {
			// Guarda el nuevo producto en la base de datos
			const normalizedData = new ProductsDTO(product);
			const productoGuardado = await service.add(normalizedData.product);

			// const productoGuardado = await producto.save();
			return {
				err: 0,
				msg: `Producto ${productoGuardado.code} agregado`,
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
			// const product = await Product.findOne({ _id: id });
			const product = await service.getOne({ _id: id });
			if (!product) return { err: 1, msg: "No se encontró un producto con id: " + id };
			else {
				return { err: 0, payload: product };
			}
		} catch (error) {
			return { err: 1, msg: "Error al obtener el producto: " + error };
		}
	};

	updateProduct = async (id, update) => {
		try {
			// let newProduct = await Product.updateOne({ _id: id }, updProd);
			let newProduct = await service.update({ _id: id }, update, {});
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
			// const product = await Product.findOneAndDelete({ _id: id });
			const product = await service.delete({ _id: id });
			if (!product) return { err: 1, msg: "No se encontró un proudcto con id: " + id };
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
