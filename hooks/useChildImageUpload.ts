// hooks/useChildImageUpload.ts (Simplified)
import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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

  const uploadImage = async (uri: string): Promise<string> => {
    setUploading(true);

    try {
      // Generate simple filename
      const timestamp = Date.now();
      const fileName = `child_${childId}_${timestamp}.jpg`;
      
      console.log('Uploading with filename:', fileName);

      // Fetch the image
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, blob, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      console.log('Upload successful:', publicUrl);

      // Update database
      await onImageUpdated(publicUrl);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async (): Promise<void> => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera roll permission is required.');
        return;
      }

      // Pick image with minimal options
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Pick image error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = async (): Promise<void> => {
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
              console.error('Remove error:', error);
              Alert.alert('Error', 'Failed to remove profile picture');
            }
          },
        },
      ]
    );
  };

  return { 
    pickImage, 
    removeImage, 
    uploading 
  };
};