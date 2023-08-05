import mongoose from "mongoose";

interface iChatMessage {
  userID?: string;
  chatID?: string;
  message?: string;
}

interface iChatMessageData extends iChatMessage, mongoose.Document {}

const chatMessageModel = new mongoose.Schema(
  {
    message: {
      type: String,
    },
    chatID: {
      type: String,
    },
    userID: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model<iChatMessageData>(
  "chatMessages",
  chatMessageModel,
);
