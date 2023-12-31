const express = require("express");
const cors = require("cors");
const fs = require("fs");
const os = require("os");
const readline = require("readline");
const mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost:27017/songs");
mongoose.connect(
  "mongodb+srv://user:wAFat3rPZ2Kvv36@cluster0.trwul3l.mongodb.net/songs?retryWrites=true&w=majority"
);

const db = mongoose.connection;
const Song = mongoose.model("Song", {
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
db.once("open", async function () {
  console.log("connected");
  // insertSongDB();
  // findSong("林俊杰");
});
db.once("close", async function () {
  console.log("closed");
});

const findSong = async (keyword) => {
  const songs = await Song.find({ singer_name: keyword })
    .sort({
      song_time_public: 1,
    })
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
function sendResponse(res, statusCode, status, data, message) {
  if (statusCode >= 400) {
    res.status(statusCode).json({
      status: status,
      error: message,
    });
  } else {
    res.status(statusCode).json({
      status: status,
      data: data,
    });
  }
}

const app = express();
app.use(cors());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/findSong", async (req, res) => {
  try {
    const { singerName } = req.query;
    console.log(singerName);
    const songs = await findSong(singerName);
    sendResponse(res, 200, "success", songs);
  } catch (error) {
    sendResponse(res, 500, "error", null, error.message);
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
