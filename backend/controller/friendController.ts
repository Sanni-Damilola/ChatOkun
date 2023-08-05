import { Request, Response } from "express";
import userModel from "../model/userModel";
import mongoose from "mongoose";

export const beFriend = async (req: Request, res: Response) => {
  try {
    const { userID, friendID } = req.params;

    const friend: any = await userModel.findById(friendID);
    const user: any = await userModel.findById(userID);

    if (user && friend) {
      friend.friends.push(userID);
      friend.save();

      user.friends.push(friendID);
      user.save();
    }

    res.status(201).json({
      message: "You are both Friends",
    });
  } catch (error) {
    res.status(404).json({
      message: "Error",
    });
  }
};

export const unFriend = async (req: Request, res: Response) => {
  try {
    const { userID, friendID } = req.params;

    const friend: any = await userModel.findById(friendID);
    const user: any = await userModel.findById(userID);

    if (user && friend) {
      friend.friends.pull(userID);
      friend.save();

      user.friends.pull(friendID);
      user.save();
    }

    res.status(201).json({
      message: "You are both no more Friends",
    });
  } catch (error) {
    res.status(404).json({
      message: "Error",
    });
  }
};
