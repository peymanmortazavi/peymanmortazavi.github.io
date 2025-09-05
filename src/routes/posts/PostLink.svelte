<script lang="ts">
	import { GetRandomInt } from "$lib/random";
	import { onMount } from "svelte";

	const {
		title,
		description,
		slug,
		date,
	}: { title: string; description: string; slug: string; date: Date } =
		$props();

	let width = $state(0);
	let height = $state(0);
	let element: HTMLElement | undefined = $state();

	function update() {
		if (!element) {
			return;
		}

		width = element.getBoundingClientRect().width;
		height = element.getBoundingClientRect().height;
	}

	onMount(update);
</script>

<svelte:window onresize={update} />
<a
	bind:this={element}
	href={slug}
	aria-label={title}
	class="w-100 bg-background-100/75 p-4 lg:p-6 font-mono space-y-1 lg:space-y-3 relative"
>
	<svg
		class="absolute inset-0 w-full h-full"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M {GetRandomInt(0, 10)},{GetRandomInt(0, 10)} Q 0,0 {width -
				GetRandomInt(0, 10)},{GetRandomInt(0, 10)} L {width -
				GetRandomInt(0, 10)},{height - GetRandomInt(0, 10)} L {GetRandomInt(
				0,
				10,
			)},{height - GetRandomInt(0, 10)} Z"
			stroke="#000"
			stroke-width="2"
			fill="transparent"
		/>
	</svg>

	<div class="font-bold text-lg xl:text-xl">
		{title}
	</div>
	<div>
		{description}
	</div>
	<div class="text-sm">
		{date.toLocaleDateString()}
	</div>
</a>
