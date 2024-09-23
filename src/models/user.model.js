import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import config from "../config.js";

mongoose.pluralize(null);

const schema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true, index: false },
	email: { type: String, required: true },
	password: { type: String },
	age: { type: Number },
	role: { type: String, enum: ["admin", "premium", "user"], default: "user" },
	cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
	profilePicture: { type: String },
	documents: [
		{
			name: { type: String, required: true },
			reference: { type: String, required: true },
		},
	],
	active: { type: Boolean, default: true },
	last_connection: { type: Date, default: Date.now },
	created_at: { type: Date, default: Date.now },
});

schema.plugin(mongoosePaginate);

const model = mongoose.model(config.USERS_COLLECTION, schema);

export default model;
