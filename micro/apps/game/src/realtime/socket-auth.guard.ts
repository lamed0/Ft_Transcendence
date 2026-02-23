import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    
    // Try to get token from auth object first
    let token = client.handshake.auth.token;
    
    // If not found, try to extract from cookie
    if (!token && client.handshake.headers.cookie) {
      const cookies = client.handshake.headers.cookie;
      const match = cookies.match(/accessToken=([^;]+)/);
      token = match ? match[1] : null;
    }

    if (!token) {
      console.warn('No token found in WebSocket handshake');
      client.disconnect();
      return false;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      client.data.user = payload;
      return true;
    } catch (err) {
      console.error('Token verification failed:', err.message);
      client.disconnect();
      return false;
    }
  }
}
