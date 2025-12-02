'use client';
import { Helmet } from 'react-helmet-async';
import React, { useState, PropsWithChildren, useCallback, useMemo, useEffect } from 'react';
import type { LayoutContextProps, LayoutConfig, LayoutState, Breadcrumb, AppMenuItem } from '../../types/layout';

const BRAND = 'VidhiOne';

export type ThemeMeta = {
  name?: string;
  description?: string;
  url?: string;
  ogImage?: string;
  favicon?: string;
  robots?: string;
};

const THEME_LINK_ID = 'theme-link';
const getThemeHref = (colorScheme: LayoutConfig['colorScheme'], componentTheme: LayoutConfig['componentTheme']) => {
  const filename = `../../theme/theme-${colorScheme}/${componentTheme}/theme.css`;
  return new URL(filename, import.meta.url).href;
};

const ensureThemeLink = () => {
  if (typeof document === 'undefined') {
    return null;
  }
  let linkEl = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.id = THEME_LINK_ID;
    linkEl.rel = 'stylesheet';
    linkEl.type = 'text/css';
    document.head.appendChild(linkEl);
  }
  return linkEl;
};

const defaultLayoutContext: LayoutContextProps = {
  layoutConfig: {
    ripple: true,
    inputStyle: 'outlined',
    menuMode: 'static',
    colorScheme: 'light',
    componentTheme: 'indigo',
    scale: 14,
    menuTheme: 'light',
    topbarTheme: 'indigo',
    menuProfilePosition: 'end',
    desktopMenuActive: true,
    mobileMenuActive: false,
    mobileTopbarActive: false,
  },
  setLayoutConfig: () => {},
  layoutState: {
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    configSidebarVisible: false,
    profileSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    rightMenuActive: false,
    topbarMenuActive: false,
    sidebarActive: false,
    anchored: false,
    overlaySubmenuActive: false,
    menuProfileActive: false,
    resetMenu: false,
  },
  setLayoutState: () => {},
  onMenuToggle: () => {},
  isSlim: () => false,
  isSlimPlus: () => false,
  isHorizontal: () => false,
  isDesktop: () => true,
  isSidebarActive: () => false,
  breadcrumbs: [],
  setBreadcrumbs: () => {},
  onMenuProfileToggle: () => {},
  onTopbarMenuToggle: () => {},
  showRightSidebar: () => {},
  onSidebarAnchorClick: () => {},
  hostMenu: undefined,
  showConfigPanel: true,
  logoPath: '/layout/images/logo/LogIQImage.png',
};

export const LayoutContext = React.createContext<LayoutContextProps>(defaultLayoutContext);

type LayoutProviderProps = PropsWithChildren<{
  meta?: ThemeMeta;
  showConfigPanel?: boolean;
  menu?: AppMenuItem[];
  logoPath?: string;
}>;

