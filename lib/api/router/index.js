"use strict";

const root = require("./root.js");
const admin = require("./admin.js");
const {getRouter: getOperationsRouter} = require("./operations.js");

module.exports = {
    root,
    admin,
    getOperationsRouter
};