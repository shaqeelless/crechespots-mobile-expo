import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import { headerStyles, loadingErrorStyles, sharedStyles } from '../styles';

interface ErrorStateProps {
  onBack: () => void;
}

export default function ErrorState({ onBack }: ErrorStateProps) {
  return (
    <View style={sharedStyles.container}>
      <View style={headerStyles.header}>
        <Pressable style={headerStyles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        <Text style={headerStyles.headerTitle}>Child Details</Text>
        <View style={headerStyles.placeholder} />
      </View>
      <View style={loadingErrorStyles.errorContainer}>
        <AlertCircle size={48} color="#ef4444" />
        <Text style={loadingErrorStyles.errorTitle}>Child Not Found</Text>
        <Text style={loadingErrorStyles.errorDescription}>
          The child you're looking for doesn't exist or you don't have permission to view it.
        </Text>
      </View>
    </View>
  );
}