'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/app/components/TopBar';

type Feed = { _id: string; name: string; url: string };
type FeedWithPlatform = { _id: string; name: string; url: string; platform?: 'facebook'|'instagram'|'twitter'|'youtube'|'google'|'website' };

export default function DashboardPage() {
  const [tab, setTab] = useState<'feeds'|'account'>('feeds');
  return (
    <div className="space-y-6">
      <TopBar showBack />
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex gap-2">
        <button onClick={()=>setTab('feeds')} className={`px-4 py-2 rounded-2xl border ${tab==='feeds'?'bg-gray-900 text-white':'bg-white'}`}>Feeds</button>
        <button onClick={()=>setTab('account')} className={`px-4 py-2 rounded-2xl border ${tab==='account'?'bg-gray-900 text-white':'bg-white'}`}>Account</button>
      </div>
      {tab==='feeds' ? <FeedsTab/> : <AccountTab/>}
    </div>
  );
}

function FeedsTab() {
  const [feeds, setFeeds] = useState<FeedWithPlatform[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<'facebook'|'instagram'|'twitter'|'youtube'|'google'|'website'>('website');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');

  async function load() { const r = await fetch('/api/feeds'); setFeeds(await r.json()); }
  useEffect(()=>{ load(); },[]);

  async function add() {
    await fetch('/api/feeds', { method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, url, platform }) });
    setName(''); setUrl(''); setPlatform('website'); load();
  }
  async function del(id: string) { await fetch(`/api/feeds/${id}`, { method:'DELETE' }); load(); }
  const [editPlatform, setEditPlatform] = useState<'facebook'|'instagram'|'twitter'|'youtube'|'google'|'website'>('website');
  function startEdit(f: FeedWithPlatform) {
    setEditingId(f._id); setEditName(f.name); setEditUrl(f.url); setEditPlatform((f.platform ?? 'website'));
  }
  async function saveEdit() {
    if (!editingId) return;
    await fetch(`/api/feeds/${editingId}`, { method:'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName, url: editUrl, platform: editPlatform }) });
    setEditingId(null); setEditName(''); setEditUrl(''); setEditPlatform('website'); load();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-center">
        <input className="border rounded-xl p-2 flex-1" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded-xl p-2 flex-1" placeholder="RSS URL" value={url} onChange={e=>setUrl(e.target.value)} />
        <select className="border rounded-xl p-2" value={platform} onChange={e=>setPlatform(e.target.value as any)}>
          <option value="website">Website</option>
          <option value="youtube">YouTube</option>
          <option value="twitter">Twitter</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="google">Google</option>
        </select>
        <button onClick={add} className="px-4 py-2 rounded-2xl bg-black text-white">Add</button>
        <button onClick={async()=>{ await fetch('/api/feeds/refresh', { method:'POST' }); }} className="px-4 py-2 rounded-2xl border">Refresh Feeds</button>
      </div>
      <table className="w-full bg-white rounded-2xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">URL</th>
            <th className="text-left p-3">Platform</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {feeds.map(f=> (
            <tr key={f._id} className="border-t">
              <td className="p-3">
                {editingId===f._id ? (
                  <input className="border rounded-xl p-2 w-full" value={editName} onChange={e=>setEditName(e.target.value)} />
                ) : f.name}
              </td>
              <td className="p-3">
                {editingId===f._id ? (
                  <input className="border rounded-xl p-2 w-full" value={editUrl} onChange={e=>setEditUrl(e.target.value)} />
                ) : <span className="truncate inline-block max-w-[300px] align-middle">{f.url}</span>}
              </td>
              <td className="p-3">
                {editingId===f._id ? (
                  <select className="border rounded-xl p-2" value={editPlatform} onChange={e=>setEditPlatform(e.target.value as any)}>
                    <option value="website">Website</option>
                    <option value="youtube">YouTube</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="google">Google</option>
                  </select>
                ) : (f.platform ?? 'website')}
              </td>
              <td className="p-3 text-center">
                {editingId===f._id ? (
                  <div className="flex gap-2 justify-center">
                    <button onClick={saveEdit} className="px-3 py-1 rounded-xl border">Save</button>
                    <button onClick={()=>{ setEditingId(null); }} className="px-3 py-1 rounded-xl border">Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-4 justify-center">
                    <button onClick={()=>startEdit(f)} className="text-blue-600">Edit</button>
                    <button onClick={()=>del(f._id)} className="text-red-600">Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountTab() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  useEffect(()=>{ (async()=>{ const r = await fetch('/api/account'); const a = await r.json(); if (a?.email) setEmail(a.email); })(); },[]);
  async function save() {
    await fetch('/api/account', { method:'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: password||undefined }) });
    alert('Saved');
  }

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input className="border rounded-xl p-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm mb-1">New Password</label>
        <input className="border rounded-xl p-2 w-full" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Leave blank to keep" />
      </div>
      <button onClick={save} className="px-4 py-2 rounded-2xl bg-black text-white">Save</button>
    </div>
  );
}
