import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ClaimSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  claimer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  }
});

const Claim = mongoose.model("Claim", ClaimSchema);
export default Claim; // Changed from module.exports
