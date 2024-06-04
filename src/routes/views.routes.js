import { Router } from "express";
import ProductManager from "../dao/productManager.mdb.js";
import CartManager from "../dao/cartManager.mdb.js";

const router = Router();

const productManager = new ProductManager();
const cartManager = new CartManager();

const userAuth = (req, res, next) => {
	if (!req.session.user) {
		req.session.redirectTo = req.originalUrl; // Guarda la URL original en la sesión para redirigir luego
		return res.redirect("/login");
	}
	next();
};

const adminAuth = (req, res, next) => {
	if (!req.session.user || req.session.user.role !== "admin")
		res.redirect("/accessdenied");

	next();
};

router.get("/", async (req, res) => {
	res.redirect("/login");
});

router.get("/products", userAuth, async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;

	const products = await productManager.getAllProducts(
		page,
		limit,
		category,
		stock,
		sort
	);
	const user = req.session.user;
	const cart = req.session.cart;

	res.render("products", {
		title: "Productos",
		user: user,
		products: products,
		cart: cart,
	});
});

router.get("/realtimeproducts", adminAuth, async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;

	const result = await productManager.getAllProducts(
		page,
		limit,
		category,
		stock,
		sort
	);
	res.render("realTimeProducts", {
		title: "Admin :: Productos",
		user: req.session.user,
		products: result.docs,
	});
});

router.get("/carts/:cid", userAuth, async (req, res) => {
	const cid = req.params.cid;
	if (cid) {
		const result = await cartManager.getCartById(cid);

		res.render("cart", {
			title: "Ver Carrito",
			user: req.session.user,
			products: result.payload.products,
			cart: cid,
		});
	}
});
// Endpoint alternatvo al anterior, para el caso que no se pase cartId
router.get("/carts", userAuth, async (req, res) => {
	const cid = req.session.cart;
	if (cid) {
		const result = await cartManager.getCartById(cid);

		res.render("cart", {
			title: "Ver Carrito",
			user: req.session.user,
			products: result.payload.products,
			cart: cid,
		});
	}
});

router.get("/chat", userAuth, (req, res) => {
	res.render("chat", { title: "Chat" });
});

router.get("/register", (req, res) => {
	res.render("register", {});
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

	res.render("login", {});
});

router.get("/profile", (req, res) => {
	// Si NO hay datos de sesión activos, redireccionamos al login
	if (!req.session.user) return res.redirect("/login");
	res.render("profile", { user: req.session.user });
});

export default router;
