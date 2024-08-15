import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import FileStore from "session-file-store";
import passport from "passport";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

import config from "./config.js";
import initSocket from "./helpers/socket.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import viewsRouter from "./routes/views.routes.js";
import userRouter from "./routes/users.routes.js";
import cookieRouter from "./routes/cookies.routes.js";
import sessionRouter from "./routes/sessions.routes.js";
import loggerRouter from "./routes/logger.routes.js";
import handlebarsConfig from "./config/handlebarsConfig.js";
import MongoSingleton from "./patterns/mongo.singleton.js";
import errorsHandler from "./errors/errors.handler.js";
import addLogger, { logger } from "./utils/logger.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.SECRET));
app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE" }));
app.use(addLogger);

// Session
const fileStorage = FileStore(session);
app.use(
	session({
		store: new fileStorage({ path: "./sessions", ttl: 600, retries: 0 }),
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
app.use("/api/loggerTest", loggerRouter);
app.use("/static", express.static(`${config.DIRNAME}/public`));
app.use(errorsHandler);

// Swagger
const swaggerOptions = {
	definition: {
		openapi: "3.0.1",
		info: {
			title: "Documentación ecommerce",
			description: "Esta documentación detalla la API habilitada para el ecommerce",
		},
	},
	apis: [`${config.DIRNAME}/docs/**/*.yaml`],
};
const specs = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Iniciar servidor
const expressInstance = app.listen(config.PORT, async () => {
	// await mongoose.connect(config.MONGODB_URI);
	MongoSingleton.getInstance();

	const socketServer = initSocket(expressInstance);
	app.set("socketServer", socketServer);

	logger.info(`App activa en puerto ${config.PORT} conectada a la base ${config.SERVER}. Entorno ${config.MODO}`);
});
