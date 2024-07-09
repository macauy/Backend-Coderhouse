import path from "path";
import { Command } from "commander";
import dotenv from "dotenv";

const commandLine = new Command();
commandLine.option("--mode <mode>").option("--port <port>");
commandLine.parse();
const clOptions = commandLine.opts();

const mode = clOptions.mode || "dev";

dotenv.config({ path: mode === "dev" ? ".env.dev" : ".env.prod" });

const config = {
	SERVER: "remota",
	MODO: mode == "dev" ? "Desarrollo" : "Produccion",
	IP: "localhost",
	PORT: process.env.PORT || clOptions.port || 5000,
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
	PERSISTENCE: process.env.PERSISTENCE || "mongo",
};

export default config;
