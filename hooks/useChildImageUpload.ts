// hooks/useChildImageUpload.ts
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';

interface ChildImageUploadProps {
  childId: string;
  userId: string;
  onImageUpdated: (imageUrl: string) => Promise<void> | void;
}

export const useChildImageUpload = ({ 
  childId, 
  userId, 
  onImageUpdated 
}: ChildImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const BUCKET_NAME = 'child_images';
  const FOLDER_NAME = 'child-profiles';

  // Validate file type
  const validateFileType = (fileName: string): string => {
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (!validExtensions.includes(fileExt)) {
      throw new Error(`Invalid file type. Allowed: ${validExtensions.join(', ')}`);
    }
    
    return fileExt;
  };

  // Validate file size
  const validateFileSize = (file: Blob) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }
  };

  // Convert URI to Blob (handles web and mobile)
  const uriToBlob = async (uri: string): Promise<Blob> => {
    if (Platform.OS === 'web') {
      // For web
      const response = await fetch(uri);
      return await response.blob();
    } else {
      // For mobile (React Native)
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const byteCharacters = atob(base64);
      const byteArrays: Uint8Array[] = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      
      return new Blob(byteArrays, { type: 'image/jpeg' });
    }
  };

  // Check if storage bucket exists
  const checkStorageBucket = async (): Promise<boolean> => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error checking storage buckets:', error);
        return false;
      }
      
      return buckets?.some(bucket => bucket.name === BUCKET_NAME) || false;
    } catch (error) {
      console.error('Error in checkStorageBucket:', error);
      return false;
    }
  };

  // Upload image function
  const uploadImage = async (uri: string): Promise<string> => {
    setUploading(true);

    try {
      // Check if storage bucket exists
      const bucketExists = await checkStorageBucket();
      
      if (!bucketExists) {
        throw new Error(
          'Storage bucket not configured. Please contact support or run the storage setup SQL.'
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileExt = validateFileType(uri);
      const fileName = `${childId}_${userId}_${timestamp}_${random}.${fileExt}`;
      const filePath = `${FOLDER_NAME}/${fileName}`;

      // Convert to blob
      const blob = await uriToBlob(uri);
      validateFileSize(blob);

      console.log('Uploading image to:', {
        bucket: BUCKET_NAME,
        path: filePath,
        size: `${(blob.size / 1024).toFixed(2)}KB`,
        type: blob.type
      });

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, blob, {
          upsert: true,
          contentType: blob.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      // Update the child's profile picture
      await onImageUpdated(publicUrl);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      
      let errorMessage = 'Failed to upload image';
      
      if (error.message.includes('Bucket')) {
        errorMessage = 'Storage bucket not configured. Please contact support.';
      } else if (error.message.includes('size')) {
        errorMessage = 'Image is too large. Please select an image under 5MB.';
      } else if (error.message.includes('type')) {
        errorMessage = 'Invalid image format. Please use JPG, PNG, or GIF.';
      }
      
      Alert.alert('Upload Error', errorMessage);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Pick image from device
  const pickImage = async (): Promise<string | null> => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll permission is required to upload images.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const imageUrl = await uploadImage(result.assets[0].uri);
        return imageUrl;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error in pickImage:', error);
      return null;
    }
  };

  // Remove image
  const removeImage = async (): Promise<void> => {
    try {
      Alert.alert(
        'Remove Profile Picture',
        'Are you sure you want to remove the profile picture?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await onImageUpdated('');
                Alert.alert('Success', 'Profile picture removed');
              } catch (error) {
                console.error('Error removing image:', error);
                Alert.alert('Error', 'Failed to remove profile picture');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in removeImage:', error);
    }
  };

  return { 
    pickImage, 
    removeImage, 
    uploadImage, 
    uploading 
  };
};