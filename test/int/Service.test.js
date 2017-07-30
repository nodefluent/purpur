"use strict";

const assert = require("assert");
const request = require("request");

const { Purpur } = require("./../../index.js");
const config = require("./../test-config.js");

const isOnTravis = !!process.env.KST_TOPIC;
const testKafkaTopic = process.env.KST_TOPIC || "purpur_test";

describe("Purpur Service INT", function(){

    let purpur = null;
    let currentOperationId = null;

    before(function(done){
        purpur = new Purpur(config);
        purpur.start().then(_ => done());
    });

    after(function(done){
        if(purpur){
            purpur.stop().then(done());
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

    it("should be able to create an operation", function(done){

        const body = {
            operation: {
                name: "test-operation-2",
                connector: "mysql",
                type: "sink",
                scale: 1,
                config: {
                    bla: 123
                },
                converterFactory: {
                    tableSchema: {
                        one: {
                            type: "string"
                        }
                    },
                    etlFunction: "() => { console.log('hi'); }"
                }
            }
        };

        const url = `${getBaseUrl()}/api/v1/operations`;
        request({
            url,
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(body)
        }, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 201);
            body = JSON.parse(body);
            assert.ok(body.id);
            currentOperationId = body.id;
            done();
        });
    });

    it("should be able to delete operation", function(done){

        assert.ok(currentOperationId);
        const url = `${getBaseUrl()}/api/v1/operations/id/${currentOperationId}`;
        currentOperationId = null;

        request({
            url,
            method: "DELETE"
        }, (error, response, body) => {
            assert.ifError(error);
            assert.equal(response.statusCode, 200);
            body = JSON.parse(body);
            assert.equal(body.count, 1);
            done();
        });
    });
});