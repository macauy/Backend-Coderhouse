import bcrypt from "bcrypt";
import config from "../config.js";
import UserController from "../controllers/user.controller.js";
import CustomError from "../errors/CustomError.class.js";
import { errorsDictionary } from "../errors/errors.dictionary.js";

const userController = new UserController();

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const verifyHash = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);

export const isValidPassword = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);

export const verifyToken = (req, res, next) => {
	const headerToken = req.headers.authorization ? req.headers.authorization.split(" ")[1] : undefined;
	const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`] : undefined;
	const queryToken = req.query.access_token ? req.query.access_token : undefined;
	const receivedToken = headerToken || cookieToken || queryToken;

	if (!receivedToken) return res.status(401).send({ origin: config.SERVER, payload: "Se requiere token" });

	jwt.verify(receivedToken, config.SECRET, (err, payload) => {
		if (err) return res.status(403).send({ origin: config.SERVER, payload: "Token no válido" });
		req.user = payload;
		next();
	});
};

export const verifyAuth = (req, res, next) => {
	if (!req.session.user) {
		// return res.status(401).send({ origin: config.SERVER, payload: "Se requiere autenticación" });

		req.session.redirectTo = req.originalUrl; // Guarda la URL original en la sesión para redirigir luego
		return res.redirect("/login");
	}
	next();
};

export const verifyRequiredBody = (requiredFields) => {
	return (req, res, next) => {
		// console.log("verifyRequiredBody - ", requiredFields);
		const body = { ...req.body };

		if (!Array.isArray(requiredFields)) {
			return res.status(400).send({ origin: config.SERVER, payload: "Solicitud interna mal formada (código 5): se requiere array" });
		}

		const missingFields = requiredFields.filter(
			(field) => !body.hasOwnProperty(field) || body[field] === "" || body[field] === null || body[field] === undefined
		);

		if (missingFields.length > 0) {
			throw new CustomError({ ...errorsDictionary.FEW_PARAMETERS, detail: `Faltan las siguientes propiedades: ${missingFields.join(", ")}` });
		}

		next();
	};
};

export const verifyAllowedBody = (allowedFields) => {
	return (req, res, next) => {
		req.body = allowedFields.reduce((filteredBody, key) => {
			if (req.body.hasOwnProperty(key) && req.body[key] !== "") filteredBody[key] = req.body[key];
			return filteredBody;
		}, {});

		next();
	};
};

export const verifyMongoDBId = (id) => {
	return (req, res, next) => {
		if (!config.MONGODB_ID_REGEX.test(req.params.id)) {
			return res.status(400).send({ origin: config.SERVER, payload: null, error: "Id no válido" });
		}

		next();
	};
};

export const verifyDbConn = (req, res, next) => {
	MongoSingleton.getInstance();
	next();
};

export const handlePolicies = (policies) => {
	return async (req, res, next) => {
		if (!req.session.user) {
			req.session.error = "Usuario no autenticado";
			return res.redirect("/accessdenied");
		}

		if (policies.includes("self")) {
			const user = await userController.getOne({ _id: req.session.user._id });
			if (user.cart_id == req.params.cid) return next();
		}
		if (policies.includes(req.session.user.role)) return next();

		req.session.error = `Acceso denegado. Se requieren los roles: ${policies.join(", ")}`;
		req.session.save((err) => {
			return res.redirect("/accessdenied");
		});
		// res.status(403).send({ origin: config.SERVER, payload: "No tiene permisos para acceder al recurso" });
	};
};
