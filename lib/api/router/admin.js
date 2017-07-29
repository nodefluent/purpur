"use strict";

const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
    res.status(req.purpur.isAlive ? 200 : 503).json(req.purpur.health);
});

router.get("/healthcheck", (req, res) => {

    if(req.purpur.isAlive){
        return res.status(200).end("UP");
    }

    res.status(503).end("DOWN");
});

router.get("/error-sample", (req, res) => {
    req.purpur.renderError(new Error("bang"), 504);
});

module.exports = router;