'use client';
import { useEffect } from 'react';

export default function TestProfilePage() {
  // ✅ Этот лог сработает, если компонент смонтируется
  useEffect(() => {
    console.log('🔍 [TestProfilePage] ✅ MOUNTED - routing works!');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">✅ TEST PROFILE PAGE</h1>
        <p className="text-gray-600">test-second: Если ты видишь этот текст — роутинг работает.</p>
        <p className="text-sm text-gray-400 mt-4">Check console for logs.</p>
      </div>
    </div>
  );
}