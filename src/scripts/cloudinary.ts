import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: import.meta.env.CLOUD_NAME,
  api_key: import.meta.env.API_KEY,
  api_secret: import.meta.env.API_SECRET
})

export enum CloudinaryFolders {
  EnduranceEnjoyers = 'EnduranceEnjoyers'
}

export const getUrl = ({ publicId, format, width = 1920, height }: { publicId: string, format?: string, width?: number, height?: number }): string => {
  const extension = (typeof format === 'string' && format.trim() !== '') ? `.${format}` : ''
  return cloudinary.url(publicId + extension, {
    resource_type: 'image',
    type: 'upload',
    transformation: [
      { width, height, crop: 'fill', gravity: 'auto' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  })
}

export const getImages = async ({ cantidad = 12, folder }: { cantidad?: number, folder?: string }): Promise<Array<{ url: string, name: string, original: string, id: string }>> => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder ? `${folder}/` : '',
      max_results: cantidad,
      resource_type: 'image'
    })

    return result.resources.map((img: any): { url: string, name: string, original: string, id: string } => {
      return {
        url: getUrl({ publicId: img.public_id, format: img.format, width: 600, height: 400 }),
        name: img.display_name,
        original: img.secure_url,
        id: img.asset_id
      }
    })
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error)
    return []
  }
}
