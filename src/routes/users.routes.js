import { Router } from "express";
import Controller from "../controllers/user.controller.js";
import { verifyRequiredBody, verifyAllowedBody, verifyMongoDBId } from "../helpers/utils.js";

const router = Router();
const controller = new Controller();

router.param("id", verifyMongoDBId());

router.get("/", async (req, res) => {
	try {
		res.status(200).send({ status: "success", data: await controller.get() });
	} catch (err) {
		res.status(500).send({ status: "error", error: err.message });
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

router.post("/", verifyRequiredBody(["firstName", "lastName", "email", "role"]), async (req, res) => {
	console.log("POST USER");
	try {
		const data = {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: req.body.password,
			age: req.body.age,
		};
		res.status(200).send({ status: "success", data: await controller.add(data) });
	} catch (err) {
		console.log("CATCH POST USER");
		res.status(500).send({ status: "error", data: err.message });
	}
});

router.put("/:id", verifyAllowedBody(["firstName", "lastName", "email", "password", "role", "age"]), async (req, res) => {
	try {
		res.status(200).send({ status: "success", data: await controller.update(req.params.id, req.body) });
	} catch (err) {
		res.status(500).send({ status: "error", data: err.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		res.status(200).send({ status: "success", data: await controller.delete(req.params.id) });
	} catch (err) {
		res.status(500).send({ status: "error", data: err.message });
	}
});

export default router;
