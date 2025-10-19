'use client';
import TopBar from '@/app/components/TopBar';
import Link from 'next/link';

export default function ChoosePage() {
  return (
    <div className="space-y-6">
      <TopBar />
      <h1 className="text-2xl font-bold">اختر الوجهة</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href="/dashboard" className="block bg-white rounded-2xl p-8 border hover:shadow">
          <div className="text-lg font-semibold mb-2">إدارة البيانات</div>
          <div className="text-gray-600 text-sm">لوحة التحكم لإدارة الخلاصات والحساب</div>
        </Link>
        <Link href="/posts" className="block bg-white rounded-2xl p-8 border hover:shadow">
          <div className="text-lg font-semibold mb-2">عرض البوستات</div>
          <div className="text-gray-600 text-sm">تصفح أحدث المنشورات من كل الخلاصات</div>
        </Link>
      </div>
    </div>
  );
}

