import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InstallButtonProps {
	appName: string;
	downloadUrl: string;
	palDownloadUrl?: string;
	size?: "sm" | "default" | "lg";
	className?: string;
}

interface PlatformInfo {
	isIOS: boolean;
	isEU: boolean;
	hasAltStore: boolean;
	hasPAL: boolean;
}

export const InstallButton: React.FC<InstallButtonProps> = ({
	appName,
	downloadUrl,
	palDownloadUrl,
	size = "default",
	className = "",
}) => {
	const [platform, setPlatform] = useState<PlatformInfo>({
		isIOS: false,
		isEU: false,
		hasAltStore: false,
		hasPAL: false,
	});
	const [showInstructions, setShowInstructions] = useState(false);
	const [copied, setCopied] = useState<"altstore" | "pal" | null>(null);

	useEffect(() => {
		const detectPlatform = () => {
			const isIOS =
				/iPad|iPhone|iPod/.test(navigator.userAgent) &&
				!(window as any).MSStream;
			const isEU = detectEURegion();

			setPlatform({
				isIOS,
				isEU,
				hasAltStore: isIOS, // Assume available if iOS
				hasPAL: isIOS && isEU,
			});
		};

		detectPlatform();
	}, []);

	const detectEURegion = (): boolean => {
		try {
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			const euTimezones = [
				"Europe/London",
				"Europe/Berlin",
				"Europe/Paris",
				"Europe/Rome",
				"Europe/Madrid",
				"Europe/Amsterdam",
				"Europe/Brussels",
				"Europe/Vienna",
				"Europe/Stockholm",
				"Europe/Copenhagen",
				"Europe/Helsinki",
				"Europe/Dublin",
				"Europe/Lisbon",
				"Europe/Prague",
				"Europe/Budapest",
				"Europe/Warsaw",
				"Europe/Athens",
				"Europe/Bucharest",
				"Europe/Sofia",
				"Europe/Zagreb",
			];

			return euTimezones.some((tz) => timezone.includes(tz.split("/")[1]));
		} catch {
			return false;
		}
	};

	const handleInstall = (type: "altstore" | "pal") => {
		const url = type === "pal" && palDownloadUrl ? palDownloadUrl : downloadUrl;
		const scheme = type === "pal" ? "altstore-pal://" : "altstore://";
		const installUrl = `${scheme}install?url=${encodeURIComponent(url)}`;

		try {
			window.location.href = installUrl;
		} catch (error) {
			// Fallback: copy URL to clipboard
			copyToClipboard(url, type);
		}
	};

	const copyToClipboard = async (url: string, type: "altstore" | "pal") => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(type);
			setTimeout(() => setCopied(null), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	const handleCopyUrl = (type: "altstore" | "pal") => {
		const url = type === "pal" && palDownloadUrl ? palDownloadUrl : downloadUrl;
		copyToClipboard(url, type);
	};

	if (!platform.isIOS) {
		return (
			<div className={className}>
				<Button
					variant="outline"
					size={size}
					onClick={() => setShowInstructions(!showInstructions)}
					className="w-full"
				>
					Install Instructions
				</Button>

				{showInstructions && (
					<Card className="mt-4">
						<CardHeader>
							<CardTitle className="text-sm">
								How to Install {appName}
							</CardTitle>
						</CardHeader>
						<CardContent className="text-sm space-y-3">
							<div>
								<h4 className="font-medium mb-2">Requirements:</h4>
								<ul className="list-disc list-inside space-y-1 text-muted-foreground">
									<li>iOS device (iPhone/iPad)</li>
									<li>AltStore or AltStore PAL installed</li>
								</ul>
							</div>

							<div>
								<h4 className="font-medium mb-2">Install Steps:</h4>
								<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
									<li>
										Install AltStore from{" "}
										<a
											href="https://altstore.io"
											className="text-primary underline"
											target="_blank"
											rel="noopener"
										>
											altstore.io
										</a>
									</li>
									<li>
										Copy this URL:{" "}
										<code className="bg-muted px-1 py-0.5 rounded text-xs break-all">
											{downloadUrl}
										</code>
									</li>
									<li>Open AltStore and paste the URL</li>
									<li>Tap "Install" to sideload the app</li>
								</ol>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		);
	}

	return (
		<div className={className}>
			<div className="flex flex-col gap-2">
				{/* Primary install button */}
				<Button
					size={size}
					onClick={() => handleInstall("altstore")}
					className="w-full"
				>
					{copied === "altstore" ? "URL Copied!" : "Install via AltStore"}
				</Button>

				{/* PAL button if available and in EU */}
				{platform.hasPAL && palDownloadUrl && (
					<Button
						size={size}
						variant="outline"
						onClick={() => handleInstall("pal")}
						className="w-full"
					>
						{copied === "pal" ? "URL Copied!" : "Install via AltStore PAL"}
						<Badge variant="secondary" className="ml-2 text-xs">
							EU
						</Badge>
					</Button>
				)}

				{/* Alternative actions */}
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="ghost"
						onClick={() => handleCopyUrl("altstore")}
						className="flex-1 text-xs"
					>
						Copy URL
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onClick={() => setShowInstructions(!showInstructions)}
						className="flex-1 text-xs"
					>
						Instructions
					</Button>
				</div>
			</div>

			{showInstructions && (
				<Card className="mt-4">
					<CardHeader>
						<CardTitle className="text-sm">Install Instructions</CardTitle>
					</CardHeader>
					<CardContent className="text-sm space-y-3">
						<div>
							<h4 className="font-medium mb-2">Method 1: Direct Install</h4>
							<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
								<li>Tap the install button above</li>
								<li>AltStore should open automatically</li>
								<li>Confirm the installation</li>
							</ol>
						</div>

						<div>
							<h4 className="font-medium mb-2">Method 2: Manual Install</h4>
							<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
								<li>Copy the app URL using the button above</li>
								<li>Open AltStore or AltStore PAL</li>
								<li>Go to Browse → "+" → paste URL</li>
								<li>Tap "Install"</li>
							</ol>
						</div>

						{platform.hasPAL && (
							<div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
								<p className="text-xs text-blue-800 dark:text-blue-200">
									<strong>EU Users:</strong> You can use AltStore PAL for
									enhanced features and no computer required for refreshing.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};
