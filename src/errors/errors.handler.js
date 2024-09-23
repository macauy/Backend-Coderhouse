import { errorsDictionary } from "./errors.dictionary.js";

const errorsHandler = (error, req, res, next) => {
	// Asigna un error por defecto
	let customErr = errorsDictionary[0] || { status: 500, message: "Error interno del servidor" };

	// Busca un error específico en el diccionario
	for (const key in errorsDictionary) {
		if (errorsDictionary[key].code === error?.type?.code) {
			customErr = errorsDictionary[key];
			break;
		}
	}

	// Loguea el error
	if (req.logger) {
		req.logger.error(`Error: ${customErr.message}. Detalle: ${error?.type?.detail}`);
	}

	// Envía la respuesta de error
	return res.status(customErr.status).send({ status: "error", payload: "", error: `${customErr.message}. ${error?.type?.detail}` });
};

export default errorsHandler;
