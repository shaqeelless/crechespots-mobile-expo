import React from 'react';
import { ScrollView, View, Pressable, Text } from 'react-native';
import {
  BarChart3,
  FileText,
  School,
  CalendarClock,
  Heart,
  Users,
  BookOpen,
} from 'lucide-react-native';
import { TabItem } from '../types';
import { tabsStyles } from '../styles';

interface TabsNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function TabsNavigation({ activeSection, onSectionChange }: TabsNavigationProps) {
  const tabs: TabItem[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'applications', label: 'Applications', icon: FileText },
    { key: 'enrollment', label: 'Enrollment', icon: School },
    { key: 'attendance', label: 'Attendance', icon: CalendarClock },
    { key: 'medical', label: 'Medical', icon: Heart },
    { key: 'finance', label: 'Finance', icon: FileText },
    { key: 'parents', label: 'Parents', icon: Users },
    { key: 'notes', label: 'Notes', icon: BookOpen },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tabsStyles.tabsContainer}>
      <View style={tabsStyles.tabs}>
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <Pressable
              key={tab.key}
              style={[
                tabsStyles.tab,
                activeSection === tab.key && tabsStyles.activeTab,
              ]}
              onPress={() => onSectionChange(tab.key)}
            >
              <IconComponent size={16} color={activeSection === tab.key ? '#ffffff' : '#6b7280'} />
              <Text style={[
                tabsStyles.tabText,
                activeSection === tab.key && tabsStyles.activeTabText,
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}