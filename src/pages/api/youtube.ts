export async function GET({ url }): Promise<Response> {
  try {
    const YOUTUBE_API_KEY = import.meta.env.YOUTUBE_API_KEY
    const CHANNEL_IDS_STRING = import.meta.env.YOUTUBE_CHANNEL_IDS || ''

    // Separar los IDs de canales por comas y limpiar espacios
    const channelIds = CHANNEL_IDS_STRING.split(',').map(id => id.trim()).filter(id => id.length > 0)
    console.log('Canales a procesar:', channelIds)

    let allVideos = []

    // Obtener videos de cada canal
    for (const channelId of channelIds) {
      try {
        // Obtener videos del canal
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?` +
          `key=${YOUTUBE_API_KEY}&` +
          `channelId=${channelId}&` +
          `part=snippet&` +
          `order=date&` +
          `maxResults=4&` +
          `type=video&` 
        )

        if (!response.ok) {
          console.error(`Error en canal ${channelId}: ${response.status}`)
          continue
        }

        const data = await response.json()
        
        if (data.items && data.items.length > 0) {
          // Obtener detalles adicionales de los videos
          const videoIds = data.items.map(item => item.id.videoId).join(',')
          const detailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?` +
            `key=${YOUTUBE_API_KEY}&` +
            `id=${videoIds}&` +
            `part=contentDetails,statistics`
          )

          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json()

            // Combinar datos de este canal
            const channelVideos = data.items.map((item, index) => {
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
                channelId: channelId,
                channelTitle: item.snippet.channelTitle
              }
            })

            allVideos.push(...channelVideos)
            console.log(`Obtenidos ${channelVideos.length} videos del canal ${channelId}`)
          }
        }
      } catch (channelError) {
        console.error(`Error procesando canal ${channelId}:`, channelError)
        continue
      }
    }

    // Ordenar todos los videos por fecha de publicación (más recientes primero)
    allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    console.log(`Total de videos obtenidos: ${allVideos.length}`)

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
