import express from "express";

const router = express.Router();

// Endpoint para probar los logs
router.get("/", (req, res) => {
	req.logger.debug("Debug");
	req.logger.http("info http");
	req.logger.info("Información");
	req.logger.warning("Advertencia");
	req.logger.error("Error");
	req.logger.fatal("Fatal error");

	res.send({ status: "success", message: "Logs probados, revisa tus logs" });
});

export default router;
