import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export type PublicUser = {
  id: number;
  username: string;
  avatarUrl: string | null;
  status?: string; // optional if you don't need it here
  level?: number; // optional if you don't need it here
};

@Injectable()
export class UsersClient {
  constructor(private readonly http: HttpService) {}

  private baseUrl() {
    return process.env.AUTH_URL ?? 'http://localhost:3001';
  }

  private headers() {
    return { 'x-internal-token': process.env.INTERNAL_TOKEN ?? '' };
  }

  async setStatusBatch(ids: number[], status: 'ONLINE' | 'IN_GAME' | 'OFFLINE') {
    if (ids.length === 0) return;
    await firstValueFrom(
      this.http.post(`${this.baseUrl()}/users/internal/users/status/batch`, { ids, status }, {
        headers: this.headers(),
      }),
    );
  }

  async batch(ids: number[]): Promise<PublicUser[]> {
    const unique = Array.from(new Set(ids)).filter((n) => Number.isInteger(n));
    if (unique.length === 0) return [];

    const res = await firstValueFrom(
      this.http.post(
        `${this.baseUrl()}/users/internal/users/batch`,
        { ids: unique },
        { headers: this.headers() },
      ),
    );

    // Expecting: [{ id, username, avatarUrl, status? }, ...]
    return res.data as PublicUser[];
  }

  async updateLevel(userId: number, level: number): Promise<void> {
    await firstValueFrom(
      this.http.patch(
        `${this.baseUrl()}/users/internal/users/${userId}/level`,
        { level },
        { headers: this.headers() },
      ),
    );
  }

  async batchUpdateLevels(updates: Array<{ userId: number; level: number }>): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl()}/users/internal/batch-update-levels`,
        { updates },
        { headers: this.headers() },
      ),
    );
  }
}
