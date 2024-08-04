import { Router } from "express";
import Controller from "../controllers/product.controller.js";
import { verifyRequiredBody, verifyAllowedBody, verifyMongoDBId, verifyAuth, handlePolicies } from "../helpers/utils.js";
import { uploader } from "../helpers/uploader.js";
import { v2 as cloudinary } from "cloudinary";

const router = Router();

const controller = new Controller();

router.param("id", verifyMongoDBId());

router.get("/", async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;

	try {
		const result = await controller.get(page, limit, category, stock, sort);

		res.send({
			status: "success",
			data: result.docs,
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
		req.logger.error("Error al obtener los productos:", err);
		res.status(400).send({ status: "error", error: err });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const id = req.params.id;
		const result = await controller.getOne({ _id: id });
		res.status(200).send({ status: "success", data: result });
	} catch (err) {
		res.status(400).send({ status: "error", error: err });
	}
});

router.post(
	"/",
	verifyAuth,
	handlePolicies(["admin"]),
	// verifyRequiredBody(["title", "description", "code", "price", "stock", "category"]),
	uploader.array("thumbnails", 10),
	async (req, res) => {
		console.log("req.body: ", req.body);
		const { title, description, code, price, status = true, stock, category } = req.body;

		let thumbnails = [];

		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				const result = await cloudinary.uploader.upload(file.path);
				thumbnails.push(result.secure_url);
			}
		}

		thumbnails = req.files.map((file) =>
			cloudinary.url(file.filename, {
				fetch_format: "auto",
				quality: "auto",
			})
		); // URLs optimizadas de las imágenes subidas a Cloudinary

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
			res.status(200).send({ status: "success", data: await controller.add(data) });
		} catch (err) {
			res.status(400).send({ status: "error", error: err.message });
		}
	}
);

router.post("/products", uploader.array("thumbnails", 10), async (req, res) => {
	try {
		const thumbnails = req.files.map((file) =>
			cloudinary.url(file.filename, {
				fetch_format: "auto",
				quality: "auto",
			})
		); // URLs optimizadas de las imágenes subidas a Cloudinary

		const { title, description, code, category, price, stock } = req.body;

		const newProduct = await createProduct({
			title,
			description,
			code,
			category,
			price,
			stock,
			thumbnails,
		});

		res.status(200).send({ success: true, product: newProduct });
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});

router.put(
	"/:id",
	verifyAuth,
	handlePolicies(["admin"]),
	verifyAllowedBody(["title", "description", "code", "price", "stock", "category", "status", "thumbnails"]),
	async (req, res) => {
		try {
			res.status(200).send({ status: "success", data: await controller.update(req.params.id, req.body) });
		} catch (err) {
			res.status(500).send({ status: "error", error: err.message });
		}
	}
);

router.delete("/:id", verifyAuth, handlePolicies(["admin"]), async (req, res) => {
	try {
		res.status(200).send({ status: "success", data: await controller.delete(req.params.id) });
	} catch (err) {
		res.status(500).send({ status: "error", error: err.message });
	}
});

router.all("*", async (req, res) => {
	res.status(404).send({ status: "error", data: null, error: "No se encuentra la ruta solicitada" });
});

export default router;
