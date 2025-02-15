import React, { Suspense } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as ReactJSXRuntime from 'react/jsx-runtime';
import * as ReactNative from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import * as ReactNavigationNativeStack from '@react-navigation/native-stack';
import * as ReactNativeSafeAreaContext from 'react-native-safe-area-context';
import * as ReactNativeScreens from 'react-native-screens';
import { MicroAppMetadata, LoadedMicroApp } from '../types/micro-apps';
import { Platform, ActivityIndicator, View } from 'react-native';

interface MicroAppContextType {
  availableApps: MicroAppMetadata[];
  loadedApps: Record<string, LoadedMicroApp>;
  currentApp: string | null;
  setCurrentApp: (appId: string | null) => void;
  loadApp: (metadata: MicroAppMetadata) => Promise<void>;
  setAppProps: (appId: string, props: Record<string, any>) => void;
  getAppProps: (appId: string) => Record<string, any>;
  refreshApps: () => Promise<void>;
  authenticate: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const MicroAppContext = createContext<MicroAppContextType | null>(null);

// Create a global context for the micro-apps
const globalContext = {
  React,
  ReactNative,
  ReactJSXRuntime,
  ReactNavigation,
  ReactNavigationNativeStack,
  ReactNativeSafeAreaContext,
  ReactNativeScreens,
};

// Make the context available globally
(global as any).React = React;
(global as any).ReactNative = ReactNative;
(global as any).ReactJSXRuntime = ReactJSXRuntime;
(global as any).ReactNavigation = ReactNavigation;
(global as any).ReactNavigationNativeStack = ReactNavigationNativeStack;
(global as any).ReactNativeSafeAreaContext = ReactNativeSafeAreaContext;
(global as any).ReactNativeScreens = ReactNativeScreens;

interface ModuleExports {
  default?: React.ComponentType<any>;
  [key: string]: any;
}

interface ModuleContext {
  exports: ModuleExports;
  require: (moduleName: string) => any;
}

interface LoadedModule {
  exports: ModuleExports;
  loaded: boolean;
}

// Configuration for bundle URLs
const config = {
  baseUrl: __DEV__ && Platform.OS === 'web'
    ? 'http://localhost:3000'
    : `https://${process.env.EXPO_PUBLIC_GITHUB_USER}.github.io/${process.env.EXPO_PUBLIC_REPO_NAME}`,
};

export function MicroAppProvider({ children }: { children: React.ReactNode }) {
  const [availableApps, setAvailableApps] = useState<MicroAppMetadata[]>([]);
  const [loadedApps, setLoadedApps] = useState<Record<string, LoadedMicroApp>>({});
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [appProps, setAppPropsState] = useState<Record<string, Record<string, any>>>({});
  const [authToken, setAuthToken] = useState<string | null>(null);

  const refreshApps = useCallback(async () => {
    try {
      // Determine the base URL based on environment
      const baseUrl = __DEV__ && Platform.OS === 'web'
        ? 'http://localhost:3000'
        : `https://${process.env.EXPO_PUBLIC_GITHUB_USER}.github.io/${process.env.EXPO_PUBLIC_REPO_NAME}`;

      console.log('Fetching manifest from base URL:', baseUrl);

      let manifestUrl: string;
      let response: Response | null = null;

      // Try to fetch the appropriate manifest based on auth status
      if (authToken) {
        // Try to fetch the full manifest first
        try {
          manifestUrl = `${baseUrl}/manifest.json`;
          console.log('Attempting to fetch full manifest from:', manifestUrl);
          response = await fetch(manifestUrl, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (!response.ok) {
            console.log(`Full manifest fetch failed with status: ${response.status}`);
            throw new Error('Full manifest not available');
          }
        } catch (e) {
          console.error('Failed to fetch full manifest:', e);
          response = null;
        }
      }

      // If no auth token or full manifest fetch failed, get the public manifest
      if (!response || !response.ok) {
        manifestUrl = `${baseUrl}/public-manifest.json`;
        console.log('Attempting to fetch public manifest from:', manifestUrl);
        response = await fetch(manifestUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
      }

      const manifest = await response.json();
      console.log('Successfully loaded manifest with apps:', manifest.apps.length);
      console.log('Available apps:', manifest.apps.map((app: MicroAppMetadata) => app.id).join(', '));
      
      // Clean up any loaded apps that are no longer in the manifest
      const validAppIds = new Set(manifest.apps.map((app: MicroAppMetadata) => app.id));
      setLoadedApps(prev => {
        const newLoadedApps = { ...prev };
        Object.keys(newLoadedApps).forEach(appId => {
          if (!validAppIds.has(appId)) {
            delete newLoadedApps[appId];
          }
        });
        return newLoadedApps;
      });

      // If current app is no longer valid, clear it
      if (currentApp && !validAppIds.has(currentApp)) {
        setCurrentApp(null);
      }

      setAvailableApps(manifest.apps);
    } catch (error) {
      console.error('Error loading manifest:', error);
      // On error, clear everything to prevent stale state
      setAvailableApps([]);
      setLoadedApps({});
      setCurrentApp(null);
    }
  }, [authToken, currentApp]);

  // Mock authentication function (replace with real auth later)
  const authenticate = useCallback((token: string) => {
    setAuthToken(token);
  }, []);

  const logout = useCallback(() => {
    // Clear all app-related state
    setAuthToken(null);
    setCurrentApp(null);
    setLoadedApps({});
    setAvailableApps([]);
    // Clear any custom props
    setAppPropsState({});
  }, []);

  useEffect(() => {
    refreshApps();
    const interval = setInterval(refreshApps, 5000);
    return () => clearInterval(interval);
  }, [refreshApps]);

  const setAppProps = useCallback((appId: string, props: Record<string, any>) => {
    setAppPropsState(prev => ({
      ...prev,
      [appId]: { ...prev[appId], ...props },
    }));
  }, []);

  const getAppProps = useCallback((appId: string) => {
    const app = availableApps.find(a => a.id === appId);
    const defaultProps = app?.defaultProps || {};
    const customProps = appProps[appId] || {};
    return { ...defaultProps, ...customProps };
  }, [availableApps, appProps]);

  const loadApp = useCallback(async (metadata: MicroAppMetadata) => {
    try {
      if (loadedApps[metadata.id]) {
        return;
      }

      console.log(`Loading micro-app: ${metadata.id}`);
      console.log(`Bundle URL: ${metadata.bundleUrl}`);

      // Create a lazy-loaded component
      const LazyComponent = React.lazy(async () => {
        // Fetch the bundle
        console.log(`Fetching bundle for ${metadata.id}...`);
        const response = await fetch(metadata.bundleUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          console.error(`Failed to fetch bundle for ${metadata.id}:`, {
            status: response.status,
            statusText: response.statusText,
            url: response.url
          });
          throw new Error(`Failed to fetch bundle: ${response.status} ${response.statusText}`);
        }

        console.log(`Successfully fetched bundle for ${metadata.id}`);
        const bundleCode = await response.text();
        console.log(`Bundle size: ${bundleCode.length} bytes`);

        // Create a module context with the global dependencies
        const module = { exports: {} as ModuleExports };
        const require = (moduleName: string) => {
          console.log(`Resolving external module: ${moduleName}`);
          switch (moduleName) {
            case 'react':
              return React;
            case 'react-native':
              return ReactNative;
            case 'react/jsx-runtime':
              return ReactJSXRuntime;
            case '@react-navigation/native':
              return ReactNavigation;
            case '@react-navigation/native-stack':
              return ReactNavigationNativeStack;
            case 'react-native-safe-area-context':
              return ReactNativeSafeAreaContext;
            case 'react-native-screens':
              return ReactNativeScreens;
            default:
              console.error(`Unexpected external module requested: ${moduleName}`);
              throw new Error(`Unexpected external module: ${moduleName}`);
          }
        };

        // Execute the bundle
        console.log(`Executing bundle for ${metadata.id}...`);
        const moduleFunction = new Function('module', 'exports', 'require', bundleCode);
        moduleFunction(module, module.exports, require);

        // Get the component
        const Component = module.exports.default || Object.values(module.exports)[0];
        if (typeof Component !== 'function') {
          console.error(`Invalid component export for ${metadata.id}:`, module.exports);
          throw new Error('Bundle does not export a valid React component');
        }
        console.log(`Successfully loaded component for ${metadata.id}`);

        return { default: Component };
      });

      setLoadedApps(prev => ({
        ...prev,
        [metadata.id]: { Component: LazyComponent, metadata },
      }));
    } catch (error) {
      console.error(`Error loading micro-app ${metadata.id}:`, error);
      throw error;
    }
  }, [loadedApps]);

  return (
    <MicroAppContext.Provider
      value={{
        availableApps,
        loadedApps,
        currentApp,
        setCurrentApp,
        loadApp,
        setAppProps,
        getAppProps,
        refreshApps,
        authenticate,
        logout,
        isAuthenticated: !!authToken,
      }}
    >
      {children}
    </MicroAppContext.Provider>
  );
}

export function useMicroApps() {
  const context = useContext(MicroAppContext);
  if (!context) {
    throw new Error('useMicroApps must be used within a MicroAppProvider');
  }
  return context;
} 