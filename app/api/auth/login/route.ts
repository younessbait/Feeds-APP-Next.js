import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Account from '@/models/Account';
import bcrypt from 'bcryptjs';
import { setSession } from '@/lib/session';

export async function POST(req: Request) {
  await dbConnect();
  const { email, password } = await req.json();
  const user = await Account.findOne({ email });
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  await setSession({ userId: String(user._id), email: user.email });
  return NextResponse.json({ ok: true });
}
