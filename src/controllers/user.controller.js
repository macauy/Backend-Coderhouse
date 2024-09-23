import jwt from "jsonwebtoken";
import UserService from "../services/user.dao.mdb.js";
import { isValidPassword, createHash } from "../helpers/encrypt.js";
import { sendResetPasswordEmail, sendDeletionEmail } from "../helpers/mailer.js";
import { logger } from "../helpers/logger.js";
import config from "../config.js";

const service = new UserService();

class UserDTO {
	constructor(data) {
		this.data = data;
		this.data.email = this.data.email.toLowerCase();
		this.data.firstName = this.data.firstName.toUpperCase();
		this.data.lastName = this.data.lastName.toUpperCase();
		if (this.data.password) this.data.password = createHash(this.data.password);
	}
}

class UserResponseDTO {
	constructor(user) {
		this._id = user._id;
		this.firstName = user.firstName;
		this.lastName = user.lastName;
		this.email = user.email;
		this.role = user.role;
		this.active = user.active;
		this.profilePicture = user.profilePicture;
	}
}

class UserController {
	constructor() {}

	async get() {
		try {
			const users = await service.get({ active: true });
			// Aplicar DTO sobre la respuesta
			const userResponses = users.map((user) => new UserResponseDTO(user));
			return userResponses;
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
			const normalized = new UserDTO(data);
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
				throw new Error("Email o contraseña inválidos");
			}

			const isMatch = await isValidPassword(password, user.password);
			if (!isMatch) {
				throw new Error("Email o contraseña inválidos");
			}
			return user;
		} catch (error) {
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
			logger.error("Error en registerUser: " + error.message);
			throw new Error(error.message);
		}
	};

	deleteInactiveUsers = async (initialDate) => {
		try {
			const inactiveUsers = await service.get({
				$and: [
					{
						$or: [{ last_connection: { $lt: initialDate } }, { last_connection: { $exists: false } }],
					},
					{ active: true },
				],
			});

			if (!inactiveUsers.length) {
				return 0;
			}

			// Enviar correos a los usuarios y eliminarlos
			for (const user of inactiveUsers) {
				// await sendDeletionEmail(user.email); // TODO : volver a habilitar
				await this.update(user._id, { active: false });
			}
			return inactiveUsers.length;
		} catch (error) {
			logger.error("Error en registerUser: " + error.message);
			throw new Error(error.message);
		}
	};

	// Método para solicitar el restablecimiento de contraseña
	async requestPasswordReset(email) {
		const user = await service.getOne({ email });
		if (!user) throw new Error("Email no encontrado");

		const token = jwt.sign({ email: user.email }, config.SECRET, { expiresIn: "1h" });

		// Envía el correo con el enlace de restablecimiento
		const resetLink = `${config.URL}/api/users/reset-password/reset?token=${token}`;
		logger.debug("Link: " + resetLink);
		await sendResetPasswordEmail(user.email, resetLink);

		return token;
	}

	// Método para restablecer la contraseña
	async resetPassword(token, newPassword) {
		try {
			const decoded = jwt.verify(token, config.SECRET);

			const user = await this.getOne({ email: decoded.email });
			if (!user) throw new Error("Usuario no encontrado");

			const isSamePassword = await isValidPassword(newPassword, user.password);
			if (isSamePassword) throw new Error("No se puede usar la misma contraseña");

			const hashedPassword = createHash(newPassword);
			await this.update(user._id, { password: hashedPassword });
		} catch (error) {
			logger.debug("Error en resetPassword:" + error);
			if (error.name === "TokenExpiredError") {
				throw new Error("El enlace ha expirado");
			}
			throw new Error(error);
		}
	}
}

export default UserController;
