import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Feed from '@/models/Feed';

export async function GET() { await dbConnect(); const feeds = await Feed.find().sort({ createdAt: -1 }); return NextResponse.json(feeds); }
export async function POST(req: Request) { await dbConnect(); const body = await req.json(); const feed = await Feed.create(body); return NextResponse.json(feed, { status: 201 }); }
