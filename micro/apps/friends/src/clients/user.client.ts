import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

type PublicUser = { id: number; username: string; avatarUrl: string | null; status: string; level: number };

@Injectable()
export class UsersClient {
  constructor(private readonly http: HttpService) {}

  private baseUrl() {
    return process.env.AUTH_SERVICE_URL ?? 'http://auth:3001';
  }

  private headers() {
    return { 'x-internal-token': process.env.INTERNAL_TOKEN ?? '' };
  }

  async exists(userId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.get(`${this.baseUrl()}/users/internal/users/${userId}`, {
          headers: this.headers(),
        }),
      );
    } catch (e: any) {
      if (e?.response?.status === 404) throw new NotFoundException('User not found.');
      throw e;
    }
  }

  async batch(ids: number[]): Promise<PublicUser[]> {
    if (ids.length === 0) return [];
    const res = await firstValueFrom(
      this.http.post(
        `${this.baseUrl()}/users/internal/users/batch`,
        { ids },
        { headers: this.headers() },
      ),
    );
    return res.data;
  }
}
