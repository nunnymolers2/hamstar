import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firebaseUID: {
    type: String,
    required: true,
    unique: true,
  },
  listings: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
  claims: [
    {
      type: Schema.Types.ObjectId,
      ref: "Claim",
    },
  ],
});

// Change to ES Module export
export default mongoose.model("User", UserSchema);
