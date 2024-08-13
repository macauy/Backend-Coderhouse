import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	code: { type: String, required: true, unique: true, index: "true" },
	price: { type: Number, required: true },
	status: { type: Boolean, default: true },
	stock: { type: Number, default: 0 },
	category: { type: String },
	thumbnails: [{ type: String }],
	owner: { type: String, default: "admin" },
});

productSchema.plugin(mongoosePaginate);

const productsModel = mongoose.model("products", productSchema);

export default productsModel;
