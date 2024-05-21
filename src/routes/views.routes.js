import { Router } from "express";
import ProductManager from "../dao/productManager.mdb.js";

const router = Router();

const manager = new ProductManager("./src/data/productos.json");

router.get("/", async (req, res) => {
	const limit = req.query.limit || 0;
	const products = await manager.getAllProducts(limit);
	res.render("home", { title: "Admin :: Home", products: products });
});

router.get("/realtimeproducts", async (req, res) => {
	const limit = req.query.limit || 0;
	const products = await manager.getAllProducts(limit);
	res.render("realTimeProducts", {
		title: "Admin :: Productos",
		products: products,
	});
});

router.get("/chat", (req, res) => {
	res.render("chat", { title: "Chat" });
});

export default router;
