import { Router } from "express";
import Controller from "../controllers/user.controller.js";
import { verifyRequiredBody, verifyAllowedBody, verifyMongoDBId, handlePolicies } from "../utils/utils.js";
import { documentUploader, profileUploader } from "../helpers/uploader.js";

const router = Router();
const controller = new Controller();

router.param("id", verifyMongoDBId());

// Obtener todos los usuarios o buscar por email
router.get("/", async (req, res) => {
	try {
		// permito búsqueda por email para obtener un usuario por su clave única
		const { email } = req.query;
		if (email) {
			const user = await controller.getOne({ email });
			if (user) {
				return res.status(200).send({ status: "success", data: user });
			} else {
				return res.status(404).send({ status: "error", message: "Usuario no encontrado" });
			}
		} else {
			const users = await controller.get();
			res.status(200).send({ status: "success", data: users });
		}
	} catch (err) {
		res.status(500).send({ status: "error", error: err.message });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const result = await controller.getOne({ _id: req.params.id });
		res.status(200).send({ status: "success", data: result });
	} catch (err) {
		res.status(400).send({ status: "error", error: err });
	}
});

router.post("/", verifyRequiredBody(["firstName", "lastName", "email", "role"]), async (req, res) => {
	try {
		const data = {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: req.body.password,
			age: req.body.age,
		};
		res.status(200).send({ status: "success", data: await controller.add(data) });
	} catch (err) {
		res.status(500).send({ status: "error", data: err.message });
	}
});

