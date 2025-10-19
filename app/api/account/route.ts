import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Account from '@/models/Account';
import bcrypt from 'bcryptjs';

export async function GET() {
  await dbConnect();
  const acc = await Account.findOne();
  if (!acc) return NextResponse.json(null);
  return NextResponse.json({ email: acc.email, id: acc._id });
}

export async function PUT(req: Request) {
  await dbConnect();
  const { email, password } = await req.json();
  const acc = await Account.findOne();
  if (!acc) return NextResponse.json({ ok: false }, { status: 404 });
  if (email) acc.email = email;
  if (password) acc.passwordHash = await bcrypt.hash(password, 10);
  await acc.save();
  return NextResponse.json({ ok: true });
}
