require('dotenv').config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT;
//redis
const redis = require("redis");
const redisClient = redis.createClient();
const { promisify } = require("es6-promisify");
const asyncGet = promisify(redisClient.HGET).bind(redisClient);

//database
const mongodb = require("./db/mongo");
mongodb;
const quiz = require("./modules/quiz");

let users = {};

function getActiveRooms(io) {
  const arr = Array.from(io.sockets.adapter.rooms);
  const filtered = arr.filter((room) => !room[1].has(room[0]));
  const res = filtered.map((i) => i[0]);
  return res;
}

async function getUsernameFormId(io, roomid) {
  const arr = Array.from(io.sockets.adapter.rooms.get(roomid) ?? {});
  const username = arr.map(async (data, i) => {
    return {
      username: await asyncGet(data.toString(), "username"),
      host: false,
    };
  });
  const userdata = await Promise.all(username);
  console.log(userdata);
  return Promise.all(username);
}

io.on("connection", (socket) => {
  // console.log(socket.id);
  console.log("a user connected");
  console.log(io.sockets.adapter.rooms);
  // const data = Array.from(io.sockets.adapter.rooms.keys());

  // save username
  socket.on("send-username", function (username) {
    socket.username = username;
    let id = socket.id;

    redisClient.hset(id, "username", username);
  });

  // get username
  socket.on("get-username", function (nickname) {
    console.log(users[socket.id]?.username);
  });

  // join room
  socket.on("join", (data) => {
    socket.join(data);
    console.log(`join rooms ${data}`);
    if (data != "findListRooms") {
      console.log(getUsernameFormId(io, data));
      getUsernameFormId(io, data).then((res) => {
        try {
          res.length != 0 ? (res[0].host = true) : null;
          socket.emit("join", res);
          socket.to(data).emit("join", res);
        } catch (error) {
          console.log(error);
        }
      });
    }
  });

  // start game
  socket.on("startGame", (data) => {
    console.log("startGame");
    getUsernameFormId(io, data).then((res) => {
      try {
        res.length != 0 ? (res[0].host = true) : null;
        socket.emit("startGame", res);
        socket.to(data).emit("startGame", res);
      } catch (error) {
        console.log(error);
      }
    });
  });

  socket.on("leaveGame", (data) => {
    socket.leave(data);
  });

  socket.on("listRooms", (data) => {
    console.log("listRooms");
    socket.emit("listRooms", getActiveRooms(io));
    socket.to("findListRooms").emit("listRooms", getActiveRooms(io));
  });

  // inGame
  socket.on("playerPosition", (data) => {
    console.log(data);
    socket.emit("playerPosition", data);
    socket.to(data.room).emit("playerPosition", data);
  });

  //quizInGame
  socket.on("quiz", async (data) => {
    const res = await quiz.aggregate([{ $sample: { size: 1 } }]);
    socket.emit("quiz", res);
    socket.to(data.room).emit("quiz", res);
  });

  socket.on("leave", (data) => {
    socket.leave(data);
    if (data != "findListRooms") {
      getUsernameFormId(io, data).then((res) => {
        try {
          res.length != 0 ? (res[0].host = true) : null;
          socket.to(data).emit("join", res);
        } catch (error) {
          console.log(error);
        }
      });
    }
  });
});

app.use(express.static('public'));
app.use(express.json());
app.use('/api', require('./routes/multi'));
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
