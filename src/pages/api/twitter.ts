import { Redis } from '@upstash/redis'

export const prerender = false

// Crear cliente Redis con las credenciales de Upstash
const redis = new Redis({
  url: import.meta.env.KV_REST_API_URL,
  token: import.meta.env.KV_REST_API_TOKEN
})

interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url: string
}

interface TwitterTweet {
  id: string
  text: string
  created_at: string
  public_metrics?: {
    like_count: number
    retweet_count: number
    reply_count: number
  }
}

interface Tweet {
  id: string
  text: string
  created_at: string
  url: string
  author: {
    name: string
    username: string
    avatar: string
  }
  metrics?: {
    likes: number
    retweets: number
    replies: number
  }
}

interface CachedData {
  tweets: Tweet[]
  lastFetch: number
  lastSuccessfulFetch: number
}

const TWITTER_BEARER_TOKEN = import.meta.env.TWITTER_BEARER_TOKEN
const TWITTER_USERNAME = 'EnduEnjoyers'
const CACHE_KEY = 'twitter:cache'
const CACHE_DURATION = 12 * 60 * 60 * 1000 // 12 horas en milisegundos

// Funciones de caché usando Upstash Redis
async function readCache (): Promise<CachedData | null> {
  try {
    console.log('Intentando leer caché de Redis...')
    const data = await redis.get<CachedData>(CACHE_KEY)
    console.log('Caché leído:', data ? `${data.tweets.length} tweets` : 'vacío')
    return data
  } catch (error) {
    console.error('Error reading cache from Redis:', error)
    return null
  }
}

async function writeCache (tweets: Tweet[]): Promise<void> {
  try {
    const cacheData: CachedData = {
      tweets,
      lastFetch: Date.now(),
      lastSuccessfulFetch: Date.now()
    }
    // TTL de 24 horas para mantener los datos incluso si no hay tráfico
    await redis.set(CACHE_KEY, cacheData, { ex: 86400 })
  } catch (error) {
    console.error('Error writing cache to Redis:', error)
  }
}

async function updateCacheTimestamp (): Promise<void> {
  try {
    const cache = await readCache()
    if (cache) {
      cache.lastFetch = Date.now()
      await redis.set(CACHE_KEY, cache, { ex: 86400 })
    }
  } catch (error) {
    console.error('Error updating cache timestamp:', error)
  }
}

async function fetchTweetsFromTwitterAPI (): Promise<{ tweets: Tweet[], error?: string }> {
  if (!TWITTER_BEARER_TOKEN) {
    console.error('TWITTER_BEARER_TOKEN no está configurado')
    return { tweets: [], error: 'TWITTER_BEARER_TOKEN no configurado en variables de entorno' }
  }

  // Verificar que las credenciales de Redis estén configuradas
  if (!import.meta.env.KV_REST_API_URL || !import.meta.env.KV_REST_API_TOKEN) {
    console.warn('Variables de Redis no configuradas - KV_REST_API_URL o KV_REST_API_TOKEN')
  }

  // Limpiar el token por si tiene espacios o saltos de línea
  const cleanToken = TWITTER_BEARER_TOKEN.trim()

  try {
    // Primero obtener el ID del usuario
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${TWITTER_USERNAME}?user.fields=profile_image_url`,
      {
        headers: {
          Authorization: `Bearer ${cleanToken}`
        }
      }
    )

    if (!userResponse.ok) {
      const errorText = await userResponse.text()

      // Detectar error de rate limit
      if (userResponse.status === 429) {
        return { tweets: [], error: 'Rate limit excedido - espera 15 minutos' }
      }
      if (userResponse.status === 403) {
        return { tweets: [], error: 'Error 403: Token inválido o sin permisos. Verifica tu plan de Twitter API (necesitas Basic o superior para leer tweets)' }
      }
      if (userResponse.status === 401) {
        return { tweets: [], error: 'Error 401: Token no autorizado. Regenera el Bearer Token en Twitter Developer Portal' }
      }
      return { tweets: [], error: `Error API Twitter: ${userResponse.status} - ${errorText}` }
    }

    const userData = await userResponse.json()
    const user: TwitterUser = userData.data

    // Obtener   tweets del usuario
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${user.id}/tweets?max_results=6&tweet.fields=created_at,public_metrics&exclude=retweets,replies`,
      {
        headers: {
          Authorization: `Bearer ${cleanToken}`
        }
      }
    )

    if (!tweetsResponse.ok) {
      const errorText = await tweetsResponse.text()
      console.error('Error fetching tweets:', errorText)

      if (tweetsResponse.status === 429) {
        return { tweets: [], error: 'Rate limit excedido' }
      }
      return { tweets: [], error: `Error API: ${tweetsResponse.status}` }
    }

    const tweetsData = await tweetsResponse.json()
    const tweets: TwitterTweet[] = tweetsData.data || []

    const formattedTweets = tweets.map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      url: `https://twitter.com/${TWITTER_USERNAME}/status/${tweet.id}`,
      author: {
        name: user.name,
        username: user.username,
        avatar: user.profile_image_url?.replace('_normal', '_200x200') || '/logo.webp'
      },
      metrics: tweet.public_metrics
        ? {
            likes: tweet.public_metrics.like_count,
            retweets: tweet.public_metrics.retweet_count,
            replies: tweet.public_metrics.reply_count
          }
        : undefined
    }))

    return { tweets: formattedTweets }
  } catch (error) {
    console.error('Error fetching from Twitter API:', error)
    return { tweets: [], error: 'Error de conexión' }
  }
}

export async function GET () {
  try {
    // Leer caché existente
    const cache = await readCache()
    const now = Date.now()

    // Si el caché es válido (menos de 15 min), devolver caché
    if (cache && (now - cache.lastFetch) < CACHE_DURATION) {
      console.log('Devolviendo tweets desde caché (aún válido)')
      return new Response(JSON.stringify({
        tweets: cache.tweets,
        fromCache: true,
        cacheAge: Math.round((now - cache.lastSuccessfulFetch) / 1000 / 60) // minutos
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      })
    }

    console.log('Caché expirado o no existe, obteniendo tweets nuevos...')

    // Intentar obtener tweets frescos
    const { tweets, error } = await fetchTweetsFromTwitterAPI()

    if (tweets.length > 0) {
      // Éxito: guardar en caché y devolver
      await writeCache(tweets)
      console.log('Tweets obtenidos de la API y guardados en caché')

      return new Response(JSON.stringify({
        tweets,
        fromCache: false
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      })
    }

    // Error al obtener tweets: usar caché si existe
    if (cache && cache.tweets.length > 0) {
      // Actualizar timestamp para no reintentar inmediatamente
      await updateCacheTimestamp()
      console.log('Error en API, devolviendo tweets desde caché antiguo')

      return new Response(JSON.stringify({
        tweets: cache.tweets,
        fromCache: true,
        cacheAge: Math.round((now - cache.lastSuccessfulFetch) / 1000 / 60),
        warning: error || 'Usando datos en caché debido a límite de API'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      })
    }

    // No hay caché ni tweets nuevos
    return new Response(JSON.stringify({
      tweets: [],
      error: error || 'No se pudieron obtener los tweets y no hay caché disponible'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error en endpoint de Twitter:', error)

    // Último recurso: intentar devolver caché
    const cache = await readCache()
    if (cache && cache.tweets.length > 0) {
      return new Response(JSON.stringify({
        tweets: cache.tweets,
        fromCache: true,
        error: 'Error del servidor, usando caché'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      tweets: [],
      error: 'Error al obtener tweets'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
