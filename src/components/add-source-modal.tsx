import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface AddSourceModalProps {
	onClose?: () => void;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({ onClose }) => {
	const [sourceUrl, setSourceUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const [sourceData, setSourceData] = useState<any>(null);
	const [step, setStep] = useState<"input" | "preview">("input");

	const handleFetchSource = async () => {
		if (!sourceUrl.trim()) {
			setError("Please enter a source URL");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/fetch-source?url=${encodeURIComponent(sourceUrl)}`,
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch source");
			}

			setSourceData(data);
			setStep("preview");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch source");
		} finally {
			setLoading(false);
		}
	};

	const handleAddSource = () => {
		if (sourceData?.source?.url) {
			// Try to open in AltStore
			const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
			if (isIOS) {
				window.location.href = `altstore://source?url=${encodeURIComponent(sourceData.source.url)}`;
			} else {
				navigator.clipboard.writeText(sourceData.source.url);
			}
		}
	};

	const handleReset = () => {
		setSourceUrl("");
		setSourceData(null);
		setStep("input");
		setError(null);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Add Custom Source</CardTitle>
							<CardDescription>
								Enter a source URL to preview and add it to AltStore
							</CardDescription>
						</div>
						{onClose && (
							<Button variant="ghost" size="sm" onClick={onClose}>
								✕
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="overflow-y-auto max-h-[calc(90vh-8rem)]">
					{step === "input" ? (
						<div className="space-y-4">
							<div>
								{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
								<label className="text-sm font-medium">Source URL</label>
								<input
									type="url"
									className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-foreground"
									placeholder="https://example.com/apps.json"
									value={sourceUrl}
									onChange={(e) => setSourceUrl(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleFetchSource()}
								/>
								<p className="text-xs text-muted-foreground mt-1">
									Enter the JSON URL of an AltStore source
								</p>
							</div>

							{error && (
								<div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
									{error}
								</div>
							)}

							<div className="flex gap-2">
								<Button
									onClick={handleFetchSource}
									disabled={loading || !sourceUrl.trim()}
									className="flex-1"
								>
									{loading ? "Fetching..." : "Fetch Source"}
								</Button>
							</div>

							<div className="border-t pt-4">
								<h4 className="text-sm font-medium mb-2">Popular Sources</h4>
								<div className="space-y-2">
									<button
										className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
										type="button"
										onClick={() =>
											setSourceUrl(
												"https://cdn.altstore.io/file/altstore/apps.json",
											)
										}
									>
										<div className="font-medium text-sm">AltStore Official</div>
										<div className="text-xs text-muted-foreground">
											Delta, Clip, and more by Riley Testut
										</div>
									</button>
									<button
										className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
										type="button"
										onClick={() =>
											setSourceUrl(
												"https://raw.githubusercontent.com/Aidoku/Aidoku/altstore/apps.json",
											)
										}
									>
										<div className="font-medium text-sm">Aidoku</div>
										<div className="text-xs text-muted-foreground">
											Manga reader for iOS
										</div>
									</button>
								</div>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{sourceData && (
								<>
									{/* Source Preview */}
									<div className="p-4 border rounded-lg">
										<div className="flex items-start gap-3 mb-3">
											{sourceData.source.icon && (
												<img
													src={sourceData.source.icon}
													alt={sourceData.source.name}
													className="w-12 h-12 rounded-xl object-cover"
												/>
											)}
											<div className="flex-1">
												<h3 className="font-semibold">
													{sourceData.source.name}
												</h3>
												<p className="text-sm text-muted-foreground">
													by {sourceData.source.maintainer}
												</p>
											</div>
										</div>
										<p className="text-sm mb-3">
											{sourceData.source.description}
										</p>
										<div className="flex gap-2">
											<Badge variant="outline">
												{sourceData.source.category}
											</Badge>
											<Badge variant="secondary">
												{sourceData.source.appCount} apps
											</Badge>
										</div>
									</div>

									{/* Apps Preview */}
									<div>
										<h4 className="font-medium mb-2">
											Apps in this source ({sourceData.apps.length})
										</h4>
										<div className="space-y-2 max-h-60 overflow-y-auto">
											{/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
											{sourceData.apps.map((app: any, index: number) => (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
													key={index}
													className="flex items-center gap-3 p-2 border rounded-lg"
												>
													<img
														src={app.icon}
														alt={app.name}
														className="w-8 h-8 rounded-lg object-cover"
													/>
													<div className="flex-1 min-w-0">
														<div className="font-medium text-sm truncate">
															{app.name}
														</div>
														<div className="text-xs text-muted-foreground truncate">
															{app.developer} • v{app.version}
														</div>
													</div>
													<Badge variant="outline" className="text-xs">
														{app.size}
													</Badge>
												</div>
											))}
										</div>
									</div>

									{/* Actions */}
									<div className="flex gap-2 pt-4 border-t">
										<Button
											variant="outline"
											onClick={handleReset}
											className="flex-1"
										>
											Add Another
										</Button>
										<Button onClick={handleAddSource} className="flex-1">
											Add to AltStore
										</Button>
									</div>
								</>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
