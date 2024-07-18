import ticketModel from "../models/ticket.model.js";
import usersModel from "../models/user.model.js";

class TicketService {
	constructor() {}

	async get() {
		try {
			const tickets = await ticketModel.find().lean();
			return tickets;
		} catch (err) {
			throw err;
		}
	}

	async getOne(filter) {
		try {
			const ticket = await ticketModel.findOne(filter).populate({ path: "purchaser_id", model: usersModel }).lean();
			return ticket;
		} catch (err) {
			throw err;
		}
	}

	async add(data, session = null) {
		try {
			const result = await ticketModel.create([data], { session });
			return result[0];
		} catch (err) {
			throw err;
		}
	}

	async update(id, register) {
		try {
			const result = await ticketModel.updateOne({ _id: id }, { $set: register });
			return result;
		} catch (err) {
			throw err;
		}
	}

	async delete(id) {
		try {
			const result = await ticketModel.deleteOne({ _id: id });
			return result;
		} catch (err) {
			throw err;
		}
	}
}

export default TicketService;
