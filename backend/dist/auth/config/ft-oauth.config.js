"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
function must(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env: ${name}`);
    return v;
}
exports.default = (0, config_1.registerAs)('ftOAuth', () => ({
    clientID: must('FT_CLIENT_ID'),
    clientSecret: must('FT_CLIENT_SECRET'),
    callbackUrl: must('FT_CALLBACK_URL'),
}));
//# sourceMappingURL=ft-oauth.config.js.map