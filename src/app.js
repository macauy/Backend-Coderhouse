import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import config from "./config.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import viewsRouter from "./routes/views.routes.js";
import ProductManager from "./dao/productManager.mdb.js";
import MessageManager from "./dao/messageManager.mdb.js";
import mongoose from "mongoose";

// Managers
const productManager = new ProductManager();
const messageManager = new MessageManager();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handleabars
app.engine("handlebars", handlebars.engine());
app.set("views", `${config.DIRNAME}/views`);
app.set("view engine", "handlebars");

// Rutas
app.use("/", viewsRouter);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/static", express.static(`${config.DIRNAME}/public`));

// Asignamos la instancia en escucha del servidor API a una constante
const httpServer = app.listen(config.PORT, async () => {
	await mongoose.connect(config.MONGODB_URI);

	console.log(
		`App activa en puerto ${config.PORT} conectada a la base ${config.SERVER}`
	);
});

// Sockets
const socketServer = new Server(httpServer);
app.set("socketServer", socketServer);

let messages = [];

socketServer.on("connection", (client) => {
	console.log(
		`Cliente conectado, id ${client.id} desde ${client.handshake.address}`
	);

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
		const result = await messageManager.addMessage(message);
		if (!result.err) {
			socketServer.emit("messageArrived", message);
		}
	});

	// PRODUCTS
	// Evento para escuchar nuevo producto
	client.on("newProduct", async (product) => {
		const result = await productManager.addProduct(product);
		if (!result.err) {
			// Devuelvo al cliente que cree nuevo producto
			socketServer.emit("newProduct", result.payload);
		}
		socketServer.emit("response", result);
	});

	// Evento para escuchar eliminar producto
	client.on("deleteProduct", async (id) => {
		const result = await productManager.deleteProduct(id);
		if (!result.err) {
			socketServer.emit("deleteProduct", id);
		}
		socketServer.emit("response", result);
	});
});
