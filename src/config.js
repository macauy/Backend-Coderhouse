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
};

export default config;
