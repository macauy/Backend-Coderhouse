import fs, { readFile, writeFile } from "fs";

// Clase
export default class ProductManager {
	constructor(path) {
		this.products = [];
		this.path = path;
		this.nextId = 1;
		this.initProducts();
	}

	async initProducts() {
		if (fs.existsSync(this.path)) {
			const data = await fs.promises.readFile(this.path, "utf-8");
			if (data) {
				this.products = await JSON.parse(data);
				let lastId = this.products[this.products.length - 1].id;
				this.nextId = lastId + 1;
			}
		} else {
			await this.#writeLocalFile();
		}
	}
	#readLocalFile = async () => {
		if (fs.existsSync(this.path)) {
			const data = await fs.promises.readFile(this.path, "utf-8");
			if (data) {
				this.products = await JSON.parse(data);
			}
		}
		return this.products;
	};

	#writeLocalFile = async () => {
		await fs.promises.writeFile(
			this.path,
			JSON.stringify(this.products),
			"utf-8"
		);
	};

	getProducts = async (limit) => {
		await this.#readLocalFile();
		return limit === 0 ? this.products : this.products.slice(0, limit);
	};

	getProductById = async (id) => {
		await this.getProducts(0);
		return (
			this.products.find((item) => item.id === id) || "Producto no encontrado"
		);
	};

	addProduct = async (product) => {
		await this.getProducts(0);
		if (this.products.some((item) => item.code === product.code)) {
			return { err: 1, msg: "Ya existe un producto con este código" };
		} else {
			product.id = this.nextId;
			this.nextId++;
			this.products.push(product);
			await this.#writeLocalFile();
			return { err: 0, msg: "Producto agregado ID " + product.id };
		}
	};

	updateProduct = async (id, product) => {
		await this.getProducts(0);
		const index = this.products.findIndex((item) => item.id === id);
		if (index > -1) {
			const newProduct = { ...this.products[index], ...product };
			this.products[index] = newProduct;
			await this.#writeLocalFile();
			return {
				err: 0,
				msg: `Se ha actualizado el producto de id ${id}`,
			};
		} else return { err: 1, msg: "No existe un producto de id " + id };
	};

	deleteProduct = async (id) => {
		await this.getProducts();
		if (this.products.some((item) => item.id === id)) {
			const filteredProducts = this.products.filter((item) => item.id != id);
			this.products = filteredProducts;
			await this.#writeLocalFile();
			return {
				err: 0,
				msg: `Se ha eliminado el producto de id ${id}`,
			};
		} else return { err: 1, msg: "No existe un producto de id " + id };
	};
}

// Pruebas
/*
export async function testProductManager() {
	const p1 = new ProductManager("./productos.json");

	let product1 = {
		title: "titulo1",
		description: "desc1",
		price: 100,
		thumbnail: "thumb",
		code: "code1",
		stock: 50,
	};

	let product2 = {
		title: "titulo2",
		description: "desc2",
		price: 200,
		thumbnail: "thumb",
		code: "code2",
		stock: 50,
	};

	let product3 = {
		title: "titulo3",
		description: "desc3",
		price: 300,
		thumbnail: "thumb",
		code: "code3",
		stock: 50,
	};

	await p1.addProduct(product1);
	await p1.addProduct(product2);
	await p1.addProduct(product3);

	const products = await p1.getProducts(0);
	console.log(products, "productos agregados");

	console.log(await p1.getProductById(3), "producto id 3");
	console.log(await p1.getProductById(4));

	product3.title = "NuevoTitulo";
	product3.description = "Nueva Descripcion";
	product3.stock = 1000;
	await p1.updateProduct(3, product3);
	console.log(await p1.getProducts(0), "productos actualizados");
	await p1.deleteProduct(2);
	await p1.deleteProduct(2);
	const productsFinal = await p1.getProducts(0);
	console.log(productsFinal, "productos al eliminar");
	return productsFinal;
}
*/

// testProductManager();
