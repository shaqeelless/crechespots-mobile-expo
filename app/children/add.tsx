import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
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
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';

export default function AddChildScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
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
        setError('Camera roll permission is required to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
        setError(null); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Failed to pick image. Please try again.');
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
  };

  const uploadImageToStorage = async (childId: string): Promise<string | null> => {
    if (!profilePicture) return null;

    try {
      setUploadingImage(true);
      console.log('Starting image upload for child:', childId);

      // Convert image to blob
      const response = await fetch(profilePicture);
      const blob = await response.blob();

      // Generate unique file name
      const timestamp = Date.now();
      const fileName = `child_${childId}_${timestamp}.jpg`;
      
      console.log('Uploading to profile-pictures bucket:', fileName);

      // Upload to Supabase Storage - use existing profile-pictures bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Try alternative bucket if profile-pictures fails
        if (uploadError.message.includes('Bucket')) {
          console.log('Trying alternative bucket...');
          const { error: altError } = await supabase.storage
            .from('avatars')
            .upload(fileName, blob, {
              contentType: 'image/jpeg',
              upsert: true,
            });
          
          if (altError) {
            console.error('Alternative bucket also failed:', altError);
            throw uploadError;
          }
          
          // Get URL from alternative bucket
          const { data: altUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          
          return altUrlData?.publicUrl || null;
        }
        
        throw uploadError;
      }

      // Get public URL from profile-pictures bucket
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      console.log('Image uploaded successfully:', urlData?.publicUrl);
      return urlData?.publicUrl || null;
    } catch (error) {
      console.error('Error uploading image:', error);
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('Bucket')) {
          throw new Error('Storage bucket not configured. Please contact support.');
        }
        throw error;
      }
      
      throw new Error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.dateOfBirth.trim()) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.dateOfBirth)) {
        errors.dateOfBirth = 'Date must be in YYYY-MM-DD format';
      }
    }
    
    if (!formData.gender) {
      errors.gender = 'Please select a gender';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setError('You must be logged in to add a child');
      return;
    }

    try {
      setLoading(true);
      
      // First create the child record with default image
      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert([
          {
            user_id: user.id,
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            date_of_birth: formData.dateOfBirth.trim(),
            gender: formData.gender.toLowerCase(),
            profile_picture_url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (childError) {
        console.error('Error creating child:', childError);
        
        let errorMessage = 'Failed to create child profile. Please try again.';
        if (childError.message?.includes('violates foreign key constraint')) {
          errorMessage = 'Database error. Please contact support.';
        } else if (childError.message?.includes('permission denied')) {
          errorMessage = 'You do not have permission to add a child.';
        }
        
        setError(errorMessage);
        return;
      }

      console.log('Child created successfully:', childData);

      // If profile picture was selected, upload it and update the child record
      if (profilePicture && childData) {
        try {
          const imageUrl = await uploadImageToStorage(childData.id);
          
          if (imageUrl) {
            console.log('Updating child with image URL:', imageUrl);
            
            const { error: updateError } = await supabase
              .from('children')
              .update({ 
                profile_picture_url: imageUrl,
                updated_at: new Date().toISOString()
              })
              .eq('id', childData.id);

            if (updateError) {
              console.error('Error updating profile picture:', updateError);
              setError('Child created, but profile picture upload failed. You can update it later.');
            }
          }
        } catch (imageError: any) {
          console.error('Error uploading profile picture:', imageError);
          setError('Child created, but profile picture upload failed. You can update it later.');
        }
      }

      // Show success message and redirect after 2 seconds
      setSuccess(true);
      setTimeout(() => {
        router.replace('/child');
      }, 2000);

    } catch (error: any) {
      console.error('Error adding child:', error);
      setError('An unexpected error occurred. Please try again.');
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

  // Get initials for avatar fallback
  const getInitials = () => {
    const first = formData.firstName.charAt(0) || '';
    const last = formData.lastName.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Message */}
        {success && (
          <View style={styles.successContainer}>
            <CheckCircle size={24} color="#22c55e" />
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>Success!</Text>
              <Text style={styles.successMessage}>
                Child profile created successfully. Redirecting...
              </Text>
            </View>
          </View>
        )}

        {/* Error Message */}
        {error && !success && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Pressable 
              onPress={handleImagePick}
              disabled={uploadingImage || loading || success}
              style={styles.profileImageWrapper}
            >
              {uploadingImage ? (
                <View style={[styles.profileImage, styles.uploadingImage]}>
                  <ActivityIndicator size="large" color="#bd84f6" />
                </View>
              ) : profilePicture ? (
                <Image 
                  source={getImageSource()} 
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImage, styles.placeholderImage]}>
                  <Text style={styles.initialsText}>
                    {getInitials() || <User size={40} color="#bd84f6" />}
                  </Text>
                </View>
              )}
              
              {/* Camera icon overlay */}
              {!uploadingImage && !success && (
                <View style={styles.cameraIconContainer}>
                  <Camera size={16} color="#ffffff" />
                </View>
              )}
            </Pressable>
            
            {/* Remove button for uploaded image */}
            {profilePicture && !uploadingImage && !success && (
              <Pressable 
                style={styles.removeButton}
                onPress={removeProfilePicture}
                disabled={loading}
              >
                <Trash2 size={16} color="#ffffff" />
              </Pressable>
            )}
          </View>
          
          <Text style={styles.profileImageText}>
            {uploadingImage ? 'Uploading image...' : 'Tap to add profile photo'}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Child Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <View style={[
              styles.inputContainer,
              fieldErrors.firstName && styles.inputError
            ]}>
              <User size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                value={formData.firstName}
                onChangeText={(text) => {
                  setFormData({ ...formData, firstName: text });
                  clearFieldError('firstName');
                }}
                autoCapitalize="words"
                editable={!loading && !success}
              />
            </View>
            {fieldErrors.firstName && (
              <Text style={styles.fieldErrorText}>{fieldErrors.firstName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <View style={[
              styles.inputContainer,
              fieldErrors.lastName && styles.inputError
            ]}>
              <User size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                value={formData.lastName}
                onChangeText={(text) => {
                  setFormData({ ...formData, lastName: text });
                  clearFieldError('lastName');
                }}
                autoCapitalize="words"
                editable={!loading && !success}
              />
            </View>
            {fieldErrors.lastName && (
              <Text style={styles.fieldErrorText}>{fieldErrors.lastName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth *</Text>
            <View style={[
              styles.inputContainer,
              fieldErrors.dateOfBirth && styles.inputError
            ]}>
              <Calendar size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.dateOfBirth}
                onChangeText={(text) => {
                  setFormData({ ...formData, dateOfBirth: text });
                  clearFieldError('dateOfBirth');
                }}
                keyboardType="numbers-and-punctuation"
                editable={!loading && !success}
              />
            </View>
            {fieldErrors.dateOfBirth ? (
              <Text style={styles.fieldErrorText}>{fieldErrors.dateOfBirth}</Text>
            ) : (
              <Text style={styles.hintText}>Format: YYYY-MM-DD (e.g., 2020-01-15)</Text>
            )}
          </View>

          {/* Gender Selection */}
          <View style={styles.genderSection}>
            <View style={styles.genderHeader}>
              <Users size={20} color="#9ca3af" />
              <Text style={styles.genderLabel}>Gender *</Text>
            </View>
            
            {fieldErrors.gender && (
              <Text style={[styles.fieldErrorText, { marginBottom: 8 }]}>{fieldErrors.gender}</Text>
            )}
            
            <View style={styles.genderOptions}>
              {[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
              ].map((gender) => (
                <Pressable
                  key={gender.value}
                  style={[
                    styles.genderOption,
                    formData.gender === gender.value && styles.selectedGenderOption,
                    (loading || uploadingImage || success) && styles.disabledOption,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, gender: gender.value });
                    clearFieldError('gender');
                  }}
                  disabled={loading || uploadingImage || success}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      formData.gender === gender.value && styles.selectedGenderOptionText,
                    ]}
                  >
                    {gender.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Pressable 
            style={[
              styles.submitButton, 
              (loading || uploadingImage || success) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={loading || uploadingImage || success}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : success ? (
              <CheckCircle size={20} color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {uploadingImage ? 'Uploading Image...' : 'Create Child Profile'}
              </Text>
            )}
          </Pressable>
          
          <Text style={styles.disclaimer}>
            * Required fields. Profile picture is optional.
          </Text>
        </View>
        
        <View style={styles.bottomSpacing} />
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
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    paddingTop: 20,
  },
  // Success Message
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successContent: {
    marginLeft: 12,
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 2,
  },
  successMessage: {
    fontSize: 14,
    color: '#15803d',
  },
  // Error Messages
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginLeft: 8,
    flex: 1,
  },
  fieldErrorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  // Profile Picture Styles
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e7eb',
  },
  uploadingImage: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImage: {
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#c7d2fe',
    borderStyle: 'dashed',
  },
  initialsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#bd84f6',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#bd84f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileImageText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  // Form Styles
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    height: 24,
  },
  hintText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
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
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  selectedGenderOption: {
    borderColor: '#bd84f6',
    backgroundColor: '#faf5ff',
  },
  disabledOption: {
    opacity: 0.6,
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
  // Submit Button
  submitSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#bd84f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#bd84f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});