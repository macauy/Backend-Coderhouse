import { Router } from "express";
import CartManager from "../dao/cartManager.mdb.js";

const router = Router();

const manager = new CartManager();

router.get("/", async (req, res) => {
	const carts = await manager.getAllCarts();
	res.send({ status: "success", payload: carts });
});

router.get("/:id", async (req, res) => {
	const id = req.params.id;
	const result = await manager.getCartById(id);
	if (result.err) res.status(400).send({ status: "error", error: result.msg });
	else res.status(200).send({ status: "success", payload: result.payload });
});

router.post("/", async (req, res) => {
	const result = await manager.addCart();
	if (result.err) res.status(400).send({ status: "error", error: result.msg });
	else res.status(200).send({ status: "success", payload: result.payload });
});

router.post("/:cid/product/:pid", async (req, res) => {
	const cid = req.params.cid;
	const pid = req.params.pid;
	console.log(cid, "cid");
	console.log(pid, "pid");
	const result = await manager.addProductToCart(cid, pid);
	if (result.err) res.status(400).send({ status: "error", error: result.msg });
	else res.status(200).send({ status: "success", message: result.msg });
});

export default router;
