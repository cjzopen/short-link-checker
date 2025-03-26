const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/decode', async (req, res) => {
  const { shortUrl } = req.body;

  try {
    // 1. 解碼短網址
    const response = await axios.get(shortUrl, { maxRedirects: 0, validateStatus: null });
    const destinationUrl = response.headers.location || shortUrl;

    // 2. 獲取目標頁面資訊
    const pageResponse = await axios.get(destinationUrl);
    const dom = new JSDOM(pageResponse.data);
    const title = dom.window.document.querySelector('title')?.textContent || '無法獲取';
    const description = dom.window.document.querySelector('meta[name="description"]')?.getAttribute('content') || '無法獲取';

    res.json({ destinationUrl, title, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
