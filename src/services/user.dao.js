import userModel from "../models/user.model.js";

class UserService {
	constructor() {}

	async get() {
		try {
			return await userModel.find().lean();
		} catch (err) {
			return err.message;
		}
	}

	async getOne(filter) {
		try {
			return await userModel.findOne(filter).lean();
		} catch (err) {
			return err.message;
		}
	}

	async add(register) {
		try {
			return await userModel.create(register);
		} catch (err) {
			return err.message;
		}
	}

	async update(id, register) {
		try {
			return await userModel.updateOne({ _id: id }, { $set: register });
		} catch (err) {
			return err.message;
		}
	}

	async delete(id) {
		try {
			return await userModel.deleteOne({ _id: id });
		} catch (err) {
			return err.message;
		}
	}
}

export default UserService;
