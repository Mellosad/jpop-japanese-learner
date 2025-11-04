"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import kuromoji from "kuromoji";
import { useVocabulary } from "@/contexts/VocabularyContext";

export default function LearnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const title = searchParams.get("title");
  const artist = searchParams.get("artist");

  const [lyrics, setLyrics] = useState(null);
  const [lyricsLines, setLyricsLines] = useState([]);
  const [tokenizedLines, setTokenizedLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLyrics, setLoadingLyrics] = useState(true);
  const [error, setError] = useState(null);

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentTranslation, setCurrentTranslation] = useState("");
  const [allTranslations, setAllTranslations] = useState({});

  const [videoId, setVideoId] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [isLooping, setIsLooping] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const [selectedWord, setSelectedWord] = useState(null);

  const { addWord, isWordSaved } = useVocabulary();

  useEffect(() => {
    if (title && artist) {
      fetchLyrics();
      searchYouTube();
    }
  }, [title, artist]);

  const searchYouTube = async () => {
    try {
      const response = await fetch("/api/youtube-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, artist }),
      });

      const data = await response.json();
      if (response.ok && data.videoId) {
        setVideoId(data.videoId);
      }
    } catch (error) {
      console.error("YouTube search error:", error);
    }
  };

  const fetchLyrics = async () => {
    setLoadingLyrics(true);
    setError(null);

    try {
      const response = await fetch("/api/lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, artist }),
      });

      const data = await response.json();

      if (response.ok && data.lyrics) {
        setLyrics(data.lyrics);
        const lines = data.lyrics
          .split("\n")
          .filter((line) => line.trim() !== "");
        setLyricsLines(lines);
        tokenizeLyrics(lines);
      } else {
        setError("가사를 찾을 수 없습니다.");
        setLoadingLyrics(false);
      }
    } catch (err) {
      setError("가사를 불러오는 중 오류가 발생했습니다.");
      setLoadingLyrics(false);
    }
  };

  const tokenizeLyrics = async (lines) => {
    setLoading(true);

    kuromoji.builder({ dicPath: "/dict/" }).build(async (err, tokenizer) => {
      if (err) {
        console.error("Tokenizer error:", err);
        setLoading(false);
        setLoadingLyrics(false);
        return;
      }

      const tokenized = lines.map((line) => {
        const tokens = tokenizer.tokenize(line);
        return tokens.map((token) => ({
          text: token.surface_form,
          reading: token.reading || token.surface_form,
          baseForm: token.basic_form,
          pos: token.pos,
          posDetail: token.pos_detail_1,
        }));
      });

      setTokenizedLines(tokenized);
      setLoading(false);
      setLoadingLyrics(false);
    });
  };

  const handleWordClick = (token) => {
    setSelectedWord(token);
  };

  const handleSaveWord = () => {
    if (selectedWord) {
      addWord(selectedWord, { title, artist });
      setSelectedWord(null);
    }
  };

  const getPosKorean = (pos) => {
    const posMap = {
      名詞: "명사",
      動詞: "동사",
      形容詞: "형용사",
      副詞: "부사",
      助詞: "조사",
      助動詞: "조동사",
      接続詞: "접속사",
      感動詞: "감탄사",
      記号: "기호",
      接頭詞: "접두사",
    };
    return posMap[pos] || pos;
  };

  const handleNext = () => {
    setAllTranslations((prev) => ({
      ...prev,
      [currentLineIndex]: currentTranslation,
    }));

    if (currentLineIndex < lyricsLines.length - 1) {
      setCurrentLineIndex(currentLineIndex + 1);
      setCurrentTranslation("");
    } else {
      const params = new URLSearchParams({
        title,
        artist,
        lyrics: lyrics,
        translations: JSON.stringify({
          ...allTranslations,
          [currentLineIndex]: currentTranslation,
        }),
      });
      router.push(`/result?${params.toString()}`);
    }
  };

  const handlePrevious = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex(currentLineIndex - 1);
      setCurrentTranslation(allTranslations[currentLineIndex - 1] || "");
    }
  };

  if (loadingLyrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl p-12 text-center border border-white/20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-blue-700 text-xl font-bold">
            가사를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link href="/">
            <button className="mb-6 text-blue-600 hover:text-blue-700 font-bold text-lg flex items-center gap-2">
              <span>←</span>
              <span>홈으로</span>
            </button>
          </Link>
          <div className="backdrop-blur-lg bg-red-50/80 rounded-2xl shadow-xl p-8 border border-red-200">
            <p className="text-red-700 mb-6 font-bold text-xl">❌ {error}</p>
            <Link href="/">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold transition-all">
                다른 노래 검색하기
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentLineIndex + 1) / lyricsLines.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 헤더 */}
      <nav className="backdrop-blur-sm bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <button className="text-blue-600 hover:text-blue-700 font-bold text-lg flex items-center gap-2">
              <span>←</span>
              <span className="hidden sm:inline">홈으로</span>
            </button>
          </Link>
          <div className="text-right">
            <div className="text-sm text-blue-600 font-medium mb-1">진행률</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentLineIndex + 1} / {lyricsLines.length}
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 노래 정보 */}
        <div className="backdrop-blur-lg bg-white/70 rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          <p className="text-blue-700 font-medium text-lg">{artist}</p>
        </div>

        {/* YouTube 플레이어 */}
        {videoId ? (
          <div className="backdrop-blur-lg bg-gradient-to-br from-red-50/80 to-pink-50/80 rounded-2xl p-6 mb-6 border border-red-200/30 shadow-lg">
            <iframe
              key={iframeKey}
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${videoId}?start=${startTime}&end=${endTime}${
                isLooping ? `&loop=1&playlist=${videoId}` : ""
              }`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-xl shadow-lg mb-4"
            ></iframe>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-red-800 mb-2">
                  시작 시간 (초)
                </label>
                <input
                  type="number"
                  value={startTime}
                  onChange={(e) => setStartTime(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-xl text-blue-900 font-bold text-lg focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-red-800 mb-2">
                  종료 시간 (초)
                </label>
                <input
                  type="number"
                  value={endTime}
                  onChange={(e) => setEndTime(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-xl text-blue-900 font-bold text-lg focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsLooping(!isLooping);
                  setIframeKey((prev) => prev + 1);
                }}
                className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                  isLooping
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                }`}
              >
                {isLooping ? "🔁 반복 중..." : "🔁 반복 시작"}
              </button>
              <button
                onClick={() => setIframeKey((prev) => prev + 1)}
                className="px-6 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-bold shadow-lg transition-all"
              >
                🔄 새로고침
              </button>
            </div>

            <p className="text-sm text-red-700 font-medium text-center mt-3">
              💡 {startTime}초 ~ {endTime}초 구간
              {isLooping ? "을 반복합니다" : " 설정"}
            </p>
          </div>
        ) : (
          <div className="backdrop-blur-lg bg-yellow-50/80 rounded-2xl p-6 mb-6 border border-yellow-200/30">
            <p className="text-yellow-800 font-bold text-center">
              🎵 YouTube 영상을 찾는 중...
            </p>
          </div>
        )}

        {/* 현재 가사 */}
        {!loading && tokenizedLines[currentLineIndex] && (
          <div className="backdrop-blur-lg bg-white/80 rounded-2xl p-8 mb-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-full">
                가사 {currentLineIndex + 1}
              </span>
              <span className="text-sm text-blue-600 font-medium">
                {Object.keys(allTranslations).length}개 번역 완료
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {tokenizedLines[currentLineIndex].map((token, tokenIndex) => (
                <button
                  key={tokenIndex}
                  onClick={() => handleWordClick(token)}
                  className="inline-flex items-center gap-1 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3 rounded-xl hover:from-blue-100 hover:to-indigo-100 cursor-pointer border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                >
                  <span className="text-xl font-bold text-blue-900">
                    {token.text}
                  </span>
                  {isWordSaved(token.text) && (
                    <span className="text-yellow-500">⭐</span>
                  )}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-lg font-bold text-blue-800 mb-3">
                💭 번역을 입력하세요
              </label>
              <input
                type="text"
                value={currentTranslation}
                onChange={(e) => setCurrentTranslation(e.target.value)}
                placeholder="여기에 한국어 번역을 입력하세요..."
                className="w-full px-6 py-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 text-blue-900 placeholder-gray-400 text-lg shadow-sm"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* 네비게이션 */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentLineIndex === 0}
            className="flex-1 bg-white/80 text-blue-600 px-6 py-4 rounded-xl hover:bg-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-bold text-lg border border-white/20 shadow-lg hover:shadow-xl transition-all"
          >
            ← 이전
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {currentLineIndex === lyricsLines.length - 1
              ? "결과 보기 ✓"
              : "다음 →"}
          </button>
        </div>

        {/* 단어 모달 */}
        {selectedWord && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedWord(null)}
          >
            <div
              className="backdrop-blur-lg bg-white/95 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                {selectedWord.text}
              </h3>

              <div className="space-y-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-4">
                  <span className="font-bold text-blue-700 text-sm">읽기</span>
                  <p className="text-2xl font-medium text-blue-900 mt-1">
                    {selectedWord.reading}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4">
                  <span className="font-bold text-indigo-700 text-sm">
                    기본형
                  </span>
                  <p className="text-2xl font-medium text-indigo-900 mt-1">
                    {selectedWord.baseForm}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <span className="font-bold text-purple-700 text-sm">
                    품사
                  </span>
                  <p className="text-xl font-medium text-purple-900 mt-1">
                    {getPosKorean(selectedWord.pos)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {!isWordSaved(selectedWord.text) ? (
                  <button
                    onClick={handleSaveWord}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    ⭐ 단어장에 저장
                  </button>
                ) : (
                  <div className="flex-1 bg-gray-100 text-gray-600 px-6 py-4 rounded-xl text-center font-bold">
                    ⭐ 저장됨
                  </div>
                )}
                <button
                  onClick={() => setSelectedWord(null)}
                  className="flex-1 bg-gray-500 text-white px-6 py-4 rounded-xl hover:bg-gray-600 font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
