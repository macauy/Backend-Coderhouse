import { Router } from "express";
import CartController from "../controllers/cart.controller.js";
import ProductController from "../controllers/product.controller.js";
import { verifyAuth, handlePolicies } from "../helpers/utils.js";
import { generateProducts } from "../utils/mock.js";

const router = Router();

const productController = new ProductController();
const cartController = new CartController();

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
		const total = cart.products.reduce((total, item) => total + item.product.price * item.quantity, 0);

		res.render("cart", {
			title: "Ver Carrito",
			user: req.session.user,
			products: cart.products,
			cart: cid,
			total: total.toFixed(2),
		});
	}
});

// Endpoint alternatvo al anterior, para el caso que no se pase cartId
router.get("/carts", verifyAuth, async (req, res) => {
	const cid = req.session.cart;
	if (cid) {
		const result = await cartController.getOne({ _id: cid });
		const total = result?.products.reduce((total, item) => item.product.price * item.quantity + total, 0);

		res.render("cart", {
			title: "Ver Carrito",
			user: req.session.user,
			products: result.products,
			cart: cid,
			total: total.toFixed(2),
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

// Mocking de productos
router.get("/mockingproducts", async (req, res) => {
	const data = await generateProducts();
	res.status(200).send({ status: "success", payload: data });
});

router.get("/mockingproducts/:qty", async (req, res) => {
	const data = await generateProducts(parseInt(req.params.qty));
	res.status(200).send({ status: "success", payload: data });
});

export default router;
