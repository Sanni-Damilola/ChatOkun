import { Request, Response } from "express";
import userModel from "../model/userModel";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, userName } = req.body;

    const user = await userModel.create({
      email,
      password,
      userName,
    });

    res.status(200).json({
      message: "created",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      message: "Error",
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { email, password, userName } = req.body;

    const user = await userModel.find();

    res.status(200).json({
      message: "found",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      message: "Error",
    });
  }
};

export const getOneUser = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const { email, password, userName } = req.body;

    const user = await userModel.findById(userID);

    res.status(200).json({
      message: "found",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      message: "Error",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const { email, password, userName } = req.body;

    const user = await userModel.findByIdAndUpdate(
      userID,
      { userName },
      { new: true },
    );

    res.status(200).json({
      message: "update",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      message: "Error",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const { email, password, userName } = req.body;

    const user = await userModel.findByIdAndDelete(userID);

    res.status(200).json({
      message: "delete",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      message: "Error",
    });
  }
};

export const singinUser = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (user) {
      if (password === user?.password) {
        res.status(200).json({
          message: "sign in",
          data: user._id,
        });
      } else {
        res.status(404).json({
          message: "Error",
        });
      }
    } else {
      res.status(404).json({
        message: "Error",
      });
    }
  } catch (error) {
    res.status(404).json({
      message: "Error",
    });
  }
};
