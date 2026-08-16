"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIError = void 0;
class APIError extends Error {
    constructor(message, context) {
        super(message);
        this.context = context;
        this.name = "APIError";
    }
}
exports.APIError = APIError;
