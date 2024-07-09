import cartModel from "../models/cart.model.js";
import usersModel from "../models/user.model.js";
import productsModel from "../models/product.model.js";

class CartService {
	constructor() {}

	async get() {
		try {
			return await cartModel.find().lean();
		} catch (err) {
			return err.message;
		}
	}

	async getOne(filter) {
		try {
			return await cartModel
				.findOne(filter)
				.populate({ path: "_user_id", model: usersModel })
				.populate({ path: "products.product", model: productsModel })
				.lean(); // Populate para obtener los productos completos
		} catch (err) {
			return err.message;
		}
	}

	async add(data) {
		try {
			return await cartModel.create(data);
		} catch (err) {
			return err.message;
		}
	}

	async update(id, register) {
		console.log("update :: register", register);
		try {
			return await cartModel.updateOne({ _id: id }, { $set: register });
		} catch (err) {
			return err.message;
		}
	}

	async delete(id) {
		try {
			return await cartModel.deleteOne({ _id: id });
		} catch (err) {
			return err.message;
		}
	}
}

export default CartService;
