import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
	const modules = import.meta.glob(`/src/posts/*.{md,svx,svelte.md}`);

	const modulePath = `/src/posts/${params.slug}.md`;
	const resolver = modules[modulePath];
	const post = await resolver();

	return {
		metadata: post.metadata,
		component: post.default,
	};
};
