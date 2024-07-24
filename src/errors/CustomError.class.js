export default class CustomError extends Error {
	constructor(type, message = "") {
		message == "" ? (message = type.message) : message;
		super(message);
		this.type = type;
	}
}
