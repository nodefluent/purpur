"use strict";

const path = require("path");

const config = {
    kafka: {
        //zkConStr: "localhost:2181/",
        kafkaHost: "localhost:9092",
        logger: null,
        groupId: "kc-sequelize-test",
        clientName: "kc-sequelize-test-name",
        workerPerPartition: 1,
        options: {
            sessionTimeout: 8000,
            protocol: ["roundrobin"],
            fromOffset: "latest", //earliest
            fetchMaxBytes: 1024 * 1024,
            fetchMinBytes: 1,
            fetchMaxWaitMs: 10,
            heartbeatInterval: 250,
            retryMinTimeout: 250,
            requireAcks: 1
        }
    },
    topic: "sc_test_topic",
    partitions: 1,
    maxTasks: 1,
    pollInterval: 2000,
    produceKeyed: true,
    produceCompressionType: 0,
    connector: {
        options: {
            host: "localhost",
            port: 5432,
            dialect: "sqlite",
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },
            storage: path.join(__dirname, "test-db.sqlite")
        },
        database: null,
        user: null,
        password: null,
        maxPollCount: 50,
        table: "accounts",
        incrementingColumnName: "id"
    }
};

module.exports = config;