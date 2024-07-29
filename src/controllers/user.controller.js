import UserService from "../services/user.dao.mdb.js";
import { isValidPassword, createHash } from "../utils/encrypt.js";
import { logger } from "../utils/logger.js";

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
			const users = await service.get();
			return users;
		} catch (error) {
			logger.error("Error al obtener usuarios:", error);
			throw new Error(error.message);
		}
	}

	async getOne(filter) {
		try {
			const user = await service.getOne(filter);
			return user;
		} catch (error) {
			logger.error("Error al obtener usuario:", error);
			throw new Error(error.message);
		}
	}

	async add(data) {
		try {
			const normalized = new userDTO(data);
			const user = await service.add(normalized.data);
			return user;
		} catch (error) {
			logger.error("Error al agregar usuario:", error);
			throw new Error(error.message);
		}
	}

	async update(id, data) {
		try {
			const user = await service.update(id, data);
			return user;
		} catch (error) {
			logger.error("Error al actualizar usuario:", error);
			throw new Error(error.message);
		}
	}

	async delete(id) {
		try {
			const user = await service.delete(id);
			return user;
		} catch (error) {
			logger.error("Error al eliminar usuario:", error);
			throw new Error(error.message);
		}
	}

	checkUser = async (email, password) => {
		try {
			if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
				return { firstName: "Admin", lastName: "Coder", email, role: "admin" };
			}

			const user = await service.getOne({ email });

			if (!user) {
				logger.error("Error en checkUser 1");
				throw new Error("Email o contraseña inválidos");
			}

			const isMatch = await isValidPassword(password, user.password);
			if (!isMatch) {
				logger.error("Error en checkUser 2");
				throw new Error("Email o contraseña inválidos");
			}
			return user;
		} catch (error) {
			logger.error("Error en checkUser:", error.message);
			throw new Error(error.message);
		}
	};

	registerUser = async (data) => {
		try {
			let user = await service.getOne({ email: data.email });
			if (user) {
				throw new Error("Ya existe el usuario");
			}

			user = await this.add(data);
			return user;
		} catch (error) {
			logger.error("Error en registerUser:", error.message);
			throw new Error(error.message);
		}
	};
}

export default UserController;
