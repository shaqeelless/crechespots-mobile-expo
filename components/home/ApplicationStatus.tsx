import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import AnimatedActivityItem from './AnimatedActivityItem';
import { Clock, Users } from 'lucide-react-native';

const AnimatedView = Animated.createAnimatedComponent(View);

const ApplicationStatus: React.FC = () => {
  return (
    <AnimatedView 
      style={styles.section}
      entering={FadeInUp.delay(1200).duration(800).springify()}
    >
      <Text style={styles.sectionTitle}>Application Status</Text>
      
      <AnimatedActivityItem
        icon={Clock}
        title="Under Review"
        description="2 applications are currently being reviewed by creches"
        backgroundColor="#f59e0b"
        delay={1300}
      />
      
      <AnimatedActivityItem
        icon={Users}
        title="Application Accepted"
        description="Sunshine Daycare accepted your application for Emma"
        backgroundColor="#22c55e"
        delay={1500}
      />
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
});

export default ApplicationStatus;