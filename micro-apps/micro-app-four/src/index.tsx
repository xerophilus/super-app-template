import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface BrokenComponent {
  someProp: string;
}

// This component will throw during render
function ComponentWithRenderError() {
  throw new Error('This component failed during render!');
  return null;
}

// This component will throw during effect
function ComponentWithEffectError() {
  React.useEffect(() => {
    throw new Error('This component failed in useEffect!');
  }, []);
  return null;
}

const CrashTestApp: React.FC = () => {
  const [showRenderError, setShowRenderError] = useState(false);
  const [showEffectError, setShowEffectError] = useState(false);

  const triggerTypeError = () => {
    // @ts-ignore - intentionally causing a type error
    const foo: any = undefined;
    foo.bar();
  };

  const triggerReferenceError = () => {
    // @ts-ignore - intentionally referencing undefined variable
    console.log(undefinedVariable.property);
  };

  const triggerSyntaxError = () => {
    // Using eval to trigger a syntax error at runtime
    eval('this is not valid javascript');
  };

  const triggerPromiseRejection = async () => {
    await Promise.reject(new Error('This promise was intentionally rejected!'));
  };

  const triggerInvalidJSX = () => {
    // @ts-ignore - intentionally using invalid prop type
    setInvalidProp(<BrokenComponent someProp={123} />);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Error Testing App 🐛</Text>
      <Text style={styles.subtitle}>Test different types of errors and crashes</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowRenderError(true)}
        >
          <Text style={styles.buttonText}>Trigger Render Error</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowEffectError(true)}
        >
          <Text style={styles.buttonText}>Trigger Effect Error</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={triggerTypeError}
        >
          <Text style={styles.buttonText}>Trigger Type Error</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={triggerReferenceError}
        >
          <Text style={styles.buttonText}>Trigger Reference Error</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={triggerSyntaxError}
        >
          <Text style={styles.buttonText}>Trigger Syntax Error</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={triggerPromiseRejection}
        >
          <Text style={styles.buttonText}>Trigger Promise Rejection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={triggerInvalidJSX}
        >
          <Text style={styles.buttonText}>Trigger Invalid JSX</Text>
        </TouchableOpacity>
      </View>

      {showRenderError && <ComponentWithRenderError />}
      {showEffectError && <ComponentWithEffectError />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
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
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CrashTestApp; 