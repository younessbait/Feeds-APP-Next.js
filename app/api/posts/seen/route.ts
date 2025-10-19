import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import { getSession } from '@/lib/session';

export async function POST() {
  await dbConnect();
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const userId = session.userId;
  const res = await Post.updateMany(
    { seenBy: { $ne: userId } },
    { $addToSet: { seenBy: userId } }
  );

  const modified = typeof res.modifiedCount === 'number' ? res.modifiedCount : (res as any).nModified ?? 0;
  return NextResponse.json({ ok: true, modified });
}

