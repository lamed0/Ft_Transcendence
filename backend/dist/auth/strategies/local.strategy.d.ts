import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
declare const LocalStrategy_base: new (...args: [] | [options: import("passport-local").IStrategyOptionsWithRequest] | [options: import("passport-local").IStrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(username: string, password: string): Promise<{
        user: {
            email: string | null;
            username: string;
            id: number;
            avatarUrl: string | null;
            status: import(".prisma/client").$Enums.userStatus;
            createdAt: Date;
        };
        accessToken: string;
    }>;
}
export {};
