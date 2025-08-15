# App Structure Migration Guide

## Overview

This repository has been refactored to separate apps from their distribution sources, allowing the same app to be distributed through multiple sources while maintaining a single app entry.

## What Changed

### Before (Old Structure)
- **App files** were named `{app-name}-{source-slug}.md` (e.g., `altstore-altstore.md`)
- **Duplicate files** were created for the same app when distributed through multiple sources
- **Source information** was stored in `sourceUrls` array
- **No unified app entity** existed

### After (New Structure)
- **App files** are named using unique identifiers (bundle ID or app name)
- **Single app file** per unique app, regardless of how many sources distribute it
- **Sources array** contains detailed information about each distribution source
- **Unified app entity** with multiple source options

## New Data Structure

### App Schema
```typescript
{
  // ... other fields ...
  sources: [
    {
      sourceId: "altstore", // Reference to source slug
      downloadUrl: "https://...",
      version: "1.6.2b",
      size: "5.4 MB",
      lastUpdated: Date,
      isOfficial: true
    }
  ]
}
```

### Source Schema
```typescript
{
  // ... other fields ...
  apps: ["com-rileytestut-altstore-beta"] // Array of app slugs
}
```

## Migration Process

### 1. Run the Migration Script
```bash
npm run migrate-apps
# or
bun run migrate-apps
```

This script will:
- Group existing app files by bundle ID or name
- Merge duplicate apps into single files
- Update the data structure to use the new `sources` field
- Rename files to use unique app identifiers

### 2. Update the Sources
```bash
npm run fetch-sources
# or
bun run fetch-sources
```

This will update the sources collection with the new app references.

### 3. Verify the Changes
- Check that app files now have unique names
- Verify that the `sources` field contains proper source information
- Ensure the UI displays multiple sources for apps

## File Naming Convention

### Old Convention
```
altstore-altstore.md          # AltStore app from AltStore source
delta-altstore.md             # Delta app from AltStore source
clip-altstore.md              # Clip app from AltStore source
```

### New Convention
```
com-rileytestut-altstore-beta.md    # AltStore app (using bundle ID)
com-rileytestut-delta.md            # Delta app (using bundle ID)
com-rileytestut-clip.md             # Clip app (using bundle ID)
```

## Benefits of the New Structure

1. **No Duplicate Apps**: Each app appears only once in the catalog
2. **Multiple Sources**: Users can see all available sources for an app
3. **Better Organization**: Apps are organized by their identity, not distribution
4. **Easier Maintenance**: Updates to an app only need to be made in one place
5. **Improved UX**: Users can choose their preferred source for installation

## UI Updates

The following components have been updated to support the new structure:

- **AppCard**: Shows the number of available sources
- **App Detail Page**: Displays all available sources with install buttons
- **Apps Index**: Properly sorts apps with multiple sources
- **Search**: Works with the new unified app structure

## Backward Compatibility

The migration maintains backward compatibility by:
- Preserving existing `sourceUrls` fields
- Supporting both old and new data structures during transition
- Maintaining existing app metadata and overrides

## Troubleshooting

### Common Issues

1. **Missing Sources**: If an app shows no sources, check that the source files exist and are properly referenced
2. **Duplicate Apps**: Run the migration script again to ensure all duplicates are merged
3. **Broken Links**: Verify that source slugs in the `sources` array match actual source file names

### Rollback

If issues arise, you can:
1. Restore from git backup
2. Re-run the migration with different parameters
3. Manually fix individual app files

## Support

For questions or issues with the migration:
1. Check the existing app files for examples
2. Review the source fetcher logic
3. Examine the migration script for specific logic
