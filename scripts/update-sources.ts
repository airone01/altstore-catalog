import { fetchSourceWithApps } from '../src/lib/source-fetcher';
import fs from 'node:fs/promises';
import path from 'node:path';

// List of source URLs to fetch
const SOURCE_URLS = [
  'https://cdn.altstore.io/file/altstore/apps.json',
  'https://raw.githubusercontent.com/Aidoku/Aidoku/altstore/apps.json',
  'https://adp.salupovteam.com/altrepo.json',
  'https://altstore.ignitedemulator.com'
];

async function updateSources() {
  console.log('🔄 Updating sources and apps...\n');

  for (const url of SOURCE_URLS) {
    console.log(`📥 Fetching: ${url}`);
    
    try {
      const data = await fetchSourceWithApps(url);
      
      if (!data) {
        console.error(`❌ Failed to fetch ${url}\n`);
        continue;
      }

      const { source, apps } = data;
      
      // Generate source markdown file
      const sourceSlug = source.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const appSlugs: string[] = apps.map(app => `${app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${sourceSlug}`);

      const sourceContent = `---
name: "${source.name}"
maintainer: "${source.maintainer}"
description: "${(source.description || '').replace(/"/g, '\\"')}"
url: "${source.url}"
${source.icon ? `icon: "${source.icon}"` : ''}
${source.website ? `website: "${source.website}"` : ''}
category: "${source.category}"
verified: ${source.verified}
lastUpdated: ${
  source.lastUpdated instanceof Date && !Number.isNaN(source.lastUpdated.getTime())
    ? source.lastUpdated.toISOString().split('T')[0]
    : '1970-01-01'
}
tags: ${JSON.stringify(source.tags)}
apps: ${JSON.stringify(appSlugs)}
---
`;

      const sourcePath = path.join(
        process.cwd(),
        'src/content/sources',
        `${sourceSlug}.md`
      );
      
      await fs.writeFile(sourcePath, sourceContent);
      console.log(`✅ Created source: ${sourceSlug}.md`);
      
      // Generate app markdown files
      for (const app of apps) {
        const appSlug = `${app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${sourceSlug}`;
        const appContent = `---
name: "${app.name}"
developer: "${app.developer}"
description: "${(app.description || '').replace(/"/g, '\\"')}"
icon: "${app.icon}"
version: "${app.version ?? '?'}"
size: "${app.size ?? 0}"
category: "${app.category}"
compatibility: "${app.compatibility}"
downloadUrl: "${app.downloadUrl ?? 'https://there.was.no.download.url'}"
bundleId: "${app.bundleId}"
sourceUrls: ${JSON.stringify(app.sourceUrls)}
${app.officialSourceUrl ? `officialSourceUrl: "${app.officialSourceUrl}"` : ''}
${app.screenshots ? `screenshots: ${JSON.stringify(app.screenshots)}` : ''}
lastUpdated: ${
  app.lastUpdated instanceof Date && !Number.isNaN(app.lastUpdated.getTime())
    ? app.lastUpdated.toISOString().split('T')[0]
    : '1970-01-01'
}
tags: ${JSON.stringify(app.tags)}
verified: ${app.verified}
featured: ${app.featured}
---
`;

        const appPath = path.join(
          process.cwd(),
          'src/content/apps',
          `${appSlug}.md`
        );
        
        await fs.writeFile(appPath, appContent);
        console.log(`  📱 Created app: ${appSlug}.md`);
      }
      
      console.log(`✨ Successfully processed ${source.name}\n`);
      
    } catch (error) {
      console.error(`❌ Error processing ${url}:`, error);
      console.log('');
    }
  }
  
  console.log('🎉 Update complete!');
}

updateSources().catch(console.error);