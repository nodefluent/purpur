"use strict";

const path = require("path");
const Logger = require("log4bro");

const ProcessHandler = require("./ProcessHandler.js");
const Api = require("./api/Api.js");
const Storage = require("./storage/Storage.js");

class Purpur {

    constructor(config = {}){

        this.logger = new Logger({
            level: "INFO"
        });

        this.config = Object.assign({}, config, {
            fork: {
                module: path.join(__dirname, "./ConnectProcess.js")
            }
        });

        if(typeof this.config.database === "undefined"){
            this.config.database = {};
        }

        this.processHandler = null;
        this.api = null;
        this.storage = null;
    }

    async start(){

        this.processHandler = new ProcessHandler(this.logger, this.config, this);
        this.api = new Api(this.logger, this.config, this);
        this.storage = new Storage(this.logger, this.config, this);

        const dbConSuccessful = await this.storage.testConnection();
        if(!dbConSuccessful){
            return this.logger.error(`db connection test failed, cannot continue.`);
        }

        await this.storage.start();
        await this.processHandler.start();

        await this.api.start();
    }

    stop(){

        if(this.api){
            this.api.stop();
        }

        if(this.processHandler){
            return this.processHandler.stop();
        }
    }
}

module.exports = Purpur;