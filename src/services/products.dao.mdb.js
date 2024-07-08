import productsModel from "../models/product.model.js";

class ProductsService {
	constructor() {}

	getOne = async (filter) => {
		try {
			return await productsModel.findOne(filter).lean();
		} catch (err) {
			return err.message;
		}
	};

	getPaginated = async (query, limit, page, sort) => {
		console.log("getPaginated de products service");
		try {
			return await productsModel.paginate(query, { page: page, limit: limit, sort: sort, lean: true });
		} catch (err) {
			return err.message;
		}
	};

	add = async (newData) => {
		try {
			return await productsModel.create(newData);
		} catch (err) {
			return err.message;
		}
	};

	update = async (filter, update, options) => {
		try {
			return await productsModel.findOneAndUpdate(filter, update, options);
		} catch (err) {
			return err.message;
		}
	};

	delete = async (filter) => {
		try {
			return await productsModel.findOneAndDelete(filter);
		} catch (err) {
			return err.message;
		}
	};
}

export default ProductsService;
