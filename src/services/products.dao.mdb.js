import productModel from "../models/product.model.js";

class ProductService {
	constructor() {}

	async getOne(filter) {
		try {
			const product = await productModel.findOne(filter).lean();
			return product;
		} catch (err) {
			throw err;
		}
	}

	async getPaginated(query, limit, page, sort) {
		try {
			const products = await productModel.paginate(query, { page, limit, sort, lean: true });
			return products;
		} catch (err) {
			throw err;
		}
	}

	async add(data) {
		try {
			const product = await productModel.create(data);
			return product;
		} catch (err) {
			throw err;
		}
	}

	async update(id, register, session = null) {
		try {
			const filter = { _id: id };
			const updateDoc = { $set: register };
			const options = { session };
			const result = await productModel.updateOne(filter, updateDoc, options);
			return result;
		} catch (err) {
			throw err;
		}
	}

	async delete(id) {
		try {
			const result = await productModel.deleteOne({ _id: id });
			return result;
		} catch (err) {
			throw err;
		}
	}
}

export default ProductService;
