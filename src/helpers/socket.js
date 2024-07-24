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
			try {
				messages.push(message);
				await messageController.add(message);
				socketServer.emit("messageArrived", message);
			} catch (error) {
				console.log("Error en newMessage:", error.message);
				socketServer.emit("response", { err: true, msg: error.message });
			}
		});

		// PRODUCTS
		// Evento para escuchar nuevo producto
		client.on("newProduct", async (product) => {
			console.log("socket - newProduct");
			try {
				const result = await productController.add(product);

				// Devuelvo al cliente que cree nuevo producto
				socketServer.emit(" socket newProductAdded", result);
				socketServer.emit("socket response", { err: false, msg: `Producto ${product.code} agregado` });
			} catch (error) {
				console.log("Error en socket newProduct", error.message);
				socketServer.emit("response", { err: true, msg: error.message });
			}
		});

		// Evento para escuchar eliminar producto
		client.on("deleteProduct", async (id) => {
			try {
				await productController.delete(id);
				socketServer.emit("deleteProduct", id);
				socketServer.emit("response", { err: false, msg: `Producto eliminado` });
			} catch (error) {
				console.log("Error en deleteProduct", error.message);
				socketServer.emit("response", { err: true, msg: error.message });
			}
		});
	});

	return socketServer;
};

export default initSockets;
