import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { FileText, School } from 'lucide-react-native';
import { Child, Application } from '../types';
import { Router } from 'expo-router';
import {
  sharedStyles,
  applicationsStyles,
  overviewStyles,
} from '../styles';

interface ApplicationsSectionProps {
  child: Child;
  applications: Application[];
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
  router: Router;
}

export default function ApplicationsSection({
  child,
  applications,
  getStatusIcon,
  getStatusColor,
  router,
}: ApplicationsSectionProps) {
  const getTransferApplications = () => {
    return applications.filter(app => app.creche_id !== child.creche_id);
  };

  const getCurrentCrecheApplications = () => {
    if (!child.creche_id) return [];
    return applications.filter(app => app.creche_id === child.creche_id);
  };

  const hasTransferApplications = getTransferApplications().length > 0;
  const hasCurrentCrecheApplications = getCurrentCrecheApplications().length > 0;

  return (
    <View style={sharedStyles.section}>
      <View style={sharedStyles.sectionHeader}>
        <Text style={sharedStyles.sectionTitle}>All Applications</Text>
        <Text style={sharedStyles.sectionSubtitle}>{applications.length} total applications</Text>
      </View>
      
      {/* Current Registration Info */}
      {child.creche && (
        <View style={overviewStyles.currentCrecheInfoCard}>
          <Text style={overviewStyles.currentCrecheInfoTitle}>Currently Registered At:</Text>
          <View style={overviewStyles.currentCrecheInfoContent}>
            <School size={16} color="#8b5cf6" />
            <Text style={overviewStyles.currentCrecheInfoText}>{child.creche.name}</Text>
          </View>
        </View>
      )}

      {applications.length > 0 ? (
        <>
          {/* Transfer Applications */}
          {hasTransferApplications && (
            <>
              <Text style={applicationsStyles.applicationsSubtitle}>Transfer Applications</Text>
              {getTransferApplications().map((application) => (
                <Pressable 
                  key={application.id} 
                  style={applicationsStyles.applicationCard}
                  onPress={() => router.push(`/applications/${application.id}`)}
                >
                  <View style={overviewStyles.transferBadge}>
                    <Text style={overviewStyles.transferBadgeText}>Transfer</Text>
                  </View>
                  <Image 
                    source={{ uri: application.creches?.header_image }} 
                    style={applicationsStyles.crecheImage} 
                  />
                  <View style={applicationsStyles.applicationInfo}>
                    <Text style={applicationsStyles.crecheName}>{application.creches?.name}</Text>
                    <Text style={applicationsStyles.applicationDate}>
                      Applied: {new Date(application.created_at).toLocaleDateString()}
                    </Text>
                    <View style={applicationsStyles.statusRow}>
                      {getStatusIcon(application.application_status)}
                      <Text style={[
                        applicationsStyles.statusText, 
                        { color: getStatusColor(application.application_status) }
                      ]}>
                        {application.application_status}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </>
          )}

          {/* Applications to Current Creche */}
          {hasCurrentCrecheApplications && (
            <>
              <Text style={[applicationsStyles.applicationsSubtitle, { marginTop: hasTransferApplications ? 20 : 0 }]}>
                Applications to Current Creche
              </Text>
              {getCurrentCrecheApplications().map((application) => (
                <Pressable 
                  key={application.id} 
                  style={applicationsStyles.applicationCard}
                  onPress={() => router.push(`/applications/${application.id}`)}
                >
                  <Image 
                    source={{ uri: application.creches?.header_image }} 
                    style={applicationsStyles.crecheImage} 
                  />
                  <View style={applicationsStyles.applicationInfo}>
                    <Text style={applicationsStyles.crecheName}>{application.creches?.name}</Text>
                    <Text style={applicationsStyles.applicationDate}>
                      Applied: {new Date(application.created_at).toLocaleDateString()}
                    </Text>
                    <View style={applicationsStyles.statusRow}>
                      {getStatusIcon(application.application_status)}
                      <Text style={[
                        applicationsStyles.statusText, 
                        { color: getStatusColor(application.application_status) }
                      ]}>
                        {application.application_status}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </>
          )}
        </>
      ) : (
        <View style={sharedStyles.emptyState}>
          <FileText size={48} color="#d1d5db" />
          <Text style={sharedStyles.emptyText}>No applications found</Text>
          {child.creche_id && (
            <Pressable 
              style={applicationsStyles.applyButton}
              onPress={() => router.push(`/apply/${child.id}`)}
            >
              <Text style={applicationsStyles.applyButtonText}>Apply to Another Creche</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}