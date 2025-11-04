'use client'
import { useVocabulary } from '@/contexts/VocabularyContext';
import Link from 'next/link';
import { useState } from 'react';

export default function HistoryPage() {
  const { evaluationHistory, removeEvaluationRecord } = useVocabulary();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  
  const itemsPerPage = 5;
  const totalPages = Math.ceil(evaluationHistory.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = evaluationHistory.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month}월 ${day}일 ${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getDaysAgo = (dateString) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    return `${days}일 전`;
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 타이틀 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-3">
            <span>📝</span>
            <span>평가 기록</span>
          </h1>
          <p className="text-blue-700 text-xl font-medium mt-2">
            총 {evaluationHistory.length}개의 평가 기록 (1주일 후 자동 삭제)
          </p>
        </div>

        {currentItems.length === 0 ? (
          <div className="backdrop-blur-lg bg-white/80 rounded-3xl p-16 border border-white/20 shadow-2xl text-center">
            <div className="text-8xl mb-6">📋</div>
            <p className="text-blue-800 text-2xl mb-4 font-bold">평가 기록이 없습니다</p>
            <p className="text-blue-600 text-lg mb-8">노래를 학습하고 AI 평가를 받아보세요!</p>
            <Link href="/">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                노래 검색하기 →
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* 평가 기록 리스트 */}
            <div className="space-y-6 mb-8">
              {currentItems.map((record, index) => (
                <div key={record.id} className="backdrop-blur-lg bg-white/80 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {startIndex + index + 1}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {record.songTitle}
                          </h3>
                          <p className="text-blue-600 font-medium">{record.songArtist}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {record.score && (
                          <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-1">
                            {record.score}점
                          </div>
                        )}
                        <div className="text-sm text-blue-600 font-medium">{getDaysAgo(record.date)}</div>
                        <div className="text-xs text-blue-500">{formatDate(record.date)}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-bold text-blue-700 mb-2">
                        번역 완료: {Object.keys(record.translations).length}개 문장
                      </div>
                    </div>

                    {/* 상세 보기 토글 */}
                    <button
                      onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl hover:from-blue-100 hover:to-indigo-100 font-bold transition-all border border-blue-200"
                    >
                      {expandedId === record.id ? '▲ 접기' : '▼ 상세 보기'}
                    </button>

                    {/* 상세 내용 */}
                    {expandedId === record.id && (
                      <div className="mt-4 space-y-4 animate-fade-in">
                        {/* AI 평가 */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                            <span>🤖</span>
                            <span>AI 평가</span>
                          </h4>
                          <pre className="whitespace-pre-wrap text-green-900 font-sans leading-relaxed text-sm">
                            {record.evaluation}
                          </pre>
                        </div>

                        {/* 내 번역 */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                          <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                            <span>✍️</span>
                            <span>내 번역</span>
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(record.translations).map(([index, translation]) => (
                              <div key={index} className="text-sm">
                                <span className="text-blue-600 font-bold">{parseInt(index) + 1}. </span>
                                <span className="text-blue-900">{translation}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => {
                            if (confirm('이 평가 기록을 삭제하시겠습니까?')) {
                              removeEvaluationRecord(record.id);
                            }
                          }}
                          className="w-full px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 font-bold transition-all"
                        >
                          🗑️ 삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-5 py-3 bg-white/80 text-blue-600 rounded-xl hover:bg-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-bold border border-white/20 shadow-md hover:shadow-lg transition-all"
                >
                  ← 이전
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  
                  const showPage = 
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 2 && pageNum <= currentPage + 2);
                  
                  const showDots = 
                    (pageNum === 2 && currentPage > 4) ||
                    (pageNum === totalPages - 1 && currentPage < totalPages - 3);
                  
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
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-500 shadow-lg'
                          : 'bg-white/80 text-blue-600 hover:bg-white border-white/20 hover:shadow-lg'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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
