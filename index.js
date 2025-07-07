require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

let urlDatabase = [];
// Your first API endpoint
app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  console.log("Submitted URL: ", url);
  let urlToValidate = url;
  if (!urlToValidate.startsWith("http")) {
    urlToValidate = "http://" + urlToValidate;
  }

  let urlParser;
  try {
    urlParser = new URL(urlToValidate);
  } catch (err) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(urlParser.hostname, (err, address) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const shortUrl = urlDatabase.length + 1;

    urlDatabase.push({
      original_url: urlToValidate,
      short_url: shortUrl,
    });

    res.json({ original_url: urlToValidate, short_url: shortUrl });
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const short = parseInt(req.params.short_url);
  const entry = urlDatabase.find((e) => e.short_url === short);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.status(404).json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
