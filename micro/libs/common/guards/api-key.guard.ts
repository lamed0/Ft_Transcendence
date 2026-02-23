import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private readonly http: HttpService) {}

    private authUrl() {
        return process.env.AUTH_SERVICE_URL ?? 'http://auth:3001';
    }

    private internalToken() {
        return process.env.INTERNAL_TOKEN ?? '';
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        console.log('ApiKeyGuard.canActivate called');
        
        // Check for internal token first (for service-to-service)
        const internalToken = request.headers['x-internal-token'];
        if (internalToken) {
            if (internalToken === this.internalToken()) {
                console.log('Internal token validated successfully');
                return true;
            }
            throw new UnauthorizedException('Invalid internal token');
        }
        
        // Check for API key in cookies first, then fall back to headers
        let apiKey = request.cookies?.['x-api-key'];
        if (!apiKey) {
            apiKey = request.headers['x-api-key'];
        }

        if (!apiKey) {
            throw new UnauthorizedException('API key is required (cookie: x-api-key or header: x-api-key)');
        }

        try {
            // Call auth service to validate the API key
            const response = await firstValueFrom(
                this.http.get(`${this.authUrl()}/users/api-key/validate`, {
                    headers: {
                        'x-api-key': apiKey,
                        'x-internal-token': this.internalToken(),
                    },
                }),
            );

            // Attach key info to request for later use
            request.apiKey = response.data;
            return true;
        } catch (error: any) {
            if (error?.response?.status === 401) {
                throw new UnauthorizedException('Invalid or revoked API key');
            }
            throw new HttpException('Failed to validate API key', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
