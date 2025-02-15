import fs from 'fs';
import path from 'path';

// Configuration
const config = {
  // Default to localhost, can be overridden by BUNDLE_BASE_URL environment variable
  baseUrl: process.env.BUNDLE_BASE_URL || 'http://localhost:3000',
  // Repository name from package.json or environment variable
  repoName: process.env.REPO_NAME || 'super-app-poc'
};

interface MicroAppIcon {
  type: 'emoji' | 'url' | 'component';
  value: string;
}

interface MicroAppManifest {
  id: string;
  name: string;
  description: string;
  icon: MicroAppIcon;
  bundleUrl: string;
  defaultProps: Record<string, any>;
}

interface Manifest {
  apps: MicroAppManifest[];
}

function getDefaultIcon(appId: string): MicroAppIcon {
  const icons: Record<string, string> = {
    'micro-app-one': '📱',
    'micro-app-two': '🎮',
    'micro-app-three': '🎅',
  };
  return {
    type: 'emoji',
    value: icons[appId] || '📱',
  };
}

function getDefaultName(appId: string): string {
  return appId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getDefaultDescription(appId: string): string {
  const descriptions: Record<string, string> = {
    'micro-app-one': 'The first micro app',
    'micro-app-two': 'The second micro app',
    'micro-app-three': "Create your Christmas wish list",
  };
  return descriptions[appId] || `A micro app`;
}

function getDefaultProps(appId: string): Record<string, any> {
  const defaultProps: Record<string, Record<string, any>> = {
    'micro-app-one': {
      theme: 'light',
    },
    'micro-app-two': {
      theme: 'light',
    },
    'micro-app-three': {
      name: 'Guest',
      gender: 'Unknown',
    },
  };
  return defaultProps[appId] || {};
}

function getBundleUrl(appId: string): string {
  // Check if the app uses esbuild (bundle.js) or bob build (commonjs/index.js)
  const bundlePath = path.join(__dirname, 'bundles', appId, 'bundle.js');
  const commonjsPath = path.join(__dirname, appId, 'lib', 'commonjs', 'index.js');

  let bundlePathSuffix: string;
  if (fs.existsSync(bundlePath)) {
    bundlePathSuffix = `${appId}/bundle.js`;
  } else if (fs.existsSync(commonjsPath)) {
    bundlePathSuffix = `${appId}/commonjs/index.js`;
  } else {
    bundlePathSuffix = `${appId}/bundle.js`;
  }

  // If using GitHub Pages, format URL accordingly
  if (config.baseUrl.includes('github.io')) {
    return `${config.baseUrl}/${config.repoName}/micro-apps/bundles/${bundlePathSuffix}`;
  }

  // For local development
  return `${config.baseUrl}/${bundlePathSuffix}`;
}

function generateManifest(): Manifest {
  const microAppsDir = __dirname;
  const apps: MicroAppManifest[] = [];

  // Read all directories in the micro-apps folder
  const entries = fs.readdirSync(microAppsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    // Skip if not a directory or if it's the bundles directory
    if (!entry.isDirectory() || entry.name === 'bundles' || entry.name.startsWith('.')) {
      continue;
    }

    // Check if the directory contains a package.json
    const packageJsonPath = path.join(microAppsDir, entry.name, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      continue;
    }

    // Read the package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    const appId = entry.name;
    const app: MicroAppManifest = {
      id: appId,
      name: getDefaultName(appId),
      description: packageJson.description || getDefaultDescription(appId),
      icon: getDefaultIcon(appId),
      bundleUrl: getBundleUrl(appId),
      defaultProps: getDefaultProps(appId),
    };

    apps.push(app);
  }

  return { apps };
}

// Generate the manifest
const manifest = generateManifest();

// Write the manifest to disk
const manifestPath = path.join(__dirname, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`Generated manifest.json with base URL: ${config.baseUrl}`);
manifest.apps.forEach(app => {
  console.log(`- ${app.name} (${app.id})`);
  console.log(`  Bundle URL: ${app.bundleUrl}`);
}); 