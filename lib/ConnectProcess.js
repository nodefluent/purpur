"use strict";

const { ForkProcess } = require("eisenhertz");

const fork = new ForkProcess();

const processCallback = data => {
    const {connector, type} = data;
    fork.log(`${connector}:${type} -> ready.`);
    //TODO run sink or source process and apply converter factory if present
    setInterval(() => {}, 1000);
};

const metricsCallback = cb => {
    cb(null, {});
};

fork.connect(processCallback, metricsCallback);