"use strict";

const Sequelize = require("sequelize");
const {getModels} = require("./models/index.js");

class Storage {

    constructor(logger, config, purpurRef){

        this.logger = logger;
        this.config = config;
        this.purpurRef = purpurRef;

        let {database, user, password,
            dialect, host, port, storage
        } = this.config.database;

        database = database || "purpur";
        user = user || "root";
        dialect = dialect || "mysql";
        host = host || "localhost";
        port = port || 3306;

        if(typeof password === "undefined"){
            password = "root";
        }

        this.sequelize = new Sequelize(database, user, password, {
            host,
            port,
            dialect,
            pool: {
                max: 15,
                min: 1,
                idle: 10000
            },
            storage,
            logging: this.logger.debug.bind(this.logger)
        });

        this.models = getModels(this.sequelize);
    }

    testConnection(){
        return this.sequelize.authenticate().then(() => {
            this.logger.info(`db connection authentication successful.`);
            return true;
        }).catch(error => {
            this.logger.error(`db connection authentication failed: ${error.message}`);
        });
    }

    start(syncForce = true){ //TODO turn this force back to false
        return this.sequelize.sync({
            force: syncForce
        }).then(_ => {
            this.logger.info(`db connection is established.`);
            return _;
        });
    }

    getModels(){
        return this.models;
    }
}

module.exports = Storage;