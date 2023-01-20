"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanHistory = void 0;
function cleanHistory(history) {
    return history.map(({ question, answer }) => ({
        question,
        answer,
    }));
}
exports.cleanHistory = cleanHistory;
