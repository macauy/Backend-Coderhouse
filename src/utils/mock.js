import { faker } from "@faker-js/faker";

export const generateProducts = async (qty = 100) => {
	const products = [];

	for (let i = 0; i < qty; i++) {
		products.push(await generateProduct());
	}

	return products;
};

const generateProduct = async () => {
	return {
		title: faker.commerce.productName(),
		description: faker.commerce.productDescription(),
		code: faker.string.alpha(4),
		price: faker.commerce.price(),
		status: faker.datatype.boolean(0.9),
		stock: faker.string.numeric(1),
		category: faker.commerce.department(),
		thumbnails: [faker.image.url()],
	};
};
