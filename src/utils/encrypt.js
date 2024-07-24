import bcrypt from "bcrypt";
import config from "../config.js";
export const createHash = (password) => {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const isValidPassword = (inputPassword, storedPasswordHash) => {
	return bcrypt.compare(inputPassword, storedPasswordHash);
};
