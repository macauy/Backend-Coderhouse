import UserService from "../services/user.dao.js";
import { isValidPassword, createHash } from "../utils/encrypt.js";

const service = new UserService();

class userDTO {
	constructor(data) {
		this.data = data;
		this.data.email = this.data.email.toLowerCase();
		this.data.firstName = this.data.firstName.toUpperCase();
		this.data.lastName = this.data.lastName.toUpperCase();
		if (this.data.password) this.data.password = createHash(this.data.password);
	}
}

class UserController {
	constructor() {}

	async get() {
		try {
			return await service.get();
		} catch (err) {
			return err.message;
		}
	}

	async getOne(filter) {
		try {
			return await service.getOne(filter);
		} catch (err) {
			return err.message;
		}
	}

	async add(data) {
		try {
			const normalized = new userDTO(data);
			return await service.add(normalized.data);
		} catch (err) {
			return err.message;
		}
	}

	async update(id, data) {
		try {
			return await service.update(id, data);
		} catch (err) {
			return err.message;
		}
	}

	async delete(id) {
		try {
			return await service.delete(id);
		} catch (err) {
			return err.message;
		}
	}

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

			// Busca un usuario que coincida con el email
			const user = await service.getOne({ email: email });

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
			console.log("Error en checkUser:", err.message);
			throw new Error(err.message);
		}
	};

	registerUser = async (data) => {
		try {
			// Busca si ya existe el usuario
			let user = await service.getOne({ email: data.email });
			if (user) {
				throw new Error("Ya existe el usuario");
			}

			user = await this.add(data);

			// Devuelve el objeto del usuario
			return user;
		} catch (err) {
			throw new Error(err.message);
		}
	};
}

export default UserController;
