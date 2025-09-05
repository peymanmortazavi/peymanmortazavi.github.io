<script lang="ts">
	import { setContext, type Snippet } from "svelte";

	interface Props {
		onSelectionChanged: (range: { start: Date; end: Date }) => void;
		children: Snippet;
		class?: string;
	}

	interface Record {
		element: HTMLElement;
		start: Date;
		end: Date;
	}

	interface ScrollSegment {
		threshold: number;
		record: Record;
	}

	const props: Props = $props();
	let currentSelection = $state({ start: new Date(), end: new Date() });
	let lastScrollValue = 0;

	const registry = {
		entries: new Map<HTMLElement, Record>(),
		scrollValues: [] as ScrollSegment[],

		add(element: HTMLElement, start: Date, end: Date) {
			const record = {
				element: element,
				start: start,
				end: end,
			};
			this.entries.set(element, record);
			this.scrollValues.push({
				threshold: element.offsetTop - element.parentElement!.offsetTop,
				record: record,
			});
			if (this.entries.size == 1) {
				currentSelection = { start: start, end: end };
				props.onSelectionChanged(currentSelection);
			}
			this.scrollValues.sort((x, y) => x.threshold - y.threshold);
		},
		remove(element: HTMLElement) {
			this.entries.delete(element);
		},
		updateScrollValues() {
			this.scrollValues = [];
			this.entries.forEach(($) => {
				this.scrollValues.push({
					threshold: $.element.offsetTop - $.element.parentElement!.offsetTop,
					record: $,
				});
			});
			this.scrollValues.sort((x, y) => x.threshold - y.threshold);
		},
	};

	function handleScroll(event: Event) {
		const sensitivityCoefficient = 40;
		let scrollValue = (event.target as HTMLElement).scrollTop;
		const delta = scrollValue - lastScrollValue;
		lastScrollValue = scrollValue;
		const goingDown = delta > 0;
		if (goingDown) {
			scrollValue += sensitivityCoefficient;
		} else {
			scrollValue -= sensitivityCoefficient / 2;
		}
		for (const [index, value] of registry.scrollValues.entries()) {
			if (goingDown) {
				if (value.threshold >= scrollValue) return;
			} else {
				if (value.threshold < scrollValue) continue;
			}
			const nextElement = registry.scrollValues[index + (goingDown ? 1 : -1)];
			if (
				nextElement === undefined ||
				(goingDown && nextElement.threshold >= scrollValue) ||
				(!goingDown && nextElement.threshold <= scrollValue)
			) {
				const selection = { start: value.record.start, end: value.record.end };
				// const selection = { start: value.record.start, end: new Date() };
				if (
					currentSelection.start != selection.start &&
					currentSelection.end != selection.end
				) {
					currentSelection = selection;
					props.onSelectionChanged(selection);
				}
			}
		}
	}

	setContext("work_experience_registry", registry);
</script>

<svelte:window on:resize={registry.updateScrollValues.bind(registry)} />

<div class="flex flex-col gap-12 {props.class ?? ''}" onscroll={handleScroll}>
	{@render props.children?.()}

	<div
		class="h-[25vh] mt-[10vh] flex-shrink-0 flex justify-center items-center"
	>
		<img
			class="w-1/2 max-w-sm md:w-1/4 h-fit object-scale-down"
			src="/end_of_letter.svg"
			alt="end of the letter"
		/>
	</div>
</div>
