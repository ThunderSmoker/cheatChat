import { Server } from 'socket.io';

const io = new Server();

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('sendMessage', (message) => {
    io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

export default io;
