import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// `base` must match the GitHub Pages repo name so asset URLs resolve when served
// from https://<user>.github.io/<repo>/. Override via BASE_PATH env in CI if needed.
const base = process.env.BASE_PATH ?? '/hgss-companion/';

export default defineConfig({
  base,
  plugins: [svelte()],
});
