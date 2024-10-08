import nodemailer from "nodemailer";
import config from "../config.js";
import { logger } from "../helpers/logger.js";

const transport = nodemailer.createTransport({
	service: "gmail",
	port: 587,
	host: "smtp.gmail.com",
	auth: {
		user: config.GMAIL_APP_USER,
		pass: config.GMAIL_APP_PASS,
	},
});

export const sendResetPasswordEmail = async (email, link) => {
	logger.debug(`Enviando mail a ${email} con el link: ${link}`);
	try {
		let result = await transport.sendMail({
			from: `Ecommerce Coder <${config.GMAIL_APP_USER}>`,
			to: email,
			subject: "Resetea tu contraseña",
			html: `
				<!DOCTYPE html>
				<html lang="es">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Restablecimiento de Contraseña</title>
				</head>
				<body>
					<div>
						<h1>¡Hola!</h1>
						<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
						<a href="${link}">${link}</a>
						<p>o copia y pega este texto en el navegador:</p>
						<a href="${link}">${link}</a>
						<p>Si no solicitaste este cambio, simplemente ignora este mensaje.</p>
						<div>
							<p>Gracias por usar nuestro servicio.</p>
							<p>&copy; 2024 Ecommerce Coder</p>
						</div>
					</div>
				</body>
				</html>
			`,
		});

		logger.debug("Correo enviado: " + result);
		return result;
	} catch (error) {
		logger.debug("Error al enviar el correo:" + error);
		throw new Error("No se pudo enviar el correo de restablecimiento");
	}
};

export const sendDeletionEmail = async (email) => {
	logger.debug(`Enviando mail a ${email} por baja de usuario`);

	try {
		let result = await transport.sendMail({
			from: `Ecommerce Coder <${config.GMAIL_APP_USER}>`,
			to: email,
			subject: "Se ha deshabilitado tu cuenta",
			html: `
					<!DOCTYPE html>
					<html lang="es">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Se ha deshabilitado tu cuenta</title>
					</head>
					<body>
						<div>
							<h1>¡Hola!</h1>
							<p>Notamos que no has tenido actividad en el sitio Backend Ecommerce, por lo cual se ha desactivado tu usuario.</p>
							
							<p>Para volver a activarlo, inicia sesión nuevamente.</p>
							
							<div>
								<p>Gracias por usar nuestro servicio.</p>
								<p>&copy; 2024 Ecommerce Coder</p>
							</div>
						</div>
					</body>
					</html>
				`,
		});

		logger.debug("Correo enviado: " + result);
		return result;
	} catch (error) {
		logger.debug("Error al enviar el correo: " + error);
		throw new Error("No se pudo enviar el correo por baja de usuario");
	}
};

export const sendDeleteProductEmail = async (email, code, title) => {
	logger.debug(`Enviando mail a ${email} por baja de producto`);

	try {
		let result = await transport.sendMail({
			from: `Ecommerce Coder <${config.GMAIL_APP_USER}>`,
			to: email,
			subject: `Se ha eliminado el producto ${code} del Ecommerce Coder`,
			html: `
					<!DOCTYPE html>
					<html lang="es">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Se ha eliminado el producto ${code} del Ecommerce Coder</title>
					</head>
					<body>
						<div>
							<h1>¡Hola!</h1>
							<p>Te enviamos este correo para notificarte que se ha eliminado el siguiente producto del Ecommerce Coder:</p>
							
							<h3>Código: ${code}</h3>
							<h3>Título: ${title}</h3>
							<p> </p>
							<div>
								<p>Gracias por usar nuestro servicio.</p>
								<p>&copy; 2024 Ecommerce Coder</p>
							</div>
						</div>
					</body>
					</html>
				`,
		});

		logger.debug("Correo enviado:" + result);
		return result;
	} catch (error) {
		logger.debug("Error al enviar el correo:" + error);
		throw new Error("No se pudo enviar el correo por eliminación de producto");
	}
};
