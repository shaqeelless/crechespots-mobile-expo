import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { STEPS } from '@/utils/applicationUtils';

// Progress Steps Component


// Navigation Footer Component
export const NavigationFooter = ({
  isFirstStep,
  isLastStep,
  canProceed,
  submitting,
  onPrevious,
  onNext,
  onSubmit,
}: {
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  submitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) => {
  return (
    <View style={styles.footer}>
      {!isFirstStep ? (
        <Pressable 
          style={[styles.navButton, styles.backNavButton]}
          onPress={onPrevious}
        >
          <ChevronLeft size={20} color="#374151" />
          <Text style={styles.backNavButtonText}>Back</Text>
        </Pressable>
      ) : (
        <View style={styles.navButtonPlaceholder} />
      )}

      {!isLastStep ? (
        <Pressable 
          style={[
            styles.navButton,
            styles.nextNavButton,
            !canProceed && styles.navButtonDisabled,
          ]}
          onPress={onNext}
          disabled={!canProceed}
        >
          <Text style={styles.nextNavButtonText}>Continue</Text>
          <ChevronRight size={20} color="#ffffff" />
        </Pressable>
      ) : (
        <Pressable 
          style={[
            styles.navButton,
            styles.submitButton,
            (!canProceed || submitting) && styles.navButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={!canProceed || submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

// Step Header Component (for main header)
export const StepHeader = ({ title }: { title: string }) => {
  return (
    <View style={styles.stepHeader}>
      <Text style={styles.stepHeaderTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  progressIconActive: {
    backgroundColor: '#bd84f6',
  },
  progressIconCompleted: {
    backgroundColor: '#10b981',
  },
  progressText: {
    flex: 1,
  },
  progressStepTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 2,
  },
  progressStepTitleActive: {
    color: '#374151',
  },
  progressStepTitleCompleted: {
    color: '#10b981',
  },
  progressStepDescription: {
    fontSize: 10,
    color: '#d1d5db',
  },
  progressLine: {
    width: 20,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  progressLineCompleted: {
    backgroundColor: '#10b981',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  backNavButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  backNavButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextNavButton: {
    backgroundColor: '#bd84f6',
    flexDirection: 'row-reverse',
  },
  nextNavButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#10b981',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  navButtonPlaceholder: {
    flex: 0,
    marginRight: 8,
  },
  stepHeader: {
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
  stepHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
});