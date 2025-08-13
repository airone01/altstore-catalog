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
		downloadUrl: z.string().url(),
		lastUpdated: z.date(),

		// Enhanced installation fields
		bundleId: z.string().optional(), // App bundle identifier (e.g., com.rileytestut.Delta)
		// Multiple distribution sources for this app
		sourceUrls: z.array(z.string().url()).optional(),
		// Back-compat single source (deprecated)
		sourceUrl: z.string().url().optional(),
		// Optional official/canonical source for this app (e.g., Official AltStore URL)
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
	}),
});

export const collections = {
	apps: appsCollection,
	sources: sourcesCollection,
};
