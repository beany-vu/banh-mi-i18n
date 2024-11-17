<script lang="ts">
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		PUBLIC_BACKEND_PROTOCOL,
		PUBLIC_BACKEND_URL,
		PUBLIC_BACKEND_PORT
	} from '$env/static/public';

	const apiUrl = `${PUBLIC_BACKEND_PROTOCOL}://${PUBLIC_BACKEND_URL}:${PUBLIC_BACKEND_PORT}`;

	let translations: any = null;
	let loading = true;
	let error: string | null = null;

	// Normalize language tag
	function normalizeLanguageTag(languageTag: string): AvailableLanguageTag {
		switch (languageTag) {
			case 'en':
				return 'en';
			case 'fr':
				return 'fr';
			case 'vi':
				return 'vi';
			case 'zh':
				return 'zh';
			case 'jp':
				return 'jp';
			case 'nl':
				return 'nl';
			default:
				return 'en';
		}
	}

	// Switch language and update route
	function switchToLanguage(newLanguage: AvailableLanguageTag) {
		const canonicalPath = i18n.route($page.url.pathname);
		const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
		goto(localisedPath);
	}

	// Fetch translations from the backend
	const fetchAllTranslations = async () => {
		try {
			const response = await fetch(`${apiUrl}/translations`);
			if (!response.ok) {
				throw new Error('Failed to fetch translations');
			}
			translations = await response.json();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	};

	// Function to extract data from table rows
	function extractTableData() {
		const tableRows = document.querySelectorAll('tbody tr');
		const data = Array.from(tableRows).map((row) => {
			const cells = row.querySelectorAll('td');
			return {
				id: cells[0].innerText,
				defaultMessage: cells[1].innerText,
				message: cells[2].querySelector('input')?.value || '',
				description: cells[3].innerText
			};
		});
		return data;
	}

	// Modified saveTranslation function to use extracted data
	const saveTranslation = async () => {
		const id = document.getElementById('translation-id')?.value || null;
		const name = document.getElementById('translation-set-name')?.value || '';
		if (id) {
      
			const translationsData = extractTableData();
			const data = {
				_id: id,
				name: name,
				locale: 'es',
				data: translationsData
			};

			try {
				const response = await fetch(`${apiUrl}/translations/`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(data)
				});
				if (!response.ok) {
					throw new Error('Failed to save translation');
				}
			} catch (err) {
				error = err.message;
			}
		}
	};

	// On mount, fetch translations and handle routing
	onMount(() => {
		const canonicalPath = i18n.route(window.location.pathname);
		const localizedPath = i18n.resolveRoute(canonicalPath);
		const languageTag = localizedPath.split('/')[1];

		switchToLanguage(normalizeLanguageTag(languageTag));
		fetchAllTranslations();
	});
</script>

<h1 class="text-2xl font-bold">Translations Page</h1>

{#if loading}
	<p class="text-gray-500">Loading translations...</p>
{:else if error}
	<p class="text-red-500">Error fetching translations: {error}</p>
{:else if !translations || !translations.length}
	<p class="text-gray-500">No translations found</p>
{:else}
	<h2 class="text-xl font-semibold">{translations[0]?.name ?? 'Untitle'}</h2>

	<div class="container mx-auto">
		<div>
			<button class="rounded bg-blue-500 px-4 py-2 text-white" on:click={saveTranslation}>
				Save
			</button>
		</div>
		<input
			id="translation-set-name"
			type="text"
			value={translations[0]?.name ?? 'Untitle'}
			placeholder="Untitle"
		/>
		<br />
		<input id="translation-id" type="hidden" value={translations[0]._id} />
		<input id="creator-id" type="hidden" value={translations[0].creatorId} />
		<table class="border-collapse border border-slate-400">
			<thead>
				<tr>
					<th class="border px-8">Id</th>
					<th class="border px-8">Default Message</th>
					<th class="border px-8">Message</th>
					<th class="border px-8">Description</th>
				</tr>
			</thead>
			<tbody>
				{#each translations[0]?.data as translation}
					<tr>
						<td class="border px-8">
							{translation.id}
						</td>
						<td class="border px-8">
							{translation.defaultMessage}
						</td>
						<td class="border px-8">
							<input value={translation.message} />
						</td>
						<td class="border px-8">
							{translation.description}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<p class="text-sm text-gray-400">API URL: {apiUrl}</p>
