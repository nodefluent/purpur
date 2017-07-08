"use strict";

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.end("purpur");
});

router.get("/alive", (req, res) => {
    res.status(req.purpur.isAlive ? 200 : 503).end();
});

module.exports = router;