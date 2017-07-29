"use strict";

const path = require("path");
const fs = require("fs");
const express = require("express");
const router = express.Router();

const pjson = require("../../../package.json");
const bannerBytes = Buffer.from(fs.readFileSync(path.join(__dirname, "./../banner.txt")));

router.get("/", (req, res) => {
    res.set("content-type", "text/html");
    res.write("<div style=\"color: #4a203b\"><pre>");
    res.write(bannerBytes);
    res.write(`</pre>${pjson.name}@${pjson.version}</div>`);
    res.end();
});

router.get("/alive", (req, res) => {
    res.status(req.purpur.isAlive ? 200 : 503).end();
});

module.exports = router;