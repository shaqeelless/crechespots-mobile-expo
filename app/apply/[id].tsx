import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';

import { LoadingComponent } from '@/components/apply/LoadingComponents';
import {  NavigationFooter, StepHeader as Header } from '@/components/apply/SharedComponents';
import { ChildSelectionStep, ClassSelectionStep, NotesStep, SummaryStep } from '@/components/apply/StepComponents';
import { useApplicationData } from '@/hooks/useApplicationData';
import { STEPS } from '@/utils/applicationUtils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function ApplyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'child' | 'class' | 'notes' | 'summary'>('child');
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  
  const {
    loading,
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
    submitting,
    fetchData
  } = useApplicationData(id as string);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleNextStep = () => {
    setDirection('next');
    const steps = STEPS.map(s => s.id);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    setDirection('prev');
    const steps = STEPS.map(s => s.id);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderCurrentStep = () => {
    const animationIn = direction === 'next' ? SlideInRight : SlideInLeft;
    const animationOut = direction === 'next' ? SlideOutLeft : SlideOutRight;

    const commonProps = {
      children,
      classes,
      selectedChild,
      selectedClass,
      formData,
      setSelectedChild,
      setSelectedClass,
      setFormData,
      existingApplications,
      creche,
      profile,
      onBackToChildSelection: () => setCurrentStep('child'),
    };

    switch (currentStep) {
      case 'child':
        return (
          <Animated.View
            key="child-step"
            entering={animationIn.duration(300)}
            exiting={animationOut.duration(300)}
            style={styles.stepContainer}
          >
            <ChildSelectionStep {...commonProps} />
          </Animated.View>
        );
      case 'class':
        return (
          <Animated.View
            key="class-step"
            entering={animationIn.duration(300)}
            exiting={animationOut.duration(300)}
            style={styles.stepContainer}
          >
            <ClassSelectionStep {...commonProps} />
          </Animated.View>
        );
      case 'notes':
        return (
          <Animated.View
            key="notes-step"
            entering={animationIn.duration(300)}
            exiting={animationOut.duration(300)}
            style={styles.stepContainer}
          >
            <NotesStep {...commonProps} />
          </Animated.View>
        );
      case 'summary':
        return (
          <Animated.View
            key="summary-step"
            entering={animationIn.duration(300)}
            exiting={animationOut.duration(300)}
            style={styles.stepContainer}
          >
            <SummaryStep {...commonProps} />
          </Animated.View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingComponent currentStep={currentStep} />;
  }

  if (!creche) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Creche not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const canProceed = validateCurrentStep(currentStep, selectedChild, selectedClass, existingApplications);

  return (
    <View style={styles.container}>
      {/* Header */}
      <AnimatedView 
        style={styles.header}
        entering={FadeInDown.duration(600).springify()}
      >
        <AnimatedPressable 
          style={styles.backButton} 
          onPress={() => router.back()}
          entering={ZoomIn.duration(600).springify()}
        >
          <ArrowLeft size={24} color="#374151" />
        </AnimatedPressable>
        <AnimatedText 
          style={styles.headerTitle}
          entering={FadeInUp.delay(200).duration(600).springify()}
        >
          Apply to {creche.name}
        </AnimatedText>
        <View style={styles.placeholder} />
      </AnimatedView>

      <View style={styles.content}>
        {renderCurrentStep()}
      </View>

      <NavigationFooter
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        canProceed={canProceed}
        submitting={submitting}
        onPrevious={handlePreviousStep}
        onNext={handleNextStep}
        onSubmit={handleSubmit}
      />
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
    padding: 20,
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
    borderBottomColor: '#e5e7eb',
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
    backgroundColor: '#f8fafc',
  },
  stepContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  backText: {
    color: '#374151',
    fontWeight: '600',
  },
});