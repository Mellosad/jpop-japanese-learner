import { NextResponse } from 'next/server';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = 8;

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(query)}&per_page=50`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GENIUS_ACCESS_TOKEN}`
        }
      }
    );

    const data = await response.json();

    if (!data.response.hits || data.response.hits.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // 모든 검색 결과를 배열로 변환
    const allSongs = data.response.hits.map(hit => ({
      title: hit.result.title,
      artist: hit.result.primary_artist.name,
      albumArt: hit.result.song_art_image_thumbnail_url,
      url: hit.result.url,
      id: hit.result.id,
      path: hit.result.path
    }));

    // 페이지네이션 계산
    const totalSongs = allSongs.length;
    const totalPages = Math.ceil(totalSongs / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedSongs = allSongs.slice(startIndex, endIndex);

    return NextResponse.json({
      songs: paginatedSongs,
      currentPage: page,
      totalPages: totalPages,
      totalSongs: totalSongs
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
