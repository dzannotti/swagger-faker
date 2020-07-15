import { mapValues, isArray, map, get, forEach, mapKeys, find, pick } from 'lodash';
import { PathResolver } from '@ts-tool/ts-codegen';
import { __assign } from 'tslib';
import { random, date, internet, system } from 'faker';

var getRandomArrayItem = function (items) {
  return items[Math.floor(Math.random() * items.length)];
};
var booleanGenerator = function () {
  return random.boolean();
};
var stringGenerator = function (enumList) {
  return enumList ? getRandomArrayItem(enumList) : random.words();
};
var numberGenerator = function (max, min) {
  return random.number({
    min: min,
    max: max
  });
};
var fileGenerator = function () {
  return system.mimeType();
};
var dateTimeGenerator = function () {
  return date.past().toISOString();
};
var dateGenerator = function () {
  return dateTimeGenerator().slice(0, 10);
};
var timeGenerator = function () {
  return dateTimeGenerator().slice(11);
};
var urlGenerator = function () {
  return internet.url();
};
var ipv4Generator = function () {
  return internet.ip();
};
var ipv6Generator = function () {
  return internet.ipv6();
};
var emailGenerator = function () {
  return internet.email();
};

var pickRefKey = function (str) {
  if (!str) {
    return "";
  }

  var list =
  /*#__PURE__*/
  str.split("/");
  return list[list.length - 1];
};

var Traverse =
/** @class */

/*#__PURE__*/
function () {
  function Traverse(definitions) {
    var _this = this;

    this.definitions = definitions;

    this.traverse = function () {
      return mapValues(_this.definitions, function (definition) {
        return _this.resolveDefinition(definition);
      });
    };

    this.traverseSpecificDefinition = function (specificDefinitionName) {
      return _this.resolveDefinition(_this.definitions[specificDefinitionName]);
    };

    this.resolveDefinition = function (definition) {
      if (definition === void 0) {
        definition = {};
      }

      if (definition.properties) {
        return __assign(
        /*#__PURE__*/
        __assign({}, definition), {
          properties: mapValues(definition.properties, function (schema) {
            return _this.handleRef(schema);
          })
        });
      }

      if (definition.additionalProperties) {
        return __assign(
        /*#__PURE__*/
        __assign({}, definition), {
          properties: _this.handleRef(definition.additionalProperties)
        });
      }

      return definition;
    };

    this.handleRef = function (schema) {
      if (schema.$ref) {
        return _this.replaceRefInSchema(schema);
      }

      if (schema.type === "array") {
        return __assign(
        /*#__PURE__*/
        __assign({}, schema), {
          items: _this.replaceRefInItems(schema.items)
        });
      }

      return schema;
    };

    this.replaceRefInSchema = function (schema) {
      var refKey =
      /*#__PURE__*/
      pickRefKey(schema.$ref);
      return _this.resolveDefinition(_this.definitions[refKey]);
    };

    this.replaceRefInItems = function (items) {
      if (isArray(items)) {
        return map(items, function (item) {
          var refKey =
          /*#__PURE__*/
          pickRefKey(item.$ref);
          return refKey ? _this.resolveDefinition(_this.definitions[refKey]) : item;
        });
      }

      if (items.items) {
        return __assign(
        /*#__PURE__*/
        __assign({}, items), {
          items: _this.replaceRefInItems(items.items)
        });
      }

      var refKey =
      /*#__PURE__*/
      pickRefKey(items.$ref);
      return refKey ? _this.resolveDefinition(_this.definitions[refKey]) : items;
    };
  }

  Traverse.of = function (definitions) {
    return new Traverse(definitions);
  };

  return Traverse;
}();

var toFaker = function (data) {
  return mapValues(data, function (item) {
    return toFakeObj(item);
  });
};
var toFakeObj = function (schema) {
  if (schema === void 0) {
    schema = {};
  }

  var results = {};

  var getFakeProperties = function (properties) {
    return mapValues(properties, function (property) {
      switch (property.type) {
        case "object":
          return toFakeObj(property);

        case "array":
          return toFakeItems(property, property.example);

        default:
          return toFakeProp(property);
      }
    });
  };

  if (schema.properties) {
    results =
    /*#__PURE__*/
    __assign(
    /*#__PURE__*/
    __assign({}, results),
    /*#__PURE__*/
    getFakeProperties(schema.properties));
  }

  if (schema.additionalProperties) {
    results =
    /*#__PURE__*/
    __assign(
    /*#__PURE__*/
    __assign({}, results),
    /*#__PURE__*/
    getFakeProperties(schema.additionalProperties));
  }

  return results;
};
var toFakeItems = function (items, example) {
  if (example) {
    return example;
  }

  if (isArray(items)) {
    return map(items, function (item) {
      return toFakeProp(item);
    });
  }

  if (items.items) {
    return isArray(items.items) ? toFakeItems(items.items, items.example) : [toFakeItems(items.items, items.example)];
  }

  if (items.type === "object") {
    return toFakeObj(items);
  }

  return toFakeProp({
    type: items.type,
    items: items,
    example: example
  });
};

