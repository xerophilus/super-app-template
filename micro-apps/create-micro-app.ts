import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get the app name from command line arguments
const appName = process.argv[2];

if (!appName) {
  console.error('Please provide an app name: npm run create-app "my-app-name"');
  process.exit(1);
}

// Convert app name to proper format (e.g., "My Cool App" -> "micro-app-my-cool-app")
const normalizedAppName = `micro-app-${appName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const appDir = path.join(__dirname, normalizedAppName);

// Create app directory
fs.mkdirSync(appDir);
fs.mkdirSync(path.join(appDir, 'src'));

// Create package.json
const packageJson = {
  "name": normalizedAppName,
  "version": "0.1.0",
  "description": "A new micro app",
  "source": "./src/index.tsx",
  "main": "./lib/commonjs/index.js",
  "module": "./lib/module/index.js",
  "exports": {
    ".": {
      "import": {
        "types": "./lib/typescript/index.d.ts",
        "default": "./lib/module/index.js"
      },
      "require": {
        "types": "./lib/typescript/index.d.ts",
        "default": "./lib/commonjs/index.js"
      }
    }
  },
  "files": [
    "src",
    "lib",
    "!**/__tests__",
    "!**/__fixtures__",
    "!**/__mocks__",
    "!**/.*"
  ],
  "scripts": {
    "test": "jest",
    "typecheck": "tsc",
    "lint": "eslint \"**/*.{js,ts,tsx}\"",
    "clean": "del-cli lib",
    "prepare": "bob build",
    "build": "npm run clean && bob build && npm run bundle",
    "bundle": "esbuild src/index.tsx --bundle --platform=node --format=cjs --outfile=../bundles/" + normalizedAppName + "/bundle.js --external:react --external:react-native --external:react-native-safe-area-context --external:@react-navigation/native --external:@react-navigation/native-stack --external:react-native-screens",
    "build:watch": "bob watch"
  },
  "dependencies": {
    "@babel/runtime": "^7.23.0",
    "@react-navigation/native": "*",
    "@react-navigation/native-stack": "*",
    "react": "*",
    "react-dom": "18.2.0",
    "react-native": "*",
    "react-native-reanimated": "~3.6.2",
    "react-native-safe-area-context": "*",
    "react-native-screens": "*"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-react": "^7.22.15",
    "@babel/preset-typescript": "^7.23.0",
    "@types/jest": "^29.5.14",
    "@types/react": "^18.3.18",
    "@types/react-native": "^0.72.8",
    "del-cli": "^5.1.0",
    "esbuild": "^0.25.0",
    "eslint": "^8.51.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.1",
    "jest": "^29.7.0",
    "prettier": "^3.0.3",
    "react-native-builder-bob": "^0.36.0",
    "typescript": "^5.2.2"
  },
  "peerDependencies": {
    "@react-navigation/native": "*",
    "@react-navigation/native-stack": "*",
    "react": "*",
    "react-native": "*",
    "react-native-safe-area-context": "*",
    "react-native-screens": "*"
  },
  "eslintConfig": {
    "root": true,
    "extends": [
      "@react-native",
      "prettier"
    ],
    "rules": {
      "react/react-in-jsx-scope": "off"
    }
  },
  "prettier": {
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "useTabs": false
  },
  "react-native-builder-bob": {
    "source": "src",
    "output": "lib",
    "targets": [
      [
        "commonjs",
        {
          "configFile": "./babel.config.js",
          "includeScripts": true
        }
      ],
      [
        "module",
        {
          "configFile": "./babel.config.js",
          "includeScripts": true
        }
      ],
      "typescript"
    ]
  }
};

// Create babel.config.js
const babelConfig = `module.exports = {
  presets: [
    '@babel/preset-react',
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: { node: 'current' } }],
  ],
  plugins: [
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
  ],
};
`;

// Create tsconfig.json
const tsConfig = {
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      [normalizedAppName]: ["./src/index"]
    },
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "jsx": "react-native",
    "lib": ["es2017"],
    "moduleResolution": "node",
    "noEmit": true,
    "strict": true,
    "target": "esnext",
    "skipLibCheck": true,
    "types": ["react", "react-native", "@react-navigation/native-stack", "jest"]
  },
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ]
};

// Create basic app component
const appComponent = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface Props {
  message?: string;
}

const ${normalizedAppName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}: React.FC<Props> = ({ 
  message = 'Hello from ${appName}!' 
}) => {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});

export default ${normalizedAppName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')};
`;

// Write files
fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify(packageJson, null, 2));
fs.writeFileSync(path.join(appDir, 'babel.config.js'), babelConfig);
fs.writeFileSync(path.join(appDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
fs.writeFileSync(path.join(appDir, 'src', 'index.tsx'), appComponent);

// Update root package.json workspaces
const rootPackageJsonPath = path.join(__dirname, 'package.json');
const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));

// Add to workspaces
if (!rootPackageJson.workspaces.includes(normalizedAppName)) {
  rootPackageJson.workspaces.push(normalizedAppName);
  rootPackageJson.workspaces.sort();
}

// Update build-all script
const buildAllScript = rootPackageJson.scripts['build-all'];
const buildCommandsMatch = buildAllScript.match(/^(.*?)&&\s*npm run generate-manifest/);
if (buildCommandsMatch) {
  const existingBuildCommands = buildCommandsMatch[1];
  const newBuildCommand = `${existingBuildCommands}&& npm run build --workspace=${normalizedAppName} && npm run generate-manifest`;
  rootPackageJson.scripts['build-all'] = buildAllScript.replace(/^.*?&&\s*npm run generate-manifest/, newBuildCommand);
}

fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));

console.log(`Created new micro app: ${normalizedAppName}`);
console.log('Installing dependencies...');

// Install dependencies
execSync('npm install', { stdio: 'inherit', cwd: __dirname });

console.log('\nDone! To build the app, run:');
console.log(`cd ${normalizedAppName} && npm run build`); 