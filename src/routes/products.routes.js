import { Router } from "express";
import Controller from "../controllers/product.controller.js";
import { verifyRequiredBody, verifyAllowedBody, verifyMongoDBId } from "../services/utils.js";

const router = Router();

const controller = new Controller();

router.param("id", verifyMongoDBId());

router.get("/", async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;

	try {
		const result = await controller.get(page, limit, category, stock, sort);

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
	} catch (err) {
		console.error("Error al obtener los productos:", err);
		res.status(400).send({ status: "error", payload: err });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const id = req.params.id;
		const result = await controller.getOne({ _id: id });
		res.status(200).send({ status: "success", payload: result });
	} catch (err) {
		res.status(400).send({ status: "error", error: err });
	}
});

router.post("/", verifyRequiredBody(["title", "description", "code", "price", "stock", "category"]), async (req, res) => {
	const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

	const data = {
		title,
		description,
		code,
		price,
		status,
		stock,
		category,
		thumbnails,
	};
	try {
		res.status(200).send({ status: "success", payload: await controller.add(data) });
	} catch (err) {
		res.status(400).send({ status: "error", error: err.message });
	}
});

router.put("/:id", verifyAllowedBody(["title", "description", "code", "price", "stock", "category", "status", "thumbnails"]), async (req, res) => {
	try {
		res.status(200).send({ status: "success", payload: await controller.update(req.params.id, req.body) });
	} catch (err) {
		res.status(500).send({ status: "error", error: err.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		res.status(200).send({ status: "success", payload: await controller.delete(req.params.id) });
	} catch (err) {
		res.status(500).send({ status: "error", error: err.message });
	}
});

export default router;
