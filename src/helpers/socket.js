import { Server } from "socket.io";
import MessageController from "../controllers/message.controller.js";
import { logger } from "../helpers/logger.js";

const messageController = new MessageController();

const messages = [];

const initSockets = (httpServer) => {
	const socketServer = new Server(httpServer);

	socketServer.on("connection", (client) => {
		logger.info(`Cliente conectado, id ${client.id} desde ${client.handshake.address}`);

		// CHAT
		// Envio el historial de mensajes al nuevo cliente
		client.emit("chatLog", messages);

		// Emito que se registró un cliente nuevo a todos menos a ese
		client.on("clientRegistered", async (user) => {
			client.broadcast.emit("newClientConnected", user);
		});

		// Evento para nuevo mensaje de chat
		client.on("newMessage", async (message) => {
			try {
				messages.push(message);
				await messageController.add(message);
				socketServer.emit("messageArrived", message);
			} catch (error) {
				logger.error("Error al crear mensaje:", error.message);
				socketServer.emit("response", { err: true, msg: error.message });
			}
		});
	});

	return socketServer;
};

export default initSockets;
