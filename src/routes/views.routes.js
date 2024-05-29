import { Router } from "express";
import ProductManager from "../dao/productManager.mdb.js";
import CartManager from "../dao/cartManager.mdb.js";

const router = Router();

const productManager = new ProductManager();
const cartManager = new CartManager();

router.get("/products", async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;
	let query = {};
	if (category) query.category = category;
	if (stock) query.stock = stock;
	const result = await productManager.getAllProducts(page, 3, query, sort);

	res.render("products", { title: "Productos", products: result });
});

router.get("/realtimeproducts", async (req, res) => {
	const limit = req.query.limit || 0;
	let query = {};
	let sort;
	let page = 1;
	const products = await productManager.getAllProducts(
		page,
		limit,
		query,
		sort
	);
	res.render("realTimeProducts", {
		title: "Admin :: Productos",
		products: products,
	});
});

router.get("/carts/:cid", async (req, res) => {
	const cid = req.params.cid;
	const result = await cartManager.getCartById(cid);

	res.render("cart", {
		title: "Ver Carrito",
		products: result.payload.products,
		cart: cid,
	});
});

router.get("/chat", (req, res) => {
	res.render("chat", { title: "Chat" });
});

export default router;
