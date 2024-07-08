import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
	{
		product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
		quantity: { type: Number, default: 1 },
	},
	{ _id: false }
);

const cartSchema = new mongoose.Schema({
	_user_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "users",
	},
	products: [cartItemSchema],
});

const cartsModel = mongoose.model("carts", cartSchema);

export default cartsModel;
