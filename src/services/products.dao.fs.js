import fs from "fs/promises";
import path from "path";

const filePath = path.resolve("src/data/productos.json");

class ProductServiceFS {
	constructor() {
		this.init();
	}

	async init() {
		try {
			await fs.access(filePath);
		} catch (error) {
			await fs.writeFile(filePath, JSON.stringify([]));
		}
	}

	async readFile() {
		const data = await fs.readFile(filePath, "utf-8");
		return JSON.parse(data);
	}

	async writeFile(data) {
		await fs.writeFile(filePath, JSON.stringify(data, null, 2));
	}

	async getOne(filter) {
		try {
			const products = await this.readFile();
			return products.find((product) => {
				return Object.keys(filter).every((key) => product[key] == filter[key]);
			});
		} catch (err) {
			throw err;
		}
	}

	async getPaginated(query, limit, page, sort) {
		try {
			let products = await this.readFile();
			if (query) {
				products = products.filter((product) => {
					return Object.keys(query).every((key) => product[key] == query[key]);
				});
			}

			if (sort) {
				const [sortKey, sortOrder] = Object.entries(sort)[0];
				products.sort((a, b) => {
					if (sortOrder === "asc") {
						return a[sortKey] > b[sortKey] ? 1 : -1;
					} else {
						return a[sortKey] < b[sortKey] ? 1 : -1;
					}
				});
			}

			const startIndex = (page - 1) * limit;
			const paginatedProducts = products.slice(startIndex, startIndex + limit);
			const totalPages = Math.ceil(products.length / limit);

			return {
				docs: paginatedProducts,
				totalDocs: products.length,
				limit,
				page,
				totalPages,
				hasPrevPage: page > 1,
				hasNextPage: page < totalPages,
				prevPage: page > 1 ? page - 1 : null,
				nextPage: page < totalPages ? page + 1 : null,
			};
		} catch (err) {
			throw err;
		}
	}

	async add(data) {
		try {
			const products = await this.readFile();
			const newProduct = { ...data, _id: (products.length + 1).toString() };
			products.push(newProduct);
			await this.writeFile(products);
			return newProduct;
		} catch (err) {
			throw err;
		}
	}

	async update(id, register) {
		try {
			const products = await this.readFile();
			const index = products.findIndex((product) => product._id == id);

			if (index === -1) {
				throw new Error("Product not found");
			}

			products[index] = { ...products[index], ...register };
			await this.writeFile(products);
			return products[index];
		} catch (err) {
			throw err;
		}
	}

	async delete(id) {
		try {
			let products = await this.readFile();
			const initialLength = products.length;
			products = products.filter((product) => product._id !== id);

			if (products.length === initialLength) {
				throw new Error("Product not found");
			}

			await this.writeFile(products);
			return { message: "Product deleted successfully" };
		} catch (err) {
			throw err;
		}
	}
}

export default ProductServiceFS;
