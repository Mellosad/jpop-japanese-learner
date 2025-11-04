'use client'
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q');
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      searchSongs(query, currentPage);
    }
  }, [query, currentPage]);

  const searchSongs = async (searchQuery, page) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&page=${page}`);
      const data = await response.json();
      
      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || '노래를 찾을 수 없습니다.');
      }
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 헤더 */}
      <nav className="backdrop-blur-sm bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/">
            <button className="text-blue-600 hover:text-blue-700 font-bold text-lg flex items-center gap-2 transition-all">
              <span>←</span>
              <span>홈으로</span>
            </button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* 검색 정보 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            검색 결과
          </h1>
          <p className="text-xl text-blue-700 font-medium">"{query}"</p>
        </div>

        {loading && (
          <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-blue-700 text-lg font-medium">검색 중...</p>
          </div>
        )}

        {error && (
          <div className="backdrop-blur-lg bg-red-50/80 rounded-2xl shadow-xl p-8 border border-red-200">
            <p className="text-red-700 font-bold text-lg mb-4">❌ {error}</p>
            <Link href="/">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold transition-all">
                다른 노래 검색하기
              </button>
            </Link>
          </div>
        )}

        {results && (
          <>
            <div className="mb-6 backdrop-blur-lg bg-white/70 rounded-xl px-6 py-3 inline-block border border-white/20">
              <span className="text-blue-700 font-bold">
                총 {results.totalSongs}곡 발견
              </span>
              <span className="text-blue-600 mx-2">•</span>
              <span className="text-blue-600 font-medium">
                페이지 {results.currentPage} / {results.totalPages}
              </span>
            </div>

            {/* 노래 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {results.songs.map((song) => (
                <div 
                  key={song.id} 
                  className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 overflow-hidden transition-all group"
                >
                  <div className="flex gap-4 p-6">
                    {song.albumArt && (
                      <div className="flex-shrink-0">
                        <img 
                          src={song.albumArt} 
                          alt={song.title} 
                          className="w-24 h-24 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-blue-800 mb-1 truncate group-hover:text-blue-600 transition-colors">
                          {song.title}
                        </h2>
                        <p className="text-blue-600 font-medium truncate mb-3">
                          {song.artist}
                        </p>
                      </div>
                      
                      <Link href={`/learn?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`}>
                        <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold shadow-md hover:shadow-lg transition-all">
                          학습 시작 →
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {results.totalPages > 1 && (
              <div className="flex justify-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-5 py-3 bg-white/80 text-blue-600 rounded-xl hover:bg-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-bold border border-white/20 shadow-md hover:shadow-lg transition-all"
                >
                  ← 이전
                </button>

                {[...Array(results.totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  
                  const showPage = 
                    pageNum === 1 || 
                    pageNum === results.totalPages || 
                    (pageNum >= currentPage - 2 && pageNum <= currentPage + 2);
                  
                  const showDots = 
                    (pageNum === 2 && currentPage > 4) ||
                    (pageNum === results.totalPages - 1 && currentPage < results.totalPages - 3);
                  
                  if (showDots) {
                    return (
                      <span key={pageNum} className="px-3 py-3 text-blue-600 font-bold">
                        ...
                      </span>
                    );
                  }
                  
                  if (!showPage) {
                    return null;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-5 py-3 rounded-xl font-bold border shadow-md transition-all ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-lg'
                          : 'bg-white/80 text-blue-600 hover:bg-white border-white/20 hover:shadow-lg'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === results.totalPages}
                  className="px-5 py-3 bg-white/80 text-blue-600 rounded-xl hover:bg-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-bold border border-white/20 shadow-md hover:shadow-lg transition-all"
                >
                  다음 →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
