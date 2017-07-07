"use strict";

const path = require("path");
const Logger = require("log4bro");
const ProcessHandler = require("./ProcessHandler.js");

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
    }

    start(){
        this.processHandler = new ProcessHandler(this.logger, this.config);
        return this.processHandler.start();
    }

    stop(){
        if(this.processHandler){
            return this.processHandler.stop();
        }
    }
}

module.exports = Purpur;