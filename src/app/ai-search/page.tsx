'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AIPoweredSearch from '@/components/ai-powered-search';

function AISearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

  useEffect(() => {
    document.title = 'AI Project Builder | Smart Tech Stack Recommendations';
  }, []);

  return <AIPoweredSearch initialQuery={initialQuery} />;
}

function AISearchFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-gray-400">Loading...</div>
    </div>
  );
}

export default function AISearchPage() {
  return (
    <div className="min-h-screen mt-10 bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
            AI-Powered Project Builder
          </h1>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto font-light">
            Describe your project idea in natural language and get personalized recommendations 
            for the perfect tech stack to build it fast and efficiently.
          </p>
        </div>
        <Suspense fallback={<AISearchFallback />}>
          <AISearchContent />
        </Suspense>
      </div>
    </div>
  );
} 