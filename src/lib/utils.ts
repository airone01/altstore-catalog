import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getPlatformBadgeColor = (platform: string) => {
	switch (platform) {
		case "App Store":
			return "bg-blue-100 text-blue-800";
		case "Google Play":
			return "bg-green-100 text-green-800";
		case "Web":
			return "bg-purple-100 text-purple-800";
		case "GitHub":
			return "bg-gray-100 text-gray-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
};

export const parseDownloadCount = (downloads: string): number => {
	return Number.parseInt(downloads.replace(/[^\d]/g, ""));
};
