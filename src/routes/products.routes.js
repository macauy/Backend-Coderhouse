import { Router } from "express";
import Controller from "../controllers/product.controller.js";
import { verifyRequiredBody, verifyAllowedBody, verifyMongoDBId, verifyAuth, handlePolicies } from "../utils/utils.js";
import { productUploader } from "../helpers/uploader.js";
import { v2 as cloudinary } from "cloudinary";

const router = Router();
const controller = new Controller();

router.param("id", verifyMongoDBId());

router.get("/", async (req, res) => {
	let { page, limit, category, stock, sort } = req.query;

	try {
		const result = await controller.get(page, limit, category, stock, sort, req.session.user);

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
			pageNumbers: result.pageNumbers,
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

router.get("/code/:code", async (req, res) => {
	try {
		const code = req.params.code;
		const result = await controller.getOne({ code });
		res.status(200).send({ status: "success", data: result });
	} catch (err) {
		res.status(400).send({ status: "error", error: err });
	}
});

router.post(
	"/",
	verifyAuth,
	handlePolicies(["admin", "premium"]),
	productUploader.array("thumbnails", 10),
	verifyRequiredBody(["title", "description", "code", "price", "stock", "category"]),
	async (req, res) => {
		const { title, description, code, price, status = true, stock, category } = req.body;

		// owner
		const user = req.session.user;
		let owner;
		if (user) {
			user.role === "admin" ? (owner = "admin") : (owner = String(user._id));
		}

		// thumbnails
		let thumbnails = [];
		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				const result = await cloudinary.uploader.upload(file.path);
				thumbnails.push(result.secure_url);
			}
		}

		const data = {
			title,
			description,
			code,
			price,
			status,
			stock,
			category,
			thumbnails,
			owner,
		};
		try {
			res.status(200).send({ status: "success", data: await controller.add(data) });
		} catch (err) {
			res.status(400).send({ status: "error", error: err.message });
		}
	}
);

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

router.delete("/:id", verifyAuth, handlePolicies(["admin", "premium"]), async (req, res) => {
	try {
		const id = req.params.id;
		const user = req.session.user;
		// si es premium controlo que sea el owner del producto
		if (user.role == "premium") {
			const result = await controller.checkOwner(id, user);
		}

		return res.status(200).send({ status: "success", data: await controller.delete(req.params.id) });
	} catch (err) {
		return res.status(500).send({ status: "error", error: err.message });
	}
});

router.all("*", async (req, res) => {
	res.status(404).send({ status: "error", data: null, error: "No se encuentra la ruta solicitada" });
});

export default router;
