import fs from 'fs';
import path from 'path';

// Configuration
const config = {
  // Default to localhost, can be overridden by BUNDLE_BASE_URL environment variable
  baseUrl: process.env.BUNDLE_BASE_URL || 'http://localhost:3000',
  // Repository name from package.json or environment variable
  repoName: process.env.REPO_NAME || 'super-app-template'
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
  requiresAuth: boolean;
  version: string;
}

interface Manifest {
  apps: MicroAppManifest[];
}

function getDefaultIcon(appId: string): MicroAppIcon {
  const icons: Record<string, string> = {
    'micro-app-one': '📱',
    'micro-app-two': '🎮',
    'micro-app-three': '🎅',
    'micro-app-four': '🐛',
  };
  return {
    type: 'emoji',
    value: icons[appId] || '📱',
  };
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
    'micro-app-four': {},
  };
  return defaultProps[appId] || {};
}

function getBundleUrl(appId: string): string {
  // Bundle path without the bundles prefix since they're deployed to root
  const bundlePathSuffix = `${appId}/bundle.js`;

  // If using GitHub Pages, format URL accordingly
  if (config.baseUrl.includes('github.io')) {
    return `${config.baseUrl}/${config.repoName}/${bundlePathSuffix}`;
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

    // Check if this is a micro-app by looking for the bundle script
    if (!packageJson.scripts?.bundle) {
      continue;
    }

    const appId = entry.name;
    const app: MicroAppManifest = {
      id: appId,
      name: packageJson.name.split('/').pop()?.split('-').map(
        (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ') || appId,
      description: packageJson.description || `A micro app`,
      icon: getDefaultIcon(appId),
      bundleUrl: getBundleUrl(appId),
      defaultProps: getDefaultProps(appId),
      // Only micro-app-three requires auth by default
      requiresAuth: appId === 'micro-app-three',
      version: packageJson.version,
    };

    apps.push(app);
  }

  // Sort apps by ID to maintain consistent order
  apps.sort((a, b) => a.id.localeCompare(b.id));

  return { apps };
}

// Generate the manifest
const manifest = generateManifest();

// Write different manifest files for different auth levels
const publicApps = manifest.apps.filter(app => !app.requiresAuth);
const protectedApps = manifest.apps.filter(app => app.requiresAuth);

// Write the manifests to the bundles directory
const bundlesDir = path.join(__dirname, 'bundles');
fs.mkdirSync(bundlesDir, { recursive: true });

// Public manifest (no auth required)
const publicManifest = { apps: publicApps };
fs.writeFileSync(
  path.join(bundlesDir, 'public-manifest.json'),
  JSON.stringify(publicManifest, null, 2)
);

// Protected manifest (auth required)
const protectedManifest = { apps: protectedApps };
fs.writeFileSync(
  path.join(bundlesDir, 'protected-manifest.json'),
  JSON.stringify(protectedManifest, null, 2)
);

// Full manifest (all apps)
fs.writeFileSync(
  path.join(bundlesDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

// Log the results
console.log('Generated manifests with configuration:', config);
console.log('\nPublic apps:');
publicApps.forEach(logAppInfo);
console.log('\nProtected apps:');
protectedApps.forEach(logAppInfo);

function logAppInfo(app: MicroAppManifest) {
  console.log(`- ${app.name} v${app.version} (${app.id})`);
  console.log(`  Description: ${app.description}`);
  console.log(`  Auth Required: ${app.requiresAuth}`);
  console.log(`  Bundle URL: ${app.bundleUrl}`);
  console.log();
} 