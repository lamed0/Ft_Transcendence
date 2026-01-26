"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePair = normalizePair;
function normalizePair(a, b) {
    return a < b ? { low: a, high: b } : { low: b, high: a };
}
//# sourceMappingURL=friends.utils.js.map