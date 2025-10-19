import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Feed from '@/models/Feed';

export async function PUT(req: Request, { params }: { params: { id: string } }) { await dbConnect(); const feed = await Feed.findByIdAndUpdate(params.id, await req.json(), { new: true }); return NextResponse.json(feed); }
export async function DELETE(_: Request, { params }: { params: { id: string } }) { await dbConnect(); await Feed.findByIdAndDelete(params.id); return NextResponse.json({ ok: true }); }
