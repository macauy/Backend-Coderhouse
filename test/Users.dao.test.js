// import chai from "chai";
import * as chai from "chai";
import mongoose from "mongoose";
import UserService from "../src/services/user.dao.mdb.js";
import config from "../src/config.js";

const expect = chai.expect;
const dao = new UserService();
let connection;

const testUser = { firstName: "Juan", lastName: "Perez", email: "jperez@gmail.com", password: "abc445" };
const updatedUser = { firstName: "Juan", lastName: "Lopez", email: "jperez@gmail.com", password: "abc445" };

connection = await mongoose.connect(config.MONGODB_URI);

describe("Test User DAO", () => {
	before(async function () {
		// Limpiar la colección antes de comenzar las pruebas
		await mongoose.connection.collection("test_users").deleteMany({});
	});

	beforeEach(function () {});

	after(async function () {
		// Cerrar la conexión después de todas las pruebas
		await mongoose.connection.close();
	});

	it("add() debe retornar un objeto con los datos del nuevo usuario", async function () {
		const result = await dao.add(testUser);
		expect(result).to.be.an("object");
		expect(result._id).to.be.not.null;
		expect(result.firstName).to.equal(testUser.firstName);
	});

	it("get() debe retornar un array de usuarios", async function () {
		const result = await dao.get();
		expect(result).to.be.an("array");
		expect(result.length).to.equal(1);
	});

	it("getOne() debe retornar un objeto coincidente con el criterio indicado", async function () {
		const result = await dao.getOne({ email: testUser.email });
		expect(result).to.be.an("object");
		expect(result._id).to.be.not.null;
		expect(result.email).to.be.equal(testUser.email);
	});

	it("update() debe modificar correctamente el usuario existente", async function () {
		const existingUser = await dao.getOne({ email: testUser.email });
		const result = await dao.update(existingUser._id, updatedUser);
		expect(result).to.be.an("object");
		expect(result.modifiedCount).to.equal(1);

		// Verificar si los cambios se han aplicado
		const updated = await dao.getOne({ email: updatedUser.email });
		expect(updated.firstName).to.equal(updatedUser.firstName);
		expect(updated.lastName).to.equal(updatedUser.lastName);
	});

	it("delete() debe eliminar el usuario correctamente", async function () {
		const existingUser = await dao.getOne({ email: updatedUser.email });
		const result = await dao.delete(existingUser._id);
		expect(result).to.be.an("object");
		expect(result.deletedCount).to.equal(1);

		// Verificar si el usuario ha sido eliminado
		const deletedUser = await dao.getOne({ email: updatedUser.email });
		expect(deletedUser).to.be.null;
	});
});
