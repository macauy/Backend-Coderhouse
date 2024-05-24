import { Router } from "express";
import ProductManager from "../dao/productManager.mdb.js";
import { validatePage, validatePageSize } from "../utils/http.utils.js";

const router = Router();

const manager = new ProductManager();

// router.get("/paginate/:page", async (req, res) => {
// 	try {
// 		// Podríamos paginar manualmente con skip, limit, pero es más
// 		// práctico y eficiente con Mongoose Paginate
// 		// const process = await usersModel.find().skip(0).limit(8).lean();

// 		/**
// 		 * paginate toma 2 objetos como parámetros; el primero es equivalente
// 		 * al objeto que pasaríamos a un filter para filtrar los datos que nos
// 		 * interesan; el segundo contiene los parámetros para armar el paginado,
// 		 * en este caso le indicamos que queremos recuperar la página 1,
// 		 * utilizando un límite de 100 por página. paginate se encargará de
// 		 * devolvernos los datos de paginado en base a esos parámetros, teniendo
// 		 * luego esos datos, podremos reenviarlos por ej a una plantilla o a un
// 		 * frontend para armar la botonera de paginado.
// 		 */
// 		const process = await usersModel.paginate(
// 			{ role: "admin" },
// 			{ page: 1, limit: 100 }
// 		);

// 		res.status(200).send({ origin: config.SERVER, payload: process });
// 	} catch (err) {
// 		res
// 			.status(500)
// 			.send({ origin: config.SERVER, payload: null, error: err.message });
// 	}
// });

router.get("/", async (req, res) => {
	let { page, limit } = req.query;
	page = validatePage(page);
	limit = validatePageSize(limit);

	const query = req.query.query || "";
	const sort = req.query.sort || 0;

	await manager
		.getAllProducts(page, limit, query, sort)
		.then((products) => {
			res.send({ status: "success", payload: products });
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
