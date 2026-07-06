import { defineConfig } from 'astro/config';
import { remarkInterviewBlocks } from './src/utils/remarkInterviewBlocks.mjs';

export default defineConfig({
  site: 'https://qazaqmura.kz',
  markdown: {
    remarkPlugins: [remarkInterviewBlocks],
  },
});
