import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import socketio from 'socket.io';
import http from 'http';
import socketioJwt from 'socketio-jwt'; // nova dependência!
import jwt from 'jsonwebtoken'; // nova dependência!
import cors from 'cors'; // nova dependência! para fazer o login

const users = [
  { name: 'user1', password: '123' },
  { name: 'user2', password: '123' }
]; // usuários padrão

const SECRET = 'secret'; // insira algo mais seguro!

const messages = [];

const app = express();
const server = new http.Server(app);
const io = socketio.listen(server);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`[x] Magic happens on port: ${port}`));

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.json({ hello: 'world!' }));

// registro de novo usuário
app.post('/signup', (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ name: 'NoNameOrPassword!' });
  }
  users.push({ name, password });
  return res.status(201).json(jwt.sign({ name }, SECRET));
});
// login de um usuário
app.post('/login', (req, res) => {
  try {
    const { name, password } = req.body;
    const user = users.filter(u => u.name === name && u.password === password)[0];
    if (user) {
      return res.status(200).json(jwt.sign({ name: user.name }, SECRET));
    }
    return res.status(400).json({ name: 'UserOrPasswordIsWrong' });
  } catch (e) {
    return res.status(400).json({ name: 'UserOrPasswordIsWrong' });
  }
});

// definir o middleware
io.use(socketioJwt.authorize({
  secret: SECRET,
  handshake: true
}));

io.on('connection', (socket) => {
  const userName = socket.decoded_token.name; // nome do usuário, que vem pelo token de login
  socket.emit('messages', messages);
  socket.emit('hello', 'Welcome!');
  socket.on('sent message', (message) => {
    const newMessage = { userName, message }; // alteramos a estrutura das mensagens, temos que atualizar no front-end!
    messages.push(newMessage);
    io.emit('new message', newMessage);
  });
});


export default app;
