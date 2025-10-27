import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Users, 
  Camera,
  Trash2,
  Upload
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function AddChildScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const handleImagePick = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
  };

  const uploadImageToStorage = async (childId: string): Promise<string | null> => {
    if (!profilePicture) return null;

    try {
      setUploadingImage(true);

      // Convert image to blob
      const response = await fetch(profilePicture);
      const blob = await response.blob();

      // Generate unique file name
      const fileExt = profilePicture.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${childId}/${uuidv4()}.${fileExt}`;
      const filePath = `child-profile-pictures/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('child-images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('child-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a child');
      return;
    }

    try {
      setLoading(true);
      
      // First create the child record
      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert([
          {
            user_id: user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            profile_picture_url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png', // Default image
          },
        ])
        .select()
        .single();

      if (childError) throw childError;

      // If profile picture was selected, upload it and update the child record
      if (profilePicture && childData) {
        try {
          const imageUrl = await uploadImageToStorage(childData.id);
          
          if (imageUrl) {
            const { error: updateError } = await supabase
              .from('children')
              .update({ profile_picture_url: imageUrl })
              .eq('id', childData.id);

            if (updateError) {
              console.error('Error updating profile picture:', updateError);
              // Don't throw here, as the child was created successfully
            }
          }
        } catch (imageError) {
          console.error('Error uploading profile picture:', imageError);
          // Continue even if image upload fails - the child record was created
        }
      }

      Alert.alert(
        'Success!',
        'Child profile created successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error adding child:', error);
      Alert.alert('Error', 'Failed to create child profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getImageSource = () => {
    if (profilePicture) {
      return { uri: profilePicture };
    }
    return { uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Add Child</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={getImageSource()} 
              style={styles.profileImage}
              defaultSource={{ uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png' }}
            />
            <View style={styles.profileImageOverlay}>
              <Pressable 
                style={styles.imageActionButton}
                onPress={handleImagePick}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Camera size={20} color="#ffffff" />
                )}
              </Pressable>
              {profilePicture && (
                <Pressable 
                  style={[styles.imageActionButton, styles.removeImageButton]}
                  onPress={removeProfilePicture}
                  disabled={uploadingImage}
                >
                  <Trash2 size={16} color="#ffffff" />
                </Pressable>
              )}
            </View>
          </View>
          
          <Text style={styles.profileImageText}>
            {uploadingImage ? 'Uploading...' : 'Tap to add profile photo'}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Child Information</Text>
          
          <View style={styles.inputContainer}>
            <User size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <User size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Calendar size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (YYYY-MM-DD)"
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
            />
          </View>

          {/* Gender Selection */}
          <View style={styles.genderSection}>
            <View style={styles.genderHeader}>
              <Users size={20} color="#9ca3af" />
              <Text style={styles.genderLabel}>Gender</Text>
            </View>
            
            <View style={styles.genderOptions}>
              {['Male', 'Female', 'Other'].map((gender) => (
                <Pressable
                  key={gender}
                  style={[
                    styles.genderOption,
                    formData.gender === gender && styles.selectedGenderOption,
                  ]}
                  onPress={() => setFormData({ ...formData, gender })}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      formData.gender === gender && styles.selectedGenderOptionText,
                    ]}
                  >
                    {gender}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Pressable 
            style={[styles.submitButton, (loading || uploadingImage) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading || uploadingImage}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating Profile...' : 'Create Child Profile'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Profile Picture Styles
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e7eb',
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    gap: 8,
  },
  imageActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#bd84f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageButton: {
    backgroundColor: '#ef4444',
  },
  profileImageText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  genderSection: {
    marginTop: 8,
  },
  genderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  genderLabel: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  selectedGenderOption: {
    borderColor: '#bd84f6',
    backgroundColor: '#fdf2f8',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectedGenderOptionText: {
    color: '#bd84f6',
    fontWeight: '600',
  },
  submitSection: {
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#bd84f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});