import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import { getSession } from '@/lib/session';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  await Post.findByIdAndUpdate(params.id, { $addToSet: { seenBy: session.userId } });
  return NextResponse.json({ ok: true });
}
