"use strict";

const {
    STRING,
    TEXT,
    INTEGER,
    UUID,
    UUIDV4
} = require("sequelize");

const {getDefaultModelOptions} = require("./defaultModelOptions.js");

class ConnectorOperation {

    constructor(model){
        this.model = model;
    }

    getModel(){
        return this.model;
    }

    static toDBObject(operation){

        const clone = Object.assign({}, operation);

        if(clone.config){
            clone.config = JSON.stringify(clone.config);
        }

        if(clone.converterFactory){
            clone.converterFactory = JSON.stringify(clone.converterFactory);
        }

        return clone;
    }

    static fromDBObject(operation){

        const clone = Object.assign({}, operation.get({plain:true}));

        if(clone.config){
            try {
                clone.config = JSON.parse(clone.config);
            } catch(e){/*empty*/}
        }

        if(clone.converterFactory){
            try {
                clone.converterFactory = JSON.parse(clone.converterFactory);
            } catch(e){/*empty*/}
        }

        return clone;
    }

    allStartedNamesWithScale(){
        return this.model.findAll({
            where: {
                state: "started"
            },
            attributes: ["id", "name", "scale"]
        });
    }

    getById(id){
        return this.model.findOne({
            where: {
                id
            }
        }).then(operation => ConnectorOperation.fromDBObject(operation));
    }

    getByName(name){
        return this.model.findOne({
            where: {
                name
            }
        }).then(operation => ConnectorOperation.fromDBObject(operation));
    }

    create(object){
        return this.model.create(ConnectorOperation.toDBObject(object)).then(operation => operation.id);
    }

    updateForId(id, object){
        return this.model.update(ConnectorOperation.toDBObject(object), {
            where: {
                id
            }
        });
    }

    updateForName(name, object){
        return this.model.update(ConnectorOperation.toDBObject(object), {
            where: {
                name
            }
        });
    }

    deleteForId(id){
        return this.model.destroy({
            where: {
                id
            }
        });
    }

    deleteForName(name){
        return this.model.destroy({
            where: {
                name
            }
        });
    }
}

const TABLE_NAME = "connector_operation";

const getModel = sequelize => {

    const model = sequelize.define(TABLE_NAME,
        {
            id: {
                type: UUID,
                primaryKey: true,
                defaultValue: UUIDV4
            },
            name: {
                type: STRING,
                allowNull: false
            },
            description: {
                type: TEXT,
                allowNull: true,
                defaultValue: null
            },
            version: {
                type: INTEGER,
                defaultValue: 1
            },
            scale: {
                type: INTEGER,
                defaultValue: 1
            },
            connector: {
                type: STRING,
                allowNull: false
            },
            state: {
                type: STRING,
                defaultValue: "started"
            },
            type: {
                type: STRING,
                allowNull: false
            },
            config: { //is an object, has to be serialised manually
                type: TEXT,
                allowNull: true,
                defaultValue: null,
            },
            converterFactory: { //is an object, has to be serialised manually
                type: TEXT,
                allowNull: true,
                defaultValue: null,
            }
        },
        Object.assign({}, getDefaultModelOptions(TABLE_NAME), {
            indexes: [
                {
                    unique: false,
                    fields: ["connector"]
                },
                {
                    unique: true,
                    fields: ["name"]
                }
            ]
        })
    );

    //wrap with custom model class
    return new ConnectorOperation(model);
};

module.exports = getModel;