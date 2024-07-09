import Message from "../models/message.model.js";

class MessageService {
	constructor() {}

	async get(limit) {
		try {
			// Trae todos los mensajes con un límite especificado
			return await Message.find().lean().limit(limit);
		} catch (error) {
			console.error("Error al obtener los mensajes:", error);
			throw new Error("Error al obtener los mensajes");
		}
	}

	async add(message) {
		try {
			// Guarda el nuevo message en la base de datos
			const mensaje = new Message(message);
			return await mensaje.save();
		} catch (error) {
			console.error("Error al agregar el mensaje:", error);
			throw new Error("Error al agregar el mensaje");
		}
	}
}

export default MessageService;
