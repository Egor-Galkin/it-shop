'use client';
import { useEffect } from 'react';

export default function TestAuthPage() {
  useEffect(() => {
    console.log('🔍 [TestAuthPage] Mounted');
    const token = localStorage.getItem('access_token');
    console.log('🔍 [TestAuthPage] Token:', token ? '✓' : '✗');
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl">TEST AUTH PAGE</h1>
      <p>test-first: Если видишь этот текст — роутинг работает.</p>
    </div>
  );
}