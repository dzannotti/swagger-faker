"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const ts_codegen_1 = require("@ts-tool/ts-codegen");
const faker_1 = require("./faker");
const getPath = (pathName) => pathName.replace(/\{/g, ":").replace(/\}/g, "");
// TODO: responses.200.schema.type ==="array"
// TODO: response.200.schema.type ==="object" (additionalProperties)
// TODO: response.200.schema.type==="string" | "number" | "integer" | "boolean"
// TODO: responses.200.headers 存在时
// TODO: responses.201 同上
const getResponse = (operation) => {
    const responses = lodash_1.get(operation, "responses");
    const reference = lodash_1.get(operation, "$ref");
    return reference ? reference : lodash_1.get(responses, "200") || lodash_1.get(responses, "201");
};
const getResolvedPathByOperationId = (swagger, operationId) => {
    const resolvedPaths = ts_codegen_1.PathResolver.of(swagger.paths, swagger.basePath).resolve().resolvedPaths;
    return lodash_1.find(resolvedPaths, (item) => item.operationId === operationId);
};
exports.getRequestConfigByOperationId = (swagger, operationId) => {
    const resolvedPath = getResolvedPathByOperationId(swagger, operationId);
    let request = null;
    lodash_1.forEach(swagger.paths, (path, pathName) => {
        const operations = lodash_1.pick(path, ["get", "post", "put", "delete", "patch", "options", "head"]);
        lodash_1.mapKeys(operations, (operation, method) => {
            if (operation && operation.operationId === operationId) {
                request = {
                    path: getPath(pathName),
                    basePath: swagger.basePath,
                    method,
                    response: faker_1.getFakeData(swagger, getResponse(operation)),
                    queryParams: resolvedPath ? resolvedPath.queryParams : [],
                };
            }
        });
    });
    return request;
};
