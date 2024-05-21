import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	code: { type: String, required: true, unique: true, index: "true" },
	price: { type: Number, required: true },
	status: { type: String, enum: ["true", "false"], default: "true" },
	stock: { type: Number, default: 0 },
	category: { type: String },
	thumbnails: [{ type: String }],
});

// Crea el modelo 'Product' a partir del esquema
const productsModel = mongoose.model("products", productSchema);

export default productsModel;
