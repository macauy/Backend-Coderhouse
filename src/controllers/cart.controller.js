import CartService from "../services/cart.dao.mdb.js";

const service = new CartService();

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
			return await service.get();
		} catch (err) {
			return err.message;
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
			const normalizedData = new cartDTO(data);
			return await service.add(normalizedData);
		} catch (err) {
			return err.message;
		}
	}

	async update(id, products) {
		try {
			return await service.update(id, { products });
		} catch (err) {
			return err.message;
		}
	}

	async delete(id) {
		try {
			return await service.delete(id);
		} catch (err) {
			return err.message;
		}
	}

	async addToCart(cartId, productId) {
		try {
			const cart = await service.getOne({ _id: cartId });
			const productExists = cart.products.find((p) => p.product._id == productId);

			if (productExists) {
				productExists.quantity += 1;
			} else {
				cart.products.push({ product: productId, quantity: 1 });
			}

			return await service.update(cartId, cart);
		} catch (err) {
			return err.message;
		}
	}

	async deleteFromCart(cartId, productId) {
		try {
			const cart = await service.getOne({ _id: cartId });
			cart.products = cart.products.filter((p) => p.product._id.toString() !== productId);
			return await service.update(cartId, cart);
		} catch (err) {
			return err.message;
		}
	}

	async updateProductQuantity(cartId, productId, quantity) {
		try {
			const cart = await service.getOne({ _id: cartId });
			const productExists = cart.products.find((p) => p.product._id == productId);
			if (productExists) {
				productExists.quantity = quantity;
				return await service.update(cartId, cart);
			} else {
				throw new Error("Producto no encontrado en el carrito");
			}
		} catch (err) {
			return err.message;
		}
	}

	async cleanCart(cartId) {
		try {
			return await service.update(cartId, { products: [] });
		} catch (err) {
			console.error(`Error al vaciar el carrito con ID ${cartId}:`, err);
			return err.message;
		}
	}
}

export default CartController;
