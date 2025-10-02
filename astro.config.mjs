// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react({
      include: ['**/keystatic/**/*'],
    }),
    keystatic()
  ],
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
  }),
  vite: {
    ssr: {
      external: ['react', 'react-dom'],
    },
  },
});
