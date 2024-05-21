import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
	products: [
		{
			product: { type: String, required: true },
			quantity: { type: Number, required: true },
		},
	],
});

const cartsModel = mongoose.model("carts", cartSchema);

export default cartsModel;
