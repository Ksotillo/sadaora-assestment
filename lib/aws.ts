import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const uploadImageToS3 = async (
  file: File,
  userId: string
): Promise<string> => {
  // Validate environment variables
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error('AWS_ACCESS_KEY_ID environment variable is not set')
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_SECRET_ACCESS_KEY environment variable is not set')
  }
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME environment variable is not set')
  }

  const fileExtension = file.name.split('.').pop()
  const fileName = `profile-images/${userId}-${Date.now()}.${fileExtension}`
  
  const buffer = Buffer.from(await file.arrayBuffer())
  
  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  })
  
  try {
    await s3Client.send(uploadCommand)
    
    // Construct the public URL - use more reliable format
    const region = process.env.AWS_REGION || 'us-east-1'
    let imageUrl: string
    
    if (region === 'us-east-1') {
      // us-east-1 uses a different URL format
      imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`
    } else {
      imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${fileName}`
    }
    
    return imageUrl
  } catch (error) {
    console.error('S3 Upload Error:', error)

    // Provide more specific error messages
    let errorMessage = 'Failed to upload image'
    
    if (error instanceof Error) {
      if (error.message.includes('InvalidAccessKeyId')) {
        errorMessage = 'Invalid AWS Access Key ID. Please check your AWS credentials.'
      } else if (error.message.includes('SignatureDoesNotMatch')) {
        errorMessage = 'Invalid AWS Secret Access Key. Please check your AWS credentials.'
      } else if (error.message.includes('NoSuchBucket')) {
        errorMessage = `S3 bucket '${process.env.AWS_S3_BUCKET_NAME}' does not exist or is not accessible.`
      } else if (error.message.includes('AccessDenied')) {
        errorMessage = 'Access denied. Check your IAM permissions and bucket policy.'
      } else if (error.message.includes('NetworkingError')) {
        errorMessage = 'Network error. Check your internet connection.'
      } else if (error.message.includes('must be addressed using the specified endpoint')) {
        errorMessage = `Region mismatch! Your bucket '${process.env.AWS_S3_BUCKET_NAME}' is not in region '${process.env.AWS_REGION || 'us-east-1'}'. Please check your bucket's actual region in the AWS Console and update your AWS_REGION environment variable.`
      } else {
        errorMessage = `AWS S3 Error: ${error.message}`
      }
    }
    
    throw new Error(errorMessage)
  }
}

export const deleteImageFromS3 = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the key from the URL
    const url = new URL(imageUrl)
    const key = url.pathname.substring(1) // Remove leading slash
    
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    })
    
    await s3Client.send(deleteCommand)
  } catch (error) {
    console.error('Error deleting from S3:', error)
    throw new Error('Failed to delete image')
  }
} 