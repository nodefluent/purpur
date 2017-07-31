"use strict";

const { ForkProcess } = require("eisenhertz");
const fork = new ForkProcess();
let connectorConfig = null;

const processCallback = data => {

    const {connector, type, config, converterFactory} = data;
    fork.log(`${connector}:${type} -> starting.`);

    let ConnectorModule = null;
    switch(connector){

        case "bigquery":
            ConnectorModule = require("bigquery-kafka-connect");
            break;

        case "pubsub":
            ConnectorModule = require("gcloud-pubsub-kafka-connect");
            break;

        case "salesforce":
            ConnectorModule = require("salesforce-kafka-connect");
            break;

        case "bigtable":
            ConnectorModule = require("bigtable-kafka-connect");
            break;

        case "mysql":
        case "postgres":
        case "sqlite3":
        case "mssql":
            ConnectorModule = require("sequelize-kafka-connect");
            break;

        default:
            fork.error(`unknown connector module ${connector}.`);
            break;
    }

    if(!ConnectorModule){
        fork.error(`failed to load connector module ${connector}.`);
    }

    switch(type){
        case "sink": runSinkProcess(ConnectorModule, config, converterFactory, connector); break;
        case "source": runSourceProcess(ConnectorModule, config, converterFactory, connector); break;
        default: fork.error(`unknown process type ${type}.`);
    }

    //run at least for 3 seconds
    setTimeout(() => {}, 3000);
};

const metricsCallback = cb => {
    cb(null, {});
};

const adjustConfig = config => {

    if(!config){
        config = {};
    }

    if(config.http){
        delete config.http;
    }

    config.enableMetrics = true;

    return config;
};

const runSinkProcess = (ConnectorModule, config, converterFactory = null, connector = null) => {

    if(!ConnectorModule){
        return;
    }

    const { runSinkConnector, ConverterFactory } = ConnectorModule;

    const converters = [];
    if(converterFactory){

        try {
            let {tableSchema, etlFunction} = converterFactory;
            etlFunction = eval(etlFunction);
            const converter = ConverterFactory.createSinkSchemaConverter(tableSchema, etlFunction);
            converters.push(converter);
        } catch(error) {
            fork.error(error);
        }
    }

    runSinkConnector(adjustConfig(config), converters, error => fork.error(error)).then(sinkConfig => {
        connectorConfig = sinkConfig;
        fork.log(`${connector} -> ready.`);
        //runs forever until: config.stop();
    });
};

const runSourceProcess = (ConnectorModule, config, converterFactory = null, connector = null) => {

    if(!ConnectorModule){
        return;
    }

    const { runSourceConnector, ConverterFactory } = ConnectorModule;

    const converters = [];
    if(converterFactory){
        //TODO kafka-connect does not yet support a createSourceSchemaConverter()
    }

    runSourceConnector(adjustConfig(config), converters, error => fork.error(error)).then(sourceConfig => {
        connectorConfig = sourceConfig;
        fork.log(`${connector} -> ready.`);
        //runs forever until: config.stop();
    });
};

fork.register("get-kafka-stats", (_, callback) => {

    if(!connectorConfig){
        return callback(new Error("connector-config not yet setup."));
    }

    connectorConfig.getStats().then(stats => {
        callback(null, stats);
    }).catch(error => {
        callback(error);
    });
});

fork.register("get-prom-metrics", (_, callback) => {

    if(!connectorConfig){
        return callback(new Error("connector-config not yet setup."));
    }

    if(!connectorConfig.metrics){
        return callback(new Error("metrics object on connector-config is not initialised."));
    }

    const metrics = connectorConfig.metrics.getMetricsAsText();
    callback(null, {metrics});
});

fork.register("stop-config", (_, callback) => {

    if(!connectorConfig){
        return callback(new Error("connector-config not yet setup."));
    }

    connectorConfig.stop();
    callback(null, "stopped");
});

fork.connect(processCallback, metricsCallback);