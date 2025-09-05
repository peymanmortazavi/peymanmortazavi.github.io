<script lang="ts">
	import { onMount } from "svelte";

	interface Props {
		/**
		 * the stage element.
		 */
		element: HTMLElement | null;
	}

	const props: Props = $props();
	let frame: DOMRect | null = $state(null);
	let width = $state(0);
	let height = $state(0);

	$effect(() => {
		if (props.element) {
			updateRect();
		}
	});

	function updateRect() {
		if (!props.element) {
			return;
		}

		frame = props.element.getBoundingClientRect();
	}

	onMount(() => {
		updateRect();
	});
</script>

<svelte:window
	bind:innerWidth={width}
	bind:innerHeight={height}
	on:resize={updateRect}
/>
{#if frame}
	<svg
		class="absolute inset-0 w-full h-full pointer-events-none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<!-- Top line -->
		<path
			d={`M 0,${frame.top} Q ${width / 4},${frame.top - 2} ${width / 2},${frame.top + 2.5} T ${width},${frame.top - 2}`}
			stroke="#2d3748"
			stroke-width="2"
			fill="none"
			opacity="0.8"
		/>

		<!-- Bottom line -->
		<path
			d={`M 0,${frame.bottom + 2} Q ${width / 3},${frame.bottom - 5} ${(width * 2) / 3},${frame.bottom - 2} T ${width},${frame.bottom + 1}`}
			stroke="#2d3748"
			stroke-width="2"
			fill="none"
			opacity="0.8"
		/>

		<!-- Left line -->
		<path
			d={`M ${frame.left + 3},0 Q ${frame.left - 2},${height / 4} ${frame.left + 4},${height / 2} T ${frame.left - 5},${height}`}
			stroke="#2d3748"
			stroke-width="2"
			fill="none"
			opacity="0.8"
		/>

		<!-- Right line -->
		<path
			d={`M ${frame.right},0 Q ${frame.right + 5},${height / 3} ${frame.right + 2},${(height * 2) / 3} T ${frame.right - 3},${height}`}
			stroke="#2d3748"
			stroke-width="2"
			fill="none"
			opacity="0.8"
		/>
	</svg>
{/if}
