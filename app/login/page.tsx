'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) router.push('/choose');
    else setErr('Email or password is incorrect');
  }

  return (
    <div className="max-w-md mx-auto mt-24 bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded-xl p-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="w-full border rounded-xl p-2"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
        />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full bg-black text-white rounded-xl py-2">Sign In</button>
      </form>
    </div>
  );
}
