import { Router } from "express";
import passport from "passport";
import config from "../config.js";
import UserController from "../controllers/user.controller.js";
import initAuthStrategies from "../auth/passport.strategies.js";
import { verifyRequiredBody } from "../utils/encrypt.js";

const router = Router();
const userController = new UserController();

initAuthStrategies();

const adminAuth = (req, res, next) => {
	if (!req.session.user || req.session.user.role !== "admin")
		// Si no existe el objeto req.session.user o el role no es admin
		return res.status(403).send({
			status: "error",
			error: "Acceso no autorizado: se requiere autenticación y nivel de admin",
		});

	next();
};

// Endpoint para obtener el cart de session
router.get("/cart", (req, res) => {
	if (req.session.cart) {
		res.status(200).json({ cart: req.session.cart });
	} else {
		res.status(200).json({ cart: null });
	}
});

// Login
router.post("/login", verifyRequiredBody(["email", "password"]), async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await userController.checkUser(email, password);

		if (user) {
			const { password, ...filteredUser } = user;
			req.session.user = filteredUser;

			req.session.save((err) => {
				if (err) {
					console.error("Error saving session:", err);
					return res.status(500).send("Failed to save session");
				}

				// redirigo a la pantalla previa, o a productos
				const redirectTo = req.session.redirectTo || "/products";
				delete req.session.redirectTo;
				res.redirect(redirectTo);
			});
		}
	} catch (err) {
		console.log("Error en /login", err);
		res.status(400).send("Usuario o contraseña incorrectos");
	}
});

// Passport Login
router.post(
	"/pplogin",
	verifyRequiredBody(["email", "password"]),
	passport.authenticate("login", {
		failureRedirect: `/login?error=${encodeURI("Usuario o clave no válidos")}`,
	}),

	async (req, res) => {
		try {
			// Passport inyecta los datos del done en req.user
			req.session.user = req.user;
			req.session.save((err) => {
				if (err) return res.status(500).send("Failed to save session");

				// redirigo a la pantalla previa, o a productos
				const redirectTo = req.session.redirectTo || "/products";
				delete req.session.redirectTo;
				res.redirect(redirectTo);
			});
		} catch (err) {
			res.status(500).send({ status: "error", error: err.message });
		}
	}
);

// Register manual
router.post("/register", verifyRequiredBody(["email", "password"]), async (req, res) => {
	try {
		await userController.registerUser(req.body);
		res.redirect("/registerok");
	} catch (err) {
		res.status(500).send({ status: "error", error: err.message });
	}
});

// Passport Register
router.post(
	"/ppregister",
	verifyRequiredBody(["email", "password", "firstName", "lastName"]),
	passport.authenticate("register", {
		failureRedirect: `/register?error=${encodeURI("El usuario ya existe")}`,
	}),
	async (req, res) => {
		try {
			req.session.user = req.user;
			req.session.save((err) => {
				if (err) return res.status(500).send("Failed to save session");

				res.redirect("/registerok");
			});
		} catch (err) {
			res.status(500).send({ status: "error", error: err.message });
		}
	}
);

// Login con Github
router.get("/githublogin", passport.authenticate("githublogin", { scope: ["user"] }), async (req, res) => {});

router.get(
	"/githubcallback",
	passport.authenticate("githublogin", {
		failureRedirect: `/login?error=${encodeURI("Error al identificar con Github")}`,
	}),
	async (req, res) => {
		try {
			req.session.user = req.user;
			req.session.save((err) => {
				if (err) return res.status(500).send("Failed to save session");

				res.redirect("/");
			});
		} catch (err) {
			res.status(500).send({ status: "error", error: err.message });
		}
	}
);

router.get("/private", adminAuth, async (req, res) => {
	try {
		res.status(200).send({ status: "success", payload: "Bienvenido ADMIN!" });
	} catch (err) {
		res.status(403).send({ status: "error", error: err.message });
	}
});

router.get("/logout", async (req, res) => {
	try {
		req.session.destroy((err) => {
			if (err) return res.status(500).send({ status: "error", error: err });

			res.redirect("/login");
		});
	} catch (err) {
		res.status(500).send({ status: "error", error: err.message });
	}
});

// current user
router.get("/current", async (req, res) => {
	if (req.session.user) {
		res.status(200).json({ origin: config.SERVER, payload: req.session.user });
	} else {
		res.status(200).json({ origin: config.SERVER, payload: null, error: "No se encuentra usuario logueado" });
	}
});

export default router;
