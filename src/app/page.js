'use client'
import { useState } from 'react';
import Link from 'next/link';
import { useVocabulary } from '@/contexts/VocabularyContext';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { vocabulary } = useVocabulary();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 헤더 */}
      <nav className="backdrop-blur-sm bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            J-Pop 일본어
          </h1>
          <div className="flex gap-3">
            <Link href="/vocabulary">
              <button className="px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 text-blue-600 font-medium transition-all hover:shadow-lg flex items-center gap-2">
                <span>⭐</span>
                <span className="hidden sm:inline">단어장</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm font-bold">{vocabulary.length}</span>
              </button>
            </Link>
            <Link href="/history">
              <button className="px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 text-purple-600 font-medium transition-all hover:shadow-lg flex items-center gap-2">
                <span>📝</span>
                <span className="hidden sm:inline">기록</span>
              </button>
            </Link>
            <Link href="/stats">
              <button className="px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 text-green-600 font-medium transition-all hover:shadow-lg flex items-center gap-2">
                <span>📊</span>
                <span className="hidden sm:inline">통계</span>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* 히어로 섹션 */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-6xl">🎵</span>
          </div>
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            J-Pop으로 일본어 배우기
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            좋아하는 노래를 들으면서 즐겁게 일본어를 마스터하세요
          </p>
        </div>

        {/* 검색 박스 */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all">
            <label className="block text-lg font-bold text-blue-700 mb-4">
              노래 검색
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="노래 제목과 아티스트 입력 (예: Lemon Kenshi Yonezu)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-blue-900 placeholder-gray-400 transition-all text-lg"
              />
              <button 
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all text-lg"
              >
                검색
              </button>
            </div>
          </div>
        </form>

        {/* 기능 카드 */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all">
            <div className="text-4xl mb-3">🎧</div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">음악과 함께 학습</h3>
            <p className="text-blue-600">YouTube 플레이어로 실제 노래를 들으면서 가사를 번역해보세요</p>
          </div>
          
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">AI 번역 평가</h3>
            <p className="text-blue-600">Google Gemini AI가 여러분의 번역을 평가하고 피드백을 제공합니다</p>
          </div>
          
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">스마트 단어장</h3>
            <p className="text-blue-600">모르는 단어를 저장하고 플래시카드로 복습하세요</p>
          </div>
          
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">학습 통계</h3>
            <p className="text-blue-600">연속 학습일과 학습 기록을 추적하며 동기부여를 받으세요</p>
          </div>
        </div>

        {/* 사용 방법 */}
        <div className="backdrop-blur-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-200/30">
          <h3 className="font-bold mb-6 text-blue-800 text-2xl flex items-center gap-2">
            <span>💡</span>
            <span>사용 방법</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <p className="text-blue-900 font-medium pt-1">좋아하는 J-Pop 노래를 검색하세요</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <p className="text-blue-900 font-medium pt-1">YouTube에서 노래를 들으면서 가사를 한 줄씩 번역하세요</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <p className="text-blue-900 font-medium pt-1">AI가 번역을 평가하고 개선점을 알려줍니다</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <p className="text-blue-900 font-medium pt-1">모르는 단어는 단어장에 저장하고 복습하세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
