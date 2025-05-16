import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { chat } from '../../src/utils/api';

export default function HomeScreen() {
  // Access API_URL from Constants
  const apiUrl = Constants.manifest?.extra?.API_URL || 'API URL not found';
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  const pingApi = async () => {
    setLoading(true);
    try {
      const reply = await chat("Hello API");
      setResponse(reply);
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MindBuddy</Text>
      <Text style={styles.subtitle}>Your mental health companion</Text>
      <Text style={styles.apiText}>API URL: {apiUrl}</Text>
      
      <Button title="Ping API" onPress={pingApi} />
      
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : response ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>API Response:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      ) : null}
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
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  responseContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    width: '80%',
  },
  responseLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  responseText: {
    color: '#333',
  },
}); 