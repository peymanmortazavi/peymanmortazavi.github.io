import type { PageServerLoad } from "./$types";

export interface Post {
	slug: string;
	title: string;
	description: string;
	date: Date;
}

export const load: PageServerLoad = async () => {
	const modules = import.meta.glob("/src/posts/*.{md,svx}");
	const postPromises = Object.entries(modules).map(async ([path, resolver]) => {
		const post = await resolver();
		return {
			slug: path.slice(5, path.lastIndexOf(".")),
			...post.metadata,
		} as Post;
	});

	const posts = await Promise.all(postPromises);

	return {
		posts: posts,
	};
};
