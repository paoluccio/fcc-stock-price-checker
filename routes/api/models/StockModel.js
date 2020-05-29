const mongoose = require('mongoose');

const StockSchema = mongoose.Schema({
  symbol: String,
  likes: { type: Number, default: 0 },
  ips: [String]
});

module.exports = mongoose.model('Stock', StockSchema);