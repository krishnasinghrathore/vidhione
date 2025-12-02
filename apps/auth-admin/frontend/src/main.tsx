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

// ✅ Create router with future flags (recommended for React Router v7+)
const router = createBrowserRouter(AppRoutes);

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
