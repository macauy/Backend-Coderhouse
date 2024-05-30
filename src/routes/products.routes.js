import { Router } from "express";
import ProductManager from "../dao/productManager.mdb.js";

const router = Router();

const manager = new ProductManager();

router.get("/", async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;

	await manager
		.getAllProducts(page, limit, category, stock, sort)
		.then((result) => {
			res.send({
				status: "success",
				payload: result.docs,
				totalPages: result.totalPages,
				prevPage: result.prevPage,
				nextPage: result.nextPage,
				page: result.page,
				hasPrevPage: result.hasPrevPage,
				hasNextPage: result.hasNextPage,
				prevLink: result.prevLink,
				nextLink: result.nextLink,
			});
		})
		.catch((error) => {
			console.error("Error al obtener los productos:", error);
			res.status(400).send({ status: "error", payload: error });
		});
});

router.get("/:pid", async (req, res) => {
	const id = req.params.pid;
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
	const id = req.params.id;
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
});

router.delete("/:id", async (req, res) => {
	const id = req.params.id;

	const result = await manager.deleteProduct(id);
	if (result.err) {
		res.status(400).send({ status: "error", error: result.msg });
	} else {
		res.status(200).send({ status: "success", message: result.msg });
	}
});

export default router;
