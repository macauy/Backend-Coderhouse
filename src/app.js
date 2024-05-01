import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import config from "./config.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import viewsRouter from "./routes/views.routes.js";

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
const httpServer = app.listen(config.PORT, () => {
	console.log(`App activa en puerto ${config.PORT}`);
});

const socketServer = new Server(httpServer);
app.set("socketServer", socketServer);

socketServer.on("connection", (client) => {
	console.log(
		`Cliente conectado, id ${client.id} desde ${client.handshake.address}`
	);
});
