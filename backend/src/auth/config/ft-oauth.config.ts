import { registerAs } from '@nestjs/config';

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export default registerAs('ftOAuth', () => ({
  clientID: must('FT_CLIENT_ID'),
  clientSecret: must('FT_CLIENT_SECRET'),
  callbackUrl: must('FT_CALLBACK_URL'),
}));