var toFakeProp = function (schema) {
  if (schema.example) {
    return schema.example;
  }

  switch (schema.type) {
    case "boolean":
      return booleanGenerator();

    case "string":
      if (schema.format === "date") {
        return dateGenerator();
      } else if (schema.format === "time") {
        return timeGenerator();
      } else if (schema.format === "date-time") {
        return dateTimeGenerator();
      } else if (schema.format === "uri") {
        return urlGenerator();
      } else if (schema.format === "ipv4") {
        return ipv4Generator();
      } else if (schema.format === "ipv6") {
        return ipv6Generator();
      } else if (schema.format === "email") {
        return emailGenerator();
      }

      return stringGenerator(schema.enum);

    case "number":
    case "integer":
      return numberGenerator(schema.maximum, schema.minimum);

    case "file":
      return fileGenerator();

    default:
      return "";
  }
};

var getFakeData = function (spec, response) {
  var $ref =
  /*#__PURE__*/
  get(response, "$ref");

  if ($ref && spec.definitions) {
    var refKey =
    /*#__PURE__*/
    pickRefKey($ref);
    return toFakeObj(spec.definitions[refKey]);
  }

  if (!response) {
    return {};
  }

  var _a = response,
      examples = _a.examples,
      schema = _a.schema;

  if (examples) {
    return examples;
  }

  if (!spec.definitions || !schema) {
    return {};
  }

  var schemaWithoutRef =
  /*#__PURE__*/
  Traverse.of(spec.definitions).handleRef(schema);

  switch (schemaWithoutRef.type) {
    case "array":
      return schemaWithoutRef.items ? toFakeItems(schemaWithoutRef) : {};

    case "object":
      return toFakeObj(schemaWithoutRef);

    case "string":
      return stringGenerator();

    case "boolean":
      return booleanGenerator();

    case "number":
    case "integer":
      return numberGenerator();

    default:
      return {};
  }
};

var getPath = function (pathName) {
  return pathName.replace(/\{/g, ":").replace(/\}/g, "");
}; // TODO: responses.200.schema.type ==="array"
// TODO: response.200.schema.type ==="object" (additionalProperties)
// TODO: response.200.schema.type==="string" | "number" | "integer" | "boolean"
// TODO: responses.200.headers 存在时
// TODO: responses.201 同上


var getResponse = function (operation) {
  var responses =
  /*#__PURE__*/
  get(operation, "responses");
  var reference =
  /*#__PURE__*/
  get(operation, "$ref");
  return reference ? reference : get(responses, "200") || get(responses, "201");
};

var getResolvedPathByOperationId = function (swagger, operationId) {
  var resolvedPaths = PathResolver.of(swagger.paths, swagger.basePath).resolve().resolvedPaths;
  return find(resolvedPaths, function (item) {
    return item.operationId === operationId;
  });
};

var getRequestConfigByOperationId = function (swagger, operationId) {
  var resolvedPath =
  /*#__PURE__*/
  getResolvedPathByOperationId(swagger, operationId);
  var request = null;
  forEach(swagger.paths, function (path, pathName) {
    var operations =
    /*#__PURE__*/
    pick(path, ["get", "post", "put", "delete", "patch", "options", "head"]);
    mapKeys(operations, function (operation, method) {
      if (operation && operation.operationId === operationId) {
        request = {
          path: getPath(pathName),
          basePath: swagger.basePath,
          method: method,
          response: getFakeData(swagger,
          /*#__PURE__*/
          getResponse(operation)),
          queryParams: resolvedPath ? resolvedPath.queryParams : []
        };
      }
    });
  });
  return request;
};

export { Traverse, getFakeData, getRequestConfigByOperationId, toFakeItems, toFakeObj, toFaker };
