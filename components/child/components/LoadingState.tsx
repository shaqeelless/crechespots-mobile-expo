import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { headerStyles, loadingErrorStyles, sharedStyles } from '../styles';

export default function LoadingState() {
  return (
    <View style={sharedStyles.container}>
      <View style={headerStyles.header}>
        <View style={headerStyles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </View>
        <Text style={headerStyles.headerTitle}>Child Details</Text>
        <View style={headerStyles.placeholder} />
      </View>
      <View style={loadingErrorStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={loadingErrorStyles.loadingText}>Loading child details...</Text>
      </View>
    </View>
  );
}