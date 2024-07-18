import Message from "../models/message.model.js";

class MessageService {
	constructor() {}

	async get(limit) {
		try {
			// Trae todos los mensajes con un límite especificado
			return await Message.find().lean().limit(limit);
		} catch (error) {
			throw err;
		}
	}

	async add(message) {
		try {
			// Guarda el nuevo message en la base de datos
			const mensaje = new Message(message);
			return await mensaje.save();
		} catch (error) {
			throw err;
		}
	}
}

export default MessageService;
