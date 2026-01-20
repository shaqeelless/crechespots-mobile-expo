import React from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Baby,
  GraduationCap,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Info,
  CheckCircle as CheckCircleIcon,
} from 'lucide-react-native';
import { calculateChildAgeInMonths } from '@/utils/applicationUtils';

// Child Selection Step
export const ChildSelectionStep = ({
  children,
  selectedChild,
  setSelectedChild,
  existingApplications,
}: {
  children: any[];
  selectedChild: string;
  setSelectedChild: (id: string) => void;
  existingApplications: Record<string, any>;
}) => {
  const router = useRouter();

  return (
    <>
      <View style={stepStyles.stepHeader}>
        <Baby size={24} color="#bd84f6" />
        <View style={stepStyles.stepHeaderText}>
          <Text style={stepStyles.stepTitle}>Select Your Child</Text>
          <Text style={stepStyles.stepSubtitle}>
            Choose which child you want to apply for
          </Text>
        </View>
      </View>

      {children.length > 0 ? (
        <ScrollView style={stepStyles.childrenList}>
          {children.map((childItem) => (
            <Pressable
              key={childItem.id}
              style={[
                stepStyles.childCard,
                selectedChild === childItem.id && stepStyles.childCardSelected,
                existingApplications[childItem.id] && stepStyles.childCardDisabled,
              ]}
              onPress={() => {
                if (!existingApplications[childItem.id]) {
                  setSelectedChild(childItem.id);
                }
              }}
              disabled={!!existingApplications[childItem.id]}
            >
              <View style={[
                stepStyles.childAvatar,
                selectedChild === childItem.id && stepStyles.childAvatarSelected,
              ]}>
                <Text style={stepStyles.childInitials}>
                  {`${childItem.first_name.charAt(0)}${childItem.last_name.charAt(0)}`.toUpperCase()}
                </Text>
              </View>
              <View style={stepStyles.childInfo}>
                <Text style={stepStyles.childName}>
                  {childItem.first_name} {childItem.last_name}
                </Text>
                <Text style={stepStyles.childDetails}>
                  {Math.floor(calculateChildAgeInMonths(childItem.date_of_birth) / 12)} years • {childItem.gender}
                </Text>
                {existingApplications[childItem.id] && (
                  <View style={stepStyles.appliedBadge}>
                    <CheckCircle size={12} color="#10b981" />
                    <Text style={stepStyles.appliedText}>Already Applied</Text>
                  </View>
                )}
              </View>
              {selectedChild === childItem.id && (
                <View style={stepStyles.selectedIndicator}>
                  <CheckCircle size={20} color="#ffffff" />
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={stepStyles.emptyState}>
          <Baby size={48} color="#9ca3af" />
          <Text style={stepStyles.emptyStateTitle}>No Children Found</Text>
          <Text style={stepStyles.emptyStateText}>
            Add a child profile to apply for creche
          </Text>
          <Pressable 
            style={stepStyles.addChildButton}
            onPress={() => router.push('/children/add')}
          >
            <Text style={stepStyles.addChildButtonText}>Add Child Profile</Text>
          </Pressable>
        </View>
      )}

      {selectedChild && existingApplications[selectedChild] && (
        <View style={stepStyles.warningCard}>
          <AlertCircle size={20} color="#f59e0b" />
          <Text style={stepStyles.warningText}>
            This child already has an application for this creche. 
            You can check the status in your Applications.
          </Text>
        </View>
      )}
    </>
  );
};

// Class Selection Step
export const ClassSelectionStep = ({
  children,
  classes,
  selectedChild,
  selectedClass,
  setSelectedClass,
  onBackToChildSelection,
}: {
  children: any[];
  classes: any[];
  selectedChild: string;
  selectedClass: string;
  setSelectedClass: (id: string) => void;
  onBackToChildSelection: () => void;
}) => {
  const child = children.find(c => c.id === selectedChild);
  const childAgeInMonths = selectedChild ? calculateChildAgeInMonths(child?.date_of_birth) : 0;
  
  const getAvailableClassesForChild = () => {
    if (!selectedChild) return [];
    return classes.filter(classItem => 
      childAgeInMonths >= classItem.min_age_months && 
      childAgeInMonths <= classItem.max_age_months
    );
  };

  const availableClasses = getAvailableClassesForChild();

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 75) return '#f59e0b';
    return '#10b981';
  };

  return (
    <>
      <View style={stepStyles.stepHeader}>
        <GraduationCap size={24} color="#bd84f6" />
        <View style={stepStyles.stepHeaderText}>
          <Text style={stepStyles.stepTitle}>Choose a Class</Text>
          <Text style={stepStyles.stepSubtitle}>
            Select a suitable class for your child's age
          </Text>
        </View>
      </View>

      {selectedChild ? (
        <View style={stepStyles.selectedChildInfo}>
          <View style={stepStyles.selectedChildAvatar}>
            <Text style={stepStyles.selectedChildInitials}>
              {`${child?.first_name?.charAt(0)}${child?.last_name?.charAt(0)}`.toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={stepStyles.selectedChildName}>
              {child?.first_name} {child?.last_name}
            </Text>
            <Text style={stepStyles.selectedChildAge}>
              {Math.floor(childAgeInMonths / 12)} years {childAgeInMonths % 12} months
            </Text>
          </View>
        </View>
      ) : (
        <View style={stepStyles.errorCard}>
          <AlertCircle size={20} color="#ef4444" />
          <Text style={stepStyles.errorText}>Please select a child first</Text>
          <Pressable 
            style={stepStyles.goBackButton}
            onPress={onBackToChildSelection}
          >
            <Text style={stepStyles.goBackText}>Go Back</Text>
          </Pressable>
        </View>
      )}

      {selectedChild && availableClasses.length > 0 ? (
        <ScrollView style={stepStyles.classesList}>
          <Text style={stepStyles.sectionTitle}>Available Classes</Text>
          {availableClasses.map((classItem) => {
            const capacityPercentage = classItem.current_enrollment 
              ? (classItem.current_enrollment / classItem.capacity) * 100 
              : 0;
            
            return (
              <Pressable
                key={classItem.id}
                style={[
                  stepStyles.classCard,
                  selectedClass === classItem.id && stepStyles.classCardSelected,
                ]}
                onPress={() => setSelectedClass(classItem.id)}
              >
                <View style={stepStyles.classHeader}>
                  <View style={[stepStyles.classColor, { backgroundColor: classItem.color }]} />
                  <Text style={stepStyles.className}>{classItem.name}</Text>
                  {selectedClass === classItem.id && (
                    <View style={stepStyles.classSelectedIndicator}>
                      <CheckCircleIcon size={16} color="#ffffff" />
                    </View>
                  )}
                </View>
                
                <View style={stepStyles.classDetails}>
                  <View style={stepStyles.classDetailRow}>
                    <Calendar size={14} color="#6b7280" />
                    <Text style={stepStyles.classDetailText}>
                      Age: {classItem.min_age_months} - {classItem.max_age_months} months
                    </Text>
                  </View>
                  
                  <View style={stepStyles.classDetailRow}>
                    <Users size={14} color="#6b7280" />
                    <Text style={stepStyles.classDetailText}>
                      Spots: {classItem.current_enrollment || 0}/{classItem.capacity}
                    </Text>
                  </View>
                </View>

                <View style={stepStyles.capacityContainer}>
                  <View style={stepStyles.capacityBar}>
                    <View 
                      style={[
                        stepStyles.capacityFill,
                        { 
                          width: `${Math.min(capacityPercentage, 100)}%`,
                          backgroundColor: getCapacityColor(capacityPercentage)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[
                    stepStyles.capacityText,
                    { color: getCapacityColor(capacityPercentage) }
                  ]}>
                    {capacityPercentage >= 90 ? 'Almost Full' : 
                     capacityPercentage >= 75 ? 'Limited Spots' : 
                     'Available'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : selectedChild && availableClasses.length === 0 ? (
        <View style={stepStyles.emptyState}>
          <GraduationCap size={48} color="#9ca3af" />
          <Text style={stepStyles.emptyStateTitle}>No Suitable Classes</Text>
          <Text style={stepStyles.emptyStateText}>
            Unfortunately, there are no classes available for your child's age at this creche.
          </Text>
          <View style={stepStyles.ageInfoCard}>
            <Info size={16} color="#6b7280" />
            <Text style={stepStyles.ageInfoText}>
              Your child is {Math.floor(childAgeInMonths / 12)} years {childAgeInMonths % 12} months old.
            </Text>
          </View>
        </View>
      ) : null}
    </>
  );
};

// Notes Step
export const NotesStep = ({
  children,
  classes,
  selectedChild,
  selectedClass,
  formData,
  setFormData,
}: {
  children: any[];
  classes: any[];
  selectedChild: string;
  selectedClass: string;
  formData: { message: string; notes: string };
  setFormData: (data: { message: string; notes: string }) => void;
}) => {
  const child = children.find(c => c.id === selectedChild);
  const crecheClass = classes.find(cls => cls.id === selectedClass);

  return (
    <>
      <View style={stepStyles.stepHeader}>
        <MessageCircle size={24} color="#bd84f6" />
        <View style={stepStyles.stepHeaderText}>
          <Text style={stepStyles.stepTitle}>Add Notes</Text>
          <Text style={stepStyles.stepSubtitle}>
            Provide any additional information (optional)
          </Text>
        </View>
      </View>

      <ScrollView style={stepStyles.notesContent}>
        <View style={stepStyles.applicationSummary}>
          <Text style={stepStyles.summaryTitle}>Application Summary</Text>
          <View style={stepStyles.summaryItem}>
            <Text style={stepStyles.summaryLabel}>Child:</Text>
            <Text style={stepStyles.summaryValue}>
              {child?.first_name} {child?.last_name}
            </Text>
          </View>
          <View style={stepStyles.summaryItem}>
            <Text style={stepStyles.summaryLabel}>Class:</Text>
            <Text style={stepStyles.summaryValue}>
              {crecheClass?.name}
            </Text>
          </View>
        </View>

        <View style={stepStyles.notesSection}>
          <Text style={stepStyles.sectionTitle}>Special Requirements</Text>
          <TextInput
            style={stepStyles.notesTextArea}
            placeholder="Any medical conditions, allergies, dietary restrictions, or special needs..."
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={stepStyles.notesSection}>
          <Text style={stepStyles.sectionTitle}>Additional Message</Text>
          <TextInput
            style={stepStyles.messageTextArea}
            placeholder="Any questions or additional information for the creche..."
            value={formData.message}
            onChangeText={(text) => setFormData({ ...formData, message: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </>
  );
};

// Summary Step
export const SummaryStep = ({
  children,
  classes,
  selectedChild,
  selectedClass,
  formData,
  creche,
  profile,
}: {
  children: any[];
  classes: any[];
  selectedChild: string;
  selectedClass: string;
  formData: { message: string; notes: string };
  creche: any;
  profile: any;
}) => {
  const child = children.find(c => c.id === selectedChild);
  const crecheClass = classes.find(cls => cls.id === selectedClass);
  const childAgeInMonths = selectedChild ? calculateChildAgeInMonths(child?.date_of_birth) : 0;

  return (
    <>
      <View style={stepStyles.stepHeader}>
        <CheckCircle size={24} color="#bd84f6" />
        <View style={stepStyles.stepHeaderText}>
          <Text style={stepStyles.stepTitle}>Review & Submit</Text>
          <Text style={stepStyles.stepSubtitle}>
            Confirm your application details
          </Text>
        </View>
      </View>

      <ScrollView style={stepStyles.summaryContent}>
        <View style={stepStyles.summaryCard}>
          <Text style={stepStyles.summaryCardTitle}>Creche Information</Text>
          <View style={stepStyles.summaryRow}>
            <Text style={stepStyles.summaryLabel}>Creche Name:</Text>
            <Text style={stepStyles.summaryValue}>{creche?.name}</Text>
          </View>
          <View style={stepStyles.summaryRow}>
            <Text style={stepStyles.summaryLabel}>Address:</Text>
            <Text style={stepStyles.summaryValue}>{creche?.address}</Text>
          </View>
        </View>

        <View style={stepStyles.summaryCard}>
          <Text style={stepStyles.summaryCardTitle}>Child Information</Text>
          <View style={stepStyles.summaryRow}>
            <Text style={stepStyles.summaryLabel}>Name:</Text>
            <Text style={stepStyles.summaryValue}>
              {child?.first_name} {child?.last_name}
            </Text>
          </View>
          <View style={stepStyles.summaryRow}>
            <Text style={stepStyles.summaryLabel}>Age:</Text>
            <Text style={stepStyles.summaryValue}>
              {Math.floor(childAgeInMonths / 12)} years
            </Text>
          </View>
        </View>

        <View style={stepStyles.summaryCard}>
          <Text style={stepStyles.summaryCardTitle}>Class Information</Text>
          <View style={stepStyles.summaryRow}>
            <Text style={stepStyles.summaryLabel}>Class:</Text>
            <Text style={stepStyles.summaryValue}>
              {crecheClass?.name}
              {crecheClass && (
                <Text style={stepStyles.capacityInfo}>
                  {' '}({crecheClass.current_enrollment}/{crecheClass.capacity} spots filled)
                </Text>
              )}
            </Text>
          </View>
          <View style={stepStyles.summaryRow}>
            <Text style={stepStyles.summaryLabel}>Age Range:</Text>
            <Text style={stepStyles.summaryValue}>
              {crecheClass?.min_age_months} - {crecheClass?.max_age_months} months
            </Text>
          </View>
        </View>

        {formData.notes && (
          <View style={stepStyles.summaryCard}>
            <Text style={stepStyles.summaryCardTitle}>Special Requirements</Text>
            <Text style={stepStyles.notesPreview}>{formData.notes}</Text>
          </View>
        )}

        {formData.message && (
          <View style={stepStyles.summaryCard}>
            <Text style={stepStyles.summaryCardTitle}>Additional Message</Text>
            <Text style={stepStyles.notesPreview}>{formData.message}</Text>
          </View>
        )}

        <View style={stepStyles.summaryCard}>
          <Text style={stepStyles.summaryCardTitle}>Parent Information</Text>
          <View style={stepStyles.summaryRow}>
            <Text style={stepStyles.summaryLabel}>Name:</Text>
            <Text style={stepStyles.summaryValue}>
              {profile?.first_name} {profile?.last_name}
            </Text>
          </View>
          <View style={stepStyles.summaryRow}>
            <Text style={stepStyles.summaryLabel}>Email:</Text>
            <Text style={stepStyles.summaryValue}>{profile?.email}</Text>
          </View>
          <View style={stepStyles.summaryRow}>
            <Text style={stepStyles.summaryLabel}>Phone:</Text>
            <Text style={stepStyles.summaryValue}>{profile?.phone_number || 'Not provided'}</Text>
          </View>
          <View style={stepStyles.summaryRow}>
            <Text style={stepStyles.summaryLabel}>Address:</Text>
            <Text style={stepStyles.summaryValue}>
              {[profile?.suburb, profile?.city, profile?.province].filter(Boolean).join(', ') || 'Not provided'}
            </Text>
          </View>
        </View>

        <View style={stepStyles.disclaimerCard}>
          <Info size={20} color="#6b7280" />
          <Text style={stepStyles.disclaimerText}>
            By submitting, you agree to share your information with the creche.
            Each child can only have one active application per creche.
          </Text>
        </View>
      </ScrollView>
    </>
  );
};

const stepStyles = {
  stepHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stepHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#374151',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  childrenList: {
    padding: 16,
  },
  childCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  childCardSelected: {
    borderColor: '#bd84f6',
    backgroundColor: '#fdf2f8',
  },
  childCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f9fafb',
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9cdcb8',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  childAvatarSelected: {
    backgroundColor: '#bd84f6',
  },
  childInitials: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  appliedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    backgroundColor: '#10b98115',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  appliedText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#bd84f6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  addChildButton: {
    backgroundColor: '#bd84f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addChildButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  warningCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fef3c7',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    marginLeft: 12,
  },
  selectedChildInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#ffffff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedChildAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#bd84f6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  selectedChildInitials: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  selectedChildName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 4,
  },
  selectedChildAge: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorCard: {
    alignItems: 'center' as const,
    backgroundColor: '#fef2f2',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 12,
    marginBottom: 16,
  },
  goBackButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  goBackText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  classesList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  classCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  classCardSelected: {
    borderColor: '#bd84f6',
    backgroundColor: '#fdf2f8',
  },
  classHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  classColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    flex: 1,
  },
  classSelectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#bd84f6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  classDetails: {
    marginBottom: 12,
  },
  classDetailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  classDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  capacityContainer: {
    marginTop: 8,
  },
  capacityBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden' as const,
    marginBottom: 4,
  },
  capacityFill: {
    height: '100%',
    borderRadius: 3,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'right' as const,
  },
  ageInfoCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  ageInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  notesContent: {
    padding: 16,
  },
  applicationSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 16,
  },
  summaryItem: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
  },
  notesSection: {
    marginBottom: 16,
  },
  notesTextArea: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#374151',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlignVertical: 'top' as const,
  },
  messageTextArea: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#374151',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlignVertical: 'top' as const,
  },
  summaryContent: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryCardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row' as const,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 100,
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  capacityInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
  notesPreview: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  disclaimerCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 12,
    lineHeight: 18,
  },
};