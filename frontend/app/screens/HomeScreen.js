import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';

export default function HomeScreen() {
  // Access API_URL from Constants
  const apiUrl = Constants.manifest?.extra?.API_URL || 'API URL not found';
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MindBuddy</Text>
      <Text style={styles.subtitle}>Your mental health companion</Text>
      <Text style={styles.apiText}>API URL: {apiUrl}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  apiText: {
    fontSize: 12,
    color: '#999',
  },
}); 