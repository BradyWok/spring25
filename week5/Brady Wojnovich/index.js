const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  const userId = socket.id; 
  console.log(`User connected: ${userId}`);

  socket.on('chat message', (msg) => {
    const messageData = { id: userId, text: msg };
    io.emit('chat message', messageData); 
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
  });
});

server.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});
