import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import config from "../config.js";

cloudinary.config({
	cloud_name: config.CLOUD_NAME,
	api_key: config.CLOUD_KEY,
	api_secret: config.CLOUD_SECRET,
});

// Función para determinar el almacenamiento en función del tipo de archivo
const getStorage = (folder, transformations = []) => {
	return new CloudinaryStorage({
		cloudinary: cloudinary,
		params: {
			folder: `backend-coder/${folder}`, // Carpeta en Cloudinary
			allowed_formats: ["jpg", "png", "webp", "pdf", "docx", "doc", "odt", "txt"],
			transformation: transformations,
			public_id: (req, file) => `${Date.now()}-${Math.round(Math.random() * 1e6)}-${file.originalname.split(".")[0]}`,
		},
	});
};

// Middlewares para cargar archivos en diferentes carpetas
export const productUploader = multer({
	storage: getStorage("products", [{ width: 500, height: 500, crop: "limit" }]),
});

export const profileUploader = multer({
	storage: getStorage("profiles"),
});

export const documentUploader = multer({
	storage: getStorage("documents"),
});
