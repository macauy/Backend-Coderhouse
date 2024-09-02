import path from "path";
import { Command } from "commander";
import dotenv from "dotenv";

const commandLine = new Command();
commandLine.option("--mode <mode>").option("--port <port>").option("--collection <collection>");

commandLine.parse();
const clOptions = commandLine.opts();

const mode = clOptions.mode || "dev";

dotenv.config({ path: mode === "dev" ? ".env.dev" : ".env.prod" });

const config = {
	SERVER: "remota",
	MODE: mode,
	MODO: mode == "dev" ? "Desarrollo" : "Produccion",
	IP: "localhost",
	PORT: process.env.PORT || clOptions.port || 5000,
	get URL() {
		return `http://${this.IP}:${this.PORT}`;
	},
	DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, "$1")), // Win
	get UPLOAD_DIR() {
		return `${this.DIRNAME}/public/img`;
	},
	MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
	MONGODB_URI: process.env.MONGODB_URI,
	SECRET: process.env.SECRET,
	GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
	GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
	PERSISTENCE: process.env.PERSISTENCE || "MONGO",
	GMAIL_APP_USER: process.env.GMAIL_APP_USER,
	GMAIL_APP_PASS: process.env.GMAIL_APP_PASS,
	CLOUD_NAME: process.env.CLOUD_NAME,
	CLOUD_KEY: process.env.CLOUD_KEY,
	CLOUD_SECRET: process.env.CLOUD_SECRET,

	USERS_COLLECTION: clOptions.collection || "users",
};

export const MIN_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_NUMBER = 1;
export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export default config;
