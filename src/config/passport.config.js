import passport from "passport";
import local from "passport-local";
import userService from "../controllers/models/user.model.js";
import { isValidPassword, createHash } from "../utils/encrypt.js";

const LocalStrategy = local.Strategy;

const inicializePassport = () => {
	passport.use(
		"register",
		new LocalStrategy({ passReqToCallback: true, usernameField: "email" }, async (req, username, password, done) => {
			const { firstName, lastName, afe, email } = req.body;
			try {
				let user = await userService.findOne({ email: username });
				if (user) {
					console.log("User already exists");
					return done(null, false);
				}
				const newUser = {
					firstName,
					lastName,
					email,
					age,
					password: createHash(password),
				};
				let result = await userService.createUser(newUser);
				return done(null, result);
			} catch (error) {
				return done("Error al obtener el usuario: " + error);
			}
		})
	);
};

export default inicializePassport;
