const mongoose = require("mongoose");


const uri = "mongodb://127.0.0.1:27017/skycap";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection database error"));
db.once("open", () => console.log("database ok"));

module.exports = db;
