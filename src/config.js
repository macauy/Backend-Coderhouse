import * as url from "url";
import path from "path";

const config = {
	SERVER: "remota",
	IP: "localhost",
	PORT: 5000,
	DIRNAME: path.dirname(
		new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, "$1")
	), // Win
	get UPLOAD_DIR() {
		return `${this.DIRNAME}/public/img`;
	},
	// MONGODB_URI: "mongodb://localhost:27017/test",
	MONGODB_URI:
		"mongodb+srv://maca:maca@clustercoder.nz49oiz.mongodb.net/ecommerce",
	SECRET: "secretphraseMaca",
	GITHUB_CLIENT_ID: "Iv23liv4U4hYOSlpG33W",
	GITHUB_CLIENT_SECRET: "f87753a243fa7c3e836642cc7f49ae246565ebc0",
	GITHUB_CALLBACK_URL: "http://localhost:5000/api/sessions/githubcallback",
};

export default config;
