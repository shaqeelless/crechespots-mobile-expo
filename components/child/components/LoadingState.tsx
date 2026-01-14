import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { headerStyles, loadingErrorStyles, sharedStyles } from '../styles';

// Skeleton Loading Components
const HeroSkeleton = () => (
  <View style={skeletonStyles.heroSkeleton}>
    <View style={skeletonStyles.heroContentSkeleton}>
      <View style={skeletonStyles.avatarSkeleton} />
      <View style={skeletonStyles.heroInfoSkeleton}>
        <View style={skeletonStyles.nameSkeleton} />
        <View style={skeletonStyles.ageSkeleton} />
        <View style={skeletonStyles.sinceSkeleton} />
        <View style={skeletonStyles.enrollmentBadgeSkeleton} />
      </View>
    </View>
    <View style={skeletonStyles.heroStatsSkeleton}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={skeletonStyles.heroStatSkeleton}>
          <View style={skeletonStyles.statNumberSkeleton} />
          <View style={skeletonStyles.statLabelSkeleton} />
        </View>
      ))}
    </View>
  </View>
);

const QuickActionsSkeleton = () => (
  <View style={skeletonStyles.sectionSkeleton}>
    <View style={skeletonStyles.sectionTitleSkeleton} />
    <View style={skeletonStyles.actionsGridSkeleton}>
      {[1, 2].map((i) => (
        <View key={i} style={skeletonStyles.actionButtonSkeleton}>
          <View style={skeletonStyles.actionIconSkeleton} />
          <View style={skeletonStyles.actionTextSkeleton} />
        </View>
      ))}
    </View>
  </View>
);

const CurrentCrecheSkeleton = () => (
  <View style={skeletonStyles.currentCrecheSkeleton}>
    <View style={skeletonStyles.crecheHeaderSkeleton}>
      <View style={skeletonStyles.iconSkeleton} />
      <View style={skeletonStyles.crecheTitleSkeleton} />
    </View>
    <View style={skeletonStyles.crecheContentSkeleton}>
      <View style={skeletonStyles.crecheImageSkeleton} />
      <View style={skeletonStyles.crecheInfoSkeleton}>
        <View style={skeletonStyles.crecheNameSkeleton} />
        <View style={skeletonStyles.crecheAddressSkeleton} />
      </View>
    </View>
    <View style={skeletonStyles.crecheNoteSkeleton} />
  </View>
);

const StatsGridSkeleton = () => (
  <View style={skeletonStyles.statsGridSkeleton}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={skeletonStyles.statCardSkeleton}>
        <View style={skeletonStyles.statIconSkeleton} />
        <View style={skeletonStyles.statNumberBigSkeleton} />
        <View style={skeletonStyles.statLabelSkeleton} />
      </View>
    ))}
  </View>
);

const ProgressSectionSkeleton = () => (
  <View style={skeletonStyles.sectionSkeleton}>
    <View style={skeletonStyles.sectionTitleSkeleton} />
    <View style={skeletonStyles.progressCardSkeleton}>
      <View style={skeletonStyles.progressHeaderSkeleton}>
        <View style={skeletonStyles.iconSkeleton} />
        <View style={skeletonStyles.progressTitleSkeleton} />
      </View>
      <View style={skeletonStyles.progressBarSkeleton}>
        <View style={skeletonStyles.progressFillSkeleton} />
      </View>
      <View style={skeletonStyles.progressTextSkeleton} />
    </View>
  </View>
);

const MedicalSummarySkeleton = () => (
  <View style={skeletonStyles.sectionSkeleton}>
    <View style={skeletonStyles.sectionTitleSkeleton} />
    <View style={skeletonStyles.medicalSummarySkeleton}>
      <View style={skeletonStyles.medicalHeaderSkeleton}>
        <View style={skeletonStyles.iconSkeleton} />
        <View style={skeletonStyles.medicalTitleSkeleton} />
      </View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={skeletonStyles.medicalItemSkeleton}>
          <View style={skeletonStyles.smallIconSkeleton} />
          <View style={skeletonStyles.medicalTextSkeleton} />
        </View>
      ))}
    </View>
  </View>
);

