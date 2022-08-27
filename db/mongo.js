const mongoose = require("mongoose");


const uri = "mongodb+srv://root:0995889656.P@cluster0.7b0nslk.mongodb.net/skycap";

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
