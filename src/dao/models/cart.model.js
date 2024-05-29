import mongoose from "mongoose";

// const cartSchema = new mongoose.Schema({
// 	products: {
// 		type: [{ _id: mongoose.Schema.Types.ObjectId, quantity: Number }],
// 		required: true,
// 	},
// });

const cartItemSchema = new mongoose.Schema(
	{
		product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
		quantity: { type: Number, default: 1 },
	},
	{ _id: false }
);

const cartSchema = new mongoose.Schema({
	products: [cartItemSchema],
});

const cartsModel = mongoose.model("carts", cartSchema);

export default cartsModel;
