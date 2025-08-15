import { defineCollection, z } from "astro:content";

const appsCollection = defineCollection({
	type: "content",
	schema: z.object({
		// Required fields
		name: z.string(),
		developer: z.string(),
		description: z
			.string()
			.max(200, "Description must be under 200 characters"),
		icon: z.string().url(),
		version: z.string(),
		size: z.string(),
		category: z.enum([
			"games",
			"productivity",
			"utilities",
			"entertainment",
			"social",
			"education",
			"developer",
		]),
		compatibility: z.string(), // e.g., "iOS 12.0 or later"

		// Enhanced installation fields
		bundleId: z.string().optional(), // App bundle identifier (e.g., com.rileytestut.Delta)
		
		// Multiple distribution sources for this app
		sources: z.array(z.object({
			sourceId: z.string(), // Reference to source slug
			downloadUrl: z.string().url(),
			version: z.string().optional(),
			size: z.string().optional(),
			lastUpdated: z.string().nullable(),
			isOfficial: z.boolean().default(false), // Whether this is the official source
		})).min(1), // At least one source required
		
		// Legacy fields for backward compatibility (deprecated)
		sourceUrls: z.array(z.string().url()).optional(),
		sourceUrl: z.string().url().optional(),
		officialSourceUrl: z.string().url().optional(),

		// Optional fields
		palDownloadUrl: z.string().url().optional(), // For AltStore PAL
		repoUrl: z.string().url().optional(), // GitHub/source code repository
		appStoreUrl: z.string().url().optional(), // Official App Store link
		website: z.string().url().optional(), // App's official website
		screenshots: z.array(z.string().url()).optional(),
		features: z.array(z.string()).optional(),
		tags: z.array(z.string()).optional(),
		featured: z.boolean().default(false), // For homepage highlighting
		priority: z.number().default(0), // For sorting (higher = more prominent)

		// Requirements
		minIos: z.string().optional(), // e.g., "14.0"

		// Social proof
		githubStars: z.number().optional(),

		// Internal metadata
		verified: z.boolean().default(false), // Verified by maintainers
		submittedBy: z.string().optional(), // GitHub username of submitter

		// Manual overrides for display
		overrides: z
			.object({
				name: z.string().optional(),
				developer: z.string().optional(),
				description: z.string().optional(),
				icon: z.string().url().optional(),
				version: z.string().optional(),
				size: z.string().optional(),
				category: z
					.enum([
						"games",
						"productivity",
						"utilities",
						"entertainment",
						"social",
						"education",
						"developer",
					])
					.optional(),
				compatibility: z.string().optional(),
				downloadUrl: z.string().url().optional(),
				palDownloadUrl: z.string().url().optional(),
				bundleId: z.string().optional(),
				website: z.string().url().optional(),
				repoUrl: z.string().url().optional(),
				appStoreUrl: z.string().url().optional(),
				screenshots: z.array(z.string().url()).optional(),
				tags: z.array(z.string()).optional(),
				sources: z.array(z.object({
					sourceId: z.string(),
					downloadUrl: z.string().url(),
					version: z.string().optional(),
					size: z.string().optional(),
					lastUpdated: z.date().optional(),
					isOfficial: z.boolean().default(false),
				})).optional(),
			})
			.optional(),
	}),
});

const sourcesCollection = defineCollection({
	type: "content",
	schema: z.object({
		// Required fields
		name: z.string(),
		maintainer: z.string(),
		description: z.string(),
		url: z.string().url(),
		category: z.enum(["Official", "Community", "Developer", "Specialized"]),
		lastUpdated: z.date(),

		// Optional fields
		icon: z.string().url().optional(),
		website: z.string().url().optional(),
		verified: z.boolean().default(false), // Verified/trusted sources
		tags: z.array(z.string()).optional(),

		// Featured apps in this source (for preview)
		featuredApps: z.array(z.string()).optional(), // Array of app slugs

		// App list for this source (kept in sync by generator)
		apps: z.array(z.string()).optional(), // Array of app slugs

		// Contact/social
		contact: z.string().optional(), // Email or social handle
		discord: z.string().url().optional(),
		twitter: z.string().optional(), // Handle without @
		github: z.string().url().optional(),

		// Compatibility
		supportsAltStore: z.boolean().default(true),
		supportsAltStorePAL: z.boolean().default(true),

		// Quality indicators
		updateFrequency: z
			.enum(["Daily", "Weekly", "Monthly", "Irregular", "Archived"])
			.optional(),

		// Internal metadata
		submittedBy: z.string().optional(), // GitHub username of submitter
		dateAdded: z.date().optional(),

		// Manual overrides for display
		overrides: z
			.object({
				name: z.string().optional(),
				maintainer: z.string().optional(),
				description: z.string().optional(),
				icon: z.string().url().optional(),
				website: z.string().url().optional(),
				category: z
					.enum(["Official", "Community", "Developer", "Specialized"])
					.optional(),
				tags: z.array(z.string()).optional(),
			})
			.optional(),
	}),
});

export const collections = {
	apps: appsCollection,
	sources: sourcesCollection,
};
