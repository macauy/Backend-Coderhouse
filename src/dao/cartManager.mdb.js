import Cart from "./models/cart.model.js";

class CartManager {
	constructor() {}

	getAllCarts = async (limit) => {
		try {
			// Trae todos los carts con un límite especificado
			const carts = await Cart.find().lean().limit(limit);
			return carts;
		} catch (error) {
			console.error("Error al obtener los carritos:", error);
		}
	};

	addCart = async () => {
		const cart = {};
		cart.products = [];
		try {
			// Guarda un nuevo cart en la base de datos
			const carrito = new Cart(cart);
			const carritoGuardado = await carrito.save();
			return {
				err: 0,
				msg: "Carrito agregado: " + carritoGuardado._id,
				payload: carritoGuardado,
			};
		} catch (error) {
			console.log(error);
			return { err: 1, msg: "Error al agregar el carrito" };
		}
	};

	getCartById = async (id) => {
		try {
			const cart = await Cart.findOne({ _id: id });
			if (!cart)
				return { err: 1, msg: "No se encontró un carrito con id: " + id };
			else {
				return { err: 0, payload: cart };
			}
		} catch (error) {
			return { err: 1, msg: "Error al obtener el carrito: " + error };
		}
	};

	updateCart = async (cartId, products) => {
		try {
			const cart = await Cart.findById(cartId);
			if (!cart) {
				return { err: 1, msg: "No existe un carrito con id " + cartId };
			}

			cart.products = products;
			await cart.save();
			return {
				err: 0,
				msg: `Se ha actualizado el carrito`,
				payload: cart,
			};
		} catch (error) {
			return { err: 1, msg: "Error al actualizar el carrito: " + error };
		}
	};

	deleteCart = async (id) => {
		try {
			const cart = await Cart.findOneAndDelete({ _id: id });
			if (!cart)
				return { err: 1, msg: "No se encontró un proudcto con id: " + id };
			else {
				return {
					err: 0,
					msg: `Se ha eliminado el carrito de id ${id}`,
					payload: cart,
				};
			}
		} catch (error) {
			return { err: 1, msg: "Error al eliminar el carrito: " + error };
		}
	};

	addProductToCart = async (cartId, productId) => {
		try {
			const cart = await Cart.findById(cartId);
			if (!cart) {
				return { err: 1, msg: "No existe un carrito con id " + cartId };
			}

			const existingItem = cart.products.find((item) =>
				item.product.equals(productId)
			);
			if (existingItem) {
				existingItem.quantity += 1;
			} else {
				cart.products.push({ product: productId, quantity: 1 });
			}

			await cart.save();
			return {
				err: 0,
				msg: `Producto id ${productId} agregado a carrito ${cartId}`,
			};
		} catch (error) {
			return {
				err: 1,
				msg: "Error al eliminar producto del carrito: " + error,
			};
		}
	};

	deleteProductFromCart = async (cartId, productId) => {
		try {
			const cart = await Cart.findById(cartId);
			if (!cart) {
				return { err: 1, msg: "No existe un carrito con id " + id };
			}
			const index = cart.products.findIndex((item) =>
				item.product.equals(productId)
			);
			if (index === -1) {
				return { err: 1, msg: "El producto no está en el carrito" };
			}

			cart.products.splice(index, 1);

			await cart.save();
			return {
				err: 0,
				msg: `Producto id ${productId} eliminado del carrito ${cartId}`,
			};
		} catch (error) {
			return {
				err: 1,
				msg: "Error al eliminar producto del carrito: " + error,
			};
		}
	};

	updateProductQuantity = async (cartId, productId, quantity) => {
		console.log("updateProductQuantity");
		try {
			const cart = await Cart.findById(cartId);
			if (!cart) {
				return { err: 1, msg: "No existe un carrito con id " + id };
			}

			const itemIndex = cart.products.findIndex((item) =>
				item.product.equals(productId)
			);
			if (itemIndex === -1) {
				throw new Error("El producto no está en el carrito");
			}

			cart.products[itemIndex].quantity = quantity;

			await cart.save();
			return { err: 0, msg: `Se ha actualizado el carrito` };
		} catch (error) {
			return { err: 1, msg: "Error al actualizar el carrito: " + error };
		}
	};

	cleanCart = async (cartId, productId) => {
		try {
			const cart = await Cart.findById(cartId);
			if (!cart) {
				return { err: 1, msg: "No existe un carrito con id " + id };
			}

			cart.products = [];

			await cart.save();
			return { err: 0, msg: `Carrito ${cartId} vaciado` };
		} catch (error) {
			return { err: 1, msg: "Error al vaciar el carrito: " + error };
		}
	};
}

export default CartManager;
