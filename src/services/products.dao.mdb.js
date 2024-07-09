import productModel from "../models/product.model.js";

class ProductService {
	constructor() {}

	getOne = async (filter) => {
		try {
			return await productModel.findOne(filter).lean();
		} catch (err) {
			return err.message;
		}
	};

	getPaginated = async (query, limit, page, sort) => {
		try {
			return await productModel.paginate(query, { page: page, limit: limit, sort: sort, lean: true });
		} catch (err) {
			return err.message;
		}
	};

	add = async (data) => {
		try {
			return await productModel.create(data);
		} catch (err) {
			return err.message;
		}
	};

	async update(id, register) {
		try {
			return await productModel.updateOne({ _id: id }, { $set: register });
		} catch (err) {
			return err.message;
		}
	}

	async delete(id) {
		try {
			return await productModel.deleteOne({ _id: id });
		} catch (err) {
			return err.message;
		}
	}
}

export default ProductService;
