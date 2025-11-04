'use client'
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useVocabulary } from '@/contexts/VocabularyContext';

export default function ResultPage() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title');
  const artist = searchParams.get('artist');
  const lyrics = searchParams.get('lyrics');
  const translationsParam = searchParams.get('translations');
  
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);
  
  const { addEvaluationRecord } = useVocabulary();
  
  const lyricsLines = lyrics ? lyrics.split('\n').filter(line => line.trim() !== '') : [];
  const translations = translationsParam ? JSON.parse(translationsParam) : {};

  const extractScore = (evaluationText) => {
    const scoreMatch = evaluationText.match(/(\d+)점|(\d+)\/100|점수[:\s]*(\d+)/i);
    if (scoreMatch) {
      return parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]);
    }
    return null;
  };

  const handleAiEvaluation = async () => {
    setEvaluating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lyrics: lyricsLines,
          translations: translations
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setAiEvaluation(data.evaluation);
        
        // 평가 기록 저장
        addEvaluationRecord({
          songTitle: title,
          songArtist: artist,
          translations: translations,
          evaluation: data.evaluation,
          score: extractScore(data.evaluation)
        });
      } else {
        setError(data.error || '평가 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setEvaluating(false);
    }
  };

  const translatedCount = Object.keys(translations).length;
  const totalLines = lyricsLines.length;
  const completionRate = Math.round((translatedCount / totalLines) * 100);

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
        {/* 완료 배너 */}
        <div className="backdrop-blur-lg bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl p-8 mb-8 border border-green-200/30 shadow-xl text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            학습 완료!
          </h1>
          <p className="text-green-700 text-xl font-medium">
            {translatedCount}개 문장 번역 ({completionRate}%)
          </p>
        </div>

        {/* 노래 정보 */}
        <div className="backdrop-blur-lg bg-white/70 rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {title}
          </h2>
          <p className="text-blue-700 font-medium text-lg">{artist}</p>
        </div>

        {/* 번역 결과 */}
        <div className="space-y-4 mb-8">
          {lyricsLines.map((line, index) => (
            <div key={index} className="backdrop-blur-lg bg-white/80 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
              <div className="mb-4">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  가사 {index + 1}
                </span>
                <p className="text-2xl font-bold text-blue-900 mt-3">{line}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <span className="text-xs font-bold text-indigo-700 block mb-2">내 번역</span>
                {translations[index] ? (
                  <p className="text-xl text-indigo-900 font-medium">{translations[index]}</p>
                ) : (
                  <p className="text-gray-400 italic">번역하지 않음</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI 평가 섹션 */}
        <div className="backdrop-blur-lg bg-white/80 rounded-2xl p-8 border border-white/20 shadow-xl mb-8">
          {!aiEvaluation && !evaluating && (
            <div className="text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-blue-800 mb-3">
                AI에게 평가받기
              </h3>
              <p className="text-blue-600 mb-6">
                Google Gemini AI가 여러분의 번역을 평가하고 피드백을 제공합니다
              </p>
              <button
                onClick={handleAiEvaluation}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                🤖 AI 평가 받기
              </button>
            </div>
          )}
          
          {evaluating && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mb-4"></div>
              <p className="text-green-700 text-lg font-bold">AI가 평가 중입니다...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <p className="text-red-700 font-bold">❌ {error}</p>
            </div>
          )}
          
          {aiEvaluation && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🎓</span>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  AI 평가 결과
                </h3>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <pre className="whitespace-pre-wrap text-green-900 font-sans leading-relaxed">
                  {aiEvaluation}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/history">
            <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-xl hover:from-purple-500 hover:to-pink-600 font-bold shadow-lg hover:shadow-xl transition-all">
              📝 평가 기록 보기
            </button>
          </Link>
          <Link href="/vocabulary">
            <button className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 font-bold shadow-lg hover:shadow-xl transition-all">
              ⭐ 내 단어장 보기
            </button>
          </Link>
          <Link href="/">
            <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all">
              🎵 다른 노래 학습
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
