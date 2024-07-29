import config from "../config.js";
import { logger } from "../utils/logger.js";

let factoryProductService;

switch (config.PERSISTENCE) {
	case "FILE":
		logger.info("Persistencia a FileSystem");
		const { default: FSService } = await import("../services/products.dao.fs.js");
		factoryProductService = new FSService();
		break;

	case "MONGO":
		logger.info("Persistencia a MONGODB");
		const { default: MongoSingleton } = await import("./mongo.singleton.js");
		await MongoSingleton.getInstance();
		const { default: MongoService } = await import("../services/products.dao.mdb.js");
		factoryProductService = new MongoService();
		break;

	default:
		throw new Error(`Persistencia ${config.PERSISTENCE} no soportada`);
}

export default factoryProductService;
