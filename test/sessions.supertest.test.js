import * as chai from "chai";
import supertest from "supertest";

const expect = chai.expect;
const requester = supertest("http://localhost:5000");
const testUser = { firstName: "Juan", lastName: "Perez", email: "jperez4@gmail.com", password: "abc445", age: 30 };
let sessionCookie = "";

describe("Test Integración Sessions", function () {
	before(async function () {
		// Si ya existe un usuario con el email de testUser, lo elimino para poder realizar las pruebas correctamente
		const result = await requester.get(`/api/users?email=${testUser.email}`);
		if (result.body.status == "success" && result.body.data) {
			const user = result.body.data;
			await requester.delete(`/api/users/${user._id}`);
		}
	});

	beforeEach(function () {});
	after(function () {});
	afterEach(function () {});

	it("POST  /api/sessions/register debe registrar un nuevo usuario", async function () {
		const { statusCode, ok, _body } = await requester.post("/api/sessions/register?test=true").send(testUser);

		expect(_body.error).to.be.undefined;
		expect(_body.payload).to.be.ok;
		expect(_body.payload.email).to.be.equal(testUser.email);
	});

	it("POST  /api/sessions/register NO debe registrar un nuevo usuario con mismo mail", async function () {
		const { statusCode, _body } = await requester.post("/api/sessions/register?test=true").send(testUser);
		expect(statusCode).to.be.equals(500);
	});

	it("POST  /api/sessions/login debe ingresar al usuario, guardarlo en session y retornar", async function () {
		// Realizar la solicitud de login con el parámetro test=true en la query
		const loginResponse = await requester.post("/api/sessions/login?test=true").send(testUser);

		// Verificar que la respuesta fue exitosa (status 200)
		expect(loginResponse.status).to.be.equal(200);

		// Verificar que el payload contiene los datos correctos del usuario
		expect(loginResponse.body.status).to.be.equal("success");
		expect(loginResponse.body.payload).to.have.property("email", testUser.email);

		// Verificar la cookie connect.sid y guardarla
		sessionCookie = loginResponse.headers["set-cookie"].find((cookie) => cookie.includes("connect.sid"));
		expect(sessionCookie).to.be.ok;
	});

	it("GET /api/sessions/current debe devolver el usuario logueado", async function () {
		// Solicitud al endpoint /current para verificar si se guardó el usuario en la sesión
		const { statusCode, _body } = await requester.get("/api/sessions/current").set("Cookie", sessionCookie);
		expect(_body.payload).to.have.property("email").and.to.be.eql(testUser.email);
		expect(_body.payload).to.have.property("role");
	});
});
