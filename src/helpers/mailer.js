import nodemailer from "nodemailer";
import config from "../config.js";

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
	console.log(`Enviando mail a ${email} con el link: ${link}`);

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

		console.log("Correo enviado:", result);
		return result;
	} catch (error) {
		console.error("Error al enviar el correo:", error);
		throw new Error("No se pudo enviar el correo de restablecimiento");
	}
};

export const sendDeletionEmail = async (email) => {
	console.log(`Enviando mail a ${email} por baja de usuario`);

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

		console.log("Correo enviado:", result);
		return result;
	} catch (error) {
		console.error("Error al enviar el correo:", error);
		throw new Error("No se pudo enviar el correo de restablecimiento");
	}
};
