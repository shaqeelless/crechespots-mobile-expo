import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Search, Baby, ClipboardList, Newspaper } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import AnimatedActionButton from './AnimatedActionButton';

const { width } = Dimensions.get('window');

interface QuickActionsProps {
  router: any;
}

const QuickActions: React.FC<QuickActionsProps> = ({ router }) => {
  return (
    <Animated.View 
      style={styles.quickActions}
      entering={FadeInUp.delay(600).duration(800).springify()}
    >
      <AnimatedActionButton
        icon={Search}
        text="Find Creches"
        backgroundColor="#f68484"
        delay={700}
        onPress={() => router.push('/search')}
      />
      
      <AnimatedActionButton
        icon={Baby}
        text="My Children"
        backgroundColor="#9cdcb8"
        delay={800}
        onPress={() => router.push('/children')}
      />
      
      <AnimatedActionButton
        icon={ClipboardList}
        text="Applications"
        backgroundColor="#84a7f6"
        delay={900}
        onPress={() => router.push('/applications')}
      />
      
      <AnimatedActionButton
        icon={Newspaper}
        text="Feeds"
        backgroundColor="#f6cc84"
        delay={1000}
        onPress={() => router.push('/feeds')}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 20,
  },
});

export default QuickActions;