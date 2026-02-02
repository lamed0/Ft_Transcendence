import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FriendsClient {
  constructor(private readonly http: HttpService) {}

  private baseUrl() {
    return process.env.FRIENDS_URL ?? 'http://localhost:3003';
  }

  private headers() {
    return { 'x-internal-token': process.env.INTERNAL_TOKEN ?? '' };
  }

  async areFriends(userA: number, userB: number): Promise<boolean> {
    const res = await firstValueFrom(
      this.http.get(`${this.baseUrl()}/friends/internal/friends/are-friends`, {
        params: { userA, userB },
        headers: this.headers(),
      }),
    );
    return !!res.data?.accepted;
  }

  async anyAccepted(userId: number, otherIds: number[]): Promise<boolean> {
    const res = await firstValueFrom(
      this.http.post(
        `${this.baseUrl()}/friends/internal/friends/any-accepted`,
        { userId, otherIds },
        { headers: this.headers() },
      ),
    );
    return !!res.data?.accepted;
  }
}
