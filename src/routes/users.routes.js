import { Router } from "express";
import Controller from "../controllers/user.controller.js";
import { verifyRequiredBody, verifyAllowedBody, verifyMongoDBId, handlePolicies } from "../utils/utils.js";

const router = Router();
const controller = new Controller();

router.param("id", verifyMongoDBId());

router.get("/", async (req, res) => {
	try {
		res.status(200).send({ status: "success", data: await controller.get() });
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

router.get("/premium/:id", handlePolicies(["admin"]), async (req, res) => {
	try {
		const user = await controller.getOne({ _id: req.params.id });

		if (user?.role == "user")
			return res
				.status(200)
				.send({ status: "success", data: await controller.update(req.params.id, { role: "premium" }), message: "Usuario actualizado" });
		if (user?.role == "premium")
			return res
				.status(200)
				.send({ status: "success", data: await controller.update(req.params.id, { role: "user" }), message: "Usuario actualizado" });

		return res.status(200).send({ status: "success", message: "No se realizaron cambios" });
	} catch (err) {
		return res.status(500).send({ status: "error", data: err.message });
	}
});

// Reset password
router.post("/request-reset-password", async (req, res) => {
	try {
		const { email } = req.body;
		const token = await controller.requestPasswordReset(email);

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
		console.log("err", err);
		// res.render("error", { message: err.message });
		res.render("resetPassword", { token: req.body.token, showError: true, errorMessage: err.message });

		// res.status(500).send({ status: "error", message: err.message });
	}
});

export default router;
