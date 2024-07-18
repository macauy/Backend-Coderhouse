import config from "../config.js";

let factoryProductService;

switch (config.PERSISTENCE) {
	case "FILE":
		console.log("Persistencia a FileSystem");
		const { default: FSService } = await import("../services/products.dao.fs.js");
		factoryProductService = new FSService();
		break;

	case "MONGO":
		console.log("Persistencia a MONGODB");
		const { default: MongoSingleton } = await import("./mongo.singleton.js");
		await MongoSingleton.getInstance();
		const { default: MongoService } = await import("../services/products.dao.mdb.js");
		factoryProductService = new MongoService();
		break;

	default:
		throw new Error(`Persistencia ${config.PERSISTENCE} no soportada`);
}

export default factoryProductService;
