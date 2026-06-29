import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { viteSingleFile } from "vite-plugin-singlefile";

const removeModuleType = () => {
  return {
    name: 'remove-module-type',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      return html
        .replace(/type="module"\s*/g, '')
        .replace(/crossorigin\s*/g, '');
    }
  }
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), viteSingleFile(), removeModuleType()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      target: "es2015",
      rollupOptions: {
        output: {
          format: 'iife' as const,
          inlineDynamicImports: true,
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    },
  };
});
