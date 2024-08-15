import { Router } from "express";
import CartController from "../controllers/cart.controller.js";
import UserController from "../controllers/user.controller.js";
import { verifyMongoDBId, handlePolicies } from "../utils/utils.js";
import { errorsDictionary } from "../errors/errors.dictionary.js";
import CustomError from "../errors/CustomError.class.js";
import ProductController from "../controllers/product.controller.js";

const router = Router();
const controller = new CartController();
const userController = new UserController();
const productController = new ProductController();

router.param("id", verifyMongoDBId());

router.get("/", async (req, res) => {
	try {
		res.status(200).send({ status: "success", data: await controller.get() });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

// Obtiene cantidad de items en el carrito (para notificaciones en el ícono)
router.get("/count", async (req, res) => {
	try {
		let itemCount = 0;
		const cartId = req.session.cart;
		if (cartId) {
			const cart = await controller.getOne({ _id: cartId });
			itemCount = cart ? cart.products.length : 0;
		}
		res.json({ count: itemCount });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const result = await controller.getOne({ _id: req.params.id });
		res.status(200).send({ status: "success", data: result });
	} catch (err) {
		res.status(400).send({ status: "error", error: err });
	}
});

router.post("/", async (req, res) => {
	try {
		const { user_id } = req.body;
		const result = await controller.add(user_id);

		// guardo el cartId en la session
		req.session.cart = result._id;

		// le asigno el cartId creado al usuario
		await userController.update(user_id, { cart_id: result._id });

		res.status(200).send({ status: "success", data: result });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

router.post("/:cid/products/:pid", handlePolicies(["self"]), async (req, res) => {
	try {
		const cid = req.params.cid;
		const pid = req.params.pid;

		const user = req.session.user;

		if (user.role == "premium") {
			const product = await productController.getOne({ _id: pid });
			if (product?.owner == user._id) return res.status(403).send({ status: "error", error: "No puedes agregar tu propio producto al carrito" });
		}

		const result = await controller.addToCart(cid, pid);

		res.status(200).send({ status: "success", data: result, message: "Producto agregado al carrito" });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

router.delete("/:cid/products/:pid", async (req, res) => {
	try {
		const cid = req.params.cid;
		const pid = req.params.pid;

		const result = await controller.deleteFromCart(cid, pid);
		res.status(200).send({ status: "success", data: result, message: "Product eliminado del carrito" });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

router.put("/:cid", async (req, res) => {
	try {
		const cid = req.params.cid;
		const { products } = req.body;
		const result = await controller.update(cid, products);
		res.status(200).send({ status: "success", data: result });
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
		res.status(200).send({ status: "success", data: result, message: "Product quantity updated" });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

router.delete("/:cid", async (req, res) => {
	try {
		const cid = req.params.cid;

		const result = await controller.clean(cid);
		res.status(200).send({ status: "success", data: result, message: "Cart cleaned" });
	} catch (error) {
		res.status(500).send({ status: "error", error: error.message });
	}
});

// Generar compra
router.post("/:cid/purchase", async (req, res) => {
	try {
		const cid = req.params.cid;
		const result = await controller.purchase(cid);
		res.status(200).send({ status: "success", data: result, message: "Compra confirmada", data: result });
	} catch (error) {
		req.logger.error(error);
		res.status(500).send({ status: "error", error: error.type });
	}
});

export default router;
