import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: import.meta.env.CLOUD_NAME,
  api_key: import.meta.env.API_KEY,
  api_secret: import.meta.env.API_SECRET
})

export const getImages = async (cantidad: number = 12): Promise<Array<{ format: string, public_id: string }>> => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'ENDURANCE ENJOYERS',
      max_results: cantidad,
      resource_type: 'image'
    })
    console.log(result)
    return result.resources.map((img: any): { format: string, public_id: string } => ({
      format: img.format,
      public_id: img.public_id
    }))
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error)
    return []
  }
}
