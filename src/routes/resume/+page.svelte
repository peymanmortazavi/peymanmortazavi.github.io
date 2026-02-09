<script lang="ts">
	import YearBar from "./YearBar.svelte";
	import { type Range } from "./YearBar";
	import WorkExperienceContainer from "./WorkExperienceContainer.svelte";
	import WorkExperience from "./WorkExperience.svelte";

	let selectedRange: Range | undefined = $state();
</script>

<svelte:head>
	<title>Peyman Mortazavi - Resume and Work History</title>
	<meta
		name="description"
		content="Resume and work history of Peyman Mortazavi, excluding the open-source and personal projects."
	/>
</svelte:head>

<YearBar startYear={2017} endYear={2025} {selectedRange} />

<WorkExperienceContainer
	class="mt-2 md:mt-6 lg:mt-12 m-6 md:m-10 xl:m-16 overflow-scroll"
	onSelectionChanged={(selection) => (selectedRange = selection)}
>
	<WorkExperience
		title="Founding Engineer"
		start={new Date(2026, 1)}
		end={new Date()}
		employer="Shade, Inc"
		present
	>
		Well, I just started so this is TBD but I will be working on networking and storage!
	</WorkExperience>

	<WorkExperience
		title="Principal Software Engineer"
		start={new Date(2021, 11)}
		end={new Date(2026, 1)}
		employer="Persefoni"
	>
		<li>
			Drove the design of a distributed service architecture, partnering with central architecture teams to define resource and failure boundaries, reducing new service creation time from 3 weeks to 2 hours.
		</li>

		<li>
			Drove the design and implementation of a centralized authorization service based on the ReBAC (Zanzibar) model, capable of efficiently executing complex authorization queries over large relational datasets.
		</li>

		<li>
			Built resource-aware execution models in Go and Kubernetes, enabling high-throughput processing of previously infeasible workloads.
		</li>

		<li>
			Implemented a query planner and AST-based SQL generation system for optimized, declarative SQL with join elimination.
		</li>

		<br>
		I worked at the intersection of distributed systems and performance engineering, focusing on correctness, observability, and resource efficiency.
		My work emphasized understanding CPU, memory, and I/O behavior, applying low-level optimizations when abstractions become limiting, and designing execution models that scale reliably under real production constraints.
	</WorkExperience>

	<WorkExperience
		title="Senior Software Engineer"
		start={new Date(2021, 3)}
		end={new Date(2021, 11)}
		employer="Maria DB"
	>
		<li>
			Developed and maintained Kubernetes operator for various MariaDB database
			topologies.
		</li>

		<li>
			Refactored a large monolith into multiple libraries, reducing image sizes
			and reusing common code.
		</li>

		<li>Initiated efforts for an automatic database upgrade system.</li>

		<li>
			Added CI and automatic release notes generator for streamlined release
			procedures.
		</li>
	</WorkExperience>

	<WorkExperience
		title="Backend Engineer"
		employer="Numerator (formerly InfoScout)"
		start={new Date(2017, 0)}
		end={new Date(2021, 3)}
	>
		<li>
			Implemented a human intelligence task software, processing 1 million tasks
			daily, replacing mTurk.
		</li>
		<li>
			Containerized and migrated ML pipelines to Kubernetes, enabling automatic
			scaling and reducing complexity.
		</li>
		<li>
			Designed an open-source configuration management library in C++ with
			wrapper libraries for Python and Java, utilized company-wide.
		</li>
		<li>Runner-up/winner of five consecutive hack-day competitions.</li>
		<li>Won the company value award for clever solutions.</li>
	</WorkExperience>
</WorkExperienceContainer>
