"use strict";

const isOnTravis = !!process.env.KST_TOPIC;

const config = {
    httpPort: 4203,
    database: {
        user: "root",
        password: isOnTravis ? "" : undefined
    }
};

module.exports = config;