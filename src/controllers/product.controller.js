import ProductService from "../services/products.dao.mdb.js";
import { validatePage, validatePageSize, validateSort } from "../utils/http.utils.js";

const service = new ProductService();

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
	}

	async getOne(filter) {
		try {
			return await service.getOne(filter);
		} catch (err) {
			return err.message;
		}
	}

	async add(data) {
		try {
			const normalizedData = new ProductsDTO(data);
			return await service.add(normalizedData.product);
		} catch (error) {
			if (error.code && error.code === 11000) {
				// Si el error es de clave duplicada
				const campoDuplicado = Object.keys(error.keyValue)[0];
				const valorDuplicado = error.keyValue[campoDuplicado];
				throw new Error(`Ya existe un producto con '${campoDuplicado}' con valor '${valorDuplicado}'`);
			}
			throw new Error("Error al agregar el producto");
		}
	}

	async update(id, data) {
		try {
			return await service.update(id, data);
		} catch (error) {
			if (error.code && error.code === 11000) {
				// Si el error es de clave duplicada
				const campoDuplicado = Object.keys(error.keyValue)[0];
				const valorDuplicado = error.keyValue[campoDuplicado];
				throw new Error(`Ya existe un producto con '${campoDuplicado}' con valor '${valorDuplicado}'`);
			}
			return error.message;
		}
	}

	async delete(id) {
		try {
			return await service.delete(id);
		} catch (err) {
			return err.message;
		}
	}
}

export default ProductController;
