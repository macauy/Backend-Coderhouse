import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import config from "./config.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import viewsRouter from "./routes/views.routes.js";
import ProductManager from "./ProductManager.js";
import mongoose from "mongoose";

// ProductManager
const manager = new ProductManager("./src/data/productos.json");

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

	console.log(`App activa en puerto ${config.PORT} conectada a la base`);
});

// Sockets
const socketServer = new Server(httpServer);
app.set("socketServer", socketServer);

socketServer.on("connection", (client) => {
	console.log(
		`Cliente conectado, id ${client.id} desde ${client.handshake.address}`
	);

	// Evento para escuchar nuevo producto
	client.on("newProduct", async (product) => {
		const result = await manager.addProduct(product);
		if (!result.err) {
			// Devuelvo al cliente que cree nuevo producto
			socketServer.emit("newProduct", product);
		}
		socketServer.emit("response", result);
	});

	// Evento para escuchar eliminar producto
	client.on("deleteProduct", async (id) => {
		const result = await manager.deleteProduct(id);
		if (!result.err) {
			socketServer.emit("deleteProduct", id);
		}
		socketServer.emit("response", result);
	});
});
