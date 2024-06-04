import handlebars from "express-handlebars";
import config from "../config.js";

const ifCond = (v1, operator, v2, options) => {
	switch (operator) {
		case "==":
			return v1 == v2 ? options.fn(this) : options.inverse(this);
		case "===":
			return v1 === v2 ? options.fn(this) : options.inverse(this);
		case "!=":
			return v1 != v2 ? options.fn(this) : options.inverse(this);
		case "!==":
			return v1 !== v2 ? options.fn(this) : options.inverse(this);
		case "<":
			return v1 < v2 ? options.fn(this) : options.inverse(this);
		case "<=":
			return v1 <= v2 ? options.fn(this) : options.inverse(this);
		case ">":
			return v1 > v2 ? options.fn(this) : options.inverse(this);
		case ">=":
			return v1 >= v2 ? options.fn(this) : options.inverse(this);
		default:
			return options.inverse(this);
	}
};

const handlebarsConfig = handlebars.create({
	extname: ".handlebars",
	partialsDir: `${config.DIRNAME}/views/partials`,
	helpers: {
		ifCond,
		multiply: (v1, v2) => v1 * v2,
		round: (value, decimals) => {
			if (!decimals) decimals = 0;
			return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
		},
	},
});

export default handlebarsConfig;
