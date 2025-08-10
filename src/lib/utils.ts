import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const parseDownloadCount = (downloads: string): number => {
	return Number.parseInt(downloads.replace(/[^\d]/g, ""));
};
