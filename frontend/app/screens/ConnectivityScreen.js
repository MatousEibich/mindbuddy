import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, ScrollView, Platform } from 'react-native';
import axios from 'axios';

// Hardcoded API URL for reliable testing
const API_URL = "http://192.168.10.112:8000";

export default function ConnectivityScreen() {
  const [status, setStatus] = useState('Not tested');
  const [logs, setLogs] = useState([]);
  
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs]);
  };
  
  const testConnection = async () => {
    setStatus('Testing...');
    addLog(`Testing connection to ${API_URL}...`);
    
    try {
      const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      setStatus('Connected');
      addLog(`Connection successful! Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setStatus('Failed');
      addLog(`Connection failed: ${error.message}`);
      
      if (error.response) {
        addLog(`Response data: ${JSON.stringify(error.response.data)}`);
        addLog(`Response status: ${error.response.status}`);
      }
    }
  };
  
  // Test on initial load
  useEffect(() => {
    testConnection();
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connectivity Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.label}>API URL:</Text>
        <Text style={styles.value}>{API_URL}</Text>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.label}>Status:</Text>
        <Text 
          style={[
            styles.value, 
            status === 'Connected' ? styles.success : 
            status === 'Failed' ? styles.error : 
            styles.pending
          ]}
        >
          {status}
        </Text>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.label}>Platform:</Text>
        <Text style={styles.value}>{Platform.OS} {Platform.Version}</Text>
      </View>
      
      <Button 
        title="Test Connection" 
        onPress={testConnection} 
      />
      
      <Text style={styles.logsTitle}>Logs:</Text>
      <ScrollView style={styles.logs}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logItem}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    width: 80,
  },
  value: {
    flex: 1,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  pending: {
    color: 'orange',
    fontWeight: 'bold',
  },
  logsTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  logs: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    padding: 8,
  },
  logItem: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
}); 