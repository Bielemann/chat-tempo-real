# Chat em Tempo Real

Projeto desenvolvido com Node.js e WebSockets. A aplicação permite que vários usuários acessem uma sala de conversa, enviem mensagens instantaneamente e consultem o histórico salvo em um arquivo JSON.

## Tecnologias utilizadas

- Node.js
- Módulo HTTP nativo do Node.js
- WebSocket, por meio da biblioteca `ws`
- HTML, CSS e JavaScript
- Arquivo JSON para persistência das mensagens

## Requisitos

- Node.js versão 18 ou superior
- npm (instalado junto com o Node.js)
- Navegador atualizado

## Como instalar

1. Baixe ou clone este repositório.
2. Abra o terminal na pasta do projeto.
3. Instale as dependências:

   ```bash
   npm install
   ```

## Como executar

No terminal, execute:

```bash
npm start
```

Quando aparecer a mensagem `Chat disponível em http://localhost:3000`, o servidor estará funcionando.

## Como acessar

Abra o navegador e acesse:

[http://localhost:3000](http://localhost:3000)

Para testar a comunicação entre vários usuários, abra o endereço em duas ou mais abas ou em navegadores diferentes. Informe nomes diferentes e envie mensagens.

## Como funciona

- O servidor HTTP entrega os arquivos da interface que ficam na pasta `public`.
- O módulo WebSocket gerencia as conexões dos usuários.
- Quando uma mensagem é recebida, o servidor registra o nome, o texto e a data/hora no arquivo `data/messages.json`.
- Em seguida, a mensagem é enviada para todos os usuários conectados.
- Ao conectar, cada usuário recebe o histórico armazenado.
- O projeto mantém as 500 mensagens mais recentes no arquivo JSON.

## Estrutura de pastas

```text
chat-tempo-real/
├── data/
│   └── messages.json
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── package.json
├── README.md
└── server.js
```

## Observação

O arquivo `data/messages.json` é criado automaticamente caso não exista. Esta versão utiliza armazenamento local em arquivo JSON, conforme solicitado na atividade.
