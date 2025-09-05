<script lang="ts">
	import type { Snippet } from "svelte";

	interface Link {
		alt: string;
		icon: string;
		url: string;
	}

	interface Props {
		title: string;
		links: Link[];
		children: Snippet;
	}

	const props: Props = $props();
</script>

<div class="flex flex-col font-mono gap-4">
	<span class="text-xl md:text-2xl xl:text-3xl font-semibold">
		{props.title}
	</span>

	<div class="w-fit flex">
		{#each props.links as link, index (index)}
			<a href={link.url}>
				<img src={link.icon} alt={link.alt} class="w-8" />
			</a>
		{/each}
	</div>

	<div class="text-justify flex-shrink-0 md:text-lg lg:text-xl xl:text-2xl">
		{@render props.children?.()}
	</div>
</div>
