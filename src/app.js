import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import FileStore from "session-file-store";
import passport from "passport";
import cors from "cors";
import config from "./config.js";
import initSocket from "./services/socket.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import viewsRouter from "./routes/views.routes.js";
import userRouter from "./routes/users.routes.js";
import cookieRouter from "./routes/cookies.routes.js";
import sessionRouter from "./routes/sessions.routes.js";
import handlebarsConfig from "./config/handlebarsConfig.js";
import MongoSingleton from "./services/mongo.singleton.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.SECRET));
app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE" }));

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
	// await mongoose.connect(config.MONGODB_URI);
	MongoSingleton.getInstance();

	const socketServer = initSocket(expressInstance);
	app.set("socketServer", socketServer);

	console.log(`App activa en puerto ${config.PORT} conectada a la base ${config.SERVER}. Entorno ${config.MODO}`);
});
