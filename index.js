const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const shortid = require('shortid');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory database to store short URLs
const urlDatabase = {};

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate URL format
  const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,9}(:[0-9]+)?(\/.*)?$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Validate DNS
  const urlParts = originalUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/');
  const domain = urlParts[0];

  dns.lookup(domain, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Generate short URL
    const shortUrl = shortid.generate();
    urlDatabase[shortUrl] = originalUrl;

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'short url not found' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
