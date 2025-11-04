import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { title, artist } = await request.json();
    
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    
    if (!apiKey) {
      // API 키가 없으면 검색 링크만 제공
      return NextResponse.json({ 
        videoId: null,
        error: 'YouTube API key not configured' 
      }, { status: 200 });
    }
    
    const query = encodeURIComponent(`${title} ${artist} official audio`);
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return NextResponse.json({
        videoId: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.default.url
      });
    }
    
    return NextResponse.json({ 
      videoId: null,
      error: 'Video not found' 
    }, { status: 200 });
    
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ 
      videoId: null,
      error: error.message 
    }, { status: 200 });
  }
}
