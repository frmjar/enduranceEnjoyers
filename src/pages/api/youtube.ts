import type { APIRoute } from 'astro'

export const prerender = false

interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  duration: string
  viewCount: string
  channelId: string
  channelTitle: string
}

export const GET: APIRoute = async (): Promise<Response> => {
  try {
    const YOUTUBE_API_KEY: string = import.meta.env.YOUTUBE_API_KEY
    const CHANNEL_IDS_STRING: string = import.meta.env.YOUTUBE_CHANNEL_IDS || ''

    if (!YOUTUBE_API_KEY || !CHANNEL_IDS_STRING) {
      return new Response(JSON.stringify({ videos: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const channelIds = CHANNEL_IDS_STRING.split(',').map(id => id.trim()).filter(id => id.length > 0)

    if (channelIds.length === 0) {
      return new Response(JSON.stringify({ videos: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const allVideos: YouTubeVideo[] = []

    // Obtener videos de cada canal
    for (const channelId of channelIds) {
      try {
        // Obtener videos del canal
        const response = await fetch(
          'https://www.googleapis.com/youtube/v3/search?' +
          `key=${YOUTUBE_API_KEY}&` +
          `channelId=${channelId}&` +
          'part=snippet&' +
          'order=date&' +
          'maxResults=4&' +
          'type=video&'
        )

        if (!response.ok) {
          console.error(`Error en canal ${channelId}: ${response.status}`)
          continue
        }

        const data = await response.json()

        if (data.items && data.items.length > 0) {
          // Obtener detalles adicionales de los videos
          const videoIds: string = data.items.map((item: Record<string, any>) => item.id.videoId).join(',')
          const detailsResponse = await fetch(
            'https://www.googleapis.com/youtube/v3/videos?' +
            `key=${YOUTUBE_API_KEY}&` +
            `id=${videoIds}&` +
            'part=contentDetails,statistics'
          )

          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json()

            // Combinar datos de este canal
            const channelVideos = data.items.map((item: Record<string, any>, index: number) => {
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
                viewCount: details?.statistics.viewCount || '0',
                channelId,
                channelTitle: item.snippet.channelTitle
              }
            })

            allVideos.push(...channelVideos)
          }
        }
      } catch (channelError) {
        console.error(`Error procesando canal ${channelId}:`, channelError)
        continue
      }
    }

    // Ordenar todos los videos por fecha de publicación (más recientes primero)
    allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return new Response(JSON.stringify({ videos: allVideos }), {
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
