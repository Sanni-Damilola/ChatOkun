import mongoose from "mongoose";

interface iChat {
  member?: Array<string>;
}

interface iChatData extends iChat, mongoose.Document {}

const chatModel = new mongoose.Schema(
  {
    member: {
      type: Array<String>,
    },
  },
  { timestamps: true },
);

export default mongoose.model<iChatData>("chats", chatModel);
