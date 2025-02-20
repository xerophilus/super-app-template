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
  // Use the new bundle naming convention: appId.bundle.js
  const bundleFileName = `${appId}.bundle.js`;

  // If using GitHub Pages, format URL accordingly
  if (config.baseUrl.includes('github.io')) {
    return `${config.baseUrl}/${config.repoName}/${bundleFileName}`;
  }

  // For local development, just append the bundle filename
  return `${config.baseUrl}/${bundleFileName}`;
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

// Write the manifests to both the bundles directory and root directory for local development
const bundlesDir = path.join(__dirname, 'bundles');
fs.mkdirSync(bundlesDir, { recursive: true });

// Function to write manifest files to a directory
function writeManifestFiles(directory: string) {
  // Public manifest (no auth required)
  const publicManifest = { apps: publicApps };
  fs.writeFileSync(
    path.join(directory, 'public-manifest.json'),
    JSON.stringify(publicManifest, null, 2),
    'utf8'
  );
  console.log(`Written public manifest to ${directory}/public-manifest.json`);

  // Protected manifest (auth required)
  const protectedManifest = { apps: protectedApps };
  fs.writeFileSync(
    path.join(directory, 'protected-manifest.json'),
    JSON.stringify(protectedManifest, null, 2),
    'utf8'
  );
  console.log(`Written protected manifest to ${directory}/protected-manifest.json`);

  // Full manifest (all apps)
  fs.writeFileSync(
    path.join(directory, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
  console.log(`Written full manifest to ${directory}/manifest.json`);
}

// Write to bundles directory (for GitHub Pages)
writeManifestFiles(bundlesDir);

// Write to root directory (for local development)
writeManifestFiles(__dirname);

// Log the results
console.log('\nManifest generation summary:');
console.log('Public apps:', publicApps.length);
console.log('Protected apps:', protectedApps.length);
console.log('Total apps:', manifest.apps.length);

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