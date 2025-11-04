'use client'
import { useVocabulary } from '@/contexts/VocabularyContext';
import Link from 'next/link';

export default function StatsPage() {
  const { vocabulary, studyHistory } = useVocabulary();

  const totalSongs = studyHistory.length;
  const totalTranslations = studyHistory.reduce((sum, record) => sum + record.translationCount, 0);
  const totalWords = vocabulary.length;

  const recentStudies = studyHistory.slice(0, 10);

  const getStudyStreak = () => {
    if (studyHistory.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedHistory = [...studyHistory].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    const uniqueDates = [...new Set(sortedHistory.map(record => {
      const date = new Date(record.date);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }))];
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      if (uniqueDates.includes(checkDate.getTime())) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month}월 ${day}일 ${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const streak = getStudyStreak();

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
        {/* 타이틀 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent flex items-center gap-3">
            <span>📊</span>
            <span>학습 통계</span>
          </h1>
          <p className="text-blue-700 text-xl font-medium mt-2">나의 학습 여정을 확인해보세요</p>
        </div>

        {/* 통계 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 연속 학습일 */}
          <div className="backdrop-blur-lg bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-2xl p-8 border border-orange-200/30 shadow-xl text-center hover:scale-105 transition-transform">
            <div className="text-6xl mb-4">🔥</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
              {streak}
            </div>
            <div className="text-orange-700 font-bold text-lg">일 연속 학습</div>
          </div>

          {/* 학습한 노래 */}
          <div className="backdrop-blur-lg bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-2xl p-8 border border-blue-200/30 shadow-xl text-center hover:scale-105 transition-transform">
            <div className="text-6xl mb-4">🎵</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent mb-2">
              {totalSongs}
            </div>
            <div className="text-blue-700 font-bold text-lg">학습한 노래</div>
          </div>

          {/* 번역한 문장 */}
          <div className="backdrop-blur-lg bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl p-8 border border-green-200/30 shadow-xl text-center hover:scale-105 transition-transform">
            <div className="text-6xl mb-4">✏️</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
              {totalTranslations}
            </div>
            <div className="text-green-700 font-bold text-lg">번역한 문장</div>
          </div>

          {/* 저장한 단어 */}
          <div className="backdrop-blur-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl p-8 border border-yellow-200/30 shadow-xl text-center hover:scale-105 transition-transform">
            <div className="text-6xl mb-4">⭐</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
              {totalWords}
            </div>
            <div className="text-yellow-700 font-bold text-lg">저장한 단어</div>
          </div>
        </div>

        {/* 최근 학습 기록 */}
        <div className="backdrop-blur-lg bg-white/80 rounded-2xl p-8 border border-white/20 shadow-xl mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <span>📚</span>
            <span>최근 학습 기록</span>
          </h2>
          
          {recentStudies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-blue-600 text-lg font-medium">아직 학습 기록이 없습니다</p>
              <p className="text-blue-500 mt-2">첫 번째 노래를 학습해보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentStudies.map((record, index) => (
                <div 
                  key={record.id} 
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-800 text-xl">{record.songTitle}</h3>
                        <p className="text-blue-600 font-medium">{record.songArtist}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-800 font-bold text-lg">
                        {record.translationCount}문장
                      </div>
                      <div className="text-blue-600 text-sm font-medium">
                        {formatDate(record.date)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 격려 메시지 */}
        {streak > 0 && (
          <div className="backdrop-blur-lg bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl p-8 border border-purple-200/30 text-center mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              {streak}일 연속 학습 달성!
            </h3>
            <p className="text-purple-700 text-lg font-medium">
              {streak < 7 ? '이 기세를 유지하세요!' : 
               streak < 30 ? '정말 대단해요! 계속 해봐요!' : 
               '당신은 진정한 학습 달인입니다! 🏆'}
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/vocabulary">
            <button className="w-full px-8 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2">
              <span>⭐</span>
              <span>내 단어장 보기</span>
            </button>
          </Link>
          <Link href="/">
            <button className="w-full px-8 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2">
              <span>🎵</span>
              <span>새로운 노래 학습하기</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
