import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface ModuleExports {
  default?: React.ComponentType<any>;
  [key: string]: any;
}

// Create a module cache to prevent duplicate loading
const moduleCache = new Map<string, ModuleExports>();

// Create a custom require function that handles external dependencies
function createCustomRequire(dependencies: Record<string, any>) {
  return function customRequire(moduleName: string) {
    if (dependencies[moduleName]) {
      return dependencies[moduleName];
    }
    if (moduleCache.has(moduleName)) {
      return moduleCache.get(moduleName);
    }
    throw new Error(`Module not found: ${moduleName}`);
  };
}

export default function MicroAppLoader() {
  const [MicroApp, setMicroApp] = useState<React.ComponentType<any> | null>(null);
  const [selectedApp, setSelectedApp] = useState('micro-app-one');
  const [error, setError] = useState<string | null>(null);

  const loadMicroApp = async () => {
    try {
      setError(null);
      // Dynamically construct the URL
      const bundleUrl = `http://localhost:3000/${selectedApp}/commonjs/index.js`;
      console.log(`Loading micro-app from: ${bundleUrl}`);

      // Fetch the compiled JavaScript file
      const response = await fetch(bundleUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch bundle: ${response.statusText}`);
      }
      const script = await response.text();

      // Create a module object and custom require function
      const module = { exports: {} as ModuleExports };
      const customRequire = createCustomRequire({
        'react': React,
        'react-native': require('react-native'),
        'react/jsx-runtime': require('react/jsx-runtime'),
        '@react-navigation/native': require('@react-navigation/native'),
        '@react-navigation/native-stack': require('@react-navigation/native-stack'),
        'react-native-safe-area-context': require('react-native-safe-area-context'),
        'react-native-screens': require('react-native-screens'),
      });

      // Execute the JavaScript file with proper module context
      const appCode = new Function('module', 'exports', 'require', script);
      appCode(module, module.exports, customRequire);

      // Store in cache
      moduleCache.set(selectedApp, module.exports);

      // Set the loaded component
      const Component = module.exports.default || module.exports;
      if (typeof Component !== 'function') {
        throw new Error('Loaded module does not export a valid React component');
      }
      setMicroApp(() => Component);
    } catch (error) {
      console.error("Error loading micro-app:", error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text>Select Micro-App</Text>
      <Button 
        title="Load Micro-App One" 
        onPress={() => { 
          setSelectedApp('micro-app-one'); 
          loadMicroApp(); 
        }} 
      />
      <Button 
        title="Load Micro-App Two" 
        onPress={() => { 
          setSelectedApp('micro-app-two'); 
          loadMicroApp(); 
        }} 
      />

      {error && (
        <Text style={{ marginTop: 20, color: 'red' }}>{error}</Text>
      )}

      {MicroApp && !error && (
        <View style={{ marginTop: 20, flex: 1 }}>
          <SafeAreaProvider>
            <NavigationContainer>
              <MicroApp />
            </NavigationContainer>
          </SafeAreaProvider>
        </View>
      )}

      {!MicroApp && !error && (
        <Text style={{ marginTop: 20 }}>No micro-app loaded</Text>
      )}
    </View>
  );
}
