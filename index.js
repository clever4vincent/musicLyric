const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const os = require("os");
const readline = require("readline");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// mongoose.connect("mongodb://localhost:27017/songs");
const instance = axios.create({
  timeout: 10000,
  headers: { "Content-Type": "application/json;charset=UTF-8" },
});
// "mongodb+srv://user:wAFat3rPZ2Kvv36@cluster0.trwul3l.mongodb.net/songs?retryWrites=true&w=majority"
// mongoose.connect(
//   "mongodb+srv://user:wAFat3rPZ2Kvv36@cluster0.fc1lnkn.mongodb.net/"
// );

const db = mongoose.createConnection(
  "mongodb+srv://user:wAFat3rPZ2Kvv36@cluster0.trwul3l.mongodb.net/songs?retryWrites=true&w=majority"
);
const db2 = mongoose.createConnection(
  "mongodb+srv://user:wAFat3rPZ2Kvv36@cluster0.fc1lnkn.mongodb.net/accounts?retryWrites=true&w=majority"
);
// utxX4MUQfvuYdaLX
// const db = mongoose.connection;
const Song = db.model("Song", {
  singer_name: [String],
  song_name: String,
  subtitle: String,
  album_name: String,
  singer_id: [Number],
  singer_mid: [String],
  song_time_public: String,
  song_type: Number,
  language: Number,
  song_id: Number,
  song_mid: String,
  song_url: String,
  // hot_comments: String,
  lyric: String,
});
const Account = db2.model("Account", {
  name: { type: String, unique: true },
  account: mongoose.Schema.Types.Object,
  condition: mongoose.Schema.Types.Object,
});
db.once("open", async function () {
  console.log("connected");
  // insertSongDB();
  // findSong("林俊杰");
});
db.once("close", async function () {
  console.log("closed");
});
db2.once("open", async function () {
  console.log("connected2");
  // insertSongDB2();
  // findSong("林俊杰");
});
db2.once("close", async function () {
  console.log("closed");
});

const findSong = async (keyword) => {
  const songs = await Song.find({ singer_name: keyword })
    // .sort({
    //   song_time_public: 1,
    // })
    .catch((err) => {
      console.error("Failed to find document", err.message);
    });
  // db.close();
  const filteredSongs = songs.filter(
    (song) =>
      !/(\(.*\))|(（.*）)|(.*live.*)|(.*串烧.*)|(.*DJ.*)/i.test(song.song_name)
  );
  // 遍历所有歌曲
  // filteredSongs.forEach(({ song_name, lyric, song_url }) => {
  //   console.log(song_name);
  //   console.log(song_url);
  //   // console.log(lyric);
  //   let newLyric = lyric?.replace(/\\n/g, " ");
  //   console.log(newLyric);
  // });
  return filteredSongs;
  // console.log(songs);
};
// findSongDB();
const insertSongDB = async () => {
  // 创建一个 readline.Interface 实例
  const rl = readline.createInterface({
    input: fs.createReadStream("song-infos"),
    // input: fs.createReadStream("test-info"),
    output: process.stdout,
    terminal: false,
  });
  // 逐行读取文件
  rl.on("line", async (line) => {
    // 解析每一行的 JSON 数据
    // lines.push(line);
    const song = JSON.parse(line);

    new Song(song).save().catch((err) => {
      console.error("Failed to insert document", err.message);
    });
  });
  // 文件读取完毕后关闭数据库连接
  rl.on("close", () => {
    // db.close();
  });
};
const insertSongDB2 = async () => {
  // 创建一个 readline.Interface 实例
  let account = { name: "test", account: "test", condition: "test" };
  new Account(account).save().catch((err) => {
    console.error("Failed to insert document", err.message);
  });
};
function sendResponse(res, statusCode, data, success = true, message) {
  if (statusCode >= 400) {
    res.status(statusCode).json({
      status: statusCode,
      error: message,
      success,
    });
  } else {
    res.status(statusCode).json({
      status: statusCode,
      success,
      data,
    });
  }
}

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/findSong", async (req, res) => {
  try {
    const { singerName } = req.query;
    console.log(singerName);
    const songs = await findSong(singerName);
    sendResponse(res, 200, songs);
  } catch (error) {
    sendResponse(res, 500, null, false, error.message);
  }
});
app.get("/findMovie", async (req, res) => {
  try {
    const { movieName } = req.query;
    console.log(movieName);
    const response = await instance.get(
      `http://101.43.155.108:8849/fantasy/movie/all/aHlseUBoeWx5LmNvbQ%3D%3D/${movieName}`
    );
    res.send(response.data);
  } catch (error) {
    sendResponse(res, 500, null, false, error.message);
  }
});
app.post("/saveAccount", async (req, res) => {
  try {
    // console.log(req.body);
    const { name, condition, account } = req.body;
    let data = { name, condition, account };
    try {
      await Account.findOneAndUpdate({ name }, data, {
        upsert: true,
      });
      sendResponse(res, 200, "保存成功!");
    } catch (err) {
      console.error("Failed to insert or update document", err.message);
      sendResponse(res, 500, null, false, err.message);
    }
  } catch (error) {
    sendResponse(res, 500, null, false, error.message);
  }
});
app.post("/getAccount", async (req, res) => {
  try {
    const { name } = req.body;
    let data = { name };
    try {
      const { condition, account } = await Account.findOne(data);
      sendResponse(res, 200, { condition, account });
    } catch (err) {
      console.error("Failed to insert or update document", err.message);
      sendResponse(res, 500, null, false, err.message);
    }
  } catch (error) {
    sendResponse(res, 500, null, false, error.message);
  }
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  console.log(`Example app listening at http://${getLocalIP()}:${port}`);
});
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      const { address, family, internal } = interface;
      if (family === "IPv4" && !internal) {
        return address;
      }
    }
  }
  return null;
}
