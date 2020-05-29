const fetch = require('node-fetch');
const StockModel = require('../models/StockModel');

async function makeCallToIEX(string) {
  const endpoint = 'https://cloud.iexapis.com/';
  const path = 'stable/stock/market/batch';
  // Parts of query
  const apiTOKEN = `token=${process.env.API_TOKEN}`;
  const symbols = `symbols=${string.split(',', 2)}`;
  const types = 'types=quote,company';
  const filter = 'filter=symbol,companyName,sector,latestPrice,industry,website,description,CEO';
  // Glued query
  const query = `?${apiTOKEN}&${symbols}&${types}&${filter}`

  const response = await fetch(`${endpoint}${path}${query}`);
  if (response.status !== 200) throw new Error(response.statusText);
  const data = await response.json();

  let result = Object.keys(data).reduce((acc, symbol) => {
    acc.push({
      'symbol': data[symbol].quote.symbol.toLowerCase(),
      'companyName': data[symbol].quote.companyName,
      'industry': data[symbol].company.industry,
      'sector': data[symbol].company.sector,
      'website': data[symbol].company.website,
      'description': data[symbol].company.description,
      'CEO': data[symbol].company.CEO,
      'latestPrice': data[symbol].quote.latestPrice
    });
    return acc;
  }, []);
  return result;
}

async function addLike(symbol, ip) {
  const conditions = { symbol, 'ips': ip };
  const likedStock = await StockModel.findOne(conditions);
  if (likedStock) {
    return likedStock.likes;
  } else {
    const conditions = { symbol };
    const update = { $push: { ips: ip }, $inc: { likes: 1 } };
    const options = { new: true, upsert: true };
    const updatedStock = await StockModel.findOneAndUpdate(conditions, update, options);
    return updatedStock.likes;
  }
}

async function getLikes(symbol) {
  const stock = await StockModel.findOne({ symbol });
  return stock ? stock.likes : 0;
}

exports.get_stock_details = async (req, res, next) => {
  const { symbol, like } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
  try {
    const data = await makeCallToIEX(symbol);
    await Promise.all(data.map(async stock => {
      if (like) {
        return stock.likes = await addLike(stock.symbol, ip);
      } else {
        return stock.likes = await getLikes(stock.symbol);
      }
    }));
    if (data.length > 1) {
      const [firstCount, secondCount] = [data[0].likes, data[1].likes];
      if (firstCount > secondCount) {
        data[0].likes_difference = `+${firstCount - secondCount}`;
        data[1].likes_difference = `${secondCount - firstCount}`;
      } else if (firstCount < secondCount) {
        data[0].likes_difference = `${firstCount - secondCount}`;
        data[1].likes_difference = `+${secondCount - firstCount}`;
      }
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
};