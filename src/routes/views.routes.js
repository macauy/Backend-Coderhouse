import { Router } from "express";
import CartController from "../controllers/cart.controller.js";
import ProductController from "../controllers/product.controller.js";
import { verifyAuth, handlePolicies } from "../helpers/utils.js";

const router = Router();

const productController = new ProductController();
const cartController = new CartController();

const adminAuth = (req, res, next) => {
	if (!req.session.user || req.session.user.role !== "admin") res.redirect("/accessdenied");

	next();
};

router.get("/", async (req, res) => {
	res.redirect("/login");
});

router.get("/products", verifyAuth, async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;

	const products = await productController.get(page, limit, category, stock, sort);

	res.render("products", {
		title: "Productos",
		products: products,
		user: req.session.user,
		cart: req.session.cart,
	});
});

router.get("/realtimeproducts", handlePolicies(["admin"]), async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;

	const products = await productController.get(page, limit, category, stock, sort);
	res.render("realTimeProducts", {
		title: "Admin :: Productos",
		products: products,
		user: req.session.user,
	});
});

router.get("/carts/:cid", verifyAuth, async (req, res) => {
	const cid = req.params.cid;
	if (cid) {
		const cart = await cartController.getOne({ _id: cid });

		res.render("cart", {
			title: "Ver Carrito",
			user: req.session.user,
			products: cart.products,
			cart: cid,
		});
	}
});

// Endpoint alternatvo al anterior, para el caso que no se pase cartId
router.get("/carts", verifyAuth, async (req, res) => {
	const cid = req.session.cart;
	if (cid) {
		const result = await cartController.getOne({ _id: cid });
		res.render("cart", {
			title: "Ver Carrito",
			user: req.session.user,
			products: result.products,
			cart: cid,
		});
	} else {
		res.render("emptyCart", { user: req.session.user, title: "Carrito" });
	}
});

router.get("/chat", handlePolicies(["user"]), (req, res) => {
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
	const errorMessage = req.session.error;
	delete req.session.error;
	res.render("accessDenied", { title: "Acceso Denegado", errorMessage });
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
