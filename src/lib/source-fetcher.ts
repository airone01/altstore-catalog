export interface AltStoreApp {
  name: string;
  bundleIdentifier: string;
  developerName: string;
  subtitle?: string;
  localizedDescription: string;
  iconURL: string;
  screenshotURLs?: string[];
  version: string;
  versionDate: string;
  versionDescription?: string;
  downloadURL: string;
  size: number;
  permissions?: Array<{
    type: string;
    usageDescription: string;
  }>;
  tintColor?: string;
  beta?: boolean;
}

export interface AltStoreSource {
  name: string;
  identifier: string;
  subtitle?: string;
  description?: string;
  iconURL?: string;
  headerURL?: string;
  website?: string;
  tintColor?: string;
  apps: AltStoreApp[];
  news?: Array<{
    identifier: string;
    caption: string;
    title: string;
    imageURL?: string;
    date: string;
    tintColor?: string;
    url?: string;
    appID?: string;
    notify?: boolean;
  }>;
}

export interface ParsedSource {
  name: string;
  maintainer: string;
  description: string;
  url: string;
  icon?: string;
  website?: string;
  category: "Official" | "Community" | "Developer" | "Specialized";
  verified: boolean;
  lastUpdated: Date;
  tags: string[];
  appCount: number;
  identifier?: string;
  tintColor?: string;
}

export interface ParsedApp {
  name: string;
  developer: string;
  description: string;
  icon: string;
  version: string;
  size: string;
  category: string;
  compatibility: string;
  downloadUrl: string;
  bundleId: string;
  sourceUrl: string;
  palDownloadUrl?: string;
  screenshots?: string[];
  lastUpdated: Date;
  tags: string[];
  verified: boolean;
  featured: boolean;
}

// Fetch and parse AltStore source JSON
export async function fetchAltStoreSource(url: string): Promise<AltStoreSource | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch source: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data as AltStoreSource;
  } catch (error) {
    console.error('Error fetching source:', error);
    return null;
  }
}

// Convert AltStore source to our format
export function parseAltStoreSource(source: AltStoreSource, url: string): ParsedSource {
  const tags: string[] = [];
  
  // Analyze apps to determine tags
  const appCategories = new Set<string>();
  for (const app of source.apps) {
    const desc = app.localizedDescription?.toLowerCase() || '';
    if (desc.includes('emulator')) {
      appCategories.add('emulation');
    }
    if (desc.includes('game')) {
      appCategories.add('games');
    }
    if (desc.includes('utility')) {
      appCategories.add('utilities');
    }
  }

  tags.push(...appCategories);

  // Determine category based on source identifier and name
  let category: ParsedSource['category'] = 'Community';
  if (source.identifier?.includes('altstore') || source.name?.toLowerCase().includes('altstore')) {
    category = 'Official';
  } else if (source.apps.length <= 3) {
    category = 'Developer';
  } else if (tags.includes('emulation') && source.apps.every(app => 
    app.localizedDescription?.toLowerCase().includes('emulator'))) {
    category = 'Specialized';
  }
  
  // Extract maintainer from source name or identifier
  const maintainer = source.identifier?.split('.').reverse()[0] || 
                     source.name?.split(' ')[0] || 
                     'Unknown';
  
  // Get most recent update date from apps
  const lastUpdated = source.apps.reduce((latest, app) => {
    const appDate = new Date(app.versionDate);
    return appDate > latest ? appDate : latest;
  }, new Date(0));
  
  return {
    name: source.name,
    maintainer: capitalize(maintainer),
    description: source.description || source.subtitle || `Collection of ${source.apps.length} apps`,
    url,
    icon: source.iconURL,
    website: source.website,
    category,
    verified: category === 'Official',
    lastUpdated,
    tags,
    appCount: source.apps.length,
    identifier: source.identifier,
    tintColor: source.tintColor,
  };
}

// Convert AltStore app to our format
export function parseAltStoreApp(
  app: AltStoreApp, 
  sourceUrl: string,
  sourceName: string
): ParsedApp {
  const tags: string[] = [];
  
  // Determine category
  let category = 'utilities';
  const desc = app.localizedDescription?.toLowerCase() || '';
  if (desc.includes('game') || desc.includes('play')) {
    category = 'games';
  } else if (desc.includes('emulator')) {
    category = 'entertainment';
    tags.push('emulator');
  } else if (desc.includes('social') || desc.includes('chat')) {
    category = 'social';
  } else if (desc.includes('productivity') || desc.includes('work')) {
    category = 'productivity';
  } else if (desc.includes('education') || desc.includes('learn')) {
    category = 'education';
  } else if (desc.includes('developer') || desc.includes('code')) {
    category = 'developer';
  }
  
  // Add tags based on content
  if (desc.includes('open source')) tags.push('open-source');
  if (desc.includes('nintendo')) tags.push('nintendo');
  if (desc.includes('sega')) tags.push('sega');
  if (desc.includes('sony') || desc.includes('playstation')) tags.push('playstation');
  if (app.beta) tags.push('beta');
  
  // Format size
  const sizeInMB = (app.size / (1024 * 1024)).toFixed(1);
  
  return {
    name: app.name,
    developer: app.developerName,
    description: app.subtitle || app.localizedDescription?.substring(0, 200) || '',
    icon: app.iconURL,
    version: app.version,
    size: `${sizeInMB} MB`,
    category,
    compatibility: 'iOS 14.0 or later', // Default, could be extracted from permissions
    downloadUrl: app.downloadURL,
    bundleId: app.bundleIdentifier,
    sourceUrl,
    screenshots: app.screenshotURLs,
    lastUpdated: new Date(app.versionDate),
    tags,
    verified: sourceName.toLowerCase().includes('altstore'),
    featured: false,
  };
}

// Helper function
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Fetch source and all its apps
export async function fetchSourceWithApps(url: string) {
  const altStoreSource = await fetchAltStoreSource(url);
  if (!altStoreSource) return null;
  
  const parsedSource = parseAltStoreSource(altStoreSource, url);
  const parsedApps = altStoreSource.apps.map(app => 
    parseAltStoreApp(app, url, altStoreSource.name)
  );
  
  return {
    source: parsedSource,
    apps: parsedApps,
  };
}