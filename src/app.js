import express from "express";
import config from "./config.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/static", express.static(`${config.DIRNAME}/public`));

app.listen(config.PORT, () => {
	console.log(`App activa en puerto ${config.PORT}`);
	console.log(config.DIRNAME);
});
