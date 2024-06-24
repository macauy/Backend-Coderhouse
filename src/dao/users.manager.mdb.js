import usersModel from "./models/user.model.js";
import { isValidPassword, createHash } from "../utils/encrypt.js";

class UsersManager {
	constructor() {}

	getAllUsers = async (limit = 0) => {
		try {
			return limit === 0 ? await usersModel.find().lean() : await usersModel.find().limit(limit).lean();
		} catch (err) {
			return err.message;
		}
	};

	getUsersPaginated = async (filter, options) => {
		try {
			return await usersModel.paginate(filter, options);
		} catch (err) {
			return err.message;
		}
	};

	getOne = async (filter) => {
		try {
			return await usersModel.findOne(filter).lean();
		} catch (err) {
			return err.message;
		}
	};

	checkUser = async (email, password) => {
		try {
			// Caso especial para el usuario administrador
			if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
				return {
					firstName: "Admin",
					lastName: "Coder",
					email: "adminCoder@coder.com",
					role: "admin",
				};
			}

			// Busca un usuario que coincida con el email y la contraseña
			const user = await usersModel.findOne({
				email: email,
			});

			// Si no se encuentra ningún usuario, lanza un error
			if (!user) {
				throw new Error("Email o contraseña inválidos");
			}

			// Compara la contraseña proporcionada con la contraseña encriptada almacenada
			const isMatch = await isValidPassword(password, user.password);
			if (!isMatch) {
				throw new Error("Email o contraseña inválidos");
			}

			// Devuelve el objeto del usuario
			return user;
		} catch (err) {
			throw new Error(err.message);
		}
	};

	registerUser = async (data) => {
		try {
			// Busca si ya existe el usuario
			let user = await usersModel.findOne({ email: data.email });
			if (user) {
				throw new Error("Ya existe el usuario");
			}

			user = await this.addUser(data);

			// Devuelve el objeto del usuario
			return user;
		} catch (err) {
			throw new Error(err.message);
		}
	};

	addUser = async (newData) => {
		if (newData.password) newData.password = createHash(newData.password);
		try {
			return await usersModel.create(newData);
		} catch (err) {
			return err.message;
		}
	};

	updateUser = async (filter, update, options) => {
		try {
			return await usersModel.findOneAndUpdate(filter, update, options);
		} catch (err) {
			return err.message;
		}
	};

	deleteUser = async (filter) => {
		try {
			return await usersModel.findOneAndDelete(filter);
		} catch (err) {
			return err.message;
		}
	};
}

export default UsersManager;
