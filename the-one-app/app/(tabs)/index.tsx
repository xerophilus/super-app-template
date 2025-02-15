import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import AppGrid from '../../components/AppGrid';

export default function TabOneScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppGrid />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
