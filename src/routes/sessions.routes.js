import { Router } from "express";
import config from "../config.js";
import UsersManager from "../dao/users.manager.mdb.js";

const router = Router();
const userManager = new UsersManager();

const adminAuth = (req, res, next) => {
	if (!req.session.user || req.session.user.role !== "admin")
		// Si no existe el objeto req.session.user o el role no es admin
		return res.status(403).send({
			status: "error",
			payload:
				"Acceso no autorizado: se requiere autenticación y nivel de admin",
		});

	next();
};

router.get("/cart", (req, res) => {
	if (req.session.cart) {
		res.status(200).json({ cart: req.session.cart });
	} else {
		res.status(200).json({ cart: null });
	}
});

router.post("/register", async (req, res) => {
	try {
		const user = await userManager.registerUser(req.body);
		res.redirect("/registerok");
	} catch (err) {
		res
			.status(500)
			.send({ status: "error", payload: null, error: err.message });
	}
});

router.post("/login", async (req, res) => {
	console.log("en login");
	try {
		const { email, password } = req.body;

		const user = await userManager.checkUser(email, password);
		console.log("user obtenido", user);
		req.session.user = {
			id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: email,
			role: user.role,
			age: user.age,
		};

		req.session.save((err) => {
			if (err) {
				console.error("Error saving session:", err);
				return res.status(500).send("Failed to save session");
			}

			const redirectTo = req.session.redirectTo || "/products";
			delete req.session.redirectTo;
			res.redirect(redirectTo);
		});
	} catch (err) {
		res.status(400).send("Usuario o contraseña incorrectos");
	}
});

router.get("/private", adminAuth, async (req, res) => {
	try {
		res.status(200).send({ status: "success", payload: "Bienvenido ADMIN!" });
	} catch (err) {
		res
			.status(403)
			.send({ status: "error", payload: null, error: err.message });
	}
});

router.get("/logout", async (req, res) => {
	try {
		req.session.destroy((err) => {
			if (err)
				return res.status(500).send({
					status: "error",
					payload: "Error al ejecutar logout",
					error: err,
				});
			// res.status(200).send({ status: "success", payload: 'Usuario desconectado' });
			res.redirect("/login");
		});
	} catch (err) {
		res
			.status(500)
			.send({ origin: config.SERVER, payload: null, error: err.message });
	}
});

export default router;