router.put("/:id", verifyAllowedBody(["firstName", "lastName", "email", "password", "role", "age"]), async (req, res) => {
	try {
		res.status(200).send({ status: "success", data: await controller.update(req.params.id, req.body) });
	} catch (err) {
		res.status(500).send({ status: "error", data: err.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		res.status(200).send({ status: "success", data: await controller.delete(req.params.id) });
	} catch (err) {
		res.status(500).send({ status: "error", data: err.message });
	}
});

// Para eliminar usuarios inactivos luego de X días
router.delete("/", async (req, res) => {
	try {
		const inicialDate = new Date();
		inicialDate.setDate(inicialDate.getDate() - 2);
		// inicialDate.setDate(inicialDate.getDate());
		// inicialDate.setMinutes(inicialDate.getMinutes() - 5);

		const eliminados = await controller.deleteInactiveUsers(inicialDate);
		if (eliminados == 0) {
			return res.status(200).send({ status: "success", message: "No hay usuarios inactivos para eliminar" });
		}
		res.status(200).send({ status: "success", message: `Se han desactivado: ${eliminados} usuarios` });
	} catch (err) {
		res.status(500).send({ status: "error", error: err.message });
	}
});

// Endpoint para que el admin cambie roles de usuarios
router.put("/role/:id", handlePolicies(["admin"]), async (req, res) => {
	try {
		const user = await controller.getOne({ _id: req.params.id });
		if (user?.role == "user") {
			await controller.update(req.params.id, { role: "premium" });
			return res.status(200).send({ status: "success", data: "premium", message: "Usuario actualizado" });
		}
		if (user?.role == "premium") {
			await controller.update(req.params.id, { role: "user" });
			return res.status(200).send({ status: "success", data: "user", message: "Usuario actualizado" });
		}

		return res.status(200).send({ status: "warning", message: "No se puede cambiar el rol de un usuario admin" });
	} catch (err) {
		return res.status(500).send({ status: "error", data: err.message });
	}
});

// Endpoint para que un usuario solicite ser premium
router.post("/premium/:id", async (req, res) => {
	try {
		const user = await controller.getOne({ _id: req.params.id });

		if (user?.role == "user") {
			if (!user) {
				return res.status(404).json({ status: "error", message: "Usuario no encontrado." });
			}

			if (!user.profilePicture) {
				return res.status(400).json({ status: "error", message: "Debes tener una foto de perfil para solicitar premium" });
			}

			if (!user.documents || user.documents.length < 2) {
				return res.status(400).json({ status: "error", message: "Debes tener al menos 2 documentos cargados para solicitar ser usuario premium" });
			}

			// Actualizar la sesión con el nuevo rol
			req.session.user.role = "premium";

			return res.status(200).send({
				status: "success",
				data: await controller.update(req.params.id, { role: "premium" }),
				role: "premium",
				message: "Felicitaciones! Eres usuario premium",
			});
		}
		if (user?.role == "premium") {
			// Actualizar la sesión con el nuevo rol
			req.session.user.role = "user";

			return res
				.status(200)
				.send({ status: "success", role: "user", data: await controller.update(req.params.id, { role: "user" }), message: "Usuario actualizado" });
		}

		if (user?.role == "admin") return res.status(400).send({ status: "error", message: "Tu rol es admin, no puedes ser premium!" });

		return res.status(200).send({ status: "success", message: "No se realizaron cambios" });
	} catch (err) {
		return res.status(500).send({ status: "error", data: err.message });
	}
});

// Endpoint para subir documentos
router.post("/:uid/documents", documentUploader.array("documents"), async (req, res) => {
	try {
		const userId = req.params.uid;
		const files = req.files;

		if (!files || files.length === 0) {
			return res.status(400).send({ status: "error", message: "No se subieron archivos." });
		}

		// Crear los objetos de documentos a partir de los archivos subidos
		const documents = files.map((file) => ({
			name: file.originalname,
			reference: file.path,
		}));

		// Obtener el usuario actual
		let user = await controller.getOne({ _id: userId });

		if (!user.documents) user.documents = [];

		// Agregar los nuevos documentos a los documentos existentes
		const updatedDocuments = [...user.documents, ...documents];

		// Actualizar el usuario en la base de datos
		user = await controller.update(userId, { documents: updatedDocuments });

		// Actualizar la sesión con los documentos nuevos
		req.session.user.documents = updatedDocuments;

		res.status(200).send({ status: "success", data: updatedDocuments });
	} catch (err) {
		res.status(500).send({ status: "error", error: err.message });
	}
});

router.post("/:uid/profile", profileUploader.single("profile"), async (req, res) => {
	try {
		const userId = req.params.uid;
		const file = req.file;

		if (!file) {
			return res.status(400).send({ status: "error", message: "No se seleccionó ninguna imagen." });
		}

		// Crear los objetos de documentos a partir de los archivos subidos
		const profilePicture = file.path;

		// Actualizar el usuario en la base de datos
		const user = controller.update(userId, { profilePicture });

		// Actualizar la sesión con la nueva imagen de perfil
		req.session.user.profilePicture = profilePicture;

		res.status(200).send({ status: "success", data: profilePicture });
	} catch (err) {
		res.status(500).send({ status: "error", error: err.message });
	}
});

// Reset password
router.post("/request-reset-password", async (req, res) => {
	try {
		const { email } = req.body;
		const token = await controller.requestPasswordReset(req, email);

		// Configurar la cookie para que expire en 1 hora
		res.cookie("resetPasswordToken", token, {
			maxAge: 3600000,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Lax",
		});

		// Redirige a la página de éxito
		res.redirect("/resetmailok");
		// res.status(200).send({ status: "success", message: "Correo de restablecimiento enviado" });
	} catch (err) {
		res.status(500).send({ status: "error", message: err.message });
	}
});

// endpoint invocado por el link de reseteo
router.get("/reset-password/reset", async (req, res) => {
	try {
		const { token } = req.query;
		const cookieToken = req.cookies.resetPasswordToken;

		// Verifica si el token en la URL coincide con el de la cookie
		if (!token || token != cookieToken) {
			return res.status(400).render("error", { message: "El enlace es inválido o ha expirado" });
		}

		// Renderiza la plantilla `resetPassword`
		res.render("resetPassword", { token });
	} catch (err) {
		// res.status(500).send({ status: "error", message: err.message });
		res.render("error", { message: err.message });
	}
});

// Ruta para manejar el reseteo de la contraseña
router.post("/reset-password", async (req, res) => {
	try {
		const { token, password } = req.body;
		const cookieToken = req.cookies.resetPasswordToken;

		if (!token || token !== cookieToken) {
			res.render("error", { message: "El enlace es inválido o ha expirado" });
		}

		await controller.resetPassword(token, password);
		res.clearCookie("resetPasswordToken");
		// res.status(200).send({ status: "success", message: "Contraseña restablecida con éxito" });

		res.redirect("/resetpasswordok");
	} catch (err) {
		req.logger.error(err);
		// res.render("error", { message: err.message });
		res.render("resetPassword", { token: req.body.token, showError: true, errorMessage: err.message });

		// res.status(500).send({ status: "error", message: err.message });
	}
});

export default router;
