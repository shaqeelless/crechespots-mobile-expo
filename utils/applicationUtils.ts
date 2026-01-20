import { Baby, GraduationCap, MessageCircle, CheckCircle } from 'lucide-react-native';

export const STEPS = [
  {
    id: 'child',
    title: 'Select Child',
    description: 'Choose which child to apply for',
    icon: Baby
  },
  {
    id: 'class',
    title: 'Choose Class',
    description: 'Select suitable class for age',
    icon: GraduationCap
  },
  {
    id: 'notes',
    title: 'Add Notes',
    description: 'Provide additional information',
    icon: MessageCircle
  },
  {
    id: 'summary',
    title: 'Review & Submit',
    description: 'Confirm your application',
    icon: CheckCircle
  }
];

export const calculateChildAgeInMonths = (dateOfBirth: string) => {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months += today.getMonth() - birthDate.getMonth();
  
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
};

export const getCapacityColor = (percentage: number) => {
  if (percentage >= 90) return '#ef4444';
  if (percentage >= 75) return '#f59e0b';
  return '#10b981';
};

export const getCapacityText = (percentage: number) => {
  if (percentage >= 90) return 'Almost Full';
  if (percentage >= 75) return 'Limited Spots';
  return 'Available';
};