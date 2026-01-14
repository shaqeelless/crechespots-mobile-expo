import React from 'react';
import { View, Text } from 'react-native';
import { CalendarClock } from 'lucide-react-native';
import { AttendanceRecord } from '../types';
import {
  sharedStyles,
  attendanceStyles,
} from '../styles';

interface AttendanceSectionProps {
  isChildEnrolledAsStudent: boolean;
  attendance: AttendanceRecord[];
  getAttendancePercentage: () => number;
  getAttendanceColor: (status: string) => string;
}

export default function AttendanceSection({
  isChildEnrolledAsStudent,
  attendance,
  getAttendancePercentage,
  getAttendanceColor,
}: AttendanceSectionProps) {
  return (
    <View style={sharedStyles.section}>
      <View style={sharedStyles.sectionHeader}>
        <Text style={sharedStyles.sectionTitle}>Attendance</Text>
        <Text style={sharedStyles.sectionSubtitle}>{getAttendancePercentage()}% overall attendance</Text>
      </View>
      
      {isChildEnrolledAsStudent ? (
        <>
          {/* Attendance Summary */}
          <View style={attendanceStyles.attendanceSummary}>
            <View style={attendanceStyles.attendanceStat}>
              <Text style={attendanceStyles.attendanceStatNumber}>
                {attendance.filter(a => a.status === 'Present').length}
              </Text>
              <Text style={attendanceStyles.attendanceStatLabel}>Present</Text>
            </View>
            <View style={attendanceStyles.attendanceStat}>
              <Text style={attendanceStyles.attendanceStatNumber}>
                {attendance.filter(a => a.status === 'Absent').length}
              </Text>
              <Text style={attendanceStyles.attendanceStatLabel}>Absent</Text>
            </View>
            <View style={attendanceStyles.attendanceStat}>
              <Text style={attendanceStyles.attendanceStatNumber}>
                {attendance.filter(a => a.status === 'Late').length}
              </Text>
              <Text style={attendanceStyles.attendanceStatLabel}>Late</Text>
            </View>
          </View>

          {attendance.length > 0 ? (
            attendance.map((record) => (
              <View key={record.id} style={attendanceStyles.attendanceCard}>
                <View style={attendanceStyles.attendanceDate}>
                  <Text style={attendanceStyles.attendanceDay}>
                    {new Date(record.attendance_date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={attendanceStyles.attendanceNumber}>
                    {new Date(record.attendance_date).getDate()}
                  </Text>
                </View>
                <View style={attendanceStyles.attendanceInfo}>
                  <Text style={attendanceStyles.attendanceMonth}>
                    {new Date(record.attendance_date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </Text>
                  <View style={attendanceStyles.statusRow}>
                    <View style={[
                      attendanceStyles.statusDot,
                      { backgroundColor: getAttendanceColor(record.status) }
                    ]} />
                    <Text style={[
                      attendanceStyles.attendanceStatus,
                      { color: getAttendanceColor(record.status) }
                    ]}>
                      {record.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={sharedStyles.emptyState}>
              <CalendarClock size={48} color="#d1d5db" />
              <Text style={sharedStyles.emptyText}>No attendance records</Text>
            </View>
          )}
        </>
      ) : (
        <View style={sharedStyles.emptyState}>
          <CalendarClock size={48} color="#d1d5db" />
          <Text style={sharedStyles.emptyText}>Not enrolled as a student</Text>
          <Text style={sharedStyles.emptySubtext}>
            Attendance records are only available for enrolled students.
          </Text>
        </View>
      )}
    </View>
  );
}