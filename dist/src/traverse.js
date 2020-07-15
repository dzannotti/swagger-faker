"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const utils_1 = require("./utils");
class Traverse {
    constructor(definitions) {
        this.definitions = definitions;
        this.traverse = () => lodash_1.mapValues(this.definitions, (definition) => this.resolveDefinition(definition));
        this.traverseSpecificDefinition = (specificDefinitionName) => this.resolveDefinition(this.definitions[specificDefinitionName]);
        this.resolveDefinition = (definition = {}) => {
            if (definition.properties) {
                return Object.assign(Object.assign({}, definition), { properties: lodash_1.mapValues(definition.properties, (schema) => this.handleRef(schema)) });
            }
            if (definition.additionalProperties) {
                return Object.assign(Object.assign({}, definition), { properties: this.handleRef(definition.additionalProperties) });
            }
            return definition;
        };
        this.handleRef = (schema) => {
            if (schema.$ref) {
                return this.replaceRefInSchema(schema);
            }
            if (schema.type === "array") {
                return Object.assign(Object.assign({}, schema), { items: this.replaceRefInItems(schema.items) });
            }
            return schema;
        };
        this.replaceRefInSchema = (schema) => {
            const refKey = utils_1.pickRefKey(schema.$ref);
            return this.resolveDefinition(this.definitions[refKey]);
        };
        this.replaceRefInItems = (items) => {
            if (lodash_1.isArray(items)) {
                return lodash_1.map(items, (item) => {
                    const refKey = utils_1.pickRefKey(item.$ref);
                    return refKey ? this.resolveDefinition(this.definitions[refKey]) : item;
                });
            }
            if (items.items) {
                return Object.assign(Object.assign({}, items), { items: this.replaceRefInItems(items.items) });
            }
            const refKey = utils_1.pickRefKey(items.$ref);
            return refKey ? this.resolveDefinition(this.definitions[refKey]) : items;
        };
    }
    static of(definitions) {
        return new Traverse(definitions);
    }
}
exports.Traverse = Traverse;
