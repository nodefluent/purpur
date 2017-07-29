"use strict";

const {
    STRING
} = require("sequelize");

const {getDefaultModelOptions} = require("./defaultModelOptions.js");

class ConnectorOperation {

    constructor(model){
        this.model = model;
    }

    getModel(){
        return this.model;
    }
}

const TABLE_NAME = "connector_operation";

const getModel = sequelize => {

    const model = sequelize.define(TABLE_NAME,
        {
            connector: {
                type: STRING
            }
        },
        getDefaultModelOptions(TABLE_NAME)
    );

    //wrap with custom model class
    return new ConnectorOperation(model);
};

module.exports = getModel;