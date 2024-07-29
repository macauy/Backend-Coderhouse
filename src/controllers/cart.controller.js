import CartService from "../services/cart.dao.mdb.js";
import TicketController from "./ticket.controller.js";
import ProductController from "./product.controller.js";
import mongoose from "mongoose";
import CustomError from "../errors/CustomError.class.js";
import { errorsDictionary } from "../errors/errors.dictionary.js";
import { logger } from "../utils/logger.js";

const service = new CartService();
const ticketController = new TicketController();
const productController = new ProductController();

// DTO
class cartDTO {
	constructor(data) {
		this.products = [];
		this._user_id = data;
	}
}

class CartController {
	constructor() {}

	async get() {
		try {
			const carts = await service.get();
			return carts;
		} catch (error) {
			logger.error("Error al obtener carritos:", error);
			throw new Error(error.message);
		}
	}

	async getOne(filter) {
		try {
			const cart = await service.getOne(filter);
			return cart;
		} catch (error) {
			logger.error("Error al obtener carrito:", error);
			throw new Error(error.message);
		}
	}

	async add(data) {
		try {
			const normalizedData = new cartDTO(data);
			const cart = await service.add(normalizedData);
			return cart;
		} catch (error) {
			logger.error("Error al agregar carrito:", error);
			throw new Error(error.message);
		}
	}

	async update(id, products) {
		try {
			const cart = await service.update(id, { products });
			return cart;
		} catch (error) {
			logger.error("Error al actualizar carrito:", error);
			throw new Error(error.message);
		}
	}

	async delete(id) {
		try {
			const result = await service.delete(id);
			return result;
		} catch (error) {
			logger.error("Error al eliminar carrito:", error);
			throw new Error(error.message);
		}
	}

	async addToCart(cartId, productId) {
		try {
			const cart = await service.getOne({ _id: cartId });
			if (!cart) {
				throw new Error("Carrito no encontrado");
			}

			const productExists = cart.products.find((p) => p.product._id == productId);

			if (productExists) {
				productExists.quantity += 1;
			} else {
				cart.products.push({ product: productId, quantity: 1 });
			}

			const updatedCart = await service.update(cartId, cart);
			return updatedCart;
		} catch (error) {
			logger.error("Error al añadir producto al carrito:", error);
			// throw new Error(error.message);
			throw new CustomError({ ...errorsDictionary.RECORD_ADDED_ERROR, detail: error.message });
		}
	}

	async deleteFromCart(cartId, productId) {
		try {
			const cart = await service.getOne({ _id: cartId });
			if (!cart) {
				throw new Error("Carrito no encontrado");
			}

			cart.products = cart.products.filter((p) => p.product._id.toString() !== productId);

			const updatedCart = await service.update(cartId, cart);
			return updatedCart;
		} catch (error) {
			logger.error("Error al eliminar producto del carrito:", error);
			throw new Error(error.message);
		}
	}

	async updateProductQuantity(cartId, productId, quantity) {
		try {
			const cart = await service.getOne({ _id: cartId });
			if (!cart) {
				throw new Error("Carrito no encontrado");
			}

			const productExists = cart.products.find((p) => p.product._id == productId);
			if (productExists) {
				productExists.quantity = quantity;
				const updatedCart = await service.update(cartId, cart);
				return updatedCart;
			} else {
				throw new Error("Producto no encontrado en el carrito");
			}
		} catch (error) {
			logger.error("Error al actualizar cantidad del producto en el carrito:", error);
			throw new Error(error.message);
		}
	}

	async cleanCart(cartId, session) {
		try {
			const result = await service.update(cartId, { products: [] }, session);
			return result;
		} catch (error) {
			logger.error(`Error al vaciar el carrito con ID ${cartId}:`, error);
			throw new Error(error.message);
		}
	}

	async purchase(cartId) {
		// Uso de session para asegurar transaccionalidad
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Obtener el carrito con todos los productos
			let cart = await this.getOne({ _id: cartId });
			if (!cart) {
				throw new Error("Carrito no encontrado");
			}

			const outOfStockItems = [];
			const updatedProducts = [];
			const ticketItems = [];

			cart.products?.forEach((item) => {
				// Realizar control de stock
				if (item.product.stock < item.quantity) {
					outOfStockItems.push(item.product.title);
				} else {
					// Actualizar stock de productos
					item.product.stock -= item.quantity;
					updatedProducts.push(item.product);

					// Agregar los productos al ticket
					ticketItems.push({
						product: item.product._id,
						quantity: item.quantity,
						price: item.product.price,
					});
				}
			});

			// Si no hay stock de alguno, retornar error
			if (outOfStockItems.length > 0) {
				throw new CustomError({
					...errorsDictionary.PURCHASE_ERROR,
					detail: `No hay suficiente stock para los siguientes productos: ${outOfStockItems.join(", ")}`,
				});
			}

			// Crear ticket de compra
			const ticketData = {
				amount: cart.products.reduce((total, item) => total + item.product.price * item.quantity, 0),
				purchaser_id: cart._user_id._id,
				items: ticketItems,
			};

			// Add del ticket
			const ticket = await ticketController.add(ticketData, session);

			logger.debug("Ticket de compra ingresado");

			// Actualizar los productos con el nuevo stock
			for (const product of updatedProducts) {
				await productController.update(product._id, product, session);
				logger.debug(`Producto ${product._id} actualizado stock`);
			}

			// Limpiar el carrito
			await this.cleanCart(cartId, session);

			logger.debug("Carrito limpiado");

			await session.commitTransaction();
			session.endSession();

			return ticket;
		} catch (error) {
			await session.abortTransaction();
			session.endSession();
			throw error;
		}
	}
}

export default CartController;
