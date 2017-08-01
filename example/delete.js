"use strict";

const request = require("request");

const options = {
    method: "DELETE",
    url: "http://localhost:4203/api/v1/operations/name/example:1",
};

request(options, (error, response, body) => {

    if(error){
        return console.error(error);
    }

    console.log(response.statusCode, body);
});