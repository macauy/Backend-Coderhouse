import mongoose from "mongoose";
import Product from "./product.model.js";

const cartSchema = new mongoose.Schema({
	id: { type: Number, required: true, unique: true },
	products: { type: [Product.schema], default: [] },
});

const cartsModel = mongoose.model("carts", cartSchema);

export default cartsModel;
