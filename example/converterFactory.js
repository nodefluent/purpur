"use strict";

const tableSchema = {
    "id": {
        "type": "integer",
        "allowNull": false,
        "primaryKey": true
    },
    "name": {
        "type": "varchar(255)",
        "allowNull": true
    }
};

const etlFunction = `(messageValue, callback) => {

    if (messageValue.type === "sc_test_topic-published") {
        return callback(null, {
            id: messageValue.payload.id,
            name: messageValue.payload.name
        });
    }

    if (messageValue.type === "sc_test_topic-unpublished") {
        return callback(null, null);
    }

    callback(new Error("unknown messageValue.type"));
}`;

module.exports = {
    tableSchema,
    etlFunction
};