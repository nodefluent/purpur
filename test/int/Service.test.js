"use strict";

const assert = require("assert");
const request = require("request");

const { Purpur } = require("./../../index.js");
const config = require("./../test-config.js");

describe("Purpur Service INT", function(){

    let purpur = null;

    before(function(done){
        purpur = new Purpur(config);
        purpur.start().then(_ => done());
    });

    after(function(done){
        if(purpur){
            purpur.stop();
            setTimeout(done, 500);
        }
    });

    const getBaseUrl = () => {
        return `http://localhost:${config.httpPort}`;
    };

    it("should be able to check api healthcheck", function(done){

        const url = `${getBaseUrl()}/admin/healthcheck`;
        request({
            url
        }, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    it("should be able to check api health", function(done){

        const url = `${getBaseUrl()}/admin/health`;
        request({
            url
        }, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 200);
            assert.equal(typeof JSON.parse(body), "object");
            assert.ok(JSON.parse(body));
            done();
        });
    });

    it("should be able to render error sample", function(done){

        const url = `${getBaseUrl()}/admin/error-sample`;
        request({
            url
        }, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 504);
            body = JSON.parse(body);
            assert.equal(body.code, 504);
            assert.equal(body.reason, "bang");
            done();
        });
    });
});