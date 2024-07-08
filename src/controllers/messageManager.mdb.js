import Message from "../models/message.model.js";

class MessageManager {
	constructor() {}

	getAllMessages = async (limit) => {
		try {
			// Trae todos los mensajes con un límite especificado
			const mensajes = await Message.find().lean().limit(limit);
			return mensajes;
		} catch (error) {
			console.error("Error al obtener los mensajes:", error);
		}
	};

	addMessage = async (message) => {
		try {
			// Guarda el nuevo message en la base de datos
			const mensaje = new Message(message);
			const mensajeGuardado = await mensaje.save();
			return { err: 0, payload: mensajeGuardado };
		} catch (error) {
			return { err: 1, msg: "Error al agregar el mensaje" };
		}
	};
}

export default MessageManager;
