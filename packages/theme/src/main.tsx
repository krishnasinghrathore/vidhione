// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppRoutes from './Router';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './lib/apollo';
import GlobalErrorToaster from './lib/GlobalErrorToaster';
import { SystemConfigProvider } from './lib/systemConfig';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import './styles/layout/layout.scss';
import './styles/demo/flags/flags.css';
import './styles/demo/Demos.scss';

import { LayoutProvider } from './layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import { HelmetProvider } from 'react-helmet-async';

const THEME_LINK_ID = 'theme-link';
const DEFAULT_THEME_HREF = new URL('./theme/theme-light/indigo/theme.css', import.meta.url).href;

const ensureThemeLink = () => {
    if (typeof document === 'undefined') {
        return;
    }

    let linkEl = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;
    if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.id = THEME_LINK_ID;
        linkEl.rel = 'stylesheet';
        linkEl.type = 'text/css';
        document.head.appendChild(linkEl);
    }

    if (!linkEl.href) {
        linkEl.href = DEFAULT_THEME_HREF;
    }
};

ensureThemeLink();

// Allow host apps (e.g., apps/accounts) to inject extra child routes under the root layout.
// Host should set: (window as any).__EXTRA_CHILD_ROUTES__ = RouteObject[];
const mergeExtraChildRoutes = (routes: any[]) => {
    try {
        if (typeof window !== 'undefined') {
            const extra = (window as any).__EXTRA_CHILD_ROUTES__;
            if (Array.isArray(extra) && extra.length) {
                const root = routes.find((r: any) => r?.path === '/');
                if (root) {
                    root.children = [...extra, ...(root.children || [])];
                } else {
                    routes = [...extra, ...routes];
                }
            }
        }
    } catch {
        // no-op on merge issues; fallback to base routes
    }
    return routes;
};

// ✅ Create router with future flags (recommended for React Router v7+)
const router = createBrowserRouter(mergeExtraChildRoutes([...AppRoutes]));

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <PrimeReactProvider>
            <HelmetProvider>
                <LayoutProvider>
                    <ApolloProvider client={apolloClient}>
                        {/* Load global system configuration once and provide via context */}
                        <SystemConfigProvider>
                            {/* Global error toaster subscribes to error bus and shows toasts */}
                            <GlobalErrorToaster />
                            <RouterProvider router={router} />
                        </SystemConfigProvider>
                    </ApolloProvider>
                </LayoutProvider>
            </HelmetProvider>
        </PrimeReactProvider>
    </StrictMode>
);
