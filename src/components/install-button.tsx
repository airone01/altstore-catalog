import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InstallButtonProps {
	appName: string;
	downloadUrl: string;
	palDownloadUrl?: string;
	sourceUrl?: string; // The source JSON URL that contains this app
	bundleId?: string; // App bundle identifier for deep linking
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
	sourceUrl,
	bundleId,
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
	const [copied, setCopied] = useState<"altstore" | "pal" | "source" | null>(
		null,
	);

	useEffect(() => {
		const detectPlatform = () => {
			const isIOS =
				/iPad|iPhone|iPod/.test(navigator.userAgent) &&
				// biome-ignore lint/suspicious/noExplicitAny: idc
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

	// Enhanced installation with URL schemes
	const handleDirectInstall = async (type: "altstore" | "pal") => {
		const isClassic = type === "altstore";
		const scheme = isClassic ? "altstore://" : "altstore-pal://";
		const currentSourceUrl = isClassic
			? downloadUrl
			: palDownloadUrl || downloadUrl;

		try {
			// Step 1: Try to add source if we have sourceUrl
			if (sourceUrl) {
				const addSourceUrl = `${scheme}source?url=${encodeURIComponent(sourceUrl)}`;
				window.location.href = addSourceUrl;

				// Step 2: After a short delay, try to open the specific app
				if (bundleId && !isClassic) {
					// Only PAL supports viewApp deep linking
					setTimeout(() => {
						const viewAppUrl = `altstore-pal://viewApp?bundleID=${encodeURIComponent(bundleId)}`;
						window.location.href = viewAppUrl;
					}, 1500);
				}

				return;
			}

			// Fallback: Try to open app directly (PAL only)
			if (bundleId && !isClassic) {
				const viewAppUrl = `altstore-pal://viewApp?bundleID=${encodeURIComponent(bundleId)}`;
				window.location.href = viewAppUrl;
				return;
			}

			// Final fallback: Copy URL
			copyToClipboard(currentSourceUrl || sourceUrl || downloadUrl, type);
		} catch (error) {
			console.error(`Failed to open ${type} URL scheme:`, error);
			// Fallback to copying URL
			copyToClipboard(currentSourceUrl || sourceUrl || downloadUrl, type);
		}
	};

	const copyToClipboard = async (
		url: string,
		type: "altstore" | "pal" | "source",
	) => {
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

	const handleCopySource = () => {
		if (sourceUrl) {
			copyToClipboard(sourceUrl, "source");
		}
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
					Installation Guide
				</Button>

				{showInstructions && (
					<Card className="mt-4">
						<CardHeader>
							<CardTitle className="text-sm">
								How to Install {appName}
							</CardTitle>
						</CardHeader>
						<CardContent className="text-sm space-y-4">
							<div>
								<h4 className="font-medium mb-2">Requirements:</h4>
								<ul className="list-disc list-inside space-y-1 text-muted-foreground">
									<li>iOS device (iPhone/iPad)</li>
									<li>AltStore or AltStore PAL installed</li>
								</ul>
							</div>

							<div>
								<h4 className="font-medium mb-2">Step-by-step:</h4>
								<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
									<li>
										Install AltStore from{" "}
										<a
											href="https://altstore.io"
											className="text-primary underline"
											target="_blank"
											rel="noreferrer noopener"
										>
											altstore.io
										</a>
									</li>
									{sourceUrl ? (
										<>
											<li>
												Copy this source URL:{" "}
												<code className="bg-muted px-1 py-0.5 rounded text-xs break-all">
													{sourceUrl}
												</code>
											</li>
											<li>Open AltStore and add the source</li>
											<li>Find and install {appName}</li>
										</>
									) : (
										<>
											<li>
												Copy this URL:{" "}
												<code className="bg-muted px-1 py-0.5 rounded text-xs break-all">
													{downloadUrl}
												</code>
											</li>
											<li>Open AltStore and paste the URL</li>
											<li>Tap "Install" to sideload the app</li>
										</>
									)}
								</ol>
							</div>

							{sourceUrl && (
								<div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
									<p className="text-xs text-blue-800 dark:text-blue-200">
										💡 <strong>Tip:</strong> Adding the source once gives you
										access to all apps from that developer, including future
										updates.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				)}
			</div>
		);
	}

	return (
		<div className={className}>
			<div className="flex flex-col gap-2">
				{/* Primary install button - Smart selection */}
				{platform.hasPAL && palDownloadUrl ? (
					<Button
						size={size}
						onClick={() => handleDirectInstall("pal")}
						className="w-full"
					>
						{copied === "pal"
							? "Opened in AltStore PAL!"
							: "Install via AltStore PAL"}
						<Badge variant="secondary" className="ml-2 text-xs">
							EU
						</Badge>
					</Button>
				) : (
					<Button
						size={size}
						onClick={() => handleDirectInstall("altstore")}
						className="w-full"
					>
						{copied === "altstore"
							? "Opened in AltStore!"
							: "Install via AltStore"}
					</Button>
				)}

				{/* Secondary install option */}
				{platform.hasPAL && palDownloadUrl && (
					<Button
						size={size}
						variant="outline"
						onClick={() => handleDirectInstall("altstore")}
						className="w-full"
					>
						{copied === "altstore"
							? "Opened in AltStore!"
							: "Install via AltStore Classic"}
					</Button>
				)}

				{/* Alternative actions */}
				<div className="flex gap-2">
					{sourceUrl && (
						<Button
							size="sm"
							variant="ghost"
							onClick={handleCopySource}
							className="flex-1 text-xs"
						>
							{copied === "source" ? "Copied!" : "Copy Source"}
						</Button>
					)}
					<Button
						size="sm"
						variant="ghost"
						onClick={() =>
							handleCopyUrl(
								platform.hasPAL && palDownloadUrl ? "pal" : "altstore",
							)
						}
						className="flex-1 text-xs"
					>
						{copied === (platform.hasPAL && palDownloadUrl ? "pal" : "altstore")
							? "Copied!"
							: "Copy URL"}
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onClick={() => setShowInstructions(!showInstructions)}
						className="flex-1 text-xs"
					>
						Help
					</Button>
				</div>
			</div>

			{showInstructions && (
				<Card className="mt-4">
					<CardHeader>
						<CardTitle className="text-sm">Installation Instructions</CardTitle>
					</CardHeader>
					<CardContent className="text-sm space-y-4">
						<div>
							<h4 className="font-medium mb-2">Quick Install (Recommended)</h4>
							<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
								<li>Tap the install button above</li>
								<li>AltStore should open automatically</li>
								{sourceUrl && <li>The source will be added automatically</li>}
								<li>Confirm the installation</li>
							</ol>
						</div>

						<div>
							<h4 className="font-medium mb-2">Manual Install</h4>
							<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
								{sourceUrl ? (
									<>
										<li>Copy the source URL using the button above</li>
										<li>Open AltStore or AltStore PAL</li>
										<li>Go to Browse → "+" → paste source URL</li>
										<li>Find {appName} and tap "Install"</li>
									</>
								) : (
									<>
										<li>Copy the app URL using the button above</li>
										<li>Open AltStore or AltStore PAL</li>
										<li>Go to Browse → "+" → paste URL</li>
										<li>Tap "Install"</li>
									</>
								)}
							</ol>
						</div>

						{platform.hasPAL && (
							<div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
								<p className="text-xs text-blue-800 dark:text-blue-200">
									<strong>EU Users:</strong> AltStore PAL offers direct
									installation from Safari with no computer required for
									refreshing apps.
								</p>
							</div>
						)}

						{sourceUrl && (
							<div className="bg-green-50 dark:bg-green-950 p-3 rounded">
								<p className="text-xs text-green-800 dark:text-green-200">
									💡 <strong>Pro Tip:</strong> Adding this source gives you
									access to all apps from this developer, including automatic
									updates!
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};
