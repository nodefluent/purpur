"use strict";

class ApiError {

    constructor(logger, error, statusCode = 500){
        this.logger = logger;
        this.error = error || new Error("Unknown API Error");
        this.statusCode = statusCode;
    }

    render(response){

        if(this.logger){
            this.logger.error(`An API-Error occured: ${this.error.message}, stack: ${this.error.stack}.`);
        }
        
        response.status(this.statusCode).json({
            code: this.statusCode,
            reason: this.error.message
        });
    }
}

module.exports = ApiError;