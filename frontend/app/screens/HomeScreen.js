import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import { chat } from '../../src/utils/api';

// Use the same hardcoded URL across the app
const API_URL = "http://192.168.10.112:8000";

export default function HomeScreen() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  const pingApi = async () => {
    setLoading(true);
    try {
      const reply = await chat("Hello API");
      console.log("MindBuddy says:", reply);
      setResponse(reply);
    } catch (error) {
      console.error("Error:", error.message);
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MindBuddy</Text>
      <Text style={styles.subtitle}>Your mental health companion</Text>
      <Text style={styles.apiText}>API URL: {API_URL}</Text>
      
      <Button title="Ping MindBuddy" onPress={pingApi} />
      
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