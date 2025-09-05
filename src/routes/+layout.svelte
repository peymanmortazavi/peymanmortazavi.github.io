<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import SketchyFrame from "$lib/SketchyFrame.svelte";

	let stageElement: HTMLElement | null = $state(null);
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="bg-background-200 w-screen h-screen relative overflow-hidden">
	<SketchyFrame element={stageElement} />

	<div class="absolute inset-0 flex flex-col">
		<!--First Row-->
		<div class="flex flex-row h-16 flex-shrink-0">
			<div class="gap"></div>

			<div
				class="flex flex-row h-full flex-1 items-center justify-around md:justify-start mx-4 gap-6"
			>
				<a href="/" class="text-2xl">info</a>
				<a href="/resume" class="text-2xl">resume</a>
				<a href="/opensource" class="text-2xl">open source</a>
				<a href="/posts" class="text-2xl">posts</a>
			</div>

			<div class="gap"></div>
		</div>

		<!--Second Row-->
		<div class="flex flex-row flex-1 overflow-hidden">
			<div class="gap"></div>
			<div class="flex-1 overflow-hidden" bind:this={stageElement}>
				<div
					class="flex flex-col relative h-full overflow-x-hidden z-20 flex-1 overflow-scroll"
				>
					{@render children()}
				</div>
			</div>
			<div class="right-gap"></div>
		</div>

		<!--Third Row-->
		<div class="flex flex-row h-0 md:h-16 flex-shrink-0">
			<div class="gap"></div>
		</div>
	</div>
</div>

<style>
	@reference "../app.css";

	.gap {
		@apply w-4 md:w-16 lg:w-20 flex-shrink-0;
	}

	.right-gap {
		@apply w-0 md:w-16 lg:w-20 flex-shrink-0;
	}
</style>
