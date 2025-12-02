import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: [
            { find: '@', replacement: path.resolve(__dirname, 'src') },
            // Shared theme source (InterLogIQ-style host)
            { find: '@vidhione/theme', replacement: path.resolve(__dirname, '../../../packages/theme/src') },

            // Map CSS import paths from shared package to this app's node_modules
            { find: 'primereact/resources', replacement: path.resolve(__dirname, 'node_modules/primereact/resources') },
            { find: 'primeicons/primeicons.css', replacement: path.resolve(__dirname, 'node_modules/primeicons/primeicons.css') },
            { find: 'primeflex/primeflex.css', replacement: path.resolve(__dirname, 'node_modules/primeflex/primeflex.css') },

            // Regex aliases to fix subpath resolution from shared source
            { find: /^primereact\/.*/, replacement: path.resolve(__dirname, 'node_modules/primereact') + '/' },
            { find: /^@fullcalendar\/.*/, replacement: path.resolve(__dirname, 'node_modules/@fullcalendar') + '/' },

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
        dedupe: ['react', 'react-dom']
    },
    server: {
        fs: {
            // allow reading shared sources outside project root
            allow: [
                '..',
                path.resolve(__dirname, '../../../packages')
            ]
        }
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@apollo/client',
            '@apollo/client/react',
            '@apollo/client/link/error',
            '@apollo/client/link/retry',
            'react-helmet-async',
            'primereact/api',
            'primereact/hooks',
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction',
            'chart.js',
            'zod'
        ]
    }
});