<script lang="ts">
	import YearBar from "./YearBar.svelte";
	import { type Range } from "./YearBar";
	import WorkExperienceContainer from "./WorkExperienceContainer.svelte";
	import WorkExperience from "./WorkExperience.svelte";

	let selectedRange: Range | undefined = $state();
</script>

<YearBar startYear={2017} endYear={2025} {selectedRange} />

<WorkExperienceContainer
	class="mt-2 md:mt-6 lg:mt-12 m-6 md:m-10 xl:m-16 overflow-scroll"
	onSelectionChanged={(selection) => (selectedRange = selection)}
>
	<WorkExperience
		title="Principal Software Engineer"
		start={new Date(2021, 11)}
		end={new Date()}
		employer="Persefoni"
		present
	>
		<li>
			Spearheaded the transformation of backend systems to a microservices
			architecture, reducing service creation time from 3 weeks to 2 hours.
		</li>

		<li>
			Architected and led the implementation effort for an enterprise
			fine-grained ReBAC capable of handling queries on large tables.
		</li>

		<li>
			Engineered an IAM service, achieving an 80% reduction in latency,
			maintaining a 99.99% uptime.
		</li>

		<li>
			Orchestrated process improvements and team ceremonies, helping in efforts
			to transforming deployment frequency to rapid 7-minute daily deployments
			from initial biweekly 3-hour deployments.
		</li>
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
