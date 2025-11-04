'use client'
import { useEffect, useState, useRef } from 'react';

export default function YouTubePlayer({ title, artist, currentLineIndex, totalLines }) {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatStart, setRepeatStart] = useState(0);
  const [repeatEnd, setRepeatEnd] = useState(10);
  const intervalRef = useRef(null);

  useEffect(() => {
    searchYouTube();
  }, [title, artist]);

  useEffect(() => {
    if (videoId) {
      loadYouTubeAPI();
    }
  }, [videoId]);

  const searchYouTube = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/youtube-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, artist })
      });

      const data = await response.json();
      if (response.ok) {
        setVideoId(data.videoId);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadYouTubeAPI = () => {
    if (window.YT) {
      initPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };
  };

  const initPlayer = () => {
    const ytPlayer = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        origin: window.location.origin
      },
      events: {
        onReady: (event) => {
          setPlayer(event.target);
        }
      }
    });
  };

  const toggleRepeat = () => {
    if (!player) return;

    if (isRepeating) {
      // 반복 중지
      clearInterval(intervalRef.current);
      setIsRepeating(false);
    } else {
      // 반복 시작
      player.seekTo(repeatStart);
      player.playVideo();
      setIsRepeating(true);

      intervalRef.current = setInterval(() => {
        const currentTime = player.getCurrentTime();
        if (currentTime >= repeatEnd) {
          player.seekTo(repeatStart);
        }
      }, 100);
    }
  };

  const handleStartChange = (e) => {
    const value = parseInt(e.target.value);
    setRepeatStart(value);
    if (value >= repeatEnd) {
      setRepeatEnd(value + 5);
    }
  };

  const handleEndChange = (e) => {
    const value = parseInt(e.target.value);
    setRepeatEnd(value);
  };

  const setCurrentLineRepeat = () => {
    if (!player) return;
    
    // 각 가사 라인당 약 5-10초 예상
    const avgLineTime = player.getDuration() / totalLines;
    const start = Math.floor(currentLineIndex * avgLineTime);
    const end = Math.floor((currentLineIndex + 1) * avgLineTime);
    
    setRepeatStart(start);
    setRepeatEnd(end);
    player.seekTo(start);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
        <p className="text-red-700 font-medium">🎵 노래 검색 중...</p>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
        <p className="text-yellow-800 font-medium mb-2">🎵 YouTube에서 노래를 찾을 수 없습니다</p>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-600 hover:underline font-bold"
        >
          YouTube에서 검색하기 →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
      <div className="mb-4">
        <div id="youtube-player" className="w-full aspect-video rounded"></div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 items-center">
          <button
            onClick={toggleRepeat}
            className={`px-6 py-2 rounded-lg font-bold ${
              isRepeating 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isRepeating ? '🔁 반복 중지' : '🔁 구간 반복'}
          </button>

          <button
            onClick={setCurrentLineRepeat}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
          >
            현재 가사 구간 설정
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-red-800 mb-1">
              시작 시간 (초)
            </label>
            <input
              type="number"
              value={repeatStart}
              onChange={handleStartChange}
              className="w-full px-3 py-2 border border-red-300 rounded text-blue-900 font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-red-800 mb-1">
              종료 시간 (초)
            </label>
            <input
              type="number"
              value={repeatEnd}
              onChange={handleEndChange}
              className="w-full px-3 py-2 border border-red-300 rounded text-blue-900 font-medium"
            />
          </div>
        </div>

        <p className="text-sm text-red-700 font-medium">
          💡 {repeatStart}초 ~ {repeatEnd}초 구간을 반복합니다
        </p>
      </div>
    </div>
  );
}
