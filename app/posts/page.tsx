'use client';
import { useEffect, useMemo, useState } from 'react';
import TopBar from '@/app/components/TopBar';

type Post = {
  _id: string;
  title: string;
  link: string;
  publishedAt?: string;
  seenBy?: string[];
  mediaUrl?: string;
  mediaKind?: 'image'|'video';
  feedId?: { _id: string; platform?: 'facebook'|'instagram'|'twitter'|'youtube'|'google'|'website' };
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [time, setTime] = useState<'all'|'hour'|'today'|'week'|'month'>('all');
  const [platform, setPlatform] = useState<'all'|'facebook'|'instagram'|'twitter'|'youtube'|'google'|'website'>('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  async function load() {
    const qs = new URLSearchParams({ time, platform, page: String(page), pageSize: String(pageSize) });
    const r = await fetch(`/api/posts?${qs.toString()}`);
    const data = await r.json();
    if (Array.isArray(data)) {
      setPosts(data);
      setTotal(data.length);
    } else {
      setPosts(data.posts ?? []);
      setTotal(data.total ?? 0);
    }
  }
  useEffect(()=>{ load(); (async()=>{ const r = await fetch('/api/account'); const a = await r.json(); setAccountId(a?.id ?? null); })(); },[]);
  useEffect(()=>{ setPage(1); }, [time, platform]);
  useEffect(()=>{ load(); }, [time, platform, page]);
  useEffect(()=>{
    let cancelled = false;
    async function tick() {
      try {
        await fetch('/api/feeds/refresh', { method: 'POST' });
        if (!cancelled) await load();
      } catch {}
    }
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      void tick();
    }, 60000);
    return ()=>{ cancelled = true; clearInterval(id); };
  }, []);

  async function markAll() { await fetch('/api/posts/seen', { method: 'POST' }); load(); }
  async function deleteAllConfirm() {
    if (!confirm('هل تريد مسح جميع البوستات؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    await fetch('/api/posts', { method: 'DELETE' });
    load();
  }

  function isUnread(p: Post) { return !p.seenBy || !accountId || !p.seenBy.includes(accountId); }
  const ordered = useMemo(() => {
    const unread: Post[] = [];
    const read: Post[] = [];
    for (const p of posts) { if (isUnread(p)) unread.push(p); else read.push(p); }
    return [...unread, ...read];
  }, [posts, accountId]);

  function timeAgo(iso?: string) {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    const now = Date.now();
    const s = Math.max(1, Math.floor((now - then) / 1000));
    const mins = Math.floor(s/60), hrs = Math.floor(mins/60), days = Math.floor(hrs/24), wks = Math.floor(days/7), mos = Math.floor(days/30), yrs = Math.floor(days/365);
    if (s < 60) return `${s}s ago`;
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    if (wks < 5) return `${wks}w ago`;
    if (mos < 12) return `${mos}mo ago`;
    return `${yrs}y ago`;
  }
  function PlatformBadge({ platform }: { platform?: Post['feedId'] extends infer T ? T extends { platform?: any } ? T['platform'] : any : any }) {
    const p = platform || 'website';
    const label = p.charAt(0).toUpperCase() + p.slice(1);
    const icon = p === 'youtube' ? 'YT' : p === 'twitter' ? 'X' : p === 'facebook' ? 'FB' : p === 'instagram' ? 'IG' : p === 'google' ? 'G' : 'WEB';
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border text-gray-600">{icon}<span>{label}</span></span>;
  }

  return (
    <div className="space-y-6">
      <TopBar showBack />
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Latest Posts</h1>
        <div className="flex items-center gap-2">
          <select className="border rounded-xl p-2 text-sm" value={time} onChange={e=>setTime(e.target.value as any)}>
            <option value="all">All time</option>
            <option value="hour">Last hour</option>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
          <select className="border rounded-xl p-2 text-sm" value={platform} onChange={e=>setPlatform(e.target.value as any)}>
            <option value="all">All platforms</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="google">Google</option>
            <option value="website">Website</option>
          </select>
          <button onClick={markAll} className="text-sm px-3 py-1 rounded-xl border">Mark All as Read</button>
          <button onClick={deleteAllConfirm} className="text-sm px-3 py-1 rounded-xl border border-red-500 text-red-600">مسح جميع البوستات</button>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Total: {total}</span>
        <div className="flex items-center gap-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1, p-1))} className="px-3 py-1 rounded-xl border disabled:opacity-50">Prev</button>
          <span>Page {page}</span>
          <button disabled={ordered.length < pageSize || page * pageSize >= total} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded-xl border disabled:opacity-50">Next</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {ordered.map(p=> (
          <div key={p._id} className="bg-white rounded-2xl p-4 flex flex-col gap-3 border">
            {isUnread(p) && <span className="mt-1 inline-block h-3 w-3 rounded-full bg-green-500" title="Unread"></span>}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{timeAgo(p.publishedAt)}</span>
                <PlatformBadge platform={p.feedId?.platform} />
              </div>
              <a href={p.link} target="_blank" className="font-medium hover:underline">{p.title}</a>
              {isValidMediaUrl(p.mediaUrl) && (
                p.mediaKind === 'video' ? (
                  <video
                    src={p.mediaUrl}
                    controls
                    preload="metadata"
                    className="w-full max-h-80 rounded-xl"
                    onError={(e)=>{ (e.currentTarget as HTMLVideoElement).style.display='none'; }}
                  />
                ) : (
                  <img
                    src={p.mediaUrl}
                    alt="media"
                    className="w-full max-h-80 object-cover rounded-xl"
                    onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display='none'; }}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function isValidMediaUrl(u?: string) {
  if (!u) return false;
  return /^https?:\/\//i.test(u);
}
