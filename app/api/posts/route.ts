import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Post from '@/models/Post';
import Feed from '@/models/Feed';
import { getSession } from '@/lib/session';

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
  const time = (searchParams.get('time') || 'all').toLowerCase();
  const platform = (searchParams.get('platform') || 'all').toLowerCase();

  const q: any = {};

  // Time filter
  let since: Date | null = null;
  const now = new Date();
  if (time === 'hour') since = new Date(now.getTime() - 60 * 60 * 1000);
  else if (time === 'today') { const d = new Date(); d.setHours(0,0,0,0); since = d; }
  else if (time === 'week') since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (time === 'month') since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (since) q.publishedAt = { $gte: since };

  // Platform filter
  if (platform && platform !== 'all') {
    const feeds = await Feed.find({ platform }).select('_id');
    const feedIds = feeds.map(f => f._id);
    // If no feeds match the platform, short-circuit
    if (feedIds.length === 0) {
      return NextResponse.json({ posts: [], total: 0, page, pageSize, hasMore: false });
    }
    q.feedId = { $in: feedIds };
  }

  const total = await Post.countDocuments(q);
  const posts = await Post.find(q)
    .sort({ publishedAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate('feedId', 'platform');

  const hasMore = page * pageSize < total;
  return NextResponse.json({ posts, total, page, pageSize, hasMore });
}

export async function DELETE() {
  await dbConnect();
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const res = await Post.deleteMany({});
  const deleted = typeof res.deletedCount === 'number' ? res.deletedCount : 0;
  return NextResponse.json({ ok: true, deleted });
}
