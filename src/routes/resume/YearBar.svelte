<script lang="ts">
	import { GetRandomInt } from "$lib/random";
	import { type Range } from "./YearBar";

	interface Props {
		startYear: number;
		endYear: number;
		selectedRange?: Range;
	}

	const props: Props = $props();
	const barHeight = 30;

	let innerWidth = $state(0);
	const width = $derived(innerWidth - 40);
	const yearCount = $derived(props.endYear - props.startYear + 1);

	function checkpointXPosition(index: number) {
		return (width / (yearCount + 2)) * index;
	}

	function checkpointXDatePosition(date: Date) {
		const currentIndex = props.endYear - date.getUTCFullYear();
		const multiplier = width / (yearCount + 2);
		let monthPortion = (multiplier * date.getMonth()) / 12;
		if (currentIndex === 0) {
			monthPortion = 0;
		}
		return multiplier * currentIndex - monthPortion + GetRandomInt(10, 16);
	}
</script>

<svelte:window bind:innerWidth />
<svg
	class="inset-0 w-full h-[10vh] min-h-[60px] pointer-events-none flex-shrink-0"
	xmlns="http://www.w3.org/2000/svg"
>
	<!--Bars-->
	{#key props.selectedRange}
		{#each { length: yearCount }, index}
			<path
				d={`M ${checkpointXPosition(index) + GetRandomInt(10, 16)},0 L ${checkpointXPosition(index) + GetRandomInt(12, 14)},${barHeight}`}
				stroke="#2d3748"
				stroke-width="2"
				fill="none"
				opacity="0.8"
			/>
		{/each}

		{#each { length: yearCount }, index}
			<!--Labels-->
			<text
				class="odd:invisible md:odd:visible"
				x={checkpointXPosition(index) + 4}
				y="50"
				font-size="20"
				transform={`rotate(${GetRandomInt(-10, -20)} ${checkpointXPosition(index)},50)`}
			>
				{index == 0 ? "present" : props.endYear - index}
			</text>
		{/each}
	{/key}

	<!--Current Selection-->
	{#if props.selectedRange}
		<path
			stroke-width="2"
			stroke="#000"
			fill="rgb(80, 176, 207)"
			d={`M ${checkpointXDatePosition(props.selectedRange.end)} 0.714` +
				` L ${checkpointXDatePosition(props.selectedRange.start)} 0.024` +
				` L ${checkpointXDatePosition(props.selectedRange.start)} ${GetRandomInt(10, 15)}` +
				` L ${checkpointXDatePosition(props.selectedRange.end)} ${GetRandomInt(10, 15)}` +
				` L ${checkpointXDatePosition(props.selectedRange.end)}` +
				` 0.714 Z`}
		/>
	{/if}
</svg>
