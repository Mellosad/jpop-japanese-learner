import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TRANSLATIONS_FILE = path.join(process.cwd(), 'public', 'translations.json');

// 번역 사전 읽기
function getTranslations() {
  try {
    if (fs.existsSync(TRANSLATIONS_FILE)) {
      const data = fs.readFileSync(TRANSLATIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Translation file read error:', error);
  }
  return {};
}

// 번역 사전 저장
function saveTranslation(word, translation) {
  try {
    const translations = getTranslations();
    translations[word] = translation;
    fs.writeFileSync(TRANSLATIONS_FILE, JSON.stringify(translations, null, 2), 'utf8');
  } catch (error) {
    console.error('Translation file write error:', error);
  }
}

export async function POST(request) {
  try {
    const { text } = await request.json();

    // 1. 먼저 사전에서 확인
    const translations = getTranslations();
    if (translations[text]) {
      console.log(`✅ 캐시에서 가져옴: ${text} -> ${translations[text]}`);
      return NextResponse.json({ 
        translation: translations[text],
        fromCache: true 
      });
    }

    // 2. 사전에 없으면 API 호출
    console.log(`🔍 API 호출: ${text}`);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다');
    }

    const prompt = `다음 일본어 단어를 한국어로 간단하게 번역해주세요. 단어의 가장 일반적인 의미만 한 줄로 답변해주세요:\n\n${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '번역 실패');
    }

    const data = await response.json();
    const translation = data.candidates[0].content.parts[0].text.trim();

    // 3. 번역 결과를 사전에 저장
    saveTranslation(text, translation);
    console.log(`💾 사전에 저장됨: ${text} -> ${translation}`);

    return NextResponse.json({ 
      translation,
      fromCache: false 
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ 
      error: '번역 중 오류가 발생했습니다' 
    }, { status: 500 });
  }
}

// GET 요청: 전체 사전 조회
export async function GET() {
  try {
    const translations = getTranslations();
    return NextResponse.json({ 
      translations,
      count: Object.keys(translations).length 
    });
  } catch (error) {
    return NextResponse.json({ error: '사전 조회 실패' }, { status: 500 });
  }
}
