import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { lyrics, translations } = await request.json();

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다');
    }

    let prompt = "다음은 일본어 가사와 사용자의 한국어 번역입니다. 번역의 정확도를 평가하고 점수(100점 만점)와 피드백을 제공해주세요.\n\n";
    
    Object.keys(translations).forEach(index => {
      const lineIndex = parseInt(index);
      prompt += `가사 ${lineIndex + 1}: ${lyrics[lineIndex]}\n`;
      prompt += `번역: ${translations[index]}\n\n`;
    });

    prompt += "\n평가 형식:\n점수: X점/100점\n\n피드백:\n- 잘한 점:\n- 개선할 점:\n- 추천 표현:";

    // gemini-flash-latest 모델 사용
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
      console.error('Gemini API Error:', errorData);
      throw new Error(errorData.error?.message || 'API 호출 실패');
    }

    const data = await response.json();
    
    // 응답 구조 확인
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('AI 응답 형식이 올바르지 않습니다');
    }
    
    const evaluation = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ 
      error: 'AI 평가 중 오류가 발생했습니다: ' + error.message 
    }, { status: 500 });
  }
}
