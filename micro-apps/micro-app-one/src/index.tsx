import { View, Text } from 'react-native';

const MicroApp = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
        🎉 Hello from the Micro-App!
      </Text>
    </View>
  );
};

export default MicroApp;