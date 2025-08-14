// models/Conversation.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [String], // Array of Firebase UIDs
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length === 2 && new Set(arr).size === 2;
      },
      message: "Conversation must have exactly 2 unique participants",
    },
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

conversationSchema.index({ participants: 1 }, { unique: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
