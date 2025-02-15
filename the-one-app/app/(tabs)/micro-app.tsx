import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useMicroApps } from '../../context/MicroAppContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';

function LoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function MicroAppScreen() {
  const { currentApp, loadedApps, getAppProps } = useMicroApps();

  if (!currentApp || !loadedApps[currentApp]) {
    return <LoadingFallback />;
  }

  const { Component, metadata } = loadedApps[currentApp];
  const props = getAppProps(currentApp);

  return (
    <ErrorBoundary appId={currentApp}>
      <Suspense fallback={<LoadingFallback />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
}); 