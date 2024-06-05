import express from "express";
import mongoose from "mongoose";
import initSocket from "./socket.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import FileStore from "session-file-store";
import passport from "passport";

import config from "./config.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import viewsRouter from "./routes/views.routes.js";
import userRouter from "./routes/users.routes.js";
import cookieRouter from "./routes/cookies.routes.js";
import sessionRouter from "./routes/sessions.routes.js";
import handlebarsConfig from "./config/handlebarsConfig.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.SECRET));

// Session
const fileStorage = FileStore(session);
app.use(
	session({
		store: new fileStorage({ path: "./sessions", ttl: 100, retries: 0 }),
		secret: "secretCoder",
		resave: false,
		saveUninitialized: false,
	})
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Handleabars
app.engine(".handlebars", handlebarsConfig.engine);
app.set("views", `${config.DIRNAME}/views`);
app.set("view engine", ".handlebars");

// Rutas
app.use("/", viewsRouter);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/users", userRouter);
app.use("/api/cookies", cookieRouter);
app.use("/api/sessions", sessionRouter);
app.use("/static", express.static(`${config.DIRNAME}/public`));

// Iniciar servidor
const expressInstance = app.listen(config.PORT, async () => {
	await mongoose.connect(config.MONGODB_URI);

	const socketServer = initSocket(expressInstance);
	app.set("socketServer", socketServer);

	console.log(
		`App activa en puerto ${config.PORT} conectada a la base ${config.SERVER}`
	);
});
