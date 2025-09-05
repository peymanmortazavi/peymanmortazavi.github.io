<script lang="ts">
	import PostLink from "./PostLink.svelte";

	export let data;
</script>

<svelte:head>
	<title>Peyman Mortazavi - Posts and Blog</title>
	<meta
		name="description"
		content="Peyman Mortazavi's thoughts, articles and blog posts."
	/>
</svelte:head>

<div
	class="p-6 md:p-8 lg:p-10 xl:p-16 flex flex-wrap gap-10 box-content justify-center"
>
	{#each data.posts as post}
		<PostLink
			title={post.title}
			slug={post.slug}
			description={post.description}
			date={new Date(post.date)}
		/>
	{/each}
</div>
