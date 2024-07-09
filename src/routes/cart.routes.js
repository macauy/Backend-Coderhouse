import { Router } from "express";
import CartController from "../controllers/cart.controller.js";

const router = Router();
const controller = new CartController();

router.get("/", async (req, res) => {
	try {
		const carts = await controller.get();
		res.status(200).send({ status: "success", payload: carts });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const result = await controller.getOne({ _id: req.params.id });
		res.status(200).send({ status: "success", payload: result });
	} catch (err) {
		res.status(400).send({ status: "error", error: err });
	}
});

router.post("/", async (req, res) => {
	try {
		const { user_id } = req.body;
		const result = await controller.add(user_id);
		if (result.err) res.status(400).send({ status: "error", error: result.msg });
		else {
			req.session.cart = result._id;
			res.status(200).send({ status: "success", payload: result });
		}
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

router.post("/:cid/products/:pid", async (req, res) => {
	try {
		const cid = req.params.cid;
		const pid = req.params.pid;

		const result = await controller.addToCart(cid, pid);
		res.status(200).send({ status: "success", payload: result, message: "Product added to cart" });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

router.delete("/:cid/products/:pid", async (req, res) => {
	try {
		const cid = req.params.cid;
		const pid = req.params.pid;

		const result = await controller.deleteFromCart(cid, pid);
		res.status(200).send({ status: "success", message: "Product removed from cart" });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

router.put("/:cid", async (req, res) => {
	try {
		const cid = req.params.cid;
		const { products } = req.body;
		const result = await controller.update(cid, products);
		res.status(200).send({ status: "success", message: "Cart updated" });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

router.put("/:cid/products/:pid", async (req, res) => {
	try {
		const cid = req.params.cid;
		const pid = req.params.pid;
		const { quantity } = req.body;

		const result = await controller.updateProductQuantity(cid, pid, quantity);
		res.status(200).send({ status: "success", message: "Product quantity updated" });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

router.delete("/:cid", async (req, res) => {
	try {
		const cid = req.params.cid;

		const result = await controller.clean(cid);
		res.status(200).send({ status: "success", message: "Cart cleaned" });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

export default router;
