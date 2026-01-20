import React from 'react';
import { View, StyleSheet } from 'react-native';

const SkeletonLoading = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonBackButton} />
        <View style={styles.skeletonHeaderTitle} />
        <View style={styles.skeletonPlaceholder} />
      </View>

      {/* Progress Steps Skeleton */}

      {/* Main Content Skeleton */}
      <View style={styles.skeletonContent}>
        {/* Step Header Skeleton */}
        <View style={styles.skeletonStepHeader}>
          <View style={styles.skeletonStepIcon} />
          <View style={styles.skeletonStepHeaderText}>
            <View style={styles.skeletonStepTitle} />
            <View style={styles.skeletonStepSubtitle} />
          </View>
        </View>

        {/* Step Content Skeleton */}
        <View style={styles.skeletonStepContent}>
          {/* Children List Skeleton */}
          {[1, 2].map((item) => (
            <View key={item} style={styles.skeletonChildCard}>
              <View style={styles.skeletonChildAvatar} />
              <View style={styles.skeletonChildInfo}>
                <View style={styles.skeletonChildName} />
                <View style={styles.skeletonChildDetails} />
                <View style={styles.skeletonAppliedBadge} />
              </View>
              <View style={styles.skeletonRadioButton} />
            </View>
          ))}
        </View>

        {/* Navigation Buttons Skeleton */}
        <View style={styles.skeletonFooter}>
          <View style={styles.skeletonBackButtonNav} />
          <View style={styles.skeletonNextButton} />
        </View>
      </View>
    </View>
  );
};

const ClassSelectionSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonBackButton} />
        <View style={styles.skeletonHeaderTitle} />
        <View style={styles.skeletonPlaceholder} />
      </View>

      {/* Progress Steps Skeleton */}
      <View style={styles.skeletonProgressContainer}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.skeletonProgressStep}>
            <View style={styles.skeletonProgressIcon} />
            <View style={styles.skeletonProgressText}>
              <View style={styles.skeletonProgressTitle} />
              <View style={styles.skeletonProgressDescription} />
            </View>
            {item < 4 && <View style={styles.skeletonProgressLine} />}
          </View>
        ))}
      </View>

      {/* Main Content Skeleton */}
      <View style={styles.skeletonContent}>
        {/* Step Header Skeleton */}
        <View style={styles.skeletonStepHeader}>
          <View style={styles.skeletonStepIcon} />
          <View style={styles.skeletonStepHeaderText}>
            <View style={styles.skeletonStepTitle} />
            <View style={styles.skeletonStepSubtitle} />
          </View>
        </View>

        {/* Selected Child Info Skeleton */}
        <View style={styles.skeletonSelectedChildInfo}>
          <View style={styles.skeletonSelectedChildAvatar} />
          <View>
            <View style={styles.skeletonSelectedChildName} />
            <View style={styles.skeletonSelectedChildAge} />
          </View>
        </View>

        {/* Classes List Skeleton */}
        <View style={styles.skeletonClassesList}>
          <View style={styles.skeletonSectionTitle} />
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.skeletonClassCard}>
              <View style={styles.skeletonClassHeader}>
                <View style={styles.skeletonClassColor} />
                <View style={styles.skeletonClassName} />
                <View style={styles.skeletonClassSelectedIndicator} />
              </View>
              <View style={styles.skeletonClassDetails}>
                <View style={styles.skeletonClassDetailRow}>
                  <View style={styles.skeletonClassDetailIcon} />
                  <View style={styles.skeletonClassDetailText} />
                </View>
                <View style={styles.skeletonClassDetailRow}>
                  <View style={styles.skeletonClassDetailIcon} />
                  <View style={styles.skeletonClassDetailText} />
                </View>
              </View>
              <View style={styles.skeletonCapacityContainer}>
                <View style={styles.skeletonCapacityBar} />
                <View style={styles.skeletonCapacityText} />
              </View>
            </View>
          ))}
        </View>

        {/* Navigation Buttons Skeleton */}
        <View style={styles.skeletonFooter}>
          <View style={styles.skeletonBackButtonNav} />
          <View style={styles.skeletonNextButton} />
        </View>
      </View>
    </View>
  );
};

const NotesSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonBackButton} />
        <View style={styles.skeletonHeaderTitle} />
        <View style={styles.skeletonPlaceholder} />
      </View>

      {/* Progress Steps Skeleton */}
      <View style={styles.skeletonProgressContainer}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.skeletonProgressStep}>
            <View style={styles.skeletonProgressIcon} />
            <View style={styles.skeletonProgressText}>
              <View style={styles.skeletonProgressTitle} />
              <View style={styles.skeletonProgressDescription} />
            </View>
            {item < 4 && <View style={styles.skeletonProgressLine} />}
          </View>
        ))}
      </View>

      {/* Main Content Skeleton */}
      <View style={styles.skeletonContent}>
        {/* Step Header Skeleton */}
        <View style={styles.skeletonStepHeader}>
          <View style={styles.skeletonStepIcon} />
          <View style={styles.skeletonStepHeaderText}>
            <View style={styles.skeletonStepTitle} />
            <View style={styles.skeletonStepSubtitle} />
          </View>
        </View>

        {/* Application Summary Skeleton */}
        <View style={styles.skeletonApplicationSummary}>
          <View style={styles.skeletonSummaryTitle} />
          <View style={styles.skeletonSummaryItem}>
            <View style={styles.skeletonSummaryLabel} />
            <View style={styles.skeletonSummaryValue} />
          </View>
          <View style={styles.skeletonSummaryItem}>
            <View style={styles.skeletonSummaryLabel} />
            <View style={styles.skeletonSummaryValue} />
          </View>
        </View>

        {/* Notes Section Skeleton */}
        <View style={styles.skeletonNotesSection}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonNotesTextArea} />
        </View>

        {/* Message Section Skeleton */}
        <View style={styles.skeletonNotesSection}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonMessageTextArea} />
        </View>

        {/* Navigation Buttons Skeleton */}
        <View style={styles.skeletonFooter}>
          <View style={styles.skeletonBackButtonNav} />
          <View style={styles.skeletonNextButton} />
        </View>
      </View>
    </View>
  );
};

const SummarySkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonBackButton} />
        <View style={styles.skeletonHeaderTitle} />
        <View style={styles.skeletonPlaceholder} />
      </View>

      {/* Progress Steps Skeleton */}
      <View style={styles.skeletonProgressContainer}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.skeletonProgressStep}>
            <View style={styles.skeletonProgressIcon} />
            <View style={styles.skeletonProgressText}>
              <View style={styles.skeletonProgressTitle} />
              <View style={styles.skeletonProgressDescription} />
            </View>
            {item < 4 && <View style={styles.skeletonProgressLine} />}
          </View>
        ))}
      </View>

      {/* Main Content Skeleton */}
      <View style={styles.skeletonContent}>
        {/* Step Header Skeleton */}
        <View style={styles.skeletonStepHeader}>
          <View style={styles.skeletonStepIcon} />
          <View style={styles.skeletonStepHeaderText}>
            <View style={styles.skeletonStepTitle} />
            <View style={styles.skeletonStepSubtitle} />
          </View>
        </View>

        {/* Summary Cards Skeleton */}
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.skeletonSummaryCard}>
            <View style={styles.skeletonSummaryCardTitle} />
            <View style={styles.skeletonSummaryRow}>
              <View style={styles.skeletonSummaryLabel} />
              <View style={styles.skeletonSummaryValue} />
            </View>
            <View style={styles.skeletonSummaryRow}>
              <View style={styles.skeletonSummaryLabel} />
              <View style={styles.skeletonSummaryValue} />
            </View>
          </View>
        ))}

        {/* Disclaimer Skeleton */}
        <View style={styles.skeletonDisclaimerCard}>
          <View style={styles.skeletonDisclaimerIcon} />
          <View style={styles.skeletonDisclaimerText} />
        </View>

        {/* Navigation Buttons Skeleton */}
        <View style={styles.skeletonFooter}>
          <View style={styles.skeletonBackButtonNav} />
          <View style={styles.skeletonSubmitButton} />
        </View>
      </View>
    </View>
  );
};

export const LoadingComponent = ({ currentStep }: { currentStep: string }) => {
  switch (currentStep) {
    case 'child':
      return <SkeletonLoading />;
    case 'class':
      return <ClassSelectionSkeleton />;
    case 'notes':
      return <NotesSkeleton />;
    case 'summary':
      return <SummarySkeleton />;
    default:
      return <SkeletonLoading />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  skeletonHeader: {
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
  skeletonBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  skeletonHeaderTitle: {
    width: 150,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonPlaceholder: {
    width: 40,
  },
  skeletonProgressContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  skeletonProgressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  skeletonProgressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  skeletonProgressText: {
    flex: 1,
  },
  skeletonProgressTitle: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
    width: '60%',
  },
  skeletonProgressDescription: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '40%',
  },
  skeletonProgressLine: {
    width: 20,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  skeletonContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  skeletonStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  skeletonStepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  skeletonStepHeaderText: {
    flex: 1,
  },
  skeletonStepTitle: {
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  skeletonStepSubtitle: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '50%',
  },
  skeletonStepContent: {
    padding: 16,
  },
  skeletonChildCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  skeletonChildAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  skeletonChildInfo: {
    flex: 1,
  },
  skeletonChildName: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  skeletonChildDetails: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '40%',
  },
  skeletonAppliedBadge: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    width: 80,
  },
  skeletonRadioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  skeletonSelectedChildInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skeletonSelectedChildAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  skeletonSelectedChildName: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: 120,
  },
  skeletonSelectedChildAge: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: 100,
  },
  skeletonClassesList: {
    padding: 16,
  },
  skeletonClassCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  skeletonClassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonClassColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  skeletonClassName: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    flex: 1,
  },
  skeletonClassSelectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  skeletonClassDetails: {
    marginBottom: 12,
  },
  skeletonClassDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skeletonClassDetailIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
  },
  skeletonClassDetailText: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
  },
  skeletonCapacityContainer: {
    marginTop: 8,
  },
  skeletonCapacityBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 4,
  },
  skeletonCapacityText: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: 80,
    alignSelf: 'flex-end',
  },
  skeletonApplicationSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skeletonSummaryTitle: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
    width: '40%',
  },
  skeletonSummaryItem: {
    marginBottom: 12,
  },
  skeletonSummaryLabel: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
    width: 60,
  },
  skeletonSummaryValue: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '70%',
  },
  skeletonNotesSection: {
    marginBottom: 16,
  },
  skeletonNotesTextArea: {
    height: 120,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skeletonMessageTextArea: {
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skeletonSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skeletonSummaryCardTitle: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
    width: '50%',
  },
  skeletonSummaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  skeletonSummaryLabel: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: 100,
  },
  skeletonSummaryValue: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    flex: 1,
  },
  skeletonDisclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonDisclaimerIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  skeletonDisclaimerText: {
    flex: 1,
    height: 36,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginLeft: 12,
  },
  skeletonFooter: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  skeletonBackButtonNav: {
    flex: 1,
    height: 44,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginRight: 8,
  },
  skeletonNextButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  skeletonSubmitButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  skeletonSectionTitle: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
    width: '40%',
  },
});