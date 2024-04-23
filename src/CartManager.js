import fs, { readFile, writeFile } from "fs";

// Clase
export default class CartManager {
	constructor(path) {
		this.carts = [];
		this.path = path;
		this.nextId = 1;
		this.initCarts();
	}

	async initCarts() {
		console.log("InitCarts - iniciando CartManager");
		if (fs.existsSync(this.path)) {
			const data = await fs.promises.readFile(this.path, "utf-8");
			if (data) {
				this.carts = await JSON.parse(data);
				if (this.carts.length > 0) {
					let lastId = this.carts[this.carts.length - 1].id;
					this.nextId = lastId + 1;
				}
			}
		} else {
			await this.#writeLocalFile();
		}
	}

	#readLocalFile = async () => {
		if (fs.existsSync(this.path)) {
			const data = await fs.promises.readFile(this.path, "utf-8");
			if (data) {
				this.carts = await JSON.parse(data);
			}
		}
		return this.carts;
	};

	#writeLocalFile = async () => {
		await fs.promises.writeFile(this.path, JSON.stringify(this.carts), "utf-8");
	};

	getCarts = async () => {
		await this.#readLocalFile();
		return this.carts;
	};

	getCartProductsById = async (id) => {
		await this.getCarts();
		const cart = this.carts.find((item) => item.id === id);
		if (cart) return { err: 0, products: cart.products };
		else return { err: 1, msg: "Carrito no encontrado" };
	};

	addCart = async () => {
		await this.getCarts();

		const cart = {
			id: this.nextId,
			products: [],
		};
		this.nextId++;
		this.carts.push(cart);

		await this.#writeLocalFile();
		return { err: 0, msg: `Carrito Id ${cart.id} agregado` };
	};

	addProductToCart = async (id, productId) => {
		await this.getCarts();
		const cart = this.carts.find((item) => item.id == id);
		console.log(cart, "cart encontrado");
		if (!cart) {
			return { err: 1, msg: "No existe un carrito con id " + id };
		} else {
			if (cart.products.some((item) => item.product == productId)) {
				const itemCart = cart.products.find(
					(item) => item.product == productId
				);
				itemCart.quantity++;
			} else {
				cart.products.push({ product: productId, quantity: 1 });
			}
			await this.#writeLocalFile();
			return {
				err: 0,
				msg: `Producto id ${productId} agregado a carrito ${id}`,
			};
		}
	};
}
