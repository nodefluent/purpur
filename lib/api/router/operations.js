"use strict";

const express = require("express");
const Ajv = require("ajv");

const getRouter = purpurRef => {

    const Operation = purpurRef.storage.getModels()["ConnectorOperation"];
    const Logger = purpurRef.logger;

    const router = express.Router();
    const ajv = new Ajv({allErrors: true});
    ajv.addSchema(operationSchema, "operation");

    router.get("/", (req, res) => {
        Operation.getWithCustomWhere(req.query).then(results => {
            res.status(200).json({results});
        }).catch(error => {
            req.purpur.renderError(error);
        });
    });

    //TODO handle stats and metrics requests for ids

    router.get("/name/:name/stats", (req, res) => {
        const name = req.params.name;
        purpurRef.processHandler.eisenhertz.leader.runTaskSearchForNode(name, "get-kafka-stats", {}, 500).then(stats => {
           res.status(200).json(stats);
        }).catch(error => {
            req.purpur.renderError(error);
        });
    });

    router.get("/name/:name/metrics", (req, res) => {
        const name = req.params.name;
        purpurRef.processHandler.eisenhertz.leader.runTaskSearchForNode(name, "get-prom-metrics", {}, 500).then(metrics => {
            res.set("content-type", "text/plain");
            res.status(200);
            res.write(metrics.metrics);
            res.end();
        }).catch(error => {
            req.purpur.renderError(error);
        });
    });

    router.post("/", (req, res) => {

        //TODO purpur restarts re-runs stalled job on first take

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

    router.patch("/:id/scale/:scale", (req, res) => {

        const id = req.params.id;
        let scale = req.params.scale;

        try {
            scale = parseInt(scale);
        } catch(e){/*empty*/}

        if(typeof scale !== "number"){
            return req.purpur.renderBadReq("scale must be a number.");
        }

        Operation.getById(id, false).then(operation => {

            if(!operation){
                return req.purpur.renderError(new Error(`Operation ${id} does not exist.`), 404);
            }

            const state = operation.scale < scale ? "upscaling" : "downscaling";

            operation.scale = scale;
            operation.save().then(_ => {
                Logger.info(`${state} ${id} to ${scale}.`);
                res.status(204).end();
            }).catch(error => {
                req.purpur.renderError(error);
            });
        });
    });

    router.patch("/:id/resume", (req, res) => {

        const id = req.params.id;

        Operation.getById(id, false).then(operation => {

            if(!operation){
                return req.purpur.renderError(new Error(`Operation ${id} does not exist.`), 404);
            }

            operation.state = "started";
            operation.save().then(_ => {
                Logger.info(`Operation ${id} resumed.`);
                res.status(204).end();
            }).catch(error => {
                req.purpur.renderError(error);
            });
        });
    });

    router.patch("/:id/stop", (req, res) => {

        const id = req.params.id;

        Operation.getById(id, false).then(operation => {

            if(!operation){
                return req.purpur.renderError(new Error(`Operation ${id} does not exist.`), 404);
            }

            operation.state = "stopped";
            operation.save().then(_ => {
                Logger.info(`Operation ${id} stopped.`);
                res.status(204).end();
            }).catch(error => {
                req.purpur.renderError(error);
            });
        });
    });

    router.delete("/id/:id", (req, res) => {
        Operation.deleteForId(req.params.id).then(count => {
            Logger.info(`operation ${req.params.id} removed.`);
            //TODO remove job and kill process
            res.status(200).json({count});
        }).catch(error => {
            req.purpur.renderError(error);
        });
    });

    router.delete("/name/:name", (req, res) => {
        Operation.deleteForName(req.params.name).then(count => {
            Logger.info(`operation ${req.params.name} removed.`);
            //TODO remove job and kill process
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