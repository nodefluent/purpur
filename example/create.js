"use strict";

const request = require("request");
const connectConfig = require("./connectConfig.js");

const options = {
    method: "POST",
    headers: {
        "content-type": "application/json"
    },
    url: "http://localhost:4203/api/v1/operations",
    body: JSON.stringify({
        operation: {
            name: "example",
            connector: "sqlite3",
            type: "sink",
            config: connectConfig,
            scale: 1
        }
    })
};

request(options, (error, response, body) => {

    if(error){
        return console.error(error);
    }

    console.log(response.statusCode, body);
});