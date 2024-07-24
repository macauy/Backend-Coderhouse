import { errorsDictionary } from "./errors.dictionary.js";

const errorsHandler = (error, req, res, next) => {
	let customErr = errorsDictionary[0];
	for (const key in errorsDictionary) {
		if (errorsDictionary[key].code === error.type.code) customErr = errorsDictionary[key];
	}
	return res.status(customErr.status).send({ status: "error", payload: "", error: `${customErr.message}. ${error?.type?.detail}` });
};

export default errorsHandler;
