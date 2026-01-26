import { randomBytes, createHash } from 'crypto';

export function makeEmailVerifyToken() {
  const raw = randomBytes(32).toString('base64url');
  const hash = createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}
