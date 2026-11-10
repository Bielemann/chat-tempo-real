const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, "[]", "utf8");

function readMessages() {
  try {
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8"));
  } catch (error) {
    console.error("Não foi possível ler o histórico:", error.message);
    return [];
  }
}

function saveMessage(message) {
  const messages = readMessages();
  messages.push(message);
  // Mantém as 500 mensagens mais recentes para evitar crescimento ilimitado do arquivo.
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages.slice(-500), null, 2), "utf8");
}

const server = http.createServer((req, res) => {
  const requestedPath = req.url === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Acesso negado");
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Página não encontrada");
    }

    const extension = path.extname(filePath);
    const contentTypes = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8"
    };

    res.writeHead(200, { "Content-Type": contentTypes[extension] || "application/octet-stream" });
    res.end(content);
  });
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "history", messages: readMessages() }));

  socket.on("message", (rawData) => {
    let data;
    try {
      data = JSON.parse(rawData.toString());
    } catch {
      return socket.send(JSON.stringify({ type: "error", message: "Mensagem inválida." }));
    }

    if (data.type !== "message") return;
    const username = String(data.username || "Visitante").trim().slice(0, 24);
    const text = String(data.text || "").trim().slice(0, 500);
    if (!text) return;

    const message = {
      username,
      text,
      timestamp: new Date().toISOString()
    };

    try {
      saveMessage(message);
      const payload = JSON.stringify({ type: "message", message });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(payload);
      });
    } catch (error) {
      console.error("Erro ao salvar mensagem:", error.message);
      socket.send(JSON.stringify({ type: "error", message: "Não foi possível salvar a mensagem." }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Chat disponível em http://localhost:${PORT}`);
});
