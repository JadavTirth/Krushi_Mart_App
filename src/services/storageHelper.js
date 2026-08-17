import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

/**
 * Reads a local file URI (e.g. file:// or content://) as an ArrayBuffer.
 * This is necessary in React Native to bypass buggy Blob serialization in fetch.
 * 
 * @param {string} uri - The local file URI
 * @returns {Promise<ArrayBuffer>} The file data as an ArrayBuffer
 */
const getArrayBufferFromUri = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return decode(base64);
  } catch (error) {
    console.error('Error reading local file URI with FileSystem:', error);
    throw new TypeError('Network request failed to read local file');
  }
};

/**
 * Uploads a local image URI to the Supabase Storage 'posts' bucket.
 * 
 * @param {string} uri - The local file URI (e.g. from expo-image-picker)
 * @param {string} userId - The ID of the user uploading the image
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export const uploadPostImage = async (uri, userId) => {
  if (!uri) return null;
  
  try {
    // Generate a unique path/filename
    const extension = uri.split('.').pop() || 'jpg';
    const filename = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
    
    // Read local file as ArrayBuffer
    const arrayBuffer = await getArrayBufferFromUri(uri);
    
    // Upload the ArrayBuffer to Supabase Storage
    const { error } = await supabase.storage
      .from('posts')
      .upload(filename, arrayBuffer, {
        contentType: `image/${extension}`,
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Retrieve the public URL
    const { data: publicUrlData } = supabase.storage
      .from('posts')
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading post image to Supabase Storage:', error);
    throw error;
  }
};

/**
 * Uploads a local image URI to the Supabase Storage 'avatars' bucket.
 * 
 * @param {string} userId - The ID of the user
 * @param {string} uri - The local file URI (e.g. from expo-image-picker)
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export const uploadProfileImage = async (userId, uri) => {
  if (!uri || !userId) return null;
  
  try {
    const extension = uri.split('.').pop() || 'jpg';
    
    // 1. Clean up old profile images from user's directory to avoid bloating
    try {
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map(file => `${userId}/${file.name}`);
        await supabase.storage.from('avatars').remove(filesToRemove);
      }
    } catch (cleanError) {
      console.warn('Could not clean old profile files from storage:', cleanError);
    }
    
    // 2. Generate a unique filename using a timestamp to bust cache
    const timestamp = Date.now();
    const filename = `${userId}/profile-${timestamp}.${extension}`;
    
    // Read local file as ArrayBuffer
    const arrayBuffer = await getArrayBufferFromUri(uri);
    
    // Upload the ArrayBuffer to Supabase Storage
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filename, arrayBuffer, {
        contentType: `image/${extension}`,
        cacheControl: '0', // Disable caching for the new upload
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Retrieve the public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading profile image to Supabase Storage:', error);
    throw error;
  }
};
