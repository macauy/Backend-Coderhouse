// import ProductService from "../services/products.dao.mdb.js";
import service from "../patterns/dao.factory.js";
import UserController from "./user.controller.js";
import { validatePage, validatePageSize, validateSort } from "../utils/http.utils.js";
import { errorsDictionary } from "../errors/errors.dictionary.js";
import CustomError from "../errors/CustomError.class.js";
import { sendDeleteProductEmail } from "../helpers/mailer.js";
import { logger } from "../helpers/logger.js";

// const service = new ProductService();
const userController = new UserController();

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
		let query = { status: true }; // Solo traer productos con status 'true'
		if (sort) sortFil = { price: validateSort(sort) };
		if (category) query.category = category;
		if (stock) {
			stock = parseInt(stock);
			query.stock = { $gte: stock };
		}

		try {
			const productos = await service.getPaginated(query, limit, page, sort);

			let filters = "";
			filters += `&status=${true}`;
			if (query.category) filters += `&category=${category}`;
			if (query.stock) filters += `&stock=${stock}`;
			if (sort) filters += `&sort=${sort}`;
			productos.hasPrevPage ? (productos.prevLink = `?limit=${limit}&page=${productos.prevPage}${filters}`) : (productos.prevLink = null);
			productos.hasNextPage ? (productos.nextLink = `?limit=${limit}&page=${productos.nextPage}${filters}`) : (productos.nextLink = null);

			const pageNumbers = [];
			for (let i = 1; i <= productos.totalPages; i++) {
				pageNumbers.push({
					number: i,
					isActive: i === productos.page,
					link: `?limit=${limit}&page=${i}${filters}`,
				});
			}
			productos.pageNumbers = pageNumbers;

			return productos;
		} catch (error) {
			logger.debug("Error al obtener los productos:", error);
			throw new Error(error.message);
		}
	}

	async getOne(filter) {
		try {
			const product = await service.getOne(filter);
			return product;
		} catch (err) {
			logger.debug("Error al obtener producto:", err);
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
				logger.debug("codigo duplicado");
				throw new CustomError(errorsDictionary.RECORD_ADDED_ERROR, `Ya existe un producto con '${campoDuplicado}' con valor '${valorDuplicado}'`);
			}
			logger.debug("Catch ProductController - Error al agregar producto:", error);
			// throw new Error("Error al agregar el producto");
			throw new CustomError(errorsDictionary.FEW_PARAMETERS);
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
				logger.debug("Error al actualizar producto - campo duplicado:", error);
				throw new Error(`Ya existe un producto con '${campoDuplicado}' con valor '${valorDuplicado}'`);
			}
			logger.debug("Error al actualizar producto:", error);
			throw new Error(error.message);
		}
	}

	async delete(id) {
		try {
			let product = await service.getOne({ _id: id });

			// si es de un usuario premium enviar mail notificando
			if (product.owner != "admin") {
				const user = await userController.getOne({ _id: product.owner });

				// Verificar si el usuario es premium y tiene un email
				if (user && user.role == "premium" && user.email) {
					try {
						// Enviar el correo notificando al usuario de la eliminación del producto
						await sendDeleteProductEmail(user.email, product.code, product.title);
					} catch (emailError) {
						logger.error("Error al enviar el correo de eliminación del producto:", emailError.message);
					}
				}
			}

			await service.update(id, { status: false });
			return product;
		} catch (error) {
			logger.debug("Error al eliminar producto:", error);
			throw new Error(error.message);
		}
	}

	async checkOwner(id, user) {
		let product = await service.getOne({ _id: id });

		if (product.owner != user._id) throw new Error("Usuario no habilitado para eliminar este producto");
		else return true;
	}

	async getOwner(id, user) {
		let product = await service.getOne({ _id: id });
		return product.owner;
	}
}

export default ProductController;
