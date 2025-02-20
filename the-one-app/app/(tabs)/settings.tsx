import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Switch } from 'react-native';
import { useMicroApps } from '../../context/MicroAppContext';

type GenderOption = 'Unknown' | 'Male' | 'Female';

export default function SettingsScreen() {
  const { setAppProps, authenticate, logout, isAuthenticated, isUsingLocalhost, toggleBaseUrl } = useMicroApps();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<GenderOption>('Unknown');

  const handleSave = () => {
    setAppProps('micro-app-three', {
      name: name || 'Guest',
      gender,
    });
  };

  const handleAuth = () => {
    if (isAuthenticated) {
      logout();
    } else {
      // Mock token for demo purposes
      authenticate('demo-token');
    }
  };

  const GenderButton = ({ value, label }: { value: GenderOption; label: string }) => (
    <TouchableOpacity
      style={[
        styles.genderButton,
        gender === value && styles.genderButtonSelected,
      ]}
      onPress={() => setGender(value)}
    >
      <Text
        style={[
          styles.genderButtonText,
          gender === value && styles.genderButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Development Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Use Localhost</Text>
          <Switch
            value={isUsingLocalhost}
            onValueChange={toggleBaseUrl}
          />
        </View>
        <Text style={styles.settingDescription}>
          {isUsingLocalhost 
            ? 'Currently using: http://localhost:3000'
            : `Currently using: https://${process.env.EXPO_PUBLIC_GITHUB_USER}.github.io/${process.env.EXPO_PUBLIC_REPO_NAME}`
          }
        </Text>
      </View>

      <View style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication</Text>
        <TouchableOpacity 
          style={[styles.authButton, isAuthenticated && styles.logoutButton]} 
          onPress={handleAuth}
        >
          <Text style={styles.authButtonText}>
            {isAuthenticated ? 'Sign Out' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.authStatus}>
          Status: {isAuthenticated ? 'Authenticated ✅' : 'Not Authenticated ❌'}
        </Text>
      </View>

      {isAuthenticated && (
        <>
          <View style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Santa's Helper Settings 🎅</Text>
            <Text style={styles.sectionDescription}>
              Customize your experience with Santa's Wish List app
            </Text>
          
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#95A5A6"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>I am a...</Text>
              <View style={styles.genderButtonGroup}>
                <GenderButton value="Unknown" label="Secret" />
                <GenderButton value="Male" label="Boy" />
                <GenderButton value="Female" label="Girl" />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Settings ✨</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {!isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.lockedFeatureText}>
            🔒 Sign in to access Santa's Helper settings and create your Christmas wish list!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 12,
  },
  authButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  authStatus: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#F8F9F9',
  },
  genderButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#F8F9F9',
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  lockedFeatureText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingText: {
    fontSize: 16,
    color: '#34495E',
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
  },
}); 