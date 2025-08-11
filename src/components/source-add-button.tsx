import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SourceAddButtonProps {
	sourceName: string;
	sourceUrl: string;
	size?: "sm" | "default" | "lg";
	className?: string;
	showLabel?: boolean;
}

interface PlatformInfo {
	isIOS: boolean;
	isEU: boolean;
	hasAltStore: boolean;
	hasPAL: boolean;
}

export const SourceAddButton: React.FC<SourceAddButtonProps> = ({
	sourceName,
	sourceUrl,
	size = "default",
	className = "",
	showLabel = true,
}) => {
	const [platform, setPlatform] = useState<PlatformInfo>({
		isIOS: false,
		isEU: false,
		hasAltStore: false,
		hasPAL: false,
	});
	const [showInstructions, setShowInstructions] = useState(false);
	const [copied, setCopied] = useState(false);
	const [added, setAdded] = useState(false);

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
				hasAltStore: isIOS,
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

	const handleAddSource = async (isPAL = false) => {
		const scheme = isPAL ? "altstore-pal://" : "altstore://";
		const addSourceUrl = `${scheme}source?url=${encodeURIComponent(sourceUrl)}`;

		try {
			// Try to open in AltStore
			window.location.href = addSourceUrl;
			setAdded(true);
			setTimeout(() => setAdded(false), 3000);
		} catch (error) {
			console.error("Failed to open AltStore:", error);
			// Fallback to copying URL
			handleCopyUrl();
		}
	};

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(sourceUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	// Desktop experience
	if (!platform.isIOS) {
		return (
			<div className={className}>
				<Button
					variant="outline"
					size={size}
					onClick={() => setShowInstructions(!showInstructions)}
					className="w-full"
				>
					{showLabel ? "How to Add Source" : "Add"}
				</Button>

				{showInstructions && (
					<Card className="mt-4">
						<CardHeader>
							<CardTitle className="text-sm">How to Add {sourceName}</CardTitle>
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
								<h4 className="font-medium mb-2">Add this source:</h4>
								<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
									<li>
										Copy this URL:{" "}
										<code className="bg-muted px-1 py-0.5 rounded text-xs break-all">
											{sourceUrl}
										</code>
									</li>
									<li>Open AltStore on your iOS device</li>
									<li>Go to Browse → "+" → Add Source</li>
									<li>Paste the URL and confirm</li>
								</ol>
							</div>

							<div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
								<p className="text-xs text-blue-800 dark:text-blue-200">
									💡 <strong>Tip:</strong> Once added, you'll have access to all
									apps from this source with automatic updates.
								</p>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		);
	}

	// iOS experience
	return (
		<div className={className}>
			<div className="flex flex-col gap-2">
				{/* Primary add button */}
				{platform.hasPAL ? (
					<Button
						size={size}
						onClick={() => handleAddSource(true)}
						className="w-full"
					>
						{added
							? "Added to AltStore PAL!"
							: showLabel
								? "Add to AltStore PAL"
								: "Add"}
						{showLabel && (
							<Badge variant="secondary" className="ml-2 text-xs">
								EU
							</Badge>
						)}
					</Button>
				) : (
					<Button
						size={size}
						onClick={() => handleAddSource(false)}
						className="w-full"
					>
						{added
							? "Added to AltStore!"
							: showLabel
								? "Add to AltStore"
								: "Add"}
					</Button>
				)}

				{/* Secondary option for EU users */}
				{platform.hasPAL && (
					<Button
						size={size}
						variant="outline"
						onClick={() => handleAddSource(false)}
						className="w-full"
					>
						{added
							? "Added!"
							: showLabel
								? "Add to AltStore Classic"
								: "Classic"}
					</Button>
				)}

				{/* Additional actions */}
				{showLabel && (
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="ghost"
							onClick={handleCopyUrl}
							className="flex-1 text-xs"
						>
							{copied ? "Copied!" : "Copy URL"}
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
				)}
			</div>

			{showInstructions && (
				<Card className="mt-4">
					<CardHeader>
						<CardTitle className="text-sm">Adding a Source</CardTitle>
					</CardHeader>
					<CardContent className="text-sm space-y-4">
						<div>
							<h4 className="font-medium mb-2">Quick Add (Recommended)</h4>
							<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
								<li>Tap the "Add" button above</li>
								<li>AltStore will open automatically</li>
								<li>Confirm to add the source</li>
								<li>Browse and install apps from {sourceName}</li>
							</ol>
						</div>

						<div>
							<h4 className="font-medium mb-2">Manual Add</h4>
							<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
								<li>Copy the URL using the button above</li>
								<li>Open AltStore or AltStore PAL</li>
								<li>Go to Browse → "+" → Add Source</li>
								<li>Paste the URL and confirm</li>
							</ol>
						</div>

						{platform.hasPAL && (
							<div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
								<p className="text-xs text-blue-800 dark:text-blue-200">
									<strong>EU Users:</strong> AltStore PAL offers the best
									experience with no computer required for app refreshing.
								</p>
							</div>
						)}

						<div className="bg-green-50 dark:bg-green-950 p-3 rounded">
							<p className="text-xs text-green-800 dark:text-green-200">
								💡 <strong>Benefits:</strong> Adding a source gives you access
								to all current and future apps from {sourceName}, with automatic
								update notifications!
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
