"use strict";

const express = require("express");

const getRouter = purpurRef => {

    const router = express.Router();

    router.get("/test", (req, res) => {
        res.end();
    });

    return router;
};

module.exports = {getRouter};