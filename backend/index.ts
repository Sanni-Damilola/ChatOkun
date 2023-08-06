import express, { Application, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import user from "./router/userRouter";
import friend from "./router/friendRouter";
import chat from "./router/chatRouter";
import chatMessage from "./router/chatMessageRouter";
import { Server } from "socket.io";
import http from "http";

const url = "mongodb://127.0.0.1:27017/chatDB";
const app: Application = express();
const port: number = 8899;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/v2", user);
app.use("/api/v2", friend);
app.use("/api/v2", chat);
app.use("/api/v2", chatMessage);

app.get("/", (req: Request, res: Response) => {
  try {
    res.status(200).json({
      message: "start",
    });
  } catch (error) {
    res.status(404).json({
      message: "Error",
    });
  }
});

io.on("connection", (socket) => {
  console.log("here", socket);
});

server.listen(port, () => {
  mongoose.connect(url).then(() => {
    console.log("server connected 🚀💌🚀✌");
  });
});
