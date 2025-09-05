<script lang="ts">
	import { getContext, onMount, type Snippet } from "svelte";
	import type { WorkExperienceRegistery } from "./WorkExperienceContainer";

	interface WorkExperience {
		start: Date;
		end: Date;
		present?: boolean;
		title: string;
		employer: string;
		tags?: string[];
		children?: Snippet;
		class?: string;
	}

	const registry: WorkExperienceRegistery = getContext(
		"work_experience_registry",
	);
	const {
		start,
		end,
		title,
		employer,
		present = false,
		children,
	}: WorkExperience = $props();
	let selfElement: HTMLElement;

	function formatDate(date: Date) {
		return date.toLocaleString("en-US", { month: "short", year: "numeric" });
	}

	onMount(() => {
		registry.add(selfElement, start, end);
	});
</script>

<div bind:this={selfElement} class="flex flex-col">
	<div class="flex flex-col md:flex-row gap-2 md:items-center mb-2 font-mono">
		<span class="text-xl md:text-xl xl:text-3xl font-bold">{title}</span>
		<span class="text-xl md:text-xl xl:text-2xl">at {employer}</span>
		<span class="flex-1 md:text-right md:text-lg xl:text-xl"
			>{formatDate(start)} -
			{present ? "Present" : formatDate(end)}</span
		>
	</div>
	<ul class="font-mono text-lg md:text-xl xl:text-2xl lg:mr-32 mt-4 space-y-2">
		{@render children?.()}
	</ul>
</div>
