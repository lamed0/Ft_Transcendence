"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('jwt', () => ({
    jwtAccess: process.env.JWT_ACCESS_SECRET,
    jwtRefresh: process.env.JWT_REFRESH_SECRET,
}));
//# sourceMappingURL=jwt.config.js.map