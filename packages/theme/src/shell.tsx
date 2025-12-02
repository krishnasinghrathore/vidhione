import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouteObject, RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { PrimeReactProvider } from 'primereact/api';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './layout/layout';
import { LayoutProvider } from './layout/context/layoutcontext';
import GlobalErrorToaster from './lib/GlobalErrorToaster';
import { SystemConfigProvider } from './lib/systemConfig';
import type { AppMenuItem } from './types/layout';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './styles/layout/layout.scss';

export type ThemeMeta = {
  name?: string;
  description?: string;
  url?: string;
  ogImage?: string;
  favicon?: string;
  robots?: string;
};

export type ThemeShellProps = {
  routes: RouteObject[];
  menu: AppMenuItem[];
  meta?: ThemeMeta;
  defaultPath?: string;
  apolloClient: ApolloClient<NormalizedCacheObject>;
  showConfigPanel?: boolean;
  logoPath?: string;
};

const THEME_LINK_ID = 'theme-link';
const DEFAULT_THEME_HREF = new URL('./theme/theme-light/indigo/theme.css', import.meta.url).href;

const ensureThemeLink = () => {
  if (typeof document === 'undefined') return;
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

export function createThemeRouter(routes: RouteObject[], defaultPath: string) {
  const indexRedirect: RouteObject = { index: true, element: <Navigate to={defaultPath} replace /> };
  const children: RouteObject[] = [indexRedirect, ...routes];

  return createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children,
    },
  ]);
}

export function ThemeShell(props: ThemeShellProps) {
  const defaultPath = props.defaultPath ?? '/';
  const router = createThemeRouter(props.routes, defaultPath);

  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <PrimeReactProvider>
        <HelmetProvider>
          <LayoutProvider
            meta={props.meta}
            showConfigPanel={props.showConfigPanel}
            menu={props.menu}
            logoPath={props.logoPath}
          >
            <ApolloProvider client={props.apolloClient}>
              <SystemConfigProvider enabled={false}>
                <GlobalErrorToaster />
                <RouterProvider router={router} />
              </SystemConfigProvider>
            </ApolloProvider>
          </LayoutProvider>
        </HelmetProvider>
      </PrimeReactProvider>
    </StrictMode>
  );
}
