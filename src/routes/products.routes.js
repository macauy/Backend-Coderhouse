import { Router } from "express";
import ProductManager from "../ProductManager.js";

const router = Router();

const manager = new ProductManager("./src/data/productos.json");

router.get("/", async (req, res) => {
	const limit = req.query.limit || 0;
	const products = await manager.getProducts(limit);
	res.send({ status: "success", payload: products });
});

router.get("/:pid", async (req, res) => {
	const id = parseInt(req.params.pid);
	const product = await manager.getProductById(id);
	if (typeof product == "object")
		res.send({ status: "success", payload: product });
	else res.status(400).send({ status: "error", payload: product });
});

router.post("/", async (req, res) => {
	console.log("en POST de products");
	console.log("body", req.body);
	const {
		title,
		description,
		code,
		price,
		status = true,
		stock,
		category,
		thumbnails = [],
	} = req.body;

	if (!title || !description || !code || !category) {
		res.status(400).send({
			status: "error",
			payload: [],
			error: "Datos insuficientes",
		});
	} else if (price < 0 || stock < 0) {
		res.status(400).send({
			status: "error",
			payload: [],
			error: "Datos incorrectos",
		});
	} else {
		const product = {
			title,
			description,
			code,
			price,
			status,
			stock,
			category,
			thumbnails,
		};

		const result = await manager.addProduct(product);
		if (result.err) {
			res.status(400).send({
				status: "error",
				payload: [],
				error: result.msg,
			});
		} else {
			// conexion con socket
			const socketServer = req.app.get("socketServer");
			// emito que recibí un nuevo producto
			socketServer.emit("newProduct", product);

			res
				.status(200)
				.send({ status: "success", message: result.msg, payload: product });
		}
	}
});

router.put("/:id", async (req, res) => {
	const id = parseInt(req.params.id);

	if (id <= 0 || isNaN(id)) {
		res.status(400).send({
			status: "error",
			payload: [],
			error: "Se requiere id numérico mayor a 0",
		});
	} else {
		const { price, stock } = req.body;
		if (price < 0 || stock < 0) {
			res.status(400).send({
				status: "error",
				payload: [],
				error: "Datos incorrectos",
			});
		} else {
			const product = req.body;
			const result = await manager.updateProduct(id, product);
			if (result.err) {
				res.status(400).send({ status: "error", error: result.msg });
			} else
				res
					.status(200)
					.send({ status: "success", message: result.msg, payload: product });
		}
	}
});

router.delete("/:id", async (req, res) => {
	const id = parseInt(req.params.id);
	console.log("metodo delete id", id);
	if (id <= 0 || isNaN(id)) {
		res.status(400).send({
			status: "error",
			payload: [],
			error: "Se requiere id numérico mayor a 0",
		});
	} else {
		const result = await manager.deleteProduct(id);
		if (result.err) {
			res.status(400).send({ status: "error", error: result.msg });
		} else {
			console.log("producto eliminado");
			// conexion con socket
			const socketServer = req.app.get("socketServer");
			// emito que recibí un nuevo producto
			socketServer.emit("deleteProduct", { id: id });
			res.status(200).send({ status: "success", message: result.msg });
		}
	}
});

export default router;
