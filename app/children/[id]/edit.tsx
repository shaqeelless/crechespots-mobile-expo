import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Save,
  Camera,
  X,
  User,
  Calendar,
  Trash2,
  Heart,
  AlertCircle,
  FileText,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  profile_picture_url: string;
  special_needs: string;
  allergies: string;
  medical_conditions: string;
  created_at: string;
  user_id: string;
  creche_id: string;
  share_code: string;
  blood_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  additional_notes: string;
}

export default function EditChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [allergies, setAllergies] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      fetchChildData();
    }
  }, [id]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: childData, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (!childData) {
        throw new Error('Child not found or you do not have permission to edit');
      }

      setChild(childData);
      
      // Set form values
      setFirstName(childData.first_name || '');
      setLastName(childData.last_name || '');
      setDateOfBirth(childData.date_of_birth ? new Date(childData.date_of_birth) : new Date());
      setGender(childData.gender || '');
      setProfilePicture(childData.profile_picture_url || '');
      setAllergies(childData.allergies || '');
      setSpecialNeeds(childData.special_needs || '');
      setMedicalConditions(childData.medical_conditions || '');
      setBloodType(childData.blood_type || '');
      setEmergencyContactName(childData.emergency_contact_name || '');
      setEmergencyContactPhone(childData.emergency_contact_phone || '');
      setEmergencyContactRelationship(childData.emergency_contact_relationship || '');
      setAdditionalNotes(childData.additional_notes || '');

    } catch (error: any) {
      console.error('Error fetching child data:', error);
      Alert.alert('Error', error.message || 'Failed to load child details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    
    const today = new Date();
    if (dateOfBirth > today) newErrors.dateOfBirth = 'Date of birth cannot be in the future';
    
    if (emergencyContactPhone && !/^[\+]?[1-9][\d]{0,15}$/.test(emergencyContactPhone.replace(/\s/g, ''))) {
      newErrors.emergencyContactPhone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      setSaving(true);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth.toISOString().split('T')[0],
        gender,
        allergies: allergies.trim(),
        special_needs: specialNeeds.trim(),
        medical_conditions: medicalConditions.trim(),
        blood_type: bloodType.trim(),
        emergency_contact_name: emergencyContactName.trim(),
        emergency_contact_phone: emergencyContactPhone.trim(),
        emergency_contact_relationship: emergencyContactRelationship.trim(),
        additional_notes: additionalNotes.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('children')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Child profile updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);

    } catch (error: any) {
      console.error('Error updating child:', error);
      Alert.alert('Error', error.message || 'Failed to update child profile');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant camera roll permissions to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images, // Fixed: Changed from MediaTypeOptions
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false, // Don't include base64 to avoid URI too long errors
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploadingImage(true);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Extract file extension from URI
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!validExtensions.includes(fileExt)) {
        throw new Error('Invalid image format. Please use JPG, PNG, or GIF.');
      }

      // Generate unique filename
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `child-profiles/${fileName}`;

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('child_images')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // Get public URL - use the correct method
      const { data: { publicUrl } } = supabase.storage
        .from('child_images')
        .getPublicUrl(filePath);

      // Update child profile with new image URL
      const { error: updateError } = await supabase
        .from('children')
        .update({ profile_picture_url: publicUrl })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfilePicture(publicUrl);
      if (child) {
        setChild({ ...child, profile_picture_url: publicUrl });
      }

      Alert.alert('Success', 'Profile picture updated successfully');

    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = async () => {
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
              if (!user) return;

              const { error } = await supabase
                .from('children')
                .update({ profile_picture_url: null })
                .eq('id', id)
                .eq('user_id', user.id);

              if (error) throw error;

              setProfilePicture('');
              if (child) {
                setChild({ ...child, profile_picture_url: '' });
              }
              Alert.alert('Success', 'Profile picture removed');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error removing image:', error);
      Alert.alert('Error', error.message || 'Failed to remove image');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (dob: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  const bloodTypes = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genderOptions = [
    { label: 'Select gender', value: '' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer-not-to-say' },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Child</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading child details...</Text>
        </View>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Child</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Child Not Found</Text>
          <Text style={styles.errorDescription}>
            The child you're trying to edit doesn't exist or you don't have permission.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Child Profile</Text>
        <Pressable 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Save size={20} color="#ffffff" />
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePictureWrapper}>
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
              ) : (
                <View style={[styles.profilePicture, styles.profilePicturePlaceholder]}>
                  <User size={40} color="#8b5cf6" />
                </View>
              )}
              
              <View style={styles.profilePictureActions}>
                <Pressable 
                  style={[styles.profilePictureButton, styles.uploadButton]}
                  onPress={pickImage}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Camera size={20} color="#ffffff" />
                  )}
                  <Text style={styles.profilePictureButtonText}>
                    {uploadingImage ? 'Uploading...' : 'Upload'}
                  </Text>
                </Pressable>
                
                {profilePicture ? (
                  <Pressable 
                    style={[styles.profilePictureButton, styles.removeButton]}
                    onPress={removeImage}
                  >
                    <Trash2 size={20} color="#ffffff" />
                    <Text style={styles.profilePictureButtonText}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            
            <Text style={styles.profilePictureHint}>
              Upload a clear photo of the child. Recommended size: 500x500px
            </Text>
          </View>
        </View>

        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) setErrors({...errors, firstName: ''});
              }}
              placeholder="Enter first name"
            />
            {errors.firstName ? (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) setErrors({...errors, lastName: ''});
              }}
              placeholder="Enter last name"
            />
            {errors.lastName ? (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Birth *</Text>
            <Pressable 
              style={[styles.input, styles.dateInput]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#64748b" />
              <Text style={styles.dateText}>
                {formatDate(dateOfBirth)}
              </Text>
            </Pressable>
            <Text style={styles.ageText}>
              {calculateAge(dateOfBirth)} years old
            </Text>
            {errors.dateOfBirth ? (
              <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
            ) : null}
            
            {showDatePicker ? (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDateOfBirth(selectedDate);
                    if (errors.dateOfBirth) setErrors({...errors, dateOfBirth: ''});
                  }
                }}
              />
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={styles.picker}
              >
                {genderOptions.map((option) => (
                  <Picker.Item 
                    key={option.value} 
                    label={option.label} 
                    value={option.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Health Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={20} color="#ef4444" />
            <Text style={styles.sectionTitle}>Health Information</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Blood Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={bloodType}
                onValueChange={(itemValue) => setBloodType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select blood type" value="" />
                {bloodTypes.slice(1).map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Allergies</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={allergies}
              onChangeText={setAllergies}
              placeholder="List any allergies (e.g., peanuts, pollen, penicillin)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.hintText}>Separate multiple allergies with commas</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Special Needs</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={specialNeeds}
              onChangeText={setSpecialNeeds}
              placeholder="Describe any special needs or requirements"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Medical Conditions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={medicalConditions}
              onChangeText={setMedicalConditions}
              placeholder="List any medical conditions (e.g., asthma, diabetes)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.hintText}>Separate multiple conditions with commas</Text>
          </View>
        </View>

        {/* Emergency Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={20} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Name</Text>
            <TextInput
              style={styles.input}
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
              placeholder="Full name of emergency contact"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Relationship</Text>
            <TextInput
              style={styles.input}
              value={emergencyContactRelationship}
              onChangeText={setEmergencyContactRelationship}
              placeholder="Relationship to child (e.g., Mother, Grandparent)"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors.emergencyContactPhone && styles.inputError]}
              value={emergencyContactPhone}
              onChangeText={(text) => {
                setEmergencyContactPhone(text);
                if (errors.emergencyContactPhone) setErrors({...errors, emergencyContactPhone: ''});
              }}
              placeholder="Phone number (e.g., 0712345678)"
              keyboardType="phone-pad"
            />
            {errors.emergencyContactPhone ? (
              <Text style={styles.errorText}>{errors.emergencyContactPhone}</Text>
            ) : null}
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Additional Information</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              placeholder="Any other important information about the child"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.hintText}>
              This information will be shared with creches and caregivers
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Pressable 
            style={[styles.actionButton, styles.saveActionButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Save size={20} color="#ffffff" />
            )}
            <Text style={styles.actionButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={saving}
          >
            <X size={20} color="#374151" />
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
              Cancel
            </Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#8b5cf6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  profilePictureContainer: {
    alignItems: 'center',
  },
  profilePictureWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profilePicturePlaceholder: {
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#c7d2fe',
    borderStyle: 'dashed',
  },
  profilePictureActions: {
    flexDirection: 'row',
    gap: 12,
  },
  profilePictureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  uploadButton: {
    backgroundColor: '#8b5cf6',
  },
  removeButton: {
    backgroundColor: '#ef4444',
  },
  profilePictureButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  profilePictureHint: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#1e293b',
  },
  ageText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  hintText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#1e293b',
  },
  actionSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  saveActionButton: {
    backgroundColor: '#8b5cf6',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButtonText: {
    color: '#374151',
  },
  bottomSpacing: {
    height: 40,
  },
});