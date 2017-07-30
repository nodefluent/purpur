"use strict";

class ApiError {

    constructor(logger, error, statusCode = 500){
        this.logger = logger;
        this.error = error || new Error("Unknown API Error");
        this.statusCode = statusCode;
    }

    /**
     * logs and renders error as in json format
     * @param response
     */
    render(response){

        if(this.logger){
            this.logger.error(`An API-Error occured: ${this.error.message}, stack: ${this.error.stack}.`);
        }
        
        response.status(this.statusCode).json({
            code: this.statusCode,
            reason: this.error.message
        });
    }

    /**
     * errors is treated as reasons object
     * @param response
     */
    renderBadRequest(response){

        if(this.logger){
            this.logger.error(`Bad request occured, reason: ${JSON.stringify(this.error)}.`);
        }

        if(this.statusCode === 500){
            this.statusCode = 400;
        }

        response.status(this.statusCode).json({
            code: this.statusCode,
            reason: this.error
        });
    }
}

module.exports = ApiError;