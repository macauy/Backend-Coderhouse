import cartModel from "../models/cart.model.js";
import usersModel from "../models/user.model.js";
import productsModel from "../models/product.model.js";

class CartService {
	constructor() {}

	async get() {
		try {
			const carts = await cartModel.find().lean();
			return carts;
		} catch (err) {
			throw err;
		}
	}

	async getOne(filter) {
		try {
			const cart = await cartModel
				.findOne(filter)
				.populate({ path: "_user_id", model: usersModel })
				.populate({ path: "products.product", model: productsModel })
				.lean();
			return cart;
		} catch (err) {
			throw err;
		}
	}

	async add(data) {
		try {
			const cart = await cartModel.create(data);
			return cart;
		} catch (err) {
			throw err;
		}
	}

	async update(id, register, session = null) {
		try {
			const filter = { _id: id };
			const updateDoc = { $set: register };
			const options = { session };
			const result = await cartModel.updateOne(filter, updateDoc, options);
			return result;
		} catch (err) {
			throw err;
		}
	}

	async delete(id) {
		try {
			const result = await cartModel.deleteOne({ _id: id });
			return result;
		} catch (err) {
			throw err;
		}
	}
}

export default CartService;
