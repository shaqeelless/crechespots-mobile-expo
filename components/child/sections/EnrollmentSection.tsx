import React from 'react';
import { View, Text, Image } from 'react-native';
import { School, MapPin } from 'lucide-react-native';
import { Child, Student } from '../types';
import {
  sharedStyles,
  enrollmentStyles,
  overviewStyles,
} from '../styles';

interface EnrollmentSectionProps {
  child: Child;
  students: Student[];
  formatCurrency: (amount: number) => string;
}

export default function EnrollmentSection({
  child,
  students,
  formatCurrency,
}: EnrollmentSectionProps) {
  const isChildEnrolledAsStudent = students.length > 0;

  return (
    <View style={sharedStyles.section}>
      <View style={sharedStyles.sectionHeader}>
        <Text style={sharedStyles.sectionTitle}>Student Enrollment</Text>
        <Text style={sharedStyles.sectionSubtitle}>{students.length} active enrollments</Text>
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

      {isChildEnrolledAsStudent ? (
        students.map((student) => (
          <View key={student.id} style={enrollmentStyles.studentCard}>
            <Image 
              source={{ uri: student.creches?.header_image }} 
              style={overviewStyles.currentCrecheImage} 
            />
            <View style={enrollmentStyles.studentInfo}>
              <Text style={overviewStyles.currentCrecheName}>{student.creches?.name}</Text>
              <Text style={enrollmentStyles.classText}>Class: {student.class || 'Not assigned'}</Text>
              <Text style={enrollmentStyles.addressText}>
                <MapPin size={12} color="#64748b" /> {student.creches?.address}
              </Text>
              <View style={enrollmentStyles.feesContainer}>
                <View style={enrollmentStyles.feesProgress}>
                  <View 
                    style={[
                      enrollmentStyles.feesProgressBar, 
                      { 
                        width: `${student.fees_owed > 0 ? 
                          Math.min((student.fees_paid / student.fees_owed) * 100, 100) : 0}%` 
                      }
                    ]} 
                  />
                </View>
                <Text style={enrollmentStyles.feesText}>
                  {formatCurrency(student.fees_paid)} paid / {formatCurrency(student.fees_owed)} owed
                </Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={sharedStyles.emptyState}>
          <School size={48} color="#d1d5db" />
          <Text style={sharedStyles.emptyText}>Not currently enrolled as a student</Text>
          <Text style={sharedStyles.emptySubtext}>
            {child.creche ? 
              `Child is registered at ${child.creche.name} but not enrolled yet.` :
              'Child is not registered at any creche.'
            }
          </Text>
        </View>
      )}
    </View>
  );
}