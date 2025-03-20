const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const axios = require('axios');

const io = new Server(server);


const GIPHY_API_KEY = 'XxUZfdq9Eg59ySml9jrXqb8jZ5rbNTyt';


const nicknames = ["CoolPenguin", "FireDragon", "HappyCactus", "SpeedyTurtle", "NeonFox"];
const users = {};


const gifCategories = ["funny", "cat", "dog", "happy", "sad", "dance", "meme", "excited", "love", "wow"];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  
  const randomName = nicknames[Math.floor(Math.random() * nicknames.length)];
  users[socket.id] = randomName;
  console.log(`User connected: ${randomName} (${socket.id})`);

  socket.on('chat message', async (msg) => {
    
    if (msg === '/gif list') {
      socket.emit('chat message', {
        type: 'list',
        text: "Available GIF commands:\n" + gifCategories.map(g => `/gif ${g}`).join('\n')
      });
      return;
    }

    
    if (msg.startsWith('/gif ')) {
      const searchTerm = msg.replace('/gif ', '');
      try {
        const response = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${searchTerm}&limit=1`);
        const gifUrl = response.data.data[0]?.images?.fixed_height?.url;

        if (gifUrl) {
          io.emit('chat message', { type: 'gif', name: users[socket.id], url: gifUrl });
        } else {
          socket.emit('chat message', { type: 'text', text: 'No GIF found! Try a different keyword.' });
        }
      } catch (error) {
        console.error(error);
        socket.emit('chat message', { type: 'text', text: 'Error fetching GIF. Try again later.' });
      }
      return;
    }

    
    io.emit('chat message', { type: 'text', name: users[socket.id], text: msg });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${users[socket.id]} (${socket.id})`);
    delete users[socket.id]; 
  });
});

server.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});
