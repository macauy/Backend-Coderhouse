import { Router } from "express";
import ProductManager from "../dao/productManager.mdb.js";

const router = Router();

const manager = new ProductManager();

router.get("/", async (req, res) => {
	const limit = req.query.limit || 0;

	await manager
		.getAll(limit)
		.then((products) => {
			console.log("Productos obtenidos:", products);
			res.send({ status: "success", payload: products });
		})
		.catch((error) => {
			console.error("Error al obtener los productos:", error);
			res.status(400).send({ status: "error", payload: error });
		});
});

router.get("/:pid", async (req, res) => {
	const id = parseInt(req.params.pid);
	const result = await manager.getProductById(id);
	if (result.err) {
		res.status(400).send({ status: "error", error: result.msg });
	} else
		res.status(200).send({
			status: "success",
			message: result.msg,
			payload: result.payload,
		});
});

router.post("/", async (req, res) => {
	console.log("en POST de products");
	console.log("body", req.body);
	const {
		id,
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
			id,
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
			res.status(400).send({ status: "error", error: result.msg });
		} else
			res.status(200).send({
				status: "success",
				message: result.msg,
				payload: result.payload,
			});
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
			// // conexion con socket
			// const socketServer = req.app.get("socketServer");
			// // emito que recibí un nuevo producto
			// socketServer.emit("deleteProduct", { id: id });
			res.status(200).send({ status: "success", message: result.msg });
		}
	}
});

export default router;
