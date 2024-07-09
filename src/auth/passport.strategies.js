import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";

import config from "../config.js";
import UserController from "../controllers/user.controller.js";
import { isValidPassword } from "../utils/encrypt.js";

const localStrategy = local.Strategy;

const controller = new UserController();

const initAuthStrategies = () => {
	passport.use(
		"login",
		new localStrategy({ passReqToCallback: true, usernameField: "email" }, async (req, username, password, done) => {
			try {
				const foundUser = await controller.getOne({ email: username });

				if (foundUser && foundUser.password && isValidPassword(password, foundUser.password)) {
					const { password, ...filteredFoundUser } = foundUser;
					return done(null, filteredFoundUser);
				} else {
					return done(null, false);
				}
			} catch (err) {
				return done(err, false);
			}
		})
	);

	passport.use(
		"register",
		new localStrategy({ passReqToCallback: true, usernameField: "email" }, async (req, username, password, done) => {
			try {
				const foundUser = await controller.getOne({ email: username });
				if (!foundUser) {
					const newUser = {
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						email: username,
						password: password,
						age: req.body.age,
						role: "user",
						cart: null,
					};

					const createdUser = await controller.add(newUser);
					return done(null, createdUser);
				} else {
					return done(null, false, { message: "El usuario ya existe" });
				}
			} catch (err) {
				return done(err, false);
			}
		})
	);

	passport.use(
		"githublogin",
		new GitHubStrategy(
			{
				clientID: config.GITHUB_CLIENT_ID,
				clientSecret: config.GITHUB_CLIENT_SECRET,
				callbackURL: config.GITHUB_CALLBACK_URL,
			},
			async (req, accessToken, refreshToken, profile, done) => {
				try {
					const email = profile._json?.email || null;

					if (email) {
						const foundUser = await controller.getOne({ email: email });

						if (!foundUser) {
							const user = {
								firstName: profile._json.name.split(" ")[0],
								lastName: profile._json.name.split(" ")[1],
								email: email,
								password: "",
							};

							const process = await controller.addUser(user);

							return done(null, process);
						} else {
							console.log("ya tenemos registrado el usuario");
							return done(null, foundUser);
						}
					} else {
						return done(new Error("Faltan datos de perfil"), null);
					}
				} catch (err) {
					return done(err, false);
				}
			}
		)
	);

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});
};

export default initAuthStrategies;
