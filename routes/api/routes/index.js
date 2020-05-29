const express = require('express');
const StockController = require('../controllers/StockController');

const api = express.Router();

api.get('/stock-prices', StockController.get_stock_details);

module.exports = api;