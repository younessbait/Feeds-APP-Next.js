import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const APP_SECRET = new TextEncoder().encode(process.env.APP_SECRET!);
const COOKIE_NAME = 'session';
const isProd = process.env.NODE_ENV === 'production';

export type SessionPayload = { userId: string; email: string };

export async function setSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(APP_SECRET);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, APP_SECRET);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 0,
  });
}
