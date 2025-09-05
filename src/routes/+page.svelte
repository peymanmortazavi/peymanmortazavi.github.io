<script lang="ts">
	interface SocialLink {
		alt: string;
		imageSource: string;
		link: string;
	}

	const items: SocialLink[] = [
		{
			alt: "LinkedIn",
			imageSource: "/linkedin.svg",
			link: "https://www.linkedin.com/in/peyman-mortazavi/",
		},
		{
			alt: "Github",
			imageSource: "/github.svg",
			link: "https://github.com/peymanmortazavi",
		},
		{
			alt: "StackOverFlow",
			imageSource: "/stackoverflow.svg",
			link: "https://stackoverflow.com/users/853300/peyman",
		},
	];
</script>

<div
	class="flex relative h-full pt-2 pl-2 md:pt-4 md:pl-4 lg:pt-10 lg:pl-10 overflow-x-hidden"
>
	<!--Top-->
	<div class="flex-1 p-2 pr-0">
		<span class="text-xl sm:text-2xl pl-5 font-sketch">Hi, I'm</span>
		<br />
		<div class="h-8">
			<span class="absolute text-4xl sm:text-4xl font-sketch"
				>Peyman Mortazavi</span
			>
		</div>
		<div class="absolute mt-10 text-xl sm:text-2xl w-2/3 md:w-1/2">
			I’m a technologist with extensive experience in software development and
			architecture. This site is where I share my work, past and present, along
			with occasional thoughts and blog posts.

			<div class="flex flex-row mt-10 gap-4">
				{#each items as item}
					<a href={item.link}>
						<img src={item.imageSource} class="w-10" alt={item.alt} />
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!--Bottom-->
	<div class="sticky top-0 flex flex-col justify-end">
		<img
			class="object-cover object-left-top w-[40vw] lg:w-full h-[60vh] md:h-[80vh]"
			src="/avatar.svg"
			alt="avatar"
		/>
	</div>
</div>
