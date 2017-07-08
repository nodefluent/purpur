"use strict";

const path = require("path");
const Logger = require("log4bro");
const Promise = require("bluebird");

const ProcessHandler = require("./ProcessHandler.js");
const Api = require("./Api.js");

class Purpur {

    constructor(){

        this.logger = new Logger({
            level: "INFO"
        });

        this.config = {
            fork: {
                module: path.join(__dirname, "./ConnectProcess.js")
            }
        };

        this.processHandler = null;
        this.api = null;
    }

    async start(){
        this.processHandler = new ProcessHandler(this.logger, this.config);
        this.api = new Api(this.logger, this.config);
        await this.processHandler.start();
        await this.api.start();
    }

    stop(){

        if(this.processHandler){
            this.processHandler.stop();
        }

        if(this.api){
            this.api.stop();
        }
    }
}

module.exports = Purpur;