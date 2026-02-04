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
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 días
const API_CALL_LIMIT_CHECK_KEY = 'twitter:api_calls'
const API_CALLS_PER_MONTH = 100
const CACHE_TTL = 30 * 24 * 60 * 60 // 30 días en segundos

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

async function trackAPICall (): Promise<number> {
  try {
    const calls = await redis.incr(API_CALL_LIMIT_CHECK_KEY)
    await redis.expire(API_CALL_LIMIT_CHECK_KEY, CACHE_TTL)
    return calls
  } catch (error) {
    console.error('Error tracking API call:', error)
    return 0
  }
}

async function getAPICallCount (): Promise<number> {
  try {
    const calls = await redis.get<number>(API_CALL_LIMIT_CHECK_KEY)
    return calls || 0
  } catch (error) {
    console.error('Error getting API call count:', error)
    return 0
  }
}

async function getAPIStatus (): Promise<{ allowed: boolean; callCount: number; remaining: number }> {
  const callCount = await getAPICallCount()
  const remaining = Math.max(0, API_CALLS_PER_MONTH - callCount)
  console.log(`Llamadas API: ${callCount}/${API_CALLS_PER_MONTH}, Restantes: ${remaining}`)
  return { allowed: remaining > 0, callCount, remaining }
}

async function writeCache (tweets: Tweet[]): Promise<void> {
  try {
    const cacheData: CachedData = {
      tweets,
      lastFetch: Date.now(),
      lastSuccessfulFetch: Date.now()
    }
    await redis.set(CACHE_KEY, cacheData, { ex: CACHE_TTL })
  } catch (error) {
    console.error('Error writing cache to Redis:', error)
  }
}

async function formatTweet (user: TwitterUser, tweet: TwitterTweet): Promise<Tweet> {
  return {
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
  }
}

function buildResponse (data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}

async function fetchTweetsFromTwitterAPI (): Promise<{ tweets: Tweet[]; error?: string }> {
  if (!TWITTER_BEARER_TOKEN) {
    console.error('TWITTER_BEARER_TOKEN no está configurado')
    return { tweets: [], error: 'TWITTER_BEARER_TOKEN no configurado' }
  }

  if (!import.meta.env.KV_REST_API_URL || !import.meta.env.KV_REST_API_TOKEN) {
    console.warn('Variables de Redis no configuradas')
  }

  const cleanToken = TWITTER_BEARER_TOKEN.trim()

  try {
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${TWITTER_USERNAME}?user.fields=profile_image_url`,
      { headers: { Authorization: `Bearer ${cleanToken}` } }
    )

    if (!userResponse.ok) {
      const status = userResponse.status
      const errorMap: Record<number, string> = {
        401: 'Token no autorizado',
        403: 'Token inválido o sin permisos',
        429: 'Rate limit excedido'
      }
      return { tweets: [], error: errorMap[status] || `Error ${status}` }
    }

    const { data: user }: { data: TwitterUser } = await userResponse.json()

    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${user.id}/tweets?max_results=6&tweet.fields=created_at,public_metrics&exclude=retweets,replies`,
      { headers: { Authorization: `Bearer ${cleanToken}` } }
    )

    if (!tweetsResponse.ok) {
      console.error(`Error fetching tweets: ${tweetsResponse.status}`)
      return { tweets: [], error: `Error ${tweetsResponse.status}` }
    }

    const { data: tweets }: { data: TwitterTweet[] } = await tweetsResponse.json()
    const formattedTweets = await Promise.all(tweets.map(tweet => formatTweet(user, tweet)))

    return { tweets: formattedTweets }
  } catch (error) {
    console.error('Error fetching from Twitter API:', error)
    return { tweets: [], error: 'Error de conexión' }
  }
}

export async function GET () {
  try {
    const cache = await readCache()
    const now = Date.now()
    const { allowed: canCall, callCount, remaining } = await getAPIStatus()
    const apiStatus = { callsUsed: callCount, callsRemaining: remaining, quotaExceeded: !canCall }

    // Caché válido
    if (cache && (now - cache.lastFetch) < CACHE_DURATION) {
      return buildResponse({
        tweets: cache.tweets,
        fromCache: true,
        cacheAge: Math.round((now - cache.lastSuccessfulFetch) / 1000 / 60),
        apiStatus
      })
    }

    // Cuota agotada y hay caché
    if (!canCall && cache) {
      return buildResponse({
        tweets: cache.tweets,
        fromCache: true,
        cacheAge: Math.round((now - cache.lastSuccessfulFetch) / 1000 / 60),
        warning: 'Cuota de API agotada. Usando datos en caché.',
        apiStatus
      })
    }

    // Cuota agotada sin caché
    if (!canCall) {
      return buildResponse({
        tweets: [],
        error: 'Cuota de API agotada y sin datos en caché',
        apiStatus
      })
    }

    console.log('Obteniendo tweets nuevos...')
    const { tweets, error } = await fetchTweetsFromTwitterAPI()

    // Éxito
    if (tweets.length > 0) {
      const newCallCount = await trackAPICall()
      await writeCache(tweets)
      return buildResponse({
        tweets,
        fromCache: false,
        apiStatus: {
          callsUsed: newCallCount,
          callsRemaining: Math.max(0, API_CALLS_PER_MONTH - newCallCount),
          quotaExceeded: false
        }
      })
    }

    // Error pero hay caché
    if (cache) {
      return buildResponse({
        tweets: cache.tweets,
        fromCache: true,
        cacheAge: Math.round((now - cache.lastSuccessfulFetch) / 1000 / 60),
        warning: error || 'Error en API, usando caché',
        apiStatus
      })
    }

    // Error y sin caché
    return buildResponse({
      tweets: [],
      error: error || 'No se pudieron obtener los tweets',
      apiStatus
    })
  } catch (error) {
    console.error('Error en endpoint:', error)
    const cache = await readCache()
    const callCount = await getAPICallCount()
    const apiStatus = {
      callsUsed: callCount,
      callsRemaining: Math.max(0, API_CALLS_PER_MONTH - callCount),
      quotaExceeded: false
    }

    if (cache?.tweets.length) {
      return buildResponse({
        tweets: cache.tweets,
        fromCache: true,
        error: 'Error del servidor, usando caché',
        apiStatus
      })
    }

    return buildResponse(
      { tweets: [], error: 'Error al obtener tweets', apiStatus },
      500
    )
  }
}
