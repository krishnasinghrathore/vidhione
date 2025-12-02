'use client';
import { Helmet } from 'react-helmet-async';
import React, { useState, PropsWithChildren, useCallback, useMemo } from 'react';
import type { LayoutContextProps, LayoutConfig, LayoutState, Breadcrumb } from '../../types/layout';
import { model } from '../AppMenu';

export const LayoutContext = React.createContext({} as LayoutContextProps);

export const LayoutProvider = (props: PropsWithChildren) => {
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
        ripple: true,
        inputStyle: 'outlined',
        menuMode: 'slim',
        colorScheme: 'light',
        componentTheme: 'indigo',
        scale: 14,
        menuTheme: 'light',
        topbarTheme: 'indigo',
        menuProfilePosition: 'end',
        desktopMenuActive: true,
        mobileMenuActive: false,
        mobileTopbarActive: false
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
        resetMenu: false
    });

    const onMenuProfileToggle = useCallback(() => {
        setLayoutState((prevLayoutState: LayoutState) => ({
            ...prevLayoutState,
            menuProfileActive: !prevLayoutState.menuProfileActive
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
                overlayMenuActive: !prevLayoutState.overlayMenuActive
            }));
        }

        if (isDesktop()) {
            setLayoutState((prevLayoutState: LayoutState) => ({
                ...prevLayoutState,
                staticMenuDesktopInactive: !prevLayoutState.staticMenuDesktopInactive
            }));
        } else {
            setLayoutState((prevLayoutState: LayoutState) => ({
                ...prevLayoutState,
                staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive
            }));
        }
    }, [isOverlay, isDesktop]);

    const onTopbarMenuToggle = useCallback(() => {
        setLayoutState((prevLayoutState: LayoutState) => ({
            ...prevLayoutState,
            topbarMenuActive: !prevLayoutState.topbarMenuActive
        }));
    }, []);
    const showRightSidebar = useCallback(() => {
        setLayoutState((prevLayoutState: LayoutState) => ({
            ...prevLayoutState,
            rightMenuActive: true
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
            showRightSidebar
        }),
        [layoutConfig, layoutState, onMenuToggle, isSlim, isSlimPlus, isHorizontal, isDesktop, isSidebarActive, breadcrumbs, onMenuProfileToggle, onTopbarMenuToggle, showRightSidebar]
    );

    return (
        <LayoutContext.Provider value={value}>
            <>
                <Helmet>
                    <title>LogIQ - INTERPROMODAL</title>
                    <meta charSet="UTF-8" />
                    <meta name="description" content="INTERPROMODAL Fleet Management Platform" />
                    <meta name="robots" content="index, follow" />
                    <meta name="viewport" content="initial-scale=1, width=device-width" />
                    <meta property="og:type" content="website"></meta>
                    <meta property="og:title" content="INTERPROMODAL"></meta>
                    <meta property="og:url" content="/"></meta>
                    <meta property="og:description" content="Comprehensive Fleet Maintenance Management System" />
                    <meta property="og:image" content="/layout/images/logo/LogIQImage.png"></meta>
                    <meta property="og:ttl" content="604800"></meta>
                    <link rel="icon" href={`/favicon.ico`} type="image/x-icon"></link>
                </Helmet>
                {props.children}
            </>
        </LayoutContext.Provider>
    );
};
