import { Router } from "express";
import CartManager from "../controllers/cartManager.mdb.js";

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
	const { user_id } = req.body;
	console.log("user", user_id);
	const result = await manager.addCart(user_id);
	if (result.err) res.status(400).send({ status: "error", error: result.msg });
	else {
		req.session.cart = result.payload._id;
		res.status(200).send({ status: "success", payload: result.payload });
	}
});

router.post("/:cid/products/:pid", async (req, res) => {
	const cid = req.params.cid;
	const pid = req.params.pid;

	const result = await manager.addProductToCart(cid, pid);
	if (result.err) res.status(400).send({ status: "error", error: result.msg });
	else res.status(200).send({ status: "success", message: result.msg });
});

router.delete("/:cid/products/:pid", async (req, res) => {
	const cid = req.params.cid;
	const pid = req.params.pid;

	const result = await manager.deleteProductFromCart(cid, pid);
	if (result.err) res.status(400).send({ status: "error", error: result.msg });
	else res.status(200).send({ status: "success", message: result.msg });
});

router.put("/:cid", async (req, res) => {
	const cid = req.params.cid;
	const { products } = req.body;
	const result = await manager.updateCart(cid, products);
	if (result.err) res.status(400).send({ status: "error", error: result.msg });
	else res.status(200).send({ status: "success", message: result.msg });
});

router.put("/:cid/products/:pid", async (req, res) => {
	const cid = req.params.cid;
	const pid = req.params.pid;

	const { quantity } = req.body;
	const result = await manager.updateProductQuantity(cid, pid, quantity);
	if (result.err) res.status(400).send({ status: "error", error: result.msg });
	else res.status(200).send({ status: "success", message: result.msg });
});

router.delete("/:cid", async (req, res) => {
	const cid = req.params.cid;

	const result = await manager.cleanCart(cid);
	if (result.err) res.status(400).send({ status: "error", error: result.msg });
	else res.status(200).send({ status: "success", message: result.msg });
});

export default router;
