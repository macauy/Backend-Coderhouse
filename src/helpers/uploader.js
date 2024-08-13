import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import config from "../config.js";

cloudinary.config({
	cloud_name: config.CLOUD_NAME, // "dkyug9gb1",
	api_key: config.CLOUD_KEY, // "666236712982442",
	api_secret: config.CLOUD_SECRET, // "C9csy1G2x_by6NCjvN78057zBSU",
});

// Configura el almacenamiento para Multer usando Cloudinary
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "products", // Carpeta en Cloudinary donde se almacenarán las imágenes
		allowed_formats: ["jpg", "png"],
		transformation: [{ width: 500, height: 500, crop: "limit" }], // Transformación básica
		public_id: (req, file) => file.originalname.split(".")[0], // Nombre del archivo
	},
});

export const uploader = multer({ storage: storage });
