import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useMicroApps } from '../../context/MicroAppContext';

type GenderOption = 'Unknown' | 'Male' | 'Female';

export default function SettingsScreen() {
  const { setAppProps } = useMicroApps();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<GenderOption>('Unknown');

  const handleSave = () => {
    setAppProps('micro-app-three', {
      name: name || 'Guest',
      gender,
    });
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
      <Text style={styles.title}>Santa's Helper Settings 🎅</Text>
      
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
}); 