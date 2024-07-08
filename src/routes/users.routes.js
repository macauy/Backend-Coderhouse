import { Router } from "express";

import config from "../config.js";
import UsersManager from "../controllers/users.manager.mdb.js";

const router = Router();
const manager = new UsersManager();

router.get("/", async (req, res) => {
	try {
		const process = await manager.getAllUsers();
		res.status(200).send({ origin: config.SERVER, payload: process });
	} catch (err) {
		res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
	}
});

router.get("/paginate/:page/:limit", async (req, res) => {
	try {
		const filter = { role: "admin" };
		const options = {
			page: req.params.page,
			limit: req.params.limit,
			sort: { lastName: 1 },
		};
		const process = await manager.getUsersPaginated(filter, options);

		res.status(200).send({ origin: config.SERVER, payload: process });
	} catch (err) {
		res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
	}
});

router.post("/", async (req, res) => {
	try {
		const process = await manager.addUser(req.body);

		res.status(200).send({ origin: config.SERVER, payload: process });
	} catch (err) {
		res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
	}
});

router.put("/:id", async (req, res) => {
	try {
		const filter = { _id: req.params.id };
		const update = req.body;
		const options = { new: true };
		const process = await manager.updateUser(filter, update, options);

		res.status(200).send({ origin: config.SERVER, payload: process });
	} catch (err) {
		res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const filter = { _id: req.params.id };
		const process = await manager.deleteUser(filter);

		res.status(200).send({ origin: config.SERVER, payload: process });
	} catch (err) {
		res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
	}
});

export default router;
