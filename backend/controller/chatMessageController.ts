import { Request, Response } from "express";
import chatModel from "../model/chatModel";
import userModel from "../model/userModel";
import chatMessageModel from "../model/chatMessageModel";

export const createChatMesssage = async (req: Request, res: Response) => {
  try {
    const { userID, chatID } = req.params;
    const { message } = req.body;

    const chatMessage = await chatMessageModel.create({
      userID,
      chatID,
      message,
    });

    res.status(201).json({
      message: "Established chat message",
      data: chatMessage,
    });
  } catch (error) {
    res.status(404).json({
      message: "Error",
    });
  }
};

export const getChatMessage = async (req: Request, res: Response) => {
  try {
    const { chatID } = req.params;

    const chatMessage = await chatMessageModel.find({ chatID });

    res.status(201).json({
      message: "Get chat message",
      data: chatMessage,
    });
  } catch (error) {
    res.status(404).json({
      message: "Error",
    });
  }
};