export default function LoadingState() {
  return (
    <View style={sharedStyles.container}>
      <View style={headerStyles.header}>
        <View style={headerStyles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </View>
        <Text style={headerStyles.headerTitle}>Child Details</Text>
        <View style={headerStyles.placeholder} />
      </View>
      
      <ScrollView style={sharedStyles.content} showsVerticalScrollIndicator={false}>
        <View style={skeletonStyles.container}>
          {/* Hero Section */}
          <HeroSkeleton />
          
          {/* Quick Actions */}
          <QuickActionsSkeleton />
          
          {/* Current Creche */}
          <CurrentCrecheSkeleton />
          
          {/* Stats Grid */}
          <StatsGridSkeleton />
          
          {/* Progress Section */}
          <ProgressSectionSkeleton />
          
          {/* Medical Summary */}
          <MedicalSummarySkeleton />
        </View>
      </ScrollView>
    </View>
  );
}

const skeletonStyles = {
  container: {
    padding: 16,
  },
  
  // Hero Section
  heroSkeleton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  heroContentSkeleton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e2e8f0',
    marginRight: 16,
  },
  heroInfoSkeleton: {
    flex: 1,
  },
  nameSkeleton: {
    height: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '70%',
    marginBottom: 8,
  },
  ageSkeleton: {
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '50%',
    marginBottom: 8,
  },
  sinceSkeleton: {
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '40%',
    marginBottom: 12,
  },
  enrollmentBadgeSkeleton: {
    height: 28,
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    width: '60%',
  },
  heroStatsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  heroStatSkeleton: {
    alignItems: 'center',
  },
  statNumberSkeleton: {
    height: 28,
    width: 40,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    marginBottom: 4,
  },
  statLabelSkeleton: {
    height: 12,
    width: 60,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },

  // Quick Actions
  sectionSkeleton: {
    marginBottom: 24,
  },
  sectionTitleSkeleton: {
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '40%',
    marginBottom: 12,
  },
  actionsGridSkeleton: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonSkeleton: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconSkeleton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  actionTextSkeleton: {
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '80%',
  },

  // Current Creche
  currentCrecheSkeleton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  crecheHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconSkeleton: {
    width: 20,
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    marginRight: 8,
  },
  crecheTitleSkeleton: {
    height: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '60%',
  },
  crecheContentSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  crecheImageSkeleton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    marginRight: 12,
  },
  crecheInfoSkeleton: {
    flex: 1,
  },
  crecheNameSkeleton: {
    height: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '70%',
    marginBottom: 6,
  },
  crecheAddressSkeleton: {
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '90%',
  },
  crecheNoteSkeleton: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '100%',
  },

  // Stats Grid
  statsGridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCardSkeleton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statIconSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginBottom: 12,
  },
  statNumberBigSkeleton: {
    height: 32,
    width: 50,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    marginBottom: 4,
  },
  
  // Progress Section
  progressCardSkeleton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  progressHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitleSkeleton: {
    height: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '50%',
    marginLeft: 8,
  },
  progressBarSkeleton: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFillSkeleton: {
    height: '100%',
    width: '60%',
    backgroundColor: '#cbd5e1',
    borderRadius: 4,
  },
  progressTextSkeleton: {
    height: 14,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '80%',
  },

  // Medical Summary
  medicalSummarySkeleton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  medicalHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicalTitleSkeleton: {
    height: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    width: '40%',
    marginLeft: 8,
  },
  medicalItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  smallIconSkeleton: {
    width: 16,
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    marginRight: 8,
  },
  medicalTextSkeleton: {
    height: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    flex: 1,
  },
};

// Optional: You can also keep the simple loading option as a fallback
export function SimpleLoadingState() {
  return (
    <View style={sharedStyles.container}>
      <View style={headerStyles.header}>
        <View style={headerStyles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </View>
        <Text style={headerStyles.headerTitle}>Child Details</Text>
        <View style={headerStyles.placeholder} />
      </View>
      <View style={loadingErrorStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={loadingErrorStyles.loadingText}>Loading child details...</Text>
      </View>
    </View>
  );
}