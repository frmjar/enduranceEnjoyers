export async function GET({ url }): Promise<Response> {
  try {
    const YOUTUBE_API_KEY = import.meta.env.YOUTUBE_API_KEY
    const CHANNEL_ID = import.meta.env.YOUTUBE_CHANNEL_ID

    // Obtener videos del canal
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `key=${YOUTUBE_API_KEY}&` +
      `channelId=${CHANNEL_ID}&` +
      `part=snippet&` +
      `order=date&` +
      `maxResults=6&` +
      `type=video`
    )

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Obtener detalles adicionales de los videos
    const videoIds = data.items.map(item => item.id.videoId).join(',')
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `key=${YOUTUBE_API_KEY}&` +
      `id=${videoIds}&` +
      `part=contentDetails,statistics`
    )

    const detailsData = await detailsResponse.json()

    // Combinar datos
    const videos = data.items.map((item, index) => {
      const details = detailsData.items[index]
      
      const thumbnails = item.snippet.thumbnails
      const bestThumbnail = thumbnails.maxres?.url || 
                           thumbnails.standard?.url || 
                           thumbnails.high?.url || 
                           thumbnails.medium?.url || 
                           thumbnails.default?.url
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: bestThumbnail,
        publishedAt: item.snippet.publishedAt,
        duration: details?.contentDetails.duration || 'PT0S',
        viewCount: details?.statistics.viewCount || '0'
      }
    })

    return new Response(JSON.stringify({ videos }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Error fetching videos',
      videos: []
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
