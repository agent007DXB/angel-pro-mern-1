const mongoose = require("mongoose");

const withdrawalSchema = mongoose.Schema({
  currency: {
    type: String,
    default: "USDT",
    required: true,
  },

  walletAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
  },
  withdrawalAmount: {
    type: Number,
    required: true,
  },
  network: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

module.exports = mongoose.model("withdrawal", withdrawalSchema);
