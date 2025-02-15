import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';

interface Props {
  name?: string;
  gender?: string;
}

const MicroAppThree: React.FC<Props> = ({ name, gender }) => {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <AppNavigator name={name} gender={gender} />
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default MicroAppThree; 