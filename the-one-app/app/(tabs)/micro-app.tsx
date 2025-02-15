import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMicroApps } from '../../context/MicroAppContext';
import { ThemedText } from '@/components/ThemedText';

export default function MicroAppScreen() {
  const { currentApp, loadedApps, getAppProps } = useMicroApps();

  if (!currentApp || !loadedApps[currentApp]) {
    return (
      <View style={styles.container}>
        <ThemedText>No micro-app selected</ThemedText>
      </View>
    );
  }

  const { Component } = loadedApps[currentApp];
  const props = getAppProps(currentApp);

  return (
    <View style={styles.container}>
      <Component {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 