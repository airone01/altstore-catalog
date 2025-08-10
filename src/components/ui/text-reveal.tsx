"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface TextRevealProps {
	text?: string;
	children?: ReactNode;
	className?: string;
	blur?: number;
	delay?: number;
	duration?: number;
	from?: "top" | "bottom";
	split?: "word" | "letter";
}

export const TextReveal = ({
	text,
	children,
	className,
	blur = 10,
	delay = 0.1,
	duration = 1,
	from = "bottom",
	split = "word",
}: TextRevealProps) => {
	// Use text prop if provided, otherwise try to extract from children
	const textContent = text || (typeof children === "string" ? children : "");

	if (!textContent) {
		console.warn(
			"TextReveal: No text content provided. Use either the 'text' prop or string children.",
		);
		return null;
	}

	const segments =
		split === "word" ? textContent.split(" ") : textContent.split(/(?=.)/);

	return (
		<div>
			{segments.map((c, index) => (
				<motion.span
					key={`${c}-${index}`}
					initial={{
						opacity: 0,
						y: from === "bottom" ? "50%" : "-50%",
						filter: `blur(${blur}px)`,
					}}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					transition={{
						delay: index * delay,
						duration,
						ease: [0.18, 0.89, 0.82, 1.04],
					}}
					className={cn(
						"inline-flex leading-none",
						split === "word" ? "mr-[0.2em]" : "",
						className,
					)}
				>
					{c === " " ? "\u00A0" : c}
				</motion.span>
			))}
			<div className="sr-only">{textContent}</div>
		</div>
	);
};
