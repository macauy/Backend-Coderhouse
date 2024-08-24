import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

mongoose.pluralize(null);

const collection = "test_users";

const schema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true, index: false },
	email: { type: String, required: true },
	password: { type: String },
	age: { type: Number },
	role: { type: String, enum: ["admin", "premium", "user"], default: "user" },
	cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
});

schema.plugin(mongoosePaginate);

const model = mongoose.model(collection, schema);

export default model;
