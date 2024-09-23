import * as chai from "chai";
import supertest from "supertest";

const expect = chai.expect;
const requester = supertest("http://localhost:5000");
const adminUser = { email: "admin@mail.com", password: "admin" };
const prmiumUser = { email: "premium@mail.com", password: "premium" };
const productId = "66b017fda1c71f274318cb0e"; // producto de ejemplo para hacer get y put
let newProduct = {
	title: "Nuevo Producto",
	description: "Descripción del producto",
	code: "PROD1234",
	price: 100,
	stock: 50,
	category: "Categoría",
};

let oldProduct = {};
let adminSessionCookie = "";
let premiumSessionCookie = "";

describe("Test Integración Productos", function () {
	before(async function () {
		// Antes de comenzar hacemos login con diferentes usuarios para luego utilizarlos en los tests

		// Hacer login con un usuario premium y guardar la cookie de sesión
		const premiumLogin = await requester.post("/api/sessions/login").send(prmiumUser);
		premiumSessionCookie = premiumLogin.headers["set-cookie"][0];

		// Hacer login con un usuario admin y guardar la cookie de sesión
		const adminLogin = await requester.post("/api/sessions/login").send(adminUser);
		adminSessionCookie = adminLogin.headers["set-cookie"][0];

		// Si existe, elimino el producto de prueba para poder realizar los tests
		const result = await requester.get(`/api/products/code/${newProduct.code}`);
		if (result.body.status == "success" && result.body.data) {
			await requester.delete(`/api/products/${result.body.data._id}`).set("Cookie", adminSessionCookie);
		}
	});

	it("GET /api/products debería obtener todos los productos", async function () {
		const { statusCode, _body } = await requester.get("/api/products");

		expect(statusCode).to.be.equal(200);
		expect(_body.status).to.be.equal("success");
		expect(_body.data).to.be.an("array");
	});

	it("GET /api/products/:id debería obtener un producto por ID", async function () {
		const { statusCode, _body } = await requester.get(`/api/products/${productId}`);

		expect(statusCode).to.be.equal(200);
		expect(_body.status).to.be.equal("success");
		expect(_body.data).to.have.property("_id").that.equals(productId);

		// Guardo este producto para volver a actualizarlo luego
		oldProduct = _body.data;
	});

	it("POST /api/products debería crear un nuevo producto", async function () {
		const { statusCode, _body } = await requester.post("/api/products").set("Cookie", adminSessionCookie).send(newProduct);
		console.log("statusCode", statusCode);
		console.log("_body", _body);

		expect(statusCode).to.be.equal(200);
		expect(_body.status).to.be.equal("success");
		expect(_body.data).to.have.property("_id");

		// Actualizo el producto con todos los datos que devuelve el post (id, owner)
		newProduct = { ...newProduct, ..._body.data };
	});

	it("PUT /api/products/:id debería actualizar un producto", async function () {
		const updatedProduct = {
			title: "Producto Actualizado",
			price: 160,
		};

		const { statusCode, _body } = await requester.put(`/api/products/${productId}`).set("Cookie", adminSessionCookie).send(updatedProduct);

		expect(statusCode).to.be.equal(200);
		expect(_body.status).to.be.equal("success");
		expect(_body.data).to.have.property("title").that.equals(updatedProduct.title);
		expect(_body.data).to.have.property("price").that.equals(updatedProduct.price);

		// Vuelvo a actualizarlo con los datos originales
		const updateResult = await requester.put(`/api/products/${productId}`).set("Cookie", adminSessionCookie).send(oldProduct);
	});

	it("DELETE /api/products/:id debería eliminar un producto", async function () {
		// Primero intento eliminar con un usuario premium (no debería permitir, ya que fue creado con owner admin)
		const { statusCode: statusPrem, _body: bodyPrem } = await requester.delete(`/api/products/${newProduct._id}`).set("Cookie", premiumSessionCookie);

		expect(statusPrem).to.be.equal(500);
		expect(bodyPrem.status).to.be.equal("error");
		expect(bodyPrem.error).to.include("Usuario no habilitado para eliminar este producto");

		// Ahora intento eliminar con un usuario admin (debería permitir eliminar)
		const { statusCode: statusAdmin, _body: bodyAdmin } = await requester.delete(`/api/products/${newProduct._id}`).set("Cookie", adminSessionCookie);

		expect(statusAdmin).to.be.equal(200);
		expect(bodyAdmin.status).to.be.equal("success");
	});
});
