const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  content: { type: String }
});

const messageModel = mongoose.model("Message", messageSchema);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', async function(socket){
  socket.on('chat message', async function(msg){

try {
  const messages = await messageModel.find();
  console.log('mesg', messages);
} catch (err) {
  console.error(err);
}

    const message = new messageModel({ content: msg });
    message.save().then(() => {
      io.emit('chat message', { id: socket.id, text: msg });
    });
  });
});

server.listen(3000, async function(){
  await mongoose.connect("mongodb+srv://sam:helloworld@cluster0.ytnrk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
  console.log('listening on *:3000');
});
