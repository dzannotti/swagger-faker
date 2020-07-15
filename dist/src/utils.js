"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickRefKey = (str) => {
    if (!str) {
        return "";
    }
    const list = str.split("/");
    return list[list.length - 1];
};
