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
  // Debug function to check router availability
  const debugRouter = () => {
    console.log('🔍 QuickActions - Router object:', router);
    console.log('🔍 QuickActions - Router methods:', Object.keys(router));
    console.log('🔍 QuickActions - Router push method exists:', typeof router.push === 'function');
  };

  // Call debug on component mount
  React.useEffect(() => {
    console.log('🚀 QuickActions component mounted');
    debugRouter();
  }, []);

  const handleButtonPress = (route: string, buttonName: string) => {
    console.log(`🔄 ${buttonName} button pressed`);
    console.log(`📍 Attempting to navigate to: ${route}`);

    
    try {
      if (router && typeof router.push === 'function') {
        console.log(`✅ Navigating to: ${route}`);
        router.push(route);
      } else {
        console.error('❌ Router or router.push is not available');
        console.log('🔍 Current router:', router);
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  };

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
        onPress={() => handleButtonPress('/search', 'Find Creches')}
      />
      
      <AnimatedActionButton
        icon={Baby}
        text="My Children"
        backgroundColor="#9cdcb8"
        delay={800}
        onPress={() => handleButtonPress('/children', 'My Children')}
      />
      
      <AnimatedActionButton
        icon={ClipboardList}
        text="Applications"
        backgroundColor="#84a7f6"
        delay={900}
        onPress={() => handleButtonPress('/applications', 'Applications')}
      />
      
      <AnimatedActionButton
        icon={Newspaper}
        text="Feeds"
        backgroundColor="#f6cc84"
        delay={1000}
        onPress={() => handleButtonPress('/feeds', 'Feeds')}
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