"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const generators_1 = require("./generators");
const utils_1 = require("./utils");
const traverse_1 = require("./traverse");
exports.toFaker = (data) => lodash_1.mapValues(data, (item) => exports.toFakeObj(item));
exports.toFakeObj = (schema = {}) => {
    let results = {};
    const getFakeProperties = (properties) => {
        return lodash_1.mapValues(properties, (property) => {
            switch (property.type) {
                case "object":
                    return exports.toFakeObj(property);
                case "array":
                    return exports.toFakeItems(property, property.example);
                default:
                    return toFakeProp(property);
            }
        });
    };
    if (schema.properties) {
        results = Object.assign(Object.assign({}, results), getFakeProperties(schema.properties));
    }
    if (schema.additionalProperties) {
        results = Object.assign(Object.assign({}, results), getFakeProperties(schema.additionalProperties));
    }
    return results;
};
exports.toFakeItems = (items, example) => {
    if (example) {
        return example;
    }
    if (lodash_1.isArray(items)) {
        return lodash_1.map(items, (item) => toFakeProp(item));
    }
    if (items.items) {
        return lodash_1.isArray(items.items) ? exports.toFakeItems(items.items, items.example) : [exports.toFakeItems(items.items, items.example)];
    }
    if (items.type === "object") {
        return exports.toFakeObj(items);
    }
    return toFakeProp({
        type: items.type,
        items,
        example,
    });
};
const toFakeProp = (schema) => {
    if (schema.example) {
        return schema.example;
    }
    switch (schema.type) {
        case "boolean":
            return generators_1.booleanGenerator();
        case "string":
            if (schema.format === "date") {
                return generators_1.dateGenerator();
            }
            else if (schema.format === "time") {
                return generators_1.timeGenerator();
            }
            else if (schema.format === "date-time") {
                return generators_1.dateTimeGenerator();
            }
            else if (schema.format === "uri") {
                return generators_1.urlGenerator();
            }
            else if (schema.format === "ipv4") {
                return generators_1.ipv4Generator();
            }
            else if (schema.format === "ipv6") {
                return generators_1.ipv6Generator();
            }
            else if (schema.format === "email") {
                return generators_1.emailGenerator();
            }
            return generators_1.stringGenerator(schema.enum);
        case "number":
        case "integer":
            return generators_1.numberGenerator(schema.maximum, schema.minimum);
        case "file":
            return generators_1.fileGenerator();
        default:
            return "";
    }
};
exports.getFakeData = (spec, response) => {
    const $ref = lodash_1.get(response, "$ref");
    if ($ref && spec.definitions) {
        const refKey = utils_1.pickRefKey($ref);
        return exports.toFakeObj(spec.definitions[refKey]);
    }
    if (!response) {
        return {};
    }
    const { examples, schema } = response;
    if (examples) {
        return examples;
    }
    if (!spec.definitions || !schema) {
        return {};
    }
    const schemaWithoutRef = traverse_1.Traverse.of(spec.definitions).handleRef(schema);
    switch (schemaWithoutRef.type) {
        case "array":
            return schemaWithoutRef.items ? exports.toFakeItems(schemaWithoutRef) : {};
        case "object":
            return exports.toFakeObj(schemaWithoutRef);
        case "string":
            return generators_1.stringGenerator();
        case "boolean":
            return generators_1.booleanGenerator();
        case "number":
        case "integer":
            return generators_1.numberGenerator();
        default:
            return {};
    }
};
