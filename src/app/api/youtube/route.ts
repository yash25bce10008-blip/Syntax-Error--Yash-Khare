import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'video'; // 'video' or 'playlist'

    if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

    const apiKey = process.env.YOUTUBE_API_KEY;
    const searchType = type === 'playlist' ? 'playlist' : 'playlist'; // always search for playlists

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=playlist&maxResults=3&relevanceLanguage=en&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error('YouTube API error:', data.error);
      return NextResponse.json({ error: data.error?.message || 'YouTube API error' }, { status: 500 });
    }

    const playlists = (data.items || []).map((item: any) => ({
      id: item.id.playlistId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      url: `https://www.youtube.com/playlist?list=${item.id.playlistId}`,
      description: item.snippet.description,
    }));

    return NextResponse.json({ playlists });
  } catch (err) {
    console.error('Error searching YouTube:', err);
    return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
  }
}
