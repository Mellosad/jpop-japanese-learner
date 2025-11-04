import { NextResponse } from 'next/server';
const geniusLyrics = require('genius-lyrics-api');

// 불필요한 내용 제거 함수
function cleanLyrics(lyrics) {
    if (!lyrics) return '';
    
    // 먼저 큰 덩어리 제거
    lyrics = lyrics.replace(/Contributors.*?(?=\n[^\n]*[\u3040-\u309F\u30A0-\u30FF])/gs, '');
    lyrics = lyrics.replace(/Translations.*?(?=\n[^\n]*[\u3040-\u309F\u30A0-\u30FF])/gs, '');
    lyrics = lyrics.replace(/Romanization.*?(?=\n[^\n]*[\u3040-\u309F\u30A0-\u30FF])/gs, '');
    
    const lines = lyrics.split('\n');
    const cleanedLines = [];
    
    for (let line of lines) {
      const trimmed = line.trim();
      
      // 빈 라인
      if (trimmed === '') continue;
      
      // 제외할 키워드 (대소문자 구분 없이)
      const excludeKeywords = [
        'contributors', 'translations', 'romanization', 'english', 'lyrics',
        'embed', 'you might also like', 'read more', 'translation',
        'see', 'traditional', 'simplified', 'chinese', 'verse', 'chorus',
        'bridge', 'intro', 'outro', 'the song', 'this song', 'compares',
        'bitterness', 'pain', 'where', 'series', 'theme', 'investigators',
        'mysterious', 'homicides', 'unnatural', 'ame', 'sansan', 'king', 'gnu'
      ];
      
      let shouldSkip = false;
      const lowerLine = trimmed.toLowerCase();
      
      for (let keyword of excludeKeywords) {
        if (lowerLine.includes(keyword)) {
          shouldSkip = true;
          break;
        }
      }
      
      if (shouldSkip) continue;
      
      // 숫자만 있는 라인
      if (/^\d+$/.test(trimmed)) continue;
      
      // ... 만 있는 라인
      if (trimmed === '...') continue;
      
      // [Verse 1] 같은 구조 태그
      if (/^\[.*\]$/.test(trimmed)) continue;
      
      // 일본어가 포함되지 않은 라인 제거
      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(trimmed);
      if (!hasJapanese) continue;
      
      // 영어 알파벳만 있는 라인 제거
      const isOnlyEnglish = /^[a-zA-Z\s.,!?'"()\-:]+$/.test(trimmed);
      if (isOnlyEnglish) continue;
      
      cleanedLines.push(trimmed);
    }
    
    return cleanedLines.join('\n');
  }
  

export async function POST(request) {
  try {
    const { title, artist } = await request.json();

    const options = {
      apiKey: process.env.NEXT_PUBLIC_GENIUS_ACCESS_TOKEN,
      title: title,
      artist: artist,
      optimizeQuery: true
    };

    const result = await geniusLyrics.getSong(options);
    
    if (!result || !result.lyrics) {
      return NextResponse.json({ 
        error: 'Lyrics not found',
        lyrics: null 
      }, { status: 404 });
    }

    // 가사 정제
    const cleanedLyrics = cleanLyrics(result.lyrics);

    return NextResponse.json({
      lyrics: cleanedLyrics
    });
  } catch (error) {
    console.error('Lyrics error:', error);
    return NextResponse.json({ 
      error: error.message,
      lyrics: null
    }, { status: 500 });
  }
}
