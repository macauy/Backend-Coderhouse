import mongoose from "mongoose";

mongoose.pluralize(null);

const schema = new mongoose.Schema({
	user: { type: String, required: true },
	message: { type: String, required: true },
	date: { type: Date, default: Date.now, required: true },
});

const model = mongoose.model("messages", schema);

export default model;
