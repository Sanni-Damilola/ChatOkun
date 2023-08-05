import express, { Router } from "express";

import {
  createChatMesssage,
  getChatMessage,
} from "../controller/chatMessageController";

const router: Router = express.Router();

router.route("/:userID/:chatID/create-chat-message").post(createChatMesssage);

router.route("/:chatID/get-chat-message").get(getChatMessage);

export default router;
