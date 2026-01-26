declare const GoogleAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GoogleAuthGuard extends GoogleAuthGuard_base {
    getAuthenticateOptions(): {
        session: boolean;
        scope: string[];
    };
}
export {};
