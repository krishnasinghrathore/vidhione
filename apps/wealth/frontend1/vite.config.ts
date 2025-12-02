import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    fs: {
      allow: ['..', path.resolve(__dirname, '../../../packages')]
    }
  },
  resolve: {
    alias: [
      // Shared theme source (resolve symlinked package + its internal "@/..." imports)
      { find: /^@\/(.*)/, replacement: path.resolve(__dirname, '../../../packages/theme/src/$1') },
      { find: '@vidhione/theme', replacement: path.resolve(__dirname, '../../../packages/theme/src') },

      // Local app alias (placed after theme alias to avoid hijacking "@/..." from the shared package)
      { find: '@', replacement: path.resolve(__dirname, 'src') },

      // Map CSS import paths from shared package to this app's node_modules
      { find: 'primereact/resources', replacement: path.resolve(__dirname, 'node_modules/primereact/resources') },
      { find: 'primeicons/primeicons.css', replacement: path.resolve(__dirname, 'node_modules/primeicons/primeicons.css') },
      { find: 'primeflex/primeflex.css', replacement: path.resolve(__dirname, 'node_modules/primeflex/primeflex.css') },

      // Regex aliases to fix subpath resolution from shared source
      { find: /^primereact\/(.*)/, replacement: path.resolve(__dirname, 'node_modules/primereact/$1') },
      { find: /^@fullcalendar\/(.*)/, replacement: path.resolve(__dirname, 'node_modules/@fullcalendar/$1') },

      // Ensure shared source resolves runtime deps from host node_modules
      { find: 'react', replacement: path.resolve(__dirname, 'node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(__dirname, 'node_modules/react-dom') },
      { find: 'react-dom/client', replacement: path.resolve(__dirname, 'node_modules/react-dom/client') },
      { find: 'react-router-dom', replacement: path.resolve(__dirname, 'node_modules/react-router-dom') },
      { find: 'react-helmet-async', replacement: path.resolve(__dirname, 'node_modules/react-helmet-async') },
      { find: '@apollo/client/link/error', replacement: path.resolve(__dirname, 'node_modules/@apollo/client/link/error') },
      { find: '@apollo/client/link/retry', replacement: path.resolve(__dirname, 'node_modules/@apollo/client/link/retry') },
      { find: '@apollo/client/react', replacement: path.resolve(__dirname, 'node_modules/@apollo/client/react') },
      { find: '@apollo/client', replacement: path.resolve(__dirname, 'node_modules/@apollo/client') },
      { find: 'chart.js', replacement: path.resolve(__dirname, 'node_modules/chart.js') },
      { find: 'zod', replacement: path.resolve(__dirname, 'node_modules/zod') }
    ],
    dedupe: ['react', 'react-dom'],
    // Follow symlinks so linked packages resolve their deps from this app's node_modules.
    preserveSymlinks: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'primereact/api',
      'primereact/hooks',
      'primereact/utils',
      'primereact/toast',
      'primereact/sidebar',
      'primereact/inputtext',
      'primereact/button',
      'primereact/inputswitch',
      'primereact/radiobutton',
      'primereact/styleclass',
      'primereact/ripple',
      'primereact/tag',
      'primereact/tooltip',
      'react-fast-compare',
      'invariant',
      'shallowequal',
      // Ensure CJS cookie and set-cookie-parser exports are wrapped as ESM for react-router
      'cookie',
      'set-cookie-parser',
      '@apollo/client/link/error',
      '@apollo/client/link/retry'
    ]
  }
});
