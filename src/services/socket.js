import { Server } from "socket.io";
import MessageController from "../controllers/message.controller.js";
import ProductController from "../controllers/product.controller.js";

const productController = new ProductController();
const messageController = new MessageController();

const messages = [];

const initSockets = (httpServer) => {
	const socketServer = new Server(httpServer);

	socketServer.on("connection", (client) => {
		console.log(`Cliente conectado, id ${client.id} desde ${client.handshake.address}`);

		// CHAT
		// Envio el historial de mensajes al nuevo cliente
		client.emit("chatLog", messages);

		// Emito que se registró un cliente nuevo a todos menos a ese
		client.on("clientRegistered", async (user) => {
			client.broadcast.emit("newClientConnected", user);
		});

		// Evento para nuevo mensaje de chat
		client.on("newMessage", async (message) => {
			messages.push(message);
			const result = await messageController.add(message);
			if (!result.err) {
				socketServer.emit("messageArrived", message);
			}
		});

		// PRODUCTS
		// Evento para escuchar nuevo producto
		client.on("newProduct", async (product) => {
			const result = await productController.add(product);
			if (!result.err) {
				// Devuelvo al cliente que cree nuevo producto
				socketServer.emit("newProduct", result.payload);
			}
			socketServer.emit("response", result);
		});

		// Evento para escuchar eliminar producto
		client.on("deleteProduct", async (id) => {
			const result = await productController.delete(id);
			if (!result.err) {
				socketServer.emit("deleteProduct", id);
			}
			socketServer.emit("response", result);
		});
	});

	return socketServer;
};

export default initSockets;
