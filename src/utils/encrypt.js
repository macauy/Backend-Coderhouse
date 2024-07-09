import bcrypt from "bcrypt";
import config from "../config.js";
export const createHash = (password) => {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const isValidPassword = (inputPassword, storedPasswordHash) => {
	console.log("inputPassword", inputPassword);
	console.log("storedPasswordHash", storedPasswordHash);
	return bcrypt.compare(inputPassword, storedPasswordHash);
};

export const verifyRequiredBody = (requiredFields) => {
	return (req, res, next) => {
		const allOk = requiredFields.every(
			(field) => req.body.hasOwnProperty(field) && req.body[field] !== "" && req.body[field] !== null && req.body[field] !== undefined
		);

		if (!allOk)
			return res.status(400).send({
				origin: config.SERVER,
				payload: "Faltan propiedades",
				requiredFields,
			});

		next();
	};
};
