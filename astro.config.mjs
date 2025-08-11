// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
		server: {
			allowedHosts: ["7b74446463ad.ngrok-free.app"],
		},
	},

	integrations: [react()],
});
