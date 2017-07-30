"use strict";

const express = require("express");
const Ajv = require("ajv");

const getRouter = purpurRef => {

    const Operation = purpurRef.storage.getModels()["ConnectorOperation"];
    const Logger = purpurRef.logger;

    const router = express.Router();
    const ajv = new Ajv({allErrors: true});
    ajv.addSchema(operationSchema, "operation");

    router.post("/", (req, res) => {

        const body = req.body;
        const isValid = ajv.validate("operation", body);

        if(!isValid){
            return req.purpur.renderBadReq(ajv.errorsText(), 400);
        }

        Operation.create(body.operation).then(id => {
            Logger.info(`operation ${id} created.`);
            res.status(201).json({id});
        }).catch(error => {
            req.purpur.renderError(error);
        });
    });

    router.delete("/id/:id", (req, res) => {
        Operation.deleteForId(req.params.id).then(count => {
            Logger.info(`operation ${req.params.id} removed.`);
            res.status(200).json({count});
        }).catch(error => {
            req.purpur.renderError(error);
        });
    });

    router.delete("/name/:name", (req, res) => {
        Operation.deleteForName(req.params.name).then(count => {
            Logger.info(`operation ${req.params.name} removed.`);
            res.status(200).json({count});
        }).catch(error => {
            req.purpur.renderError(error);
        });
    });

    return router;
};

const AVAILABLE_CONNECTORS = [
    "bigquery",
    "pubsub",
    "salesforce",
    "mysql",
    "postgres",
    "sqlite3",
    "mssql",
    "bigtable"
];

const AVAILABLE_TYPES = ["sink", "source"];
const AVAILABLE_STATES = ["started", "stopped"];

const operationSchema = {
    title: "operation",
    description: "connector operation schema",
    type: "object",
    properties: {
        operation: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    maxLength: 254,
                    minLength: 1
                },
                description: {
                    type: "string"
                },
                version: {
                    type: "number"
                },
                createdAt: {
                    type: "string"
                },
                updatedAt: {
                    type: "string"
                },
                scale: {
                    type: "number"
                },
                connector: {
                    type: "string",
                    pattern: AVAILABLE_CONNECTORS.join("|")
                },
                state: {
                    type: "string",
                    pattern: AVAILABLE_STATES.join("|")
                },
                type: {
                    type: "string",
                    pattern: AVAILABLE_TYPES.join("|")
                },
                config: {
                    type: "object",
                    properties: {},
                    additionalProperties: true
                },
                converterFactory: {
                    type: "object",
                    properties: {
                        tableSchema: {
                            type: "object",
                            properties: {},
                            additionalProperties: true
                        },
                        etlFunction: {
                            type: "string"
                        }
                    },
                    additionalProperties: false
                }
            },
            required: ["name", "connector", "type", "config", "scale"],
            additionalProperties: false
        }
    },
    required: ["operation"],
    additionalProperties: false
};

module.exports = {getRouter};