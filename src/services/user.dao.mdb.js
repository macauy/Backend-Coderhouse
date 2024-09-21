import userModel from "../models/user.model.js";

class UserService {
	constructor() {}

	async get(filter) {
		try {
			const users = await userModel.find(filter).lean();

			return users;
		} catch (err) {
			throw err;
		}
	}

	async getOne(filter) {
		try {
			const user = await userModel.findOne(filter).lean();
			return user;
		} catch (err) {
			throw err;
		}
	}

	async add(register) {
		try {
			const user = await userModel.create(register);
			return user;
		} catch (err) {
			throw err;
		}
	}

	async update(id, register) {
		try {
			const result = await userModel.updateOne({ _id: id }, { $set: register });
			return result;
		} catch (err) {
			throw err;
		}
	}

	async delete(id) {
		try {
			const result = await userModel.deleteOne({ _id: id });
			return result;
		} catch (err) {
			throw err;
		}
	}
}

export default UserService;
