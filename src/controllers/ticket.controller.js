import TicketService from "../services/ticket.dao.mdb.js";

const service = new TicketService();

class TicketDTO {
	constructor(data) {
		this.amount = data.amount;
		this.purchaser_id = data.purchaser_id;
		this.items = data.items;
		this.code = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
	}

	get data() {
		return {
			amount: this.amount,
			purchaser_id: this.purchaser_id,
			items: this.items,
			code: this.code,
		};
	}
}

class TicketController {
	constructor() {}

	async get() {
		try {
			const tickets = await service.get();
			return tickets;
		} catch (error) {
			console.error("Error al obtener tickets:", error);
			throw new Error(error.message);
		}
	}

	async getOne(filter) {
		try {
			const ticket = await service.getOne(filter);
			return ticket;
		} catch (error) {
			console.error("Error al obtener ticket:", error);
			throw new Error(error.message);
		}
	}

	async add(data, session = null) {
		try {
			const ticketDTO = new TicketDTO(data);
			const ticket = await service.add(ticketDTO.data, session);
			return ticket;
		} catch (error) {
			console.error("Error al agregar ticket:", error);
			throw new Error(error.message);
		}
	}

	async update(id, data) {
		try {
			const result = await service.update(id, data);
			return result;
		} catch (error) {
			console.error("Error al actualizar el ticket:", error);
			throw new Error(error.message);
		}
	}

	async delete(id) {
		try {
			const ticket = await service.delete(id);
			return ticket;
		} catch (error) {
			console.error("Error al eliminar ticket:", error);
			throw new Error(error.message);
		}
	}
}

export default TicketController;
