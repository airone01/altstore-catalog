import { fetchSourceWithApps } from '../src/lib/source-fetcher';
import fs from 'node:fs/promises';
import path from 'node:path';

// List of source URLs to fetch
const SOURCE_URLS = [
  // AltStore team
  'https://cdn.altstore.io/file/altstore/apps.json', // AltStore official source
  // Trusted by AltStore team
  'https://altstore.oatmealdome.me', // OatmealDome’s source
  'https://alt.getutm.app', // UTM (emulator) official source
  'https://flyinghead.github.io/flycast-builds/altstore.json', // FlyCast (emulator) official source
  'https://provenance-emu.com/apps.json', // Provenance (emulator) official source
  'https://alt.crystall1ne.dev/', // PojavLauncher official source
  // Unofficials & patches
  'https://raw.githubusercontent.com/Romain-Pl/ChutSpyroAltSources/refs/heads/main/UnofficialEpicGamesIPASource.json', // Unofficial Epic Games (ChutSpyro patches)
  // Community-driven (has to be driven by GitHub)
  'https://raw.githubusercontent.com/Aidoku/Aidoku/altstore/apps.json', // Aidoku official source
  'https://altstore.ignitedemulator.com', // Ignite (emulator) official source
  // The rest
  'https://adp.salupovteam.com/altrepo.json', // Salupov Team's source
  'https://alt.stux.me/repo.json', // Stux's source
  'https://peopledrop.app/apps.json', // Alex Tarana's source
  'https://cdn.squadblast.com/market/marketplace.json', // ULTRAHORSE source
  'https://get.furaffinity.app/altstore', // FurAffinity source
  'https://raw.githubusercontent.com/auties00/artemis/refs/heads/main/source_pal.json', // Auties00's source
  'https://altstore.nuumi.io/source.json', // Nuumi source
  'https://raw.githubusercontent.com/cbruegg/altstore-source/refs/heads/main/source.json', // cbruegg's PAL source
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

      const sourcePath = path.join(
        process.cwd(),
        'src/content/sources',
        `${sourceSlug}.md`
      );

      // Preserve existing overrides, body, maintainer, and verified
      let existingSourceOverridesBlock = '';
      let existingSourceBody = '';
      let existingMaintainer = '';
      let existingVerified: boolean | undefined = undefined;
      try {
        const existing = await fs.readFile(sourcePath, 'utf8');
        const fmMatch = existing.match(/^---[\s\S]*?---/);
        if (fmMatch) {
          const fm = fmMatch[0];
          existingSourceBody = existing.slice(fm.length).trimStart();
          
          // Extract existing maintainer
          const maintainerMatch = fm.match(/maintainer:\s*"([^"]+)"/);
          if (maintainerMatch) {
            const oldMaintainer = maintainerMatch[1];
            // If the old maintainer is generic or was auto-generated with old logic, don't preserve it
            // But allow "AltStore" for the actual AltStore source
            const badMaintainers = ['source', 'repo', 'team', 'apps', 'collection'];
            const isAltStoreSource = source.name.toLowerCase().includes('altstore') && 
                                   (source.url.includes('altstore.io') || source.url.includes('cdn.altstore.io'));
            
            if (!badMaintainers.includes(oldMaintainer.toLowerCase()) || 
                (oldMaintainer.toLowerCase() === 'altstore' && isAltStoreSource)) {
              existingMaintainer = oldMaintainer;
            }
          }

          // Extract existing verified flag
          const verifiedMatch = fm.match(/verified:\s*(true|false)/);
          if (verifiedMatch) {
            existingVerified = verifiedMatch[1] === 'true';
          }
          
          // Extract existing overrides
          const overridesIdx = fm.indexOf('\noverrides:');
          if (overridesIdx !== -1) {
            existingSourceOverridesBlock = fm.slice(overridesIdx + 1).replace(/\n---$/, '');
          }
        }
      } catch {}

      const sourceContent = `---
name: "${source.name}"
maintainer: "${existingMaintainer || source.maintainer}"
description: "${(source.description || '').replace(/"/g, '\\"')}"
url: "${source.url}"
${source.icon ? `icon: "${source.icon}"` : ''}
${source.website ? `website: "${source.website}"` : ''}
category: "${source.category}"
verified: ${existingVerified ?? false}
lastUpdated: ${
  source.lastUpdated instanceof Date && !Number.isNaN(source.lastUpdated.getTime())
    ? source.lastUpdated.toISOString().split('T')[0]
    : '1970-01-01'
}
tags: ${JSON.stringify(source.tags)}
apps: ${JSON.stringify(appSlugs)}
${existingSourceOverridesBlock ? `${existingSourceOverridesBlock}\n` : ''}---
${existingSourceBody}`;

      await fs.writeFile(sourcePath, sourceContent);
      console.log(`✅ Created source: ${sourceSlug}.md`);
      
      // Generate app markdown files
      for (const app of apps) {
        const appSlug = `${app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${sourceSlug}`;
        const appPath = path.join(
          process.cwd(),
          'src/content/apps',
          `${appSlug}.md`
        );

        // Preserve existing overrides, body, and verified
        let existingAppOverridesBlock = '';
        let existingAppBody = '';
        let existingAppVerified: boolean | undefined = undefined;
        try {
          const existing = await fs.readFile(appPath, 'utf8');
          const fmMatch = existing.match(/^---[\s\S]*?---/);
          if (fmMatch) {
            const fm = fmMatch[0];
            existingAppBody = existing.slice(fm.length).trimStart();
            const verifiedMatch = fm.match(/verified:\s*(true|false)/);
            if (verifiedMatch) {
              existingAppVerified = verifiedMatch[1] === 'true';
            }
            const overridesIdx = fm.indexOf('\noverrides:');
            if (overridesIdx !== -1) {
              existingAppOverridesBlock = fm.slice(overridesIdx + 1).replace(/\n---$/, '');
            }
          }
        } catch {}

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
verified: ${existingAppVerified ?? false}
featured: ${app.featured}
${existingAppOverridesBlock ? `${existingAppOverridesBlock}\n` : ''}---
${existingAppBody}`;

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