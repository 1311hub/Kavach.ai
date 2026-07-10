import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import Dashboard from './src/frontend/screens/dashboard';

export default function App() {
  return (
    <View style={styles.appContainer}>
      <StatusBar style="light" />
      <Dashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});