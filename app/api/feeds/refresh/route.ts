import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Feed from '@/models/Feed';
import Post from '@/models/Post';
import Parser from 'rss-parser';

export async function POST() {
  await dbConnect();
  const parser = new Parser();
  const feeds = await Feed.find();
  let created = 0;

  for (const f of feeds) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(f.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (RSSFetcher; +https://example.com)',
          'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
        },
        cache: 'no-store',
        signal: controller.signal,
      } as RequestInit);

      if (!res.ok) {
        console.error('RSS fetch non-OK', res.status, res.statusText, 'for', f.url);
        continue;
      }

      const xml = await res.text();
      let feedParsed: any;
      try {
        feedParsed = await parser.parseString(xml);
      } catch (e) {
        console.error('RSS parse error for', f.url, e);
        continue;
      }

      const items: any[] = (feedParsed?.items ?? feedParsed?.feed?.entries ?? []) as any[];
      for (const item of items) {
        const link = extractLink(item);
        if (!link) continue;

        const exists = await Post.findOne({ link });
        if (exists) continue;

        const title: string = (item?.title && typeof item.title === 'string' ? item.title : 'Untitled');
        const iso = item?.isoDate || item?.pubDate || item?.published || item?.updated;
        const publishedAt = iso ? new Date(iso) : new Date();

        const media = extractMedia(item);

        await Post.create({
          feedId: f._id,
          title,
          link,
          publishedAt,
          ...(media?.mediaUrl ? { mediaUrl: media.mediaUrl, mediaKind: media.mediaKind } : {}),
        });
        created++;
      }
    } catch (e) {
      if ((e as any)?.name === 'AbortError') {
        console.error('RSS fetch timeout for', f.url);
      } else {
        console.error('RSS error for', f.url, e);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  return NextResponse.json({ ok: true, created });
}

function extractLink(item: any): string | null {
  // Simple case
  if (typeof item?.link === 'string' && item.link.trim()) return item.link.trim();

  // Atom shapes
  if (item?.link && typeof item.link === 'object') {
    const href = (item.link.href || item.link.url);
    if (typeof href === 'string' && href.trim()) return href.trim();
  }

  if (Array.isArray(item?.links) && item.links.length) {
    const alt = item.links.find((l: any) => l?.rel === 'alternate' && (l.href || l.url));
    const primary = alt || item.links[0];
    const href = primary?.href || primary?.url;
    if (typeof href === 'string' && href.trim()) return href.trim();
  }

  if (Array.isArray(item?.link) && item.link.length) {
    const first = item.link[0];
    const href = first?.href || first?.url || (typeof first === 'string' ? first : undefined);
    if (typeof href === 'string' && href.trim()) return href.trim();
  }

  // Fallback to GUID if it looks like a URL
  if (typeof item?.guid === 'string' && /^https?:\/\//i.test(item.guid)) return item.guid.trim();

  return null;
}

function extractMedia(item: any): { mediaUrl: string; mediaKind: 'image'|'video' } | null {
  // enclosure: { url, type }
  const enc = item?.enclosure;
  if (enc && typeof enc === 'object') {
    const url = enc.url || enc.link || enc.href;
    const type = (enc.type || '').toString();
    const normalized = normalizeHttpUrl(url);
    if (normalized) {
      const kind = type.startsWith('video/') ? 'video' : 'image';
      return { mediaUrl: normalized, mediaKind: kind as 'image'|'video' };
    }
  }

  // media:content and media:thumbnail structures
  const mediaContent = (item['media:content'] || item.mediaContent || []) as any;
  if (Array.isArray(mediaContent) && mediaContent.length) {
    const m = mediaContent[0];
    const url = m?.url || m?.$?.url;
    const type = (m?.type || m?.$?.type || '').toString();
    const normalized = normalizeHttpUrl(url);
    if (normalized) {
      const kind = type.startsWith('video/') ? 'video' : 'image';
      return { mediaUrl: normalized, mediaKind: kind as 'image'|'video' };
    }
  }

  const thumb = item['media:thumbnail'] || item.mediaThumbnail;
  if (thumb) {
    const normalized = normalizeHttpUrl(thumb.url || thumb?.$?.url);
    if (normalized) return { mediaUrl: normalized, mediaKind: 'image' };
  }

  // Some feeds put image in content:encoded; rudimentary extraction
  const contentHtml = item['content:encoded'] || item.content;
  if (typeof contentHtml === 'string') {
    const imgMatch = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    const imgUrl = imgMatch?.[1] ? normalizeHttpUrl(imgMatch[1]) : null;
    if (imgUrl) return { mediaUrl: imgUrl, mediaKind: 'image' };
    const videoMatch = contentHtml.match(/<video[^>]+src=["']([^"']+)["']/i);
    const vidUrl = videoMatch?.[1] ? normalizeHttpUrl(videoMatch[1]) : null;
    if (vidUrl) return { mediaUrl: vidUrl, mediaKind: 'video' };
  }

  return null;
}

function normalizeHttpUrl(u: any): string | null {
  if (typeof u !== 'string') return null;
  const url = u.trim();
  if (!url) return null;
  if (url.startsWith('//')) return 'https:' + url;
  if (/^https?:\/\//i.test(url)) return url;
  return null; // discard non-http(s) URLs or relative paths
}
