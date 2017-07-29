"use strict";

const getModels = sequelize => {
    return {
        ConnectorOperation: require("./ConnectorOperation.js")(sequelize)
    };
};

module.exports = {getModels};