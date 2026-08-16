"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildState = buildState;
const handler_1 = require("../models/deviceStates/handler");
function buildState(events, initialState = {}) {
    let state = { ...initialState };
    for (const event of events) {
        const handler = handler_1.handlers[event.eventType];
        if (handler) {
            state = handler(state, event);
        }
    }
    return state;
}
