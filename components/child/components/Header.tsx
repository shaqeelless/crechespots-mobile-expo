import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import { Child } from '../types';
import { headerStyles } from '../styles';

interface HeaderProps {
  child: Child;
  onBack: () => void;
  onInviteParent: () => void;
}

export default function Header({ child, onBack, onInviteParent }: HeaderProps) {
  return (
    <View style={headerStyles.header}>
      <Pressable style={headerStyles.backButton} onPress={onBack}>
        <ArrowLeft size={24} color="#ffffff" />
      </Pressable>
      <Text style={headerStyles.headerTitle}>
        {child.first_name}'s Profile
      </Text>
      {child.relationship === 'owner' ? (
        <Pressable 
          style={headerStyles.shareHeaderButton}
          onPress={onInviteParent}
        >
          <UserPlus size={20} color="#ffffff" />
        </Pressable>
      ) : (
        <View style={headerStyles.placeholder} />
      )}
    </View>
  );
}