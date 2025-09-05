import { mdsvex } from "mdsvex";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: [".md", ".svx"],
			smartypants: {
				quotes: true,
				ellipses: true,
				backticks: true,
				dashes: true,
			},
			highlight: {
				alias: {
					proto: "protobuf",
					sh: "bash",
				},
			},
		}),
	],
	kit: { adapter: adapter() },
	extensions: [".svelte", ".svx", ".md"],
};

export default config;
