'use client';
import { useEventListener, useMountEffect, useResizeListener, useUnmountEffect } from 'primereact/hooks';
import { classNames, DomHandler } from 'primereact/utils';
import React, { useCallback, useContext, useEffect, useRef, Context } from 'react';
import AppConfig from './AppConfig';
import AppRightMenu from './AppRightMenu';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import { LayoutContext } from './context/layoutcontext';
import AppBreadcrumb from './AppBreadCrumb';
import AppFooter from './AppFooter';
import type { AppTopbarRef } from '@/types/layout';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { PrimeReactContext, APIOptions } from 'primereact/api';

const Layout = () => {
    const { layoutConfig, layoutState, setLayoutState, setLayoutConfig, isSlim, isSlimPlus, isHorizontal, isDesktop, isSidebarActive } = useContext(LayoutContext);
    const { setRipple } = useContext(PrimeReactContext as Context<APIOptions>);
    const topbarRef = useRef<AppTopbarRef>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const [searchParams] = useSearchParams();
    let timeout: number | null = null;

    const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event) => {
            const target = event.target as Node;
            const clickedMobileHamburger = (target as HTMLElement)?.closest?.('.layout-topbar-mobile-button');

            const isOutsideClicked = !(
                sidebarRef.current?.isSameNode(target) ||
                sidebarRef.current?.contains(target) ||
                topbarRef.current?.menubutton?.isSameNode(target) ||
                topbarRef.current?.menubutton?.contains(target) ||
                !!clickedMobileHamburger
            );

            if (isOutsideClicked) {
                hideMenu();
            }
        }
    });

    const [bindDocumentResizeListener, unbindDocumentResizeListener] = useResizeListener({
        listener: () => {
            if (isDesktop() && !DomHandler.isTouchDevice()) {
                hideMenu();
            }
        }
    });

    const hideMenu = useCallback(() => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            overlayMenuActive: false,
            overlaySubmenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false,
            resetMenu: (isSlim() || isSlimPlus() || isHorizontal()) && isDesktop()
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSlim, isSlimPlus, isHorizontal, isDesktop]);

    const blockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    };

    const unblockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    };
    useMountEffect(() => {
        setRipple?.(layoutConfig.ripple);
    });

    const onMouseEnter = () => {
        if (!layoutState.anchored) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                sidebarActive: true
            }));
        }
    };

    const onMouseLeave = () => {
        if (!layoutState.anchored) {
            if (!timeout) {
                timeout = setTimeout(
                    () =>
                        setLayoutState((prevLayoutState) => ({
                            ...prevLayoutState,
                            sidebarActive: false
                        })),
                    300
                );
            }
        }
    };

    useEffect(() => {
        console.log('[LAYOUT] useEffect location.pathname:', location.pathname);
        console.log('[LAYOUT] useEffect searchParams.toString():', searchParams.toString());
        setLayoutState((prev) => ({
            ...prev,
            overlayMenuActive: false,
            overlaySubmenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false
        }));

        // Reset menu state to close all submenus
        setLayoutState((prev) => ({
            ...prev,
            resetMenu: true
        }));

        if (layoutConfig.colorScheme === 'dark') {
            setLayoutConfig((prev) => ({ ...prev, menuTheme: 'dark' }));
        }
    }, [location.pathname, searchParams.toString()]);

    useEffect(() => {
        if (isSidebarActive()) {
            bindMenuOutsideClickListener();
        }

        if (layoutState.staticMenuMobileActive) {
            blockBodyScroll();
            (isSlim() || isSlimPlus() || isHorizontal()) && bindDocumentResizeListener();
        }

        return () => {
            unbindMenuOutsideClickListener();
            unbindDocumentResizeListener();
            unblockBodyScroll();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive, layoutState.overlaySubmenuActive]);

    useUnmountEffect(() => {
        unbindMenuOutsideClickListener();
    });

    const containerClassName = classNames('layout-topbar-' + layoutConfig.topbarTheme, 'layout-menu-' + layoutConfig.menuTheme, 'layout-menu-profile-' + layoutConfig.menuProfilePosition, {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-slim': layoutConfig.menuMode === 'slim',
        'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
        'layout-horizontal': layoutConfig.menuMode === 'horizontal',
        'layout-reveal': layoutConfig.menuMode === 'reveal',
        'layout-drawer': layoutConfig.menuMode === 'drawer',
        'p-input-filled': layoutConfig.inputStyle === 'filled',
        'layout-sidebar-dark': layoutConfig.colorScheme === 'dark',
        'p-ripple-disabled': !layoutConfig.ripple,
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive,
        'layout-topbar-menu-active': layoutState.topbarMenuActive,
        'layout-menu-profile-active': layoutState.menuProfileActive,
        'layout-sidebar-active': layoutState.sidebarActive,
        'layout-sidebar-anchored': layoutState.anchored
    });

    return (
        <React.Fragment>
            <div className={classNames('layout-container', containerClassName)}>
                <AppTopbar ref={topbarRef} />
                <AppRightMenu />
                <div ref={sidebarRef} className="layout-sidebar" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                    <AppSidebar />
                </div>
                <div className="layout-content-wrapper">
                    <AppBreadcrumb></AppBreadcrumb>
                    <div className="layout-content">
                        <Outlet />
                    </div>
                    <AppFooter></AppFooter>
                </div>
                <AppConfig />
                <div className="layout-mask" onClick={hideMenu}></div>
            </div>
        </React.Fragment>
    );
};

export default Layout;
