"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TopBar({ showBack = false }: { showBack?: boolean }) {
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/account');
        if (r.ok) {
          const a = await r.json();
          if (a?.email) setEmail(a.email);
        }
      } catch {}
    })();
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  return (
    <div className="flex items-center justify-between text-sm mb-4">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => router.push('/choose')} className="px-3 py-1 rounded-xl border">Back</button>
        )}
        <span className="text-gray-600">{email}</span>
      </div>
      <button onClick={logout} className="px-3 py-1 rounded-xl border">Logout</button>
    </div>
  );
}

