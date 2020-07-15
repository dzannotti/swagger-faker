"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker = __importStar(require("faker"));
exports.getRandomArrayItem = (items) => items[Math.floor(Math.random() * items.length)];
exports.booleanGenerator = () => faker.random.boolean();
exports.stringGenerator = (enumList) => (enumList ? exports.getRandomArrayItem(enumList) : faker.random.words());
exports.numberGenerator = (max, min) => faker.random.number({
    min,
    max,
});
exports.fileGenerator = () => faker.system.mimeType();
exports.dateTimeGenerator = () => faker.date.past().toISOString();
exports.dateGenerator = () => exports.dateTimeGenerator().slice(0, 10);
exports.timeGenerator = () => exports.dateTimeGenerator().slice(11);
exports.urlGenerator = () => faker.internet.url();
exports.ipv4Generator = () => faker.internet.ip();
exports.ipv6Generator = () => faker.internet.ipv6();
exports.emailGenerator = () => faker.internet.email();
