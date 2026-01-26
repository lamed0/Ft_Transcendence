import { registerAs } from "@nestjs/config";

export default registerAs('jwt', () => ({
    jwtAccess: process.env.JWT_ACCESS_SECRET,
    jwtRefresh: process.env.JWT_REFRESH_SECRET,
}))