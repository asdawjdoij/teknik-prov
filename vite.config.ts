import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';


export default defineConfig({
    plugins: [
        sveltekit({
            compilerOptions: {
                experimental: { async: true },
                runes: ({ filename }) =>
                    filename.split(/[/\\]/).includes('node_modules') ? undefined : true
            },
            adapter: adapter(),
            experimental: {
                remoteFunctions: true
            }
        }),
        tailwindcss()
    ]
});