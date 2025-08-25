import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET
})

export enum CloudinaryFolders {
  EnduranceEnjoyers = 'EnduranceEnjoyers/Galeria',
  General = 'EnduranceEnjoyers/General',
  Novedades = 'EnduranceEnjoyers/Novedades'
}

export const getUrl = ({ publicId, format, width = 1920, height }: { publicId: string, format?: string, width?: number, height?: number }): string => {
  const extension = (typeof format === 'string' && format.trim() !== '') ? `.${format}` : ''
  return cloudinary.url(publicId + extension, {
    resource_type: 'image',
    type: 'upload',
    transformation: [
      { width, height, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good', fetch_format: 'auto' },
      { flags: 'progressive' },
      { dpr: 'auto' }
    ]
  })
}

// Función para generar URL optimizada basada en el contexto de uso
export const getOptimizedUrl = ({
  publicId,
  format,
  context = 'gallery',
  deviceSize = 'desktop'
}: {
  publicId: string
  format?: string
  context?: 'gallery' | 'modal' | 'thumbnail'
  deviceSize?: 'mobile' | 'tablet' | 'desktop' | 'large' | 'extraLarge'
}): string => {
  const extension = (typeof format === 'string' && format.trim() !== '') ? `.${format}` : ''

  // Tamaños optimizados por contexto y dispositivo
  const sizeMap = {
    gallery: {
      mobile: { width: 320, height: 240 },
      tablet: { width: 360, height: 270 },
      desktop: { width: 400, height: 300 },
      large: { width: 300, height: 225 },
      extraLarge: { width: 400, height: 300 }
    },
    modal: {
      mobile: { width: 800 },
      tablet: { width: 1200 },
      desktop: { width: 1600 },
      large: { width: 1920 },
      extraLarge: { width: 2560 }
    },
    thumbnail: {
      mobile: { width: 150, height: 113 },
      tablet: { width: 180, height: 135 },
      desktop: { width: 200, height: 150 },
      large: { width: 200, height: 150 },
      extraLarge: { width: 250, height: 188 }
    }
  }

  const sizeConfig = sizeMap[context][deviceSize]

  // Para modal, solo limitamos el ancho y mantenemos la relación de aspecto
  if (context === 'modal') {
    return cloudinary.url(publicId + extension, {
      resource_type: 'image',
      type: 'upload',
      transformation: [
        { width: sizeConfig.width, crop: 'limit' }, // 'limit' mantiene la relación de aspecto
        { quality: 95, fetch_format: 'webp' },
        { flags: 'progressive' },
        { dpr: 'auto' }
      ]
    })
  }

  // Para gallery y thumbnails usamos crop fill para mantener dimensiones consistentes
  const { width, height } = sizeConfig as { width: number, height: number }

  return cloudinary.url(publicId + extension, {
    resource_type: 'image',
    type: 'upload',
    transformation: [
      { width, height, crop: 'fill', gravity: 'auto' },
      { quality: context === 'thumbnail' ? 80 : 90, fetch_format: 'webp' },
      { flags: 'progressive' },
      { dpr: 'auto' }
    ]
  })
}

export const getImages = async ({ cantidad = 12, folder }: { cantidad?: number, folder?: CloudinaryFolders }): Promise<Array<{
  url: string
  urlMobile: string
  urlTablet: string
  urlDesktop: string
  urlLarge: string
  urlExtraLarge: string
  urlModal: string
  urlModalMobile: string
  urlModalTablet: string
  urlModalDesktop: string
  urlModalLarge: string
  urlModalExtraLarge: string
  name: string
  original: string
  id: string
  title?: string
  description?: string
  alt: string
}>> => {
  try {
    const result = await cloudinary.api.resources_by_asset_folder(folder || '', {
      type: 'upload',
      max_results: cantidad,
      resource_type: 'image',
      context: true
    })

    return result.resources.map((img: any) => {
      const context = img?.context?.custom || {}

      return {
        url: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'gallery', deviceSize: 'desktop' }),
        urlMobile: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'gallery', deviceSize: 'mobile' }),
        urlTablet: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'gallery', deviceSize: 'tablet' }),
        urlDesktop: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'gallery', deviceSize: 'desktop' }),
        urlLarge: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'gallery', deviceSize: 'large' }),
        urlExtraLarge: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'gallery', deviceSize: 'extraLarge' }),
        urlModal: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'modal', deviceSize: 'extraLarge' }),
        urlModalMobile: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'modal', deviceSize: 'mobile' }),
        urlModalTablet: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'modal', deviceSize: 'tablet' }),
        urlModalDesktop: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'modal', deviceSize: 'desktop' }),
        urlModalLarge: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'modal', deviceSize: 'large' }),
        urlModalExtraLarge: getOptimizedUrl({ publicId: img.public_id, format: img.format, context: 'modal', deviceSize: 'extraLarge' }),
        name: img.display_name,
        original: img.secure_url,
        id: img.asset_id,
        title: context.caption,
        description: context.alt,
        alt: context.alt || context.caption || img.display_name
      }
    })
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error)
    return []
  }
}
