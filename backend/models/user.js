const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

module.exports = mongoose.model("User", UserSchema);
