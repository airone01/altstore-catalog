import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SearchItem {
	type: "app" | "source";
	slug: string;
	title: string;
	description: string;
	developer?: string;
	maintainer?: string;
	category: string;
	tags?: string[];
	icon?: string;
	verified?: boolean;
	url: string;
}

interface SearchComponentProps {
	apps: SearchItem[];
	sources: SearchItem[];
	placeholder?: string;
	showFilters?: boolean;
	maxResults?: number;
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
	apps,
	sources,
	placeholder = "Search apps and sources...",
	showFilters = true,
	maxResults = 20,
}) => {
	const [query, setQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<"all" | "app" | "source">(
		"all",
	);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [isOpen, setIsOpen] = useState(false);

	// Combine all searchable items
	const allItems = useMemo(() => [...apps, ...sources], [apps, sources]);

	// Get unique categories
	const categories = useMemo(() => {
		const cats = new Set(allItems.map((item) => item.category));
		return ["all", ...Array.from(cats)].sort();
	}, [allItems]);

	// Fuzzy search function
	const fuzzySearch = (text: string, query: string): number => {
		const textLower = text.toLowerCase();
		const queryLower = query.toLowerCase();

		// Exact match gets highest score
		if (textLower.includes(queryLower)) {
			return textLower === queryLower ? 100 : 80;
		}

		// Character-by-character fuzzy matching
		let score = 0;
		let queryIndex = 0;

		for (
			let i = 0;
			i < textLower.length && queryIndex < queryLower.length;
			i++
		) {
			if (textLower[i] === queryLower[queryIndex]) {
				score += 2;
				queryIndex++;
			}
		}

		// Bonus for matching all characters
		if (queryIndex === queryLower.length) {
			score += 10;
		}

		return score;
	};

	// Search and filter logic
	const filteredResults = useMemo(() => {
		if (!query.trim()) {
			setIsOpen(false);
			return [];
		}

		let results = allItems;

		// Filter by type
		if (activeFilter !== "all") {
			results = results.filter((item) => item.type === activeFilter);
		}

		// Filter by category
		if (selectedCategory !== "all") {
			results = results.filter((item) => item.category === selectedCategory);
		}

		// Search scoring
		const scoredResults = results.map((item) => {
			let score = 0;

			// Search in title (highest weight)
			score += fuzzySearch(item.title, query) * 3;

			// Search in description
			score += fuzzySearch(item.description, query) * 2;

			// Search in developer/maintainer
			const creator = item.developer || item.maintainer || "";
			score += fuzzySearch(creator, query) * 1.5;

			// Search in tags
			if (item.tags) {
				item.tags.forEach((tag) => {
					score += fuzzySearch(tag, query);
				});
			}

			// Search in category
			score += fuzzySearch(item.category, query) * 0.5;

			return { ...item, score };
		});

		// Filter out items with very low scores and sort
		const filtered = scoredResults
			.filter((item) => item.score > 5)
			.sort((a, b) => {
				// Verified items get slight boost
				const aBoost = a.verified ? 5 : 0;
				const bBoost = b.verified ? 5 : 0;
				return b.score + bBoost - (a.score + aBoost);
			})
			.slice(0, maxResults);

		setIsOpen(filtered.length > 0);
		return filtered;
	}, [query, activeFilter, selectedCategory, allItems, maxResults]);

	// Handle outside clicks
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;
			if (!target.closest(".search-container")) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
				setQuery("");
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div className="search-container relative w-full max-w-2xl mx-auto">
			{/* Search Input */}
			<div className="relative">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<svg
						className="h-5 w-5 text-muted-foreground"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
				<input
					type="text"
					className="block w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring"
					placeholder={placeholder}
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => query && setIsOpen(true)}
				/>
				{query && (
					<button
						className="absolute inset-y-0 right-0 pr-3 flex items-center"
						onClick={() => {
							setQuery("");
							setIsOpen(false);
						}}
					>
						<svg
							className="h-5 w-5 text-muted-foreground hover:text-foreground"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				)}
			</div>

			{/* Filters */}
			{showFilters && (
				<div className="flex flex-wrap gap-2 mt-3">
					<div className="flex gap-1">
						{(["all", "app", "source"] as const).map((filter) => (
							<Button
								key={filter}
								size="sm"
								variant={activeFilter === filter ? "default" : "outline"}
								onClick={() => setActiveFilter(filter)}
								className="capitalize"
							>
								{filter === "all"
									? "All"
									: filter === "app"
										? "Apps"
										: "Sources"}
							</Button>
						))}
					</div>

					<select
						className="px-3 py-1 text-sm border border-input rounded bg-background text-foreground"
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
					>
						{categories.map((category) => (
							<option key={category} value={category}>
								{category === "all" ? "All Categories" : category}
							</option>
						))}
					</select>
				</div>
			)}

			{/* Search Results */}
			{isOpen && (
				<Card className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto shadow-lg">
					<CardContent className="p-0">
						{filteredResults.length > 0 ? (
							<ul>
								{filteredResults.map((item, index) => (
									<li key={`${item.type}-${item.slug}`}>
										<a
											href={item.url}
											className="block px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
											onClick={() => setIsOpen(false)}
										>
											<div className="flex items-start gap-3">
												{item.icon && (
													<img
														src={item.icon}
														alt={`${item.title} icon`}
														className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
													/>
												)}
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<h3 className="font-medium text-sm truncate">
															{item.title}
														</h3>
														<Badge
															variant={
																item.type === "app" ? "default" : "secondary"
															}
															className="text-xs"
														>
															{item.type}
														</Badge>
														{item.verified && (
															<Badge
																variant="outline"
																className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
															>
																✓
															</Badge>
														)}
													</div>
													<p className="text-xs text-muted-foreground line-clamp-2">
														{item.description}
													</p>
													<div className="flex items-center justify-between mt-1">
														<span className="text-xs text-muted-foreground">
															by {item.developer || item.maintainer}
														</span>
														<Badge variant="outline" className="text-xs">
															{item.category}
														</Badge>
													</div>
												</div>
											</div>
										</a>
									</li>
								))}
							</ul>
						) : (
							<div className="px-4 py-8 text-center">
								<svg
									className="mx-auto h-12 w-12 text-muted-foreground mb-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1}
										d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.329-1.006-5.772-2.496m-.456-2.004A7.962 7.962 0 014 9c0-4.418 3.582-8 8-8s8 3.582 8 8a7.962 7.962 0 01-2.228 5.496z"
									/>
								</svg>
								<p className="text-sm text-muted-foreground">
									No results found for "{query}"
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Try adjusting your search or filters
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};

// Style for line-clamp (add to global CSS)
const styles = `
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
`;
