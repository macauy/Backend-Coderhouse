import { Router } from "express";
import CartController from "../controllers/cart.controller.js";
import ProductController from "../controllers/product.controller.js";

const router = Router();

const productController = new ProductController();
const cartController = new CartController();

const userAuth = (req, res, next) => {
	if (!req.session.user) {
		req.session.redirectTo = req.originalUrl; // Guarda la URL original en la sesión para redirigir luego
		return res.redirect("/login");
	}
	next();
};

const adminAuth = (req, res, next) => {
	if (!req.session.user || req.session.user.role !== "admin") res.redirect("/accessdenied");

	next();
};

router.get("/", async (req, res) => {
	res.redirect("/login");
});

router.get("/products", userAuth, async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;

	const products = await productController.get(page, limit, category, stock, sort);
	const user = req.session.user;
	const cart = req.session.cart;
	res.render("products", {
		title: "Productos",
		user: req.session.user,
		products: products,
		cart: cart,
	});
});

router.get("/realtimeproducts", adminAuth, async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;

	const result = await productController.get(page, limit, category, stock, sort);
	res.render("realTimeProducts", {
		title: "Admin :: Productos",
		user: req.session.user,
		products: result.docs,
	});
});

router.get("/carts/:cid", userAuth, async (req, res) => {
	const cid = req.params.cid;
	if (cid) {
		const result = await cartController.getOne({ _id: cid });

		res.render("cart", {
			title: "Ver Carrito",
			user: req.session.user,
			products: result.products,
			cart: cid,
		});
	}
});
// Endpoint alternatvo al anterior, para el caso que no se pase cartId
router.get("/carts", userAuth, async (req, res) => {
	const cid = req.session.cart;
	if (cid) {
		const result = await cartController.getOne({ _id: cid });
		res.render("cart", {
			title: "Ver Carrito",
			user: req.session.user,
			products: result.products,
			cart: cid,
		});
	}
});

router.get("/chat", userAuth, (req, res) => {
	res.render("chat", { title: "Chat" });
});

router.get("/register", (req, res) => {
	res.render("register", {
		showError: req.query.error ? true : false,
		errorMessage: req.query.error,
	});
});

router.get("/registerok", (req, res) => {
	res.render("registerOk", {});
});

router.get("/accessdenied", (req, res) => {
	res.render("accessDenied", {});
});

router.get("/login", (req, res) => {
	// Si ya hay datos de sesión activos, redireccionamos a Productos
	if (req.session.user) return res.redirect("/products");

	res.render("login", {
		showError: req.query.error ? true : false,
		errorMessage: req.query.error,
	});
});

router.get("/profile", (req, res) => {
	// Si NO hay datos de sesión activos, redireccionamos al login
	if (!req.session.user) return res.redirect("/login");
	res.render("profile", { user: req.session.user });
});

export default router;
