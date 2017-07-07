"use strict";

const { ForkProcess } = require("eisenhertz");

const fork = new ForkProcess();

const processCallback = data => {
    fork.log("ready");
    setInterval(() => {}, 1000);
};

const metricsCallback = cb => {
    cb(null, {});
};

fork.connect(processCallback, metricsCallback);