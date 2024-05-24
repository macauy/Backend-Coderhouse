import {
	MIN_PAGE_NUMBER,
	DEFAULT_PAGE_NUMBER,
	MIN_PAGE_SIZE,
	DEFAULT_PAGE_SIZE,
} from "../constants/http.constants.js";

export const validatePage = (input) => {
	const parsedValue = parseInt(input);

	return isNaN(parsedValue) || parsedValue < MIN_PAGE_NUMBER
		? DEFAULT_PAGE_NUMBER
		: parsedValue;
};

export const validatePageSize = (input) => {
	const parsedValue = parseInt(input);

	return isNaN(parsedValue) || parsedValue < MIN_PAGE_SIZE
		? DEFAULT_PAGE_SIZE
		: parsedValue;
};
