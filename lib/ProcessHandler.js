"use strict";

const os = require("os");
const Promise = require("bluebird");

const {
     Eisenhertz,
    defaultConfig,
} = require("eisenhertz");

class ProcessHandler {

    constructor(logger, config, purpurRef){

        this.logger = logger;
        this.purpurRef = purpurRef;
        this.config = ProcessHandler._adjustConfigToSystem(Object.assign({}, defaultConfig, config));

        this.eisenhertz = null;
        this.operationModel = null;
    }

    static _adjustConfigToSystem(config){

        config.properties.maxJobsPerWorker = os.cpus().length;
        config.properties.maxInstancesOfJobPerNode = 3;

        return config;
    }

    fetchJobNames(callback){

        this.operationModel.allStartedNamesWithScale().then(operations => {

            const processes = [];
            operations.forEach(operation => {
                for(let i = 0; i < operation.scale; i++){
                    processes.push(`${operation.name}:${i+1}`);
                }
            });

            callback(null, processes);
        }).catch(error => {
            callback(error);
        });
    }

    fetchJobDetails(jobName, callback){

        //removing scale from name
        const splittedId = jobName.split(":")[0];

        this.operationModel.getByName(splittedId).then(operation => {

            callback(null, {
                connector: operation.connector,
                type: operation.type,
                config: operation.config,
                converterFactory: operation.converterFactory
            })
        }).catch(error => {
            callback(error);
        });
    }

    start(){
        this.operationModel = this.purpurRef.storage.getModels()["ConnectorOperation"];
        this.eisenhertz = new Eisenhertz(this.config, this.logger);
        return this.eisenhertz
            .start(this.fetchJobNames.bind(this), this.fetchJobDetails.bind(this));
    }

    stop(){
        if(this.eisenhertz){
            return this.eisenhertz.stop();
        } else {
            return Promise.resolve(false);
        }
    }
}

module.exports = ProcessHandler;