export const LayoutProvider = (props: LayoutProviderProps) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    ripple: true,
    inputStyle: 'outlined',
    menuMode: 'static',
    colorScheme: 'light',
    componentTheme: 'indigo',
    scale: 14,
    menuTheme: 'light',
    topbarTheme: 'indigo',
    menuProfilePosition: 'end',
    desktopMenuActive: true,
    mobileMenuActive: false,
    mobileTopbarActive: false,
  });

  const [layoutState, setLayoutState] = useState<LayoutState>({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    configSidebarVisible: false,
    profileSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    rightMenuActive: false,
    topbarMenuActive: false,
    sidebarActive: false,
    anchored: false,
    overlaySubmenuActive: false,
    menuProfileActive: false,
    resetMenu: false,
  });

  const meta = props.meta || {};
  const APP_NAME = meta.name || (import.meta as any).env?.VITE_APP_NAME || BRAND;
  const APP_DESCRIPTION = meta.description || (import.meta as any).env?.VITE_APP_DESCRIPTION || `${BRAND}`;
  const APP_URL = meta.url || (import.meta as any).env?.VITE_APP_URL || '/';
  const APP_OG_IMAGE = meta.ogImage || (import.meta as any).env?.VITE_APP_OG_IMAGE || '/layout/images/logo/LogIQImage.png';
  const APP_FAVICON = meta.favicon || (import.meta as any).env?.VITE_APP_FAVICON || '/favicon.ico';
  const APP_ROBOTS = meta.robots || (import.meta as any).env?.VITE_APP_ROBOTS || 'index, follow';

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const linkEl = ensureThemeLink();
    if (!linkEl) {
      return;
    }

    linkEl.href = getThemeHref(layoutConfig.colorScheme, layoutConfig.componentTheme);
  }, [layoutConfig.colorScheme, layoutConfig.componentTheme]);

  const onMenuProfileToggle = useCallback(() => {
    setLayoutState((prevLayoutState: LayoutState) => ({
      ...prevLayoutState,
      menuProfileActive: !prevLayoutState.menuProfileActive,
    }));
  }, []);

  const isSidebarActive = useCallback(
    () => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive || layoutState.overlaySubmenuActive,
    [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive, layoutState.overlaySubmenuActive]
  );

  const isOverlay = useCallback(() => {
    return layoutConfig.menuMode === 'overlay';
  }, [layoutConfig.menuMode]);

  const isSlim = useCallback(() => {
    return layoutConfig.menuMode === 'slim';
  }, [layoutConfig.menuMode]);

  const isSlimPlus = useCallback(() => {
    return layoutConfig.menuMode === 'slim-plus';
  }, [layoutConfig.menuMode]);

  const isHorizontal = useCallback(() => {
    return layoutConfig.menuMode === 'horizontal';
  }, [layoutConfig.menuMode]);

  // Align JS breakpoint with SCSS (@media max-width: 992px => mobile)
  // Treat width 992px as mobile to avoid off-by-one mismatch
  const isDesktop = useCallback(() => {
    return window.innerWidth > 992;
  }, []);

  const onMenuToggle = useCallback(() => {
    if (isOverlay()) {
      setLayoutState((prevLayoutState: LayoutState) => ({
        ...prevLayoutState,
        overlayMenuActive: !prevLayoutState.overlayMenuActive,
      }));
    }

    if (isDesktop()) {
      setLayoutState((prevLayoutState: LayoutState) => ({
        ...prevLayoutState,
        staticMenuDesktopInactive: !prevLayoutState.staticMenuDesktopInactive,
      }));
    } else {
      setLayoutState((prevLayoutState: LayoutState) => ({
        ...prevLayoutState,
        staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive,
      }));
    }
  }, [isOverlay, isDesktop]);

  const onTopbarMenuToggle = useCallback(() => {
    setLayoutState((prevLayoutState: LayoutState) => ({
      ...prevLayoutState,
      topbarMenuActive: !prevLayoutState.topbarMenuActive,
    }));
  }, []);
  const showRightSidebar = useCallback(() => {
    setLayoutState((prevLayoutState: LayoutState) => ({
      ...prevLayoutState,
      rightMenuActive: true,
    }));
  }, []);

  const onSidebarAnchorClick = useCallback(() => {
    setLayoutState((prevLayoutState: LayoutState) => ({
      ...prevLayoutState,
      anchored: !prevLayoutState.anchored,
    }));
  }, []);

  const value = useMemo(
    () => ({
      layoutConfig,
      setLayoutConfig,
      layoutState,
      setLayoutState,
      onMenuToggle,
      isSlim,
      isSlimPlus,
      isHorizontal,
      isDesktop,
      isSidebarActive,
      breadcrumbs,
      setBreadcrumbs,
      onMenuProfileToggle,
      onTopbarMenuToggle,
      showRightSidebar,
      onSidebarAnchorClick,
      hostMenu: props.menu,
      showConfigPanel: props.showConfigPanel ?? true,
      logoPath: props.logoPath || '/layout/images/logo/LogIQImage.png',
    }),
    [
      layoutConfig,
      layoutState,
      onMenuToggle,
      isSlim,
      isSlimPlus,
      isHorizontal,
      isDesktop,
      isSidebarActive,
      breadcrumbs,
      onMenuProfileToggle,
      onTopbarMenuToggle,
      showRightSidebar,
      onSidebarAnchorClick,
      props.menu,
      props.showConfigPanel,
      props.logoPath,
    ]
  );

  return (
    <LayoutContext.Provider value={value}>
      <>
        <Helmet>
          <title>{APP_NAME}</title>
          <meta charSet="UTF-8" />
          <meta name="description" content={APP_DESCRIPTION} />
          <meta name="robots" content={APP_ROBOTS} />
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={APP_NAME} />
          <meta property="og:url" content={APP_URL} />
          <meta property="og:description" content={APP_DESCRIPTION} />
          <meta property="og:image" content={APP_OG_IMAGE} />
          <meta property="og:ttl" content="604800" />
          <link rel="icon" href={APP_FAVICON} type="image/x-icon" />
        </Helmet>
        {props.children}
      </>
    </LayoutContext.Provider>
  );
};
