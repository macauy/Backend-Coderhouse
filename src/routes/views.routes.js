import { Router } from "express";
import CartController from "../controllers/cart.controller.js";
import ProductController from "../controllers/product.controller.js";
import UserController from "../controllers/user.controller.js";
import { verifyAuth, handlePolicies } from "../utils/utils.js";
import { generateProducts } from "../helpers/mock.js";

const router = Router();

const productController = new ProductController();
const cartController = new CartController();
const userController = new UserController();

router.get("/", async (req, res) => {
	res.redirect("/login");
});

router.get("/products", verifyAuth, async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;

	const products = await productController.get(page, limit, category, stock, sort);
	const cartId = req.session.cart;
	let totalItems = 0;
	if (cartId) {
		try {
			const cart = await cartController.getOne({ _id: cartId });
			totalItems = cart?.products.length;
		} catch (error) {}
	}

	res.render("products", {
		title: "Comprar",
		products: products,
		user: req.session.user,
		cart: req.session.cart,
		totalItems: totalItems,
	});
});

router.get("/admin/products", handlePolicies(["admin", "premium"]), async (req, res) => {
	let { page, limit, category, stock, sort, search } = req.query;
	const user = req.session.user;
	console.log("user", user);
	const products = await productController.get(page, limit, category, stock, sort, search, user);

	res.render("adminProducts", { title: "Admin :: Productos", user: req.session.user, totalItems: 0, products, category, search });
});

router.get("/admin/users", handlePolicies(["admin"]), async (req, res) => {
	const users = await userController.get();

	res.render("adminUsers", { title: "Admin :: Usuarios", user: req.session.user, totalItems: 0, users });
});

router.get("/carts/:cid", verifyAuth, async (req, res) => {
	const cid = req.params.cid;
	if (cid) {
		const cart = await cartController.getOne({ _id: cid });
		const total = cart.products.reduce((total, item) => total + item.product.price * item.quantity, 0);

		res.render("cart", {
			title: "Carrito de compras",
			user: req.session.user,
			products: cart.products,
			cart: cid,
			total: total.toFixed(2),
			totalItems: cart.products.length,
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
			totalItems: result.products.length,
		});
	} else {
		res.render("emptyCart", { user: req.session.user, title: "Carrito", totalItems: 0 });
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
	res.render("registerOk", { message: "Usuario registrado correctamente", login: true });
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

router.get("/profile", async (req, res) => {
	// Si NO hay datos de sesión activos, redireccionamos al login
	if (!req.session.user) return res.redirect("/login");

	const cartId = req.session.cart;
	let totalItems = 0;
	if (cartId) {
		try {
			const cart = await cartController.getOne({ _id: cartId });
			totalItems = cart?.products.length;
		} catch (error) {}
	}
	const premium = req.session.user.role == "premium";
	res.render("profile", { title: "Perfil", user: req.session.user, totalItems, premium: premium });
});

router.get("/passwordforgotten", (req, res) => {
	res.render("passwordForgotten", {});
});

router.get("/resetmailok", (req, res) => {
	res.render("registerOk", { message: "Correo de restablecimiento enviado. Revisa tu email para acceder al enlace." });
});

router.get("/resetpasswordok", (req, res) => {
	res.render("registerOk", { message: "Contraseña modificada correctamente", login: true });
});

router.get("/error", (req, res) => {
	res.render("error", { message: "Ocurrio un error" });
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
