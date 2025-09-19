import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Baby, User, Phone, Mail, MessageCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  user_id: string | null; // parent link might be null if not linked yet
}

export default function ApplyScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ message: '' });

  useEffect(() => {
    if (profile?.id) {
      fetchChildren();
    }
  }, [profile?.id]);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      // Fetch children where user_id = profile.id
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', profile?.id);

      if (error) throw error;

      setChildren(data || []);
      if (data && data.length > 0) {
        setSelectedChild(data[0].id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'Failed to load children profiles.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async (childId: string) => {
    // This lets the parent link an existing child profile to themselves
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('children')
        .update({ user_id: profile.id })
        .eq('id', childId);

      if (error) throw error;

      Alert.alert('Success', 'Child profile linked to your account.');
      fetchChildren(); // refresh children
    } catch (error) {
      console.error('Error linking child:', error);
      Alert.alert('Error', 'Failed to link child profile.');
    }
  };

  const handleSubmit = () => {
    if (!selectedChild) {
      Alert.alert('Select a child', 'Please select a child to continue.');
      return;
    }

    // Here you can continue with your application submission logic
    Alert.alert('Submitted', `Application sent for child ID: ${selectedChild}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Loading children...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Select Your Child</Text>

      {children.length === 0 ? (
        <View style={styles.noChildren}>
          <Baby size={48} color="#999" />
          <Text style={{ marginVertical: 12, fontSize: 16, color: '#555' }}>
            You have no linked children profiles.
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => router.push('/children/add')}
          >
            <Text style={styles.buttonText}>Add Child Profile</Text>
          </Pressable>

          <Text style={{ marginTop: 24, fontSize: 14, color: '#444' }}>
            Or link an existing child profile to your account by their ID:
          </Text>

          {/* Simple input for linking child by ID */}
          <LinkChildForm onLink={handleLinkChild} />
        </View>
      ) : (
        children.map((child) => (
          <Pressable
            key={child.id}
            style={[
              styles.childCard,
              selectedChild === child.id && styles.selectedChildCard,
            ]}
            onPress={() => setSelectedChild(child.id)}
          >
            <Text style={styles.childName}>
              {child.first_name} {child.last_name}
            </Text>
            <Text style={styles.childDetails}>
              DOB: {child.date_of_birth} | Gender: {child.gender}
            </Text>
          </Pressable>
        ))
      )}

      <View style={{ marginTop: 32 }}>
        <Text style={styles.title}>Message to Creche (optional)</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Add any message here..."
          value={formData.message}
          onChangeText={(text) => setFormData({ message: text })}
        />
      </View>

      <Pressable
        style={[styles.submitButton, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Application'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function LinkChildForm({ onLink }: { onLink: (childId: string) => void }) {
  const [childId, setChildId] = useState('');

  return (
    <View style={{ marginTop: 12 }}>
      <TextInput
        placeholder="Enter child profile ID"
        value={childId}
        onChangeText={setChildId}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginBottom: 8,
        }}
      />
      <Pressable
        style={{
          backgroundColor: '#2563eb',
          paddingVertical: 10,
          borderRadius: 6,
          alignItems: 'center',
        }}
        onPress={() => {
          if (childId.trim()) {
            onLink(childId.trim());
            setChildId('');
          } else {
            Alert.alert('Enter child ID', 'Please enter a valid child profile ID');
          }
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Link Child Profile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#0c4a6e',
  },
  noChildren: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  childCard: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedChildCard: {
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0c4a6e',
  },
  childDetails: {
    fontSize: 14,
    color: '#2563eb',
    marginTop: 4,
  },
  textArea: {
    height: 100,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#0c4a6e',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
