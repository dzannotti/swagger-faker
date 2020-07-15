"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
// @ts-ignore
const rollup_plugin_babel_1 = __importDefault(require("rollup-plugin-babel"));
// @ts-ignore
const rollup_plugin_typescript_1 = __importDefault(require("rollup-plugin-typescript"));
const pkg = require(path_1.default.join(__dirname, "package.json"));
module.exports = {
    input: pkg.types,
    output: [
        {
            file: pkg.main,
            format: "cjs",
        },
        {
            file: pkg.module,
            format: "es",
        },
    ],
    external: [
        "tslib",
        // @ts-ignore
        ...Object.keys(process.binding("natives")),
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
        rollup_plugin_typescript_1.default({
            target: "es5",
            module: "es6",
        }),
        rollup_plugin_babel_1.default({
            plugins: ["babel-plugin-pure-calls-annotation"],
            exclude: "node_modules/**",
            extensions: [".js", ".jsx", ".ts", ".tsx"],
        }),
    ],
};
