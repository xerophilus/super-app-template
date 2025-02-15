import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMicroApps } from '../context/MicroAppContext';
import { MicroAppMetadata } from '../types/micro-apps';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 16;
const ITEM_SIZE = ((width / COLUMN_COUNT) - SPACING * COLUMN_COUNT) ;

function AppIcon({ icon }: { icon: MicroAppMetadata['icon'] }) {
  switch (icon.type) {
    case 'emoji':
      return <Text style={styles.iconText}>{icon.value}</Text>;
    case 'url':
      return (
        <Image
          source={{ uri: icon.value }}
          style={styles.iconImage}
          resizeMode="contain"
        />
      );
    case 'component':
      // For component-based icons, we could dynamically import them,
      // but for now we'll just show a default emoji
      return <Text style={styles.iconText}>📱</Text>;
    default:
      return <Text style={styles.iconText}>📱</Text>;
  }
}

export default function AppGrid() {
  const router = useRouter();
  
  // Wrap the hook in a try-catch to handle potential context initialization issues
  try {
    const { availableApps, loadApp, setCurrentApp, isAuthenticated } = useMicroApps();

    const handleAppPress = async (appId: string) => {
      try {
        const app = availableApps.find(app => app.id === appId);
        if (!app) return;

        await loadApp(app);
        setCurrentApp(appId);
        router.push('/(tabs)/micro-app');
      } catch (error) {
        console.error('Failed to load app:', error);
      }
    };

    if (!availableApps) {
      return (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    // Filter apps based on authentication status
    const visibleApps = availableApps.filter(app => {
      // If user is authenticated, show all apps
      if (isAuthenticated) return true;
      // If user is not authenticated, only show apps that don't require auth
      return !app.requiresAuth;
    });

    return (
      <View style={styles.container}>
        {visibleApps.map((app) => (
          <TouchableOpacity
            key={app.id}
            style={styles.appItem}
            onPress={() => handleAppPress(app.id)}
          >
            <View style={styles.iconContainer}>
              <AppIcon icon={app.icon} />
            </View>
            <Text style={styles.appName} numberOfLines={2}>
              {app.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  } catch (error) {
    // Return a loading state if the context is not yet available
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING,
    gap: SPACING,
    alignItems: 'center'
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appItem: {
    width: ITEM_SIZE,
    alignItems: 'center',
  },
  iconContainer: {
    width: ITEM_SIZE * 0.8,
    height: ITEM_SIZE * 0.8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 32,
  },
  iconImage: {
    width: '80%',
    height: '80%',
  },
  appName: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
}); 