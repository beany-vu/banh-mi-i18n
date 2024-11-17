import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ command, mode }) => {
	// Load environment variables based on the mode (development, production, etc.)
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [
			sveltekit(),
			paraglide({
				project: './project.inlang',
				outdir: './src/lib/paraglide'
			})
		],
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		},
		envDir: path.resolve(__dirname, '../'), // Ensure Vite can find the `.env` file in the project root
		define: {
			// Define environment variables globally (for client-side usage)
			'process.env': env
		}
	};
});
