"use strict";

const os = require("os");

const {
     Eisenhertz,
    defaultConfig,
} = require("eisenhertz");

class ProcessHandler {

    constructor(logger, config){
        this.logger = logger;
        this.config = this._adjustConfigToSystem(Object.assign({}, defaultConfig, config));
        this.eisenhertz = null;
    }

    _adjustConfigToSystem(config){

        const cores = os.cpus().length;
        
        config.properties.maxJobsPerWorker = cores;
        config.properties.maxInstancesOfJobPerNode = 3;

        return config;
    }

    fetchJobNames(callback){
        callback(null, [
            "one:1",
            "one:2",
            "one:3"
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