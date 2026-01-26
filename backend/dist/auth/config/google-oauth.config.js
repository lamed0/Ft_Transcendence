"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('googleOauth', () => ({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
}));
//# sourceMappingURL=google-oauth.config.js.map