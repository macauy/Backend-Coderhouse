// import ProductService from "../services/products.dao.mdb.js";
import service from "../patterns/dao.factory.js";
import { validatePage, validatePageSize, validateSort } from "../utils/http.utils.js";

// const service = new ProductService();

class ProductsDTO {
	constructor(product) {
		this.product = product;
		this.product.code = this.product.code.toUpperCase();
	}
}

class ProductController {
	constructor() {}

	async get(page, limit, category, stock, sort) {
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
			throw new Error(error.message);
		}
	}

	async getOne(filter) {
		try {
			const product = await service.getOne(filter);
			return product;
		} catch (err) {
			console.error("Error al obtener producto:", err);
			throw new Error(err.message);
		}
	}

	async add(data) {
		try {
			const normalizedData = new ProductsDTO(data);
			const product = await service.add(normalizedData.product);
			return product;
		} catch (error) {
			if (error.code && error.code === 11000) {
				const campoDuplicado = Object.keys(error.keyValue)[0];
				const valorDuplicado = error.keyValue[campoDuplicado];
				throw new Error(`Ya existe un producto con '${campoDuplicado}' con valor '${valorDuplicado}'`);
			}
			console.log("Error al agregar producto:", error);
			throw new Error("Error al agregar el producto");
		}
	}

	async update(id, data, session = null) {
		try {
			const product = await service.update(id, data, session);
			return product;
		} catch (error) {
			if (error.code && error.code === 11000) {
				const campoDuplicado = Object.keys(error.keyValue)[0];
				const valorDuplicado = error.keyValue[campoDuplicado];
				console.error("Error al actualizar producto - campo duplicado:", error);
				throw new Error(`Ya existe un producto con '${campoDuplicado}' con valor '${valorDuplicado}'`);
			}
			console.error("Error al actualizar producto:", error);
			throw new Error(error.message);
		}
	}

	async delete(id) {
		try {
			const product = await service.delete(id);
			return product;
		} catch (error) {
			console.error("Error al eliminar producto:", error);
			throw new Error(error.message);
		}
	}
}

export default ProductController;
