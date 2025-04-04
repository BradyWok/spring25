const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const messageSchema = new Schema({
  content: { type: String },
  username: { type: String }
});

const messageModel = mongoose.model("Message", messageSchema);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  socket.on('chat message', async function({ username, text }) {
    try {
      const message = new messageModel({ content: text, username });
      await message.save();
      io.emit('chat message', { id: socket.id, text, username });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });
});

server.listen(3000, async function(){
  await mongoose.connect("mongodb+srv://sam:helloworld@cluster0.ytnrk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
  console.log('listening on *:3000');
});

app.get('/messages', async function(req, res) {
  try {
    const messages = await messageModel.find();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});
