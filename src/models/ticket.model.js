import mongoose from "mongoose";

// Modelo para los items
const ticketItemSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "products",
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
});

// Modelo para el ticket
const ticketSchema = new mongoose.Schema({
	code: { type: String, unique: true },
	amount: { type: Number, required: true, default: 0.0 },
	purchase_datetime: { type: Date, default: Date.now },
	purchaser_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	items: [ticketItemSchema],
});

const ticketsModel = mongoose.model("tickets", ticketSchema);

export default ticketsModel;
