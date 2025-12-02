'use client';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ripple } from 'primereact/ripple';
import { classNames } from 'primereact/utils';
import { useContext, useEffect, useRef } from 'react';
import { LayoutContext } from './context/layoutcontext';
import { MenuContext } from './context/menucontext';
import type { AppMenuItemProps } from '@/types/layout';
import { useSubmenuOverlayPosition } from './hooks/useSubmenuOverlayPosition';

const AppMenuitem = (props: AppMenuItemProps) => {
    const { activeMenu, setActiveMenu } = useContext(MenuContext);
    const { isSlim, isSlimPlus, isHorizontal, isDesktop, setLayoutState, layoutState, layoutConfig } = useContext(LayoutContext);
    const location = useLocation();
    const navigate = useNavigate();
    const submenuRef = useRef<HTMLUListElement>(null);
    const menuitemRef = useRef<HTMLLIElement>(null);
    const item = props.item;
    const key = props.parentKey ? props.parentKey + '-' + props.index : String(props.index);
    const isActiveRoute = item!.to && location.pathname === item!.to;
    const active = activeMenu === key || !!(activeMenu && activeMenu.startsWith(key + '-'));
    const isRootLink = !!(props.root && item?.to && !item?.items);
    const isGroup = !!item?.group;

    useSubmenuOverlayPosition({
        target: menuitemRef.current,
        overlay: submenuRef.current,
        container: menuitemRef.current && menuitemRef.current.closest('.layout-menu-container'),
        when: props.root && active && (isSlim() || isSlimPlus() || isHorizontal()) && isDesktop()
    });

    useEffect(() => {
        if (layoutState.resetMenu) {
            setActiveMenu('');
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                resetMenu: false
            }));
        }
    }, [layoutState.resetMenu]);

    useEffect(() => {
        if (!(isSlim() || isSlimPlus() || isHorizontal()) && isActiveRoute) {
            setActiveMenu(key);
        }
        const url = location.pathname + location.search;
        const onRouteChange = () => {
            if (!(isSlim() || isHorizontal()) && item!.to && item!.to === url) {
                setActiveMenu(key);
            }
        };
        onRouteChange();
    }, [location.pathname, location.search, layoutConfig]);

    const itemClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        //avoid processing disabled items
        if (item!.disabled) {
            event.preventDefault();
            return;
        }

        // navigate with hover
        if (props.root && (isSlim() || isHorizontal() || isSlimPlus())) {
            const isSubmenu = event.currentTarget.closest('.layout-root-menuitem.active-menuitem > ul') !== null;
            if (isSubmenu)
                setLayoutState((prevLayoutState) => ({
                    ...prevLayoutState,
                    menuHoverActive: true
                }));
            else
                setLayoutState((prevLayoutState) => ({
                    ...prevLayoutState,
                    menuHoverActive: !prevLayoutState.menuHoverActive
                }));
        }

        //execute command
        if (item?.command) {
            item?.command({ originalEvent: event, item: item });
        }

        // Handle navigation links (items with 'to' property)
        if (item?.to && !item?.items) {
            console.log('Navigation link clicked:', item.label, 'to:', item.to);

            // Close mobile menu when navigation link is clicked
            if (!isDesktop()) {
                console.log('Closing mobile menu for navigation link');
                setLayoutState((prevLayoutState) => ({
                    ...prevLayoutState,
                    staticMenuMobileActive: false,
                    overlayMenuActive: false,
                    overlaySubmenuActive: false,
                    menuHoverActive: false
                }));
            }

            if (isSlim() || isSlimPlus() || isHorizontal()) {
                setLayoutState((prevLayoutState) => ({
                    ...prevLayoutState,
                    menuHoverActive: false
                }));
            }

            // Force close all submenus by resetting active menu
            setActiveMenu('');

            // Also set resetMenu flag to force complete menu reset
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                resetMenu: true
            }));

            return; // Exit early for navigation links
        }

        // toggle active state for submenus
        if (item?.items) {
            setActiveMenu(active ? props.parentKey! : key);

            if (props.root && !active && (isSlim() || isHorizontal() || isSlimPlus())) {
                setLayoutState((prevLayoutState) => ({
                    ...prevLayoutState,
                    overlaySubmenuActive: true
                }));
            }
        } else {
            // Close mobile menu when any other link is clicked
            if (!isDesktop()) {
                setLayoutState((prevLayoutState) => ({
                    ...prevLayoutState,
                    staticMenuMobileActive: false
                }));
            }

            if (isSlim() || isSlimPlus() || isHorizontal()) {
                setLayoutState((prevLayoutState) => ({
                    ...prevLayoutState,
                    menuHoverActive: false
                }));
            }

            setActiveMenu(key);
        }
    };

    const onMouseEnter = () => {
        // activate item on hover
        if (props.root && (isSlim() || isHorizontal() || isSlimPlus()) && isDesktop()) {
            if (!active && layoutState.menuHoverActive) {
                setActiveMenu(key);
            }
        }
    };

    const subMenu =
        item?.items && item?.visible !== false ? (
            <ul ref={submenuRef} className={classNames({ 'layout-root-submenulist': props.root })}>
                {item?.items.map((child, i) => {
                    return <AppMenuitem item={child} index={i} className={child.badgeClass} parentKey={key} key={child.label} />;
                })}
            </ul>
        ) : null;

    return (
        <li
            ref={menuitemRef}
            className={classNames({
                'layout-root-menuitem': props.root,
                'active-menuitem': active,
                'root-link': isRootLink,
                'layout-menu-group': isGroup
            })}
        >
            {isGroup && item?.label && item?.visible !== false && (
                <div className="layout-menuitem-root-text">
                    <span>{item.label}</span>
                </div>
            )}
            {props.root && !isRootLink && item?.visible !== false && (
                <div className="layout-menuitem-root-text">
                    <span>{item?.label}</span>
                    <i className="layout-menuitem-root-icon pi pi-fw pi-ellipsis-h"></i>
                </div>
            )}
            {(!item?.to || item?.items) && item?.visible !== false ? (
                <>
                    <a
                        href={item?.url}
                        onClick={(e) => itemClick(e)}
                        className={classNames(item?.class, 'p-ripple tooltip-target')}
                        target={item?.target}
                        data-pr-tooltip={item?.label}
                        data-pr-disabled={!(isSlim() && props.root && !layoutState.menuHoverActive)}
                        tabIndex={0}
                        onMouseEnter={onMouseEnter}
                    >
                        <i className={classNames('layout-menuitem-icon', item?.icon)}></i>
                        <span className="layout-menuitem-text">{item?.label}</span>
                        {item?.items && <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>}
                        <Ripple />
                    </a>
                </>
            ) : null}

            {item?.to && !item?.items && item?.visible !== false ? (
                <>
                    <a
                        href={item?.to}
                        onClick={(e) => {
                            e.preventDefault();
                            console.log('Custom navigation handler clicked:', item.label, 'to:', item.to);

                            // Force close all mobile menu states
                            setLayoutState((prevLayoutState) => ({
                                ...prevLayoutState,
                                staticMenuMobileActive: false,
                                overlayMenuActive: false,
                                overlaySubmenuActive: false,
                                menuHoverActive: false
                            }));

                            // Navigate using React Router
                            if (item.to) {
                                navigate(item.to);
                            }
                        }}
                        className={classNames(item?.class, 'p-ripple tooltip-target', {
                            'active-route': isActiveRoute
                        })}
                        target={item?.target}
                        data-pr-tooltip={item?.label}
                        data-pr-disabled={!(isSlim() && props.root && !layoutState.menuHoverActive)}
                        tabIndex={0}
                        onMouseEnter={onMouseEnter}
                    >
                        <i className={classNames('layout-menuitem-icon', item?.icon)}></i>
                        <span className="layout-menuitem-text">{item?.label}</span>
                        {/* {badge} */}
                        {item?.items && <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>}
                        <Ripple />
                    </a>
                </>
            ) : null}
            {subMenu}
        </li>
    );
};

export default AppMenuitem;
