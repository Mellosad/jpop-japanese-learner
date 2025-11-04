"use client";
import { useParams } from "next/navigation";
import { sampleSongs } from "@/data/songs";
import { YouTubeEmbed } from "@next/third-parties/google";

export default function LearnPage() {
  const params = useParams();
  const songId = parseInt(params.id);
  const song = sampleSongs.find((s) => s.id === songId);

  if (!song) {
    return <div>노래를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {song.title} - {song.artist}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 유튜브 플레이어 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">음악 플레이어</h2>
            <YouTubeEmbed
              videoid={song.youtubeId}
              height={400}
              params="controls=1"
            />
          </div>

          {/* 오른쪽: 가사 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">가사</h2>
            <div className="space-y-4">
              {song.lyrics.map((line, index) => (
                <div key={index} className="border-b pb-3">
                  <p className="text-lg font-medium">{line.japanese}</p>
                  <p className="text-sm text-gray-600 mt-1">{line.korean}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
