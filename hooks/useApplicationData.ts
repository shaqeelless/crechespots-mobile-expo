import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  user_id: string;
}

interface Creche {
  id: string;
  name: string;
  header_image: string;
  address: string;
}

interface CrecheClass {
  id: string;
  name: string;
  color: string;
  capacity: number;
  min_age_months: number;
  max_age_months: number;
  current_enrollment?: number;
}

interface ExistingApplication {
  child_id: string;
  class_id: string;
  application_status: string;
  submitted_at: string;
}

export const useApplicationData = (crecheId: string) => {
  const router = useRouter();
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [creche, setCreche] = useState<Creche | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [classes, setClasses] = useState<CrecheClass[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [existingApplications, setExistingApplications] = useState<Record<string, ExistingApplication>>({});
  const [formData, setFormData] = useState({
    message: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch creche details
      const { data: crecheData, error: crecheError } = await supabase
        .from('creches')
        .select('id, name, header_image, address')
        .eq('id', crecheId)
        .single();

      if (crecheError) throw crecheError;
      setCreche(crecheData);

      // Fetch creche classes with current enrollment
      const { data: classesData, error: classesError } = await supabase
        .from('creche_classes')
        .select('*')
        .eq('creche_id', crecheId)
        .order('min_age_months', { ascending: true });

      if (classesError) throw classesError;
      
      // Get current enrollment for each class
      const classesWithEnrollment = await Promise.all(
        (classesData || []).map(async (classItem) => {
          const { count } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classItem.id)
            .eq('status', 'active');

          return {
            ...classItem,
            current_enrollment: count || 0
          };
        })
      );
      
      setClasses(classesWithEnrollment);

      // Fetch user's children
      if (!user?.id) {
        setChildren([]);
        return;
      }

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);

      // Check for existing applications
      if (childrenData && childrenData.length > 0) {
        const childIds = childrenData.map(child => child.id);
        
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('child_id, class_id, application_status, submitted_at')
          .eq('creche_id', crecheId)
          .eq('user_id', user.id)
          .in('child_id', childIds);

        if (applicationsError) throw applicationsError;

        const existingApps: Record<string, ExistingApplication> = {};
        applicationsData?.forEach(app => {
          existingApps[app.child_id] = {
            child_id: app.child_id,
            class_id: app.class_id,
            application_status: app.application_status,
            submitted_at: app.submitted_at
          };
        });
        setExistingApplications(existingApps);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load application form');
    } finally {
      setLoading(false);
    }
  }, [crecheId, user?.id]);

  const validateCurrentStep = (
    step: string, 
    selectedChild: string, 
    selectedClass: string, 
    existingApplications: Record<string, ExistingApplication>
  ) => {
    switch (step) {
      case 'child':
        return !!selectedChild && !existingApplications[selectedChild];
      case 'class':
        return !!selectedClass;
      case 'notes':
        return true; // Notes are optional
      case 'summary':
        return true;
      default:
        return false;
    }
  };

  const calculateChildAgeInMonths = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return 0;
    
    const today = new Date();
    const birthDate = new Date(child.date_of_birth);
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months += today.getMonth() - birthDate.getMonth();
    
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return months;
  };

  const handleSubmit = async () => {
    if (!selectedChild || !selectedClass) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    // Final age validation
    const childAge = calculateChildAgeInMonths(selectedChild);
    const selectedClassData = classes.find(cls => cls.id === selectedClass);
    
    if (selectedClassData && 
        (childAge < selectedClassData.min_age_months || 
         childAge > selectedClassData.max_age_months)) {
      Alert.alert('Error', 'Child does not meet age requirements for selected class');
      return;
    }

    if (!profile || !user) {
      Alert.alert('Error', 'Please complete your profile before applying');
      return;
    }

    try {
      setSubmitting(true);

      // Get child and class details before submission for the success screen
      const child = children.find(c => c.id === selectedChild);
      const crecheClass = classes.find(cls => cls.id === selectedClass);

      const applicationData = {
        creche_id: crecheId,
        child_id: selectedChild,
        class_id: selectedClass,
        user_id: user.id,
        parent_name: `${profile.first_name} ${profile.last_name}`,
        parent_phone_number: profile.phone_number || '',
        parent_email: profile.email,
        parent_address: [profile.suburb, profile.city, profile.province].filter(Boolean).join(', '),
        message: formData.message,
        notes: formData.notes,
        source: 'mobile_app',
        application_status: 'New',
      };

      const { error } = await supabase
        .from('applications')
        .insert([applicationData]);

      if (error) {
        if (error.code === '23505') {
          await fetchData();
          Alert.alert(
            'Duplicate Application',
            'This child already has an application for this creche.',
            [
              {
                text: 'View Applications',
                onPress: () => router.push('/applications'),
              },
              { text: 'OK' },
            ]
          );
          return;
        }
        throw error;
      }

      // Update local state
      const newExistingApp: ExistingApplication = {
        child_id: selectedChild,
        class_id: selectedClass,
        application_status: 'New',
        submitted_at: new Date().toISOString()
      };
      setExistingApplications(prev => ({
        ...prev,
        [selectedChild]: newExistingApp
      }));

      // Navigate to CompleteApplication screen with animation
      router.replace({
        pathname: '/CompleteApplicationScreen',
        params: {
          crecheName: creche?.name || '',
          childName: `${child?.first_name || ''} ${child?.last_name || ''}`.trim(),
          className: crecheClass?.name || '',
          crecheId: crecheId,
        }
      });

    } catch (error: any) {
      console.error('Error submitting application:', error);
      
      if (error.code === '23505') {
        await fetchData();
        Alert.alert(
          'Already Applied',
          'This child already has an application for this creche.',
          [
            {
              text: 'View Applications',
              onPress: () => router.push('/applications'),
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to submit application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    creche,
    children,
    classes,
    selectedChild,
    selectedClass,
    existingApplications,
    formData,
    profile,
    setSelectedChild,
    setSelectedClass,
    setFormData,
    validateCurrentStep,
    handleSubmit,
    fetchData,
    calculateChildAgeInMonths,
  };
};