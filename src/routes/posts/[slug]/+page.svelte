<script lang="ts">
	import "$lib/assets/prism.css";
	import "$lib/assets/post.css";

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.metadata.title}</title>
	<meta name="description" content={data.metadata.description} />
</svelte:head>

<div class="p-2 pr-4 md:p-4 lg:p-6 xl:p-12 font-mono">
	<span class="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold"
		>{data.metadata.title}</span
	>
	<br />
	<div class="flex md:items-center justify-between flex-col md:flex-row">
		<span class="text-lg lg:text-xl xl:text-2xl"
			>{data.metadata.description}</span
		>
		<span class="xl:text-xl"
			>{new Date(data.metadata.date).toLocaleDateString(undefined, {
				month: "long",
				day: "numeric",
				year: "numeric",
			})}</span
		>
	</div>
</div>

<div
	id="post-container"
	class="p-2 pt-6 md:p-4 lg:p-6 xl:p-12 md:pt-0 md:text-justify xl:text-xl font-[Dosis]"
>
	<data.component />
</div>

<style>
	/* jetbrains-mono-latin-wght-normal */
	@font-face {
		font-family: "JetBrains Mono Variable";
		font-style: normal;
		font-display: swap;
		font-weight: 100 800;
		src: url(https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono:vf@latest/latin-wght-normal.woff2)
			format("woff2-variations");
		unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
			U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191,
			U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
	}

	/* dosis-latin-wght-normal */
	@font-face {
		font-family: "Dosis";
		font-style: normal;
		font-display: swap;
		font-weight: 200 800;
		src: url(https://cdn.jsdelivr.net/fontsource/fonts/dosis:vf@latest/latin-wght-normal.woff2)
			format("woff2-variations");
		unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
			U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191,
			U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
	}
</style>
