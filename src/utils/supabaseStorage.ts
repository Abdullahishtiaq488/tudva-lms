// src/utils/supabaseStorage.ts
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize S3 client for direct S3 operations if needed
const s3Client = new S3Client({
  region: process.env.SUPABASE_STORAGE_REGION || 'ap-south-1',
  endpoint: process.env.SUPABASE_STORAGE_URL || 'https://ngpdfyhvlztueekbksju.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY || 'c066c4f983fd2ef157b8b15a27be3270',
    secretAccessKey: process.env.SUPABASE_STORAGE_SECRET_KEY || '021c1726ee9e9e0da8cb085dbaec40fcb6a97be0250a4235348b5d0cc6277524',
  },
  forcePathStyle: true, // Required for Supabase S3 compatibility
});

// Default bucket name from environment variables
const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'tudva-bucker';

/**
 * Upload a file to Supabase Storage
 * @param file The file buffer to upload
 * @param bucket The storage bucket name
 * @param path Optional path within the bucket
 * @returns The URL of the uploaded file
 */
export const uploadFile = async (
  file: Buffer,
  path: string = '',
  contentType: string = 'application/octet-stream',
  bucket: string = DEFAULT_BUCKET
): Promise<string> => {
  try {
    const fileName = `${path}/${uuidv4()}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param fileUrl The URL of the file to delete
 * @param bucket The storage bucket name
 */
export const deleteFile = async (fileUrl: string, bucket: string = DEFAULT_BUCKET): Promise<void> => {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(fileUrl);
    const pathParts = urlObj.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(bucket) + 1).join('/');

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteFile:', error);
    throw error;
  }
};

/**
 * Create a signed URL for temporary access to a file
 * @param filePath The path to the file in the bucket
 * @param bucket The storage bucket name
 * @param expiresIn Expiration time in seconds (default: 60 minutes)
 * @returns The signed URL
 */
export const getSignedUrl = async (
  filePath: string,
  bucket: string = DEFAULT_BUCKET,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Error creating signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error in getSignedUrl:', error);
    throw error;
  }
};

/**
 * Upload a file directly to S3 using the AWS SDK
 * This can be useful for larger files or when you need more control
 * @param file The file buffer to upload
 * @param key The S3 object key (path/filename)
 * @param contentType The content type of the file
 * @param bucket The S3 bucket name
 * @returns The URL of the uploaded file
 */
export const uploadFileToS3 = async (
  file: Buffer,
  key: string,
  contentType: string = 'application/octet-stream',
  bucket: string = DEFAULT_BUCKET
): Promise<string> => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Construct the URL
    const baseUrl = process.env.SUPABASE_STORAGE_URL || '';
    return `${baseUrl}/${bucket}/${key}`;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

/**
 * Download a file from S3
 * @param key The S3 object key
 * @param bucket The S3 bucket name
 * @returns The file buffer
 */
export const downloadFileFromS3 = async (
  key: string,
  bucket: string = DEFAULT_BUCKET
): Promise<Buffer> => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    if (response.Body) {
      // @ts-ignore - TypeScript doesn't recognize the stream methods
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error downloading file from S3:', error);
    throw error;
  }
};

/**
 * Delete a file directly from S3
 * @param key The S3 object key
 * @param bucket The S3 bucket name
 */
export const deleteFileFromS3 = async (
  key: string,
  bucket: string = DEFAULT_BUCKET
): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};
