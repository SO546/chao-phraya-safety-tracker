import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { viteSingleFile } from "vite-plugin-singlefile";

const removeModuleType = () => {
  return {
    name: 'remove-module-type',
    enforce: 'post' as const,
    generateBundle(_, bundle: any) {
      if (bundle['index.html']) {
        let html = bundle['index.html'].source;
        // Remove type="module" and crossorigin
        html = html.replace(/type="module"\s*/g, '');
        html = html.replace(/crossorigin\s*/g, '');
        
        // Wrap the contents of the main script tag
        // Since we are not sure exactly which script, we wrap all script tags contents
        // Wait, it's better to just move the script tags to the body end.
        const headScriptRegex = /<head>([\s\S]*?)<\/head>/;
        const headMatch = html.match(headScriptRegex);
        if (headMatch) {
          let headContent = headMatch[1];
          let scripts: string[] = [];
          
          headContent = headContent.replace(/<script[^>]*>([\s\S]*?)<\/script>/g, (match, content) => {
            scripts.push(match);
            return '';
          });
          
          html = html.replace(headMatch[0], `<head>${headContent}</head>`);
          html = html.replace('</body>', `${scripts.join('\n')}</body>`);
        }
        
        bundle['index.html'].source = html;
      }
    }
  }
}

// Use BUILD_TARGET=gas for Google Apps Script single-file build
const isGasBuild = process.env.BUILD_TARGET === 'gas';

export default defineConfig(() => {
  const plugins = [react(), tailwindcss()];
  
  // Only add single-file plugins for Google Apps Script builds
  if (isGasBuild) {
    plugins.push(viteSingleFile(), removeModuleType());
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: isGasBuild ? {
      // Google Apps Script build: single file, IIFE, ES2015
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
    } : {
      // Standard web build for Vercel: ES modules, separate files
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
