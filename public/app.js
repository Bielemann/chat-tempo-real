const statusElement = document.getElementById("status");
const messagesElement = document.getElementById("messages");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("messageInput");
const messageForm = document.getElementById("messageForm");

let socket;

function setStatus(connected) {
  statusElement.textContent = connected ? "Conectado" : "Desconectado";
  statusElement.className = connected ? "status online" : "status offline";
}

function addMessage(message) {
  const emptyNotice = messagesElement.querySelector(".aviso");
  if (emptyNotice) emptyNotice.remove();

  const article = document.createElement("article");
  article.className = "mensagem";

  const author = document.createElement("strong");
  author.textContent = message.username;

  const content = document.createElement("p");
  content.textContent = message.text;

  const time = document.createElement("time");
  const date = new Date(message.timestamp);
  time.textContent = date.toLocaleString("pt-BR");

  article.append(author, content, time);
  messagesElement.appendChild(article);
  messagesElement.scrollTop = messagesElement.scrollHeight;
}

function connect() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${protocol}//${location.host}`);

  socket.addEventListener("open", () => setStatus(true));
  socket.addEventListener("close", () => {
    setStatus(false);
    setTimeout(connect, 2000);
  });
  socket.addEventListener("error", () => setStatus(false));

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "history") {
      messagesElement.innerHTML = "";
      if (data.messages.length === 0) {
        messagesElement.innerHTML = '<p class="aviso">Nenhuma mensagem ainda. Comece a conversa!</p>';
      } else {
        data.messages.forEach(addMessage);
      }
    } else if (data.type === "message") {
      addMessage(data.message);
    } else if (data.type === "error") {
      alert(data.message);
    }
  });
}

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  const username = usernameInput.value.trim() || "Visitante";

  if (!text || !socket || socket.readyState !== WebSocket.OPEN) {
    alert("Aguarde a conexão com o servidor para enviar mensagens.");
    return;
  }

  socket.send(JSON.stringify({ type: "message", username, text }));
  messageInput.value = "";
  messageInput.focus();
});

connect();
