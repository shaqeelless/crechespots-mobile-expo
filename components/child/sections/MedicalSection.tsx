import React from 'react';
import { View, Text } from 'react-native';
import { Heart, Stethoscope } from 'lucide-react-native';
import { Child, MedicalRecord } from '../types';
import {
  sharedStyles,
  medicalStyles,
} from '../styles';

interface MedicalSectionProps {
  child: Child;
  isChildEnrolledAsStudent: boolean;
  medicalRecords: MedicalRecord[];
}

export default function MedicalSection({
  child,
  isChildEnrolledAsStudent,
  medicalRecords,
}: MedicalSectionProps) {
  return (
    <View style={sharedStyles.section}>
      <View style={sharedStyles.sectionHeader}>
        <Text style={sharedStyles.sectionTitle}>Medical Records</Text>
        <Text style={sharedStyles.sectionSubtitle}>{medicalRecords.length} medical records</Text>
      </View>
      
      {isChildEnrolledAsStudent ? (
        medicalRecords.length > 0 ? (
          medicalRecords.map((record) => (
            <View key={record.id} style={medicalStyles.medicalCard}>
              <View style={medicalStyles.medicalHeader}>
                <Stethoscope size={20} color="#374151" />
                <Text style={medicalStyles.medicalCreche}>{record.creches?.name}</Text>
              </View>
              <View style={medicalStyles.medicalGrid}>
                <View style={medicalStyles.medicalInfo}>
                  <Text style={medicalStyles.medicalLabel}>Immunization Status:</Text>
                  <Text style={medicalStyles.medicalValue}>{record.immunization_status}</Text>
                </View>
                {record.allergies && (
                  <View style={medicalStyles.medicalInfo}>
                    <Text style={medicalStyles.medicalLabel}>Allergies:</Text>
                    <Text style={medicalStyles.medicalValue}>{record.allergies}</Text>
                  </View>
                )}
                {record.last_checkup && (
                  <View style={medicalStyles.medicalInfo}>
                    <Text style={medicalStyles.medicalLabel}>Last Checkup:</Text>
                    <Text style={medicalStyles.medicalValue}>
                      {new Date(record.last_checkup).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {record.next_checkup && (
                  <View style={medicalStyles.medicalInfo}>
                    <Text style={medicalStyles.medicalLabel}>Next Checkup:</Text>
                    <Text style={medicalStyles.medicalValue}>
                      {new Date(record.next_checkup).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
              {record.medical_notes && (
                <View style={medicalStyles.medicalNotes}>
                  <Text style={medicalStyles.medicalLabel}>Notes:</Text>
                  <Text style={medicalStyles.medicalValue}>{record.medical_notes}</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={sharedStyles.emptyState}>
            <Heart size={48} color="#d1d5db" />
            <Text style={sharedStyles.emptyText}>No medical records</Text>
          </View>
        )
      ) : (
        <View style={sharedStyles.emptyState}>
          <Heart size={48} color="#d1d5db" />
          <Text style={sharedStyles.emptyText}>Not enrolled as a student</Text>
          <Text style={sharedStyles.emptySubtext}>
            Medical records are only available for enrolled students.
          </Text>
        </View>
      )}
    </View>
  );
}