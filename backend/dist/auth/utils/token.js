"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeEmailVerifyToken = makeEmailVerifyToken;
const crypto_1 = require("crypto");
function makeEmailVerifyToken() {
    const raw = (0, crypto_1.randomBytes)(32).toString('base64url');
    const hash = (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
    return { raw, hash };
}
//# sourceMappingURL=token.js.map