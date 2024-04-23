import { Router } from "express";
import CartManager from "../CartManager.js";

const router = Router();

const manager = new CartManager("./src/carritos.json");

router.get("/", async (req, res) => {
	const carts = await manager.getCarts();
	res.send({ status: "success", payload: carts });
});

router.get("/:id", async (req, res) => {
	const id = parseInt(req.params.id);
	const result = await manager.getCartProductsById(id);
	if (result.err) res.status(400).send({ status: "error", error: result.msg });
	else res.status(200).send({ status: "success", payload: result.products });
});

router.post("/", async (req, res) => {
	const result = await manager.addCart();
	res.status(200).send({ status: "success", message: result.msg });
});

router.post("/:cid/product/:pid", async (req, res) => {
	const cid = parseInt(req.params.cid);
	const pid = parseInt(req.params.pid);
	console.log(cid, "cid");
	console.log(pid, "pid");
	const result = await manager.addProductToCart(cid, pid);
	console.log(result);
	if (result.err) res.status(400).send({ status: "error", error: result.msg });
	else res.status(200).send({ status: "success", message: result.msg });
});

export default router;
