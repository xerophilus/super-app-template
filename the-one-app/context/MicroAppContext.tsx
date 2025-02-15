import React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as ReactJSXRuntime from 'react/jsx-runtime';
import * as ReactNative from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import * as ReactNavigationNativeStack from '@react-navigation/native-stack';
import * as ReactNativeSafeAreaContext from 'react-native-safe-area-context';
import * as ReactNativeScreens from 'react-native-screens';
import { MicroAppMetadata, LoadedMicroApp } from '../types/micro-apps';
import { Platform } from 'react-native';

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
      let response: Response | null = null;
      let manifestUrl: string;

      if (__DEV__ && Platform.OS === 'web') {
        try {
          // In development web, try localhost first
          manifestUrl = authToken 
            ? 'http://localhost:3000/manifest.json'  // Full manifest for authenticated users
            : 'http://localhost:3000/bundles/manifest.json';  // Public manifest
          response = await fetch(manifestUrl);
        } catch (e) {
          console.log('Failed to fetch from localhost, falling back to GitHub Pages');
        }
      }

      // If localhost failed or we're not in web dev, use GitHub Pages
      if (!response || !response.ok) {
        manifestUrl = `${config.baseUrl}/${process.env.EXPO_PUBLIC_REPO_NAME}/${authToken ? 'manifest.json' : 'bundles/manifest.json'}`;
        console.log('Fetching from GitHub Pages:', manifestUrl);
        response = await fetch(manifestUrl, {
          headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        });
      }

      if (!response.ok) {
        throw new Error('Failed to fetch manifest');
      }

      const manifest = await response.json();
      setAvailableApps(manifest.apps);
    } catch (error) {
      console.error('Error loading manifest:', error);
    }
  }, [authToken]);

  // Mock authentication function (replace with real auth later)
  const authenticate = useCallback((token: string) => {
    setAuthToken(token);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setCurrentApp(null);
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

      // Create a module cache for this app
      const moduleCache = new Map<string, LoadedModule>();

      // Function to normalize module path
      function normalizeModulePath(basePath: string, moduleName: string): string {
        const baseUrl = basePath.substring(0, basePath.lastIndexOf('/'));
        const normalizedPath = new URL(moduleName, baseUrl + '/').pathname;
        
        // Try different extensions
        const extensions = ['.js', '.jsx', '.ts', '.tsx'];
        for (const ext of extensions) {
          const pathWithExt = normalizedPath.endsWith(ext) ? normalizedPath : normalizedPath + ext;
          try {
            // Check if file exists (this will throw if it doesn't)
            fetch(pathWithExt);
            return pathWithExt;
          } catch {
            continue;
          }
        }
        
        // If no extension worked, return the original with .js
        return normalizedPath.endsWith('.js') ? normalizedPath : `${normalizedPath}.js`;
      }

      // Function to load a module from a URL
      async function loadModuleFromUrl(url: string): Promise<ModuleExports> {
        console.log(url)
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch module: ${response.statusText}`);
        }
        const moduleCode = await response.text();
        // Create a module context
        const moduleContext: ModuleContext = {
          exports: {},
          require: (moduleName: string) => {
            // Handle core modules and dependencies
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
            }

            // Handle relative imports
            if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
              const moduleUrl = normalizeModulePath(url, moduleName);

              // Check if module is already loaded
              if (moduleCache.has(moduleUrl)) {
                const cachedModule = moduleCache.get(moduleUrl)!;
                if (cachedModule.loaded) {
                  return cachedModule.exports;
                }
                // If we hit a circular dependency, return an empty object
                return {};
              }

              // Create a new module entry
              const newModule: LoadedModule = { exports: {}, loaded: false };
              moduleCache.set(moduleUrl, newModule);

              // Load the module
              try {
                newModule.exports = loadModuleFromUrl(moduleUrl);
                newModule.loaded = true;
                return newModule.exports;
              } catch (error) {
                console.warn(`Failed to load module ${moduleUrl}:`, error);
                // Return an empty component for failed screen loads
                return {
                  default: () => null,
                  [moduleName.split('/').pop()?.replace(/\.[^/.]+$/, '') || '']: () => null,
                };
              }
            }

            throw new Error(`Module "${moduleName}" not found`);
          },
        };

        // Execute the module code
        const moduleFunction = new Function(
          'module',
          'exports',
          'require',
          moduleCode
        );

        moduleFunction(moduleContext, moduleContext.exports, moduleContext.require);
        return moduleContext.exports;
      }

      // Load the main module
      const mainModule = await loadModuleFromUrl(metadata.bundleUrl);
      console.log('Main module exports:', mainModule);

      // Get the component based on the module structure
      const Component = mainModule.default || Object.values(mainModule)[0];
      console.log('Component:', Component);

      if (typeof Component !== 'function') {
        throw new Error('Loaded module does not export a valid React component');
      }

      setLoadedApps(prev => ({
        ...prev,
        [metadata.id]: { Component, metadata },
      }));
    } catch (error) {
      console.error('Error loading micro-app:', error);
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