"use strict";

const {Producer} = require("sinek");
const connectConfig = require("./connectConfig.js");
const uuid = require("uuid");

const producer = new Producer(connectConfig.kafka, [connectConfig.topic], 1);
producer.on("error", error => console.error(error));

producer.connect().then(() => {

    producer.bufferFormat(connectConfig.topic, uuid.v4(), {
        id: 123,
        name: "bla"
    });

    /*
    producer.buffer(connectConfig.topic, uuid.v4(), {
        "payload": {
            "id": 123,
            "name": "bla",
            "version": 1
        },
        "time": new Date().toISOString(),
        "type": "sc_test_topic-published"
    });
    */

    setTimeout(() => {
        producer.close();
    }, 300);
});