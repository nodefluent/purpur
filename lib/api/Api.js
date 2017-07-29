"use strict";

const Promise = require("bluebird");
const express = require("express");
const bodyParser = require("body-parser");

const ApiError = require("./ApiError.js");

const {
    root,
    admin,
    getOperationsRouter
} = require("./router/index.js");

class Api {

    constructor(logger, config, purpurRef){

        this.logger = logger;
        this.config = config;
        this.purpurRef = purpurRef;

        this.app = express();
        this.isAlive = false;
        this.apiHealth = {};
        this.server = null;

        this._attachMiddlewares();
        this._attachCoreMiddleware();
        this._attachRouters();
        this._attachErrorHandler();
    }

    getApiHealth(){
        return this.apiHealth;
    }

    _attachCoreMiddleware(){
        this.app.use((req, res, next) => {

            req.purpur = {
                isAlive: this.isAlive,
                health: this.getApiHealth(),
                renderError: (error, statusCode) => {
                    new ApiError(this.logger, error, statusCode).render(res)
                }
            };

            next();
        });
    }

    _attachMiddlewares(){
        this.app.use(bodyParser.json());
    }

    _attachRouters(){
        this.app.use("/", root);
        this.app.use("/admin", admin);

        this.app.use("/api/v1/operations", getOperationsRouter(this.purpurRef));
    }

    _attachErrorHandler(){
        this.app.use((error, req, res, next) => {
            new ApiError(this.logger, error, 500).render(res);
        });
    }

    start(_port = 4203){
        const port = this.config.httpPort || _port;
        return new Promise(resolve => {
            this.server = this.app.listen(port, () => {
                this.isAlive = true;
                this.logger.info(`Purpur HTTP API listening @ http://localhost:${port}/api.`);
                resolve();
            });
        });
    }

    stop(){
        if(this.server){
            this.server.close();
        }
    }
}

module.exports = Api;