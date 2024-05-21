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

	addProductToCart = async (id, productId) => {
		const result = await this.getCartById(id);
		if (result.err) return { err: 1, msg: "No existe un carrito con id " + id };
		else {
			const cart = result.payload;
			if (cart.products.some((item) => item.product == productId)) {
				const itemCart = cart.products.find(
					(item) => item.product == productId
				);
				itemCart.quantity++;
			} else {
				cart.products.push({ product: productId, quantity: 1 });
				console.log("aca cart.products: ", cart.products);
			}
			try {
				console.log("cart a actualiaz", cart);
				const result = await this.updateCart(id, cart);
				if (result.err) return result;
				else
					return {
						err: 0,
						msg: `Producto id ${productId} agregado a carrito ${id}`,
					};
			} catch (error) {
				return {
					err: 1,
					msg: "Error al agregar producto al carrito: " + error,
				};
			}
		}
	};

	updateCart = async (id, updCart) => {
		try {
			let newCart = await Cart.updateOne({ _id: id }, updCart);
			return {
				err: 0,
				msg: `Se ha actualizado el carrito de id ${id}`,
				payload: newCart,
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
}

export default CartManager;
