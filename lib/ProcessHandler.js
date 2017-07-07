"use strict";

const {
     Eisenhertz,
    defaultConfig,
} = require("eisenhertz");

class ProcessHandler {

    constructor(logger, config){
        this.logger = logger;
        this.config = Object.assign({}, defaultConfig, config);
        this.eisenhertz = null;
    }

    fetchJobNames(callback){
        callback(null, [
            "one",
            "two"
        ]);
    }

    fetchJobDetails(id, callback){
        callback(null, {id});
    }

    start(){
        this.eisenhertz = new Eisenhertz(this.config, this.logger);
        return this.eisenhertz
            .start(this.fetchJobNames.bind(this), this.fetchJobDetails.bind(this));
    }

    stop(){
        if(this.eisenhertz){
            return this.eisenhertz.stop();
        }
    }
}

module.exports = ProcessHandler;