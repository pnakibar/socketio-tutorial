import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import socketio from 'socket.io';
import http from 'http';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.json({ hello: 'world!' }));


const server = http.createServer(app);
const io = socketio(server);

io.on('connection', () => console.log('someone connected'));

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`[x] Magic happens on port: ${port}`));

export default app;
