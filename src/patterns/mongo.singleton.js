import mongoose from "mongoose";
import config from "../config.js";
import { logger } from "../utils/logger.js";

export default class MongoSingleton {
	static #instance;

	constructor() {
		this.connect();
	}

	async connect() {
		await mongoose.connect(config.MONGODB_URI);
	}

	static getInstance() {
		if (!this.#instance) {
			this.#instance = new MongoSingleton();
			logger.info("Conexión bbdd CREADA");
		} else {
			logger.info("Conexión bbdd RECUPERADA");
		}

		return this.#instance;
	}
}
