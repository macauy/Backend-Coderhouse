const wsServer = "ws://localhost:5000";
const socketClient = io(wsServer);

const chat = document.getElementById("chat");
const chatList = document.getElementById("chatList");

const askForUser = async () => {
	Swal.fire({
		title: "Coderhouse",
		input: "text",
		text: "Usuario",
		inputValidator: (value) => {
			return !value && "Se debe indicar usuario";
		},
		allowOutsideClick: false,
	}).then((result) => {
		user = result.value;
		socketClient.emit("clientRegistered", user);
		return user;
	});
};

let user = askForUser();

// Cada vez que se conecta un usuario me avisa
socketClient.on("newClientConnected", (usr) => {
	chatList.innerHTML += `<br /><span style='color:red'><i>${usr} ha ingresado al chat</i></span>`;
});

// Escucho chatLog, para recibir la lista actual de chat al conectarnos
socketClient.on("chatLog", (data) => {
	for (let i = 0; i < data.length; i++) {
		chatList.innerHTML += `<br /><b>[${data[i].user}]</b>: ${data[i].message}`;
	}
});

// Escucho mensaje nuevo
socketClient.on("messageArrived", (data) => {
	chatList.innerHTML += `<br /><b>[${data.user}]</b>: ${data.message}`;
	chatList.scrollTop = chatList.scrollHeight;
});

// Envío de mensaje
const sendMessage = () => {
	if (chat.value !== "") {
		socketClient.emit("newMessage", { user: user, message: chat.value });
		chat.value = "";
	}
};

//Evento Enter
chat.addEventListener("keyup", (evt) => {
	if (evt.key === "Enter") sendMessage();
});
