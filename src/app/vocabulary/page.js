'use client'
import { useVocabulary } from '@/contexts/VocabularyContext';
import Link from 'next/link';
import { useState } from 'react';

export default function VocabularyPage() {
  const { vocabulary, removeWord } = useVocabulary();
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffledVocab, setShuffledVocab] = useState([]);

  const getPosKorean = (pos) => {
    const posMap = {
      '名詞': '명사',
      '動詞': '동사',
      '形容詞': '형용사',
      '副詞': '부사',
      '助詞': '조사',
      '助動詞': '조동사',
      '接続詞': '접속사',
      '感動詞': '감탄사',
      '記号': '기호',
      '接頭詞': '접두사'
    };
    return posMap[pos] || pos;
  };

  const startQuiz = () => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    setShuffledVocab(shuffled);
    setCurrentQuizIndex(0);
    setShowAnswer(false);
    setQuizMode(true);
  };

  const nextWord = () => {
    if (currentQuizIndex < shuffledVocab.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setShowAnswer(false);
    } else {
      setQuizMode(false);
    }
  };

  const previousWord = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
      setShowAnswer(false);
    }
  };

  if (quizMode && shuffledVocab.length > 0) {
    const currentWord = shuffledVocab[currentQuizIndex];
    const progress = ((currentQuizIndex + 1) / shuffledVocab.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* 헤더 */}
        <nav className="backdrop-blur-sm bg-white/70 border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <button 
              onClick={() => setQuizMode(false)}
              className="text-blue-600 hover:text-blue-700 font-bold text-lg flex items-center gap-2"
            >
              <span>←</span>
              <span>단어장으로</span>
            </button>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium mb-1">진행률</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {currentQuizIndex + 1} / {shuffledVocab.length}
              </div>
            </div>
          </div>
          <div className="w-full bg-blue-100 h-1">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="backdrop-blur-lg bg-white/80 rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
            <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-12">
              {currentWord.text}
            </div>

            {showAnswer ? (
              <div className="space-y-6 mb-12 animate-fade-in">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <p className="text-sm font-bold text-blue-700 mb-2">읽기</p>
                  <p className="text-4xl text-blue-900 font-medium">{currentWord.reading}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                  <p className="text-sm font-bold text-indigo-700 mb-2">기본형</p>
                  <p className="text-3xl text-indigo-900 font-medium">{currentWord.baseForm}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <p className="text-sm font-bold text-purple-700 mb-2">품사</p>
                  <p className="text-2xl text-purple-900 font-bold">{getPosKorean(currentWord.pos)}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-200">
                  <p className="text-sm text-blue-700 font-medium">🎵 {currentWord.songTitle}</p>
                  <p className="text-sm text-blue-600 mt-1">👤 {currentWord.songArtist}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="mb-12 px-12 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 font-bold text-2xl shadow-xl hover:shadow-2xl transition-all"
              >
                답 보기 👀
              </button>
            )}

            <div className="flex gap-4">
              <button
                onClick={previousWord}
                disabled={currentQuizIndex === 0}
                className="flex-1 px-6 py-4 bg-white/80 text-blue-600 rounded-xl hover:bg-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-bold border border-white/20 shadow-lg transition-all"
              >
                ← 이전
              </button>
              <button
                onClick={nextWord}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                {currentQuizIndex === shuffledVocab.length - 1 ? '완료 ✓' : '다음 →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 헤더 */}
      <nav className="backdrop-blur-sm bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <button className="text-blue-600 hover:text-blue-700 font-bold text-lg flex items-center gap-2">
              <span>←</span>
              <span>홈으로</span>
            </button>
          </Link>
          {vocabulary.length > 0 && (
            <button
              onClick={startQuiz}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold shadow-lg hover:shadow-xl transition-all"
            >
              📝 단어 복습 시작
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <span>⭐</span>
            <span>내 단어장</span>
          </h1>
          <p className="text-blue-700 text-xl font-medium">총 {vocabulary.length}개의 단어</p>
        </div>

        {vocabulary.length === 0 ? (
          <div className="backdrop-blur-lg bg-white/80 rounded-3xl p-16 border border-white/20 shadow-2xl text-center">
            <div className="text-8xl mb-6">📚</div>
            <p className="text-blue-800 text-2xl mb-4 font-bold">저장된 단어가 없습니다</p>
            <p className="text-blue-600 text-lg mb-8">노래를 학습하면서 모르는 단어를 저장해보세요!</p>
            <Link href="/">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                노래 검색하기 →
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {vocabulary.map((word) => (
                <div key={word.id} className="backdrop-blur-lg bg-white/80 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {word.text}
                        </h3>
                        <span className="text-2xl text-blue-700 font-medium">({word.reading})</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <span className="text-xs font-bold text-blue-700 block mb-1">기본형</span>
                          <span className="text-lg text-blue-900 font-medium">{word.baseForm}</span>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                          <span className="text-xs font-bold text-indigo-700 block mb-1">품사</span>
                          <span className="text-lg text-indigo-900 font-bold">{getPosKorean(word.pos)}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-blue-700 font-medium">🎵 {word.songTitle}</p>
                        <p className="text-sm text-blue-600 mt-1">👤 {word.songArtist}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeWord(word.id)}
                      className="ml-4 bg-red-100 text-red-600 px-4 py-2 rounded-xl hover:bg-red-200 font-medium transition-all shadow-sm hover:shadow-md"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 학습 팁 */}
            <div className="backdrop-blur-lg bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl p-8 border border-blue-200/30">
              <h3 className="font-bold text-blue-800 text-2xl mb-4 flex items-center gap-2">
                <span>💡</span>
                <span>학습 팁</span>
              </h3>
              <div className="space-y-3">
                <p className="text-blue-900 font-medium flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>매일 단어장을 복습하세요</span>
                </p>
                <p className="text-blue-900 font-medium flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>예문을 만들어보면 더 잘 기억됩니다</span>
                </p>
                <p className="text-blue-900 font-medium flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>노래를 다시 들으면서 단어를 떠올려보세요</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
