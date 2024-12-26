const mongoose = require("mongoose");

const trendSchema = new mongoose.Schema({
  unique_id: String,
  trends: [String],
  timestamp: Date,
  ip_address: String,
});
const Trend = mongoose.model("Trend", trendSchema);

module.exports = Trend;
