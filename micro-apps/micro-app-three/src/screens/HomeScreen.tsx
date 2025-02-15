import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
  name?: string;
  gender?: string;
};

export function HomeScreen({ navigation, name = 'Guest', gender = 'Unknown' }: Props) {
  const greeting = gender === 'Unknown' ? 'Ho Ho Ho!' : gender === 'Female' ? 'Dear Girl' : 'Dear Boy';

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        {greeting} {name}! 🎅
      </Text>
      <Text style={styles.subtitle}>
        Let's make your Christmas wish list!
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddWish')}
        >
          <Text style={styles.buttonText}>Add a Wish ✨</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('WishList')}
        >
          <Text style={styles.buttonText}>View Wish List 📝</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 15,
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 