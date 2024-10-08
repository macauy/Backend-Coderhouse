import MessageService from "../services/message.dao.mdb.js";
import { logger } from "../helpers/logger.js";

const service = new MessageService();

class MessageController {
	constructor() {}

	get = async (limit) => {
		try {
			const mensajes = await service.get(limit);
			return mensajes;
		} catch (err) {
			logger.error("Error al obtener los mensajes:", err);
			throw new Error("Error al obtener los mensajes");
		}
	};

	add = async (message) => {
		try {
			const mensajeGuardado = await service.add(message);
			return mensajeGuardado;
		} catch (err) {
			logger.error("Error al agregar el mensaje:", err);
			throw new Error("Error al agregar el mensaje");
		}
	};
}

export default MessageController;
