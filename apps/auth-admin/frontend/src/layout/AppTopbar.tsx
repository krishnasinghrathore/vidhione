import { InputText } from 'primereact/inputtext';
import { forwardRef, useContext, useImperativeHandle, useMemo, useRef } from 'react';
import { LayoutContext } from './context/layoutcontext';
import type { AppTopbarRef } from '../types/layout';
import { Button } from 'primereact/button';
import { Link, useNavigate } from 'react-router-dom';
import { StyleClass } from 'primereact/styleclass';
import { classNames } from 'primereact/utils';
import { Ripple } from 'primereact/ripple';
import { Tag } from 'primereact/tag';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { onMenuToggle, showRightSidebar, onTopbarMenuToggle, layoutConfig, setLayoutState } = useContext(LayoutContext);
    const navigate = useNavigate();
    const menubuttonRef = useRef(null);
    const searchInputRef = useRef(null);
    const mobileButtonRef = useRef(null);
    const closeBtnRef = useRef(null);

    const searchRef = useRef(null);
    const bellRef = useRef(null);
    const avatarRef = useRef(null);
    const tableRef = useRef(null);

    const onMenuButtonClick = () => {
        onMenuToggle();
    };

    // Robust mobile toggle: directly flips mobile sidebar state at mobile breakpoint
    const onMobileHamburgerClick = () => {
        const isMobile = window.innerWidth <= 992;
        if (isMobile) {
            setLayoutState?.((prev: any) => ({
                ...prev,
                staticMenuMobileActive: !prev.staticMenuMobileActive
            }));
        } else {
            onMenuToggle();
        }
    };

    const onRightMenuButtonClick = () => {
        showRightSidebar();
    };

    const onMobileTopbarMenuButtonClick = () => {
        onTopbarMenuToggle();
    };

    const focusSearchInput = () => {
        setTimeout(() => {
            (searchInputRef.current as any).focus();
        }, 0);
    };

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current
    }));

    // Role indicator: driven by env or localStorage
    // Supported:
    // - VITE_USER_ROLE=superadmin | admin
    // - VITE_ADMIN_MODE=true (treat as admin)
    // - localStorage.userRole = 'superadmin' | 'admin'
    const { isSuperAdmin, isAdmin } = useMemo(() => {
        try {
            const envRole = String((import.meta as any).env?.VITE_USER_ROLE || '').toLowerCase();
            const envFlag = String((import.meta as any).env?.VITE_ADMIN_MODE || '').toLowerCase();
            const localRole = String((localStorage.getItem('userRole') || '')).toLowerCase();
            const role = envRole || localRole;

            const isSuper = role === 'superadmin';
            // Admin mode is true when role=admin OR admin flag is enabled.
            const isAdm = !isSuper && (role === 'admin' || envFlag === 'true' || envFlag === '1');

            return { isSuperAdmin: isSuper, isAdmin: isAdm };
        } catch {
            return { isSuperAdmin: false, isAdmin: false };
        }
    }, []);

    return (
        <div className="layout-topbar">
            <div className="layout-topbar-start">
                <Link className="layout-topbar-logo" to="/">
                    <img src="/layout/images/logo/LogIQImage.png" alt="Logo" className="layout-topbar-logo-full" style={{ height: '32px' }} />
                    <img src="/layout/images/logo/LogIQImage.png" alt="Logo" className="layout-topbar-logo-slim" style={{ height: '32px' }} />
                </Link>
                <a ref={menubuttonRef} className="p-ripple layout-menu-button" onClick={onMenuButtonClick}>
                    <i className="pi pi-chevron-right"></i>
                    <Ripple />
                </a>
            </div>

            <div className="layout-topbar-end">
                <a ref={mobileButtonRef} className="p-ripple layout-topbar-mobile-button" onClick={onMobileHamburgerClick} aria-label="Open menu" role="button">
                    <i className="pi pi-bars"></i>
                    <Ripple />
                </a>
                <div className="layout-topbar-actions-start">
                    <div
                        className="font-semibold"
                        style={{
                            color: 'var(--topbar-item-text-color)',
                            fontSize: '1.1rem',
                            marginLeft: '0.5rem',
                            letterSpacing: '0.2px'
                        }}
                    >
                        Fleet Management System
                    </div>
                    {isSuperAdmin ? (
                        <div className="ml-2">
                            <Tag value="Super Admin" severity="warning" icon="pi pi-lock" />
                        </div>
                    ) : isAdmin ? (
                        <div className="ml-2">
                            <Tag value="Admin Mode" severity="warning" icon="pi pi-lock-open" />
                        </div>
                    ) : null}
                </div>
                <div className="layout-topbar-actions-end">
                    <ul className="layout-topbar-items">
                        <li className="layout-topbar-search">
                            <StyleClass nodeRef={searchRef} selector="@next" enterClassName="hidden" enterActiveClassName="px-scalein" leaveToClassName="hidden" leaveActiveClassName="px-fadeout" hideOnOutsideClick>
                                <a className="p-ripple" ref={searchRef} onClick={focusSearchInput}>
                                    <i className="pi pi-search"></i>
                                    <Ripple />
                                </a>
                            </StyleClass>
                            <div className="layout-search-panel hidden p-input-filled">
                                <i className="pi pi-search"></i>
                                <InputText ref={searchInputRef} placeholder="Search" />
                                <StyleClass nodeRef={closeBtnRef} selector=".layout-search-panel" leaveActiveClassName="fadeout" leaveToClassName="hidden">
                                    <Button ref={closeBtnRef} type="button" icon="pi pi-times" rounded text className="p-button-plain"></Button>
                                </StyleClass>
                            </div>
                        </li>
                        <li>
                            <StyleClass nodeRef={bellRef} selector="@next" enterClassName="hidden" enterActiveClassName="px-scalein" leaveToClassName="hidden" leaveActiveClassName="px-fadeout" hideOnOutsideClick>
                                <a className="p-ripple" ref={bellRef}>
                                    <i className="pi pi-bell"></i>
                                    <Ripple />
                                </a>
                            </StyleClass>
                            <div className="hidden">
                                <ul className="list-none p-0 m-0">
                                    <li className="px-3 py-1">
                                        <span>
                                            You have <b>4</b> new notifications
                                        </span>
                                    </li>
                                    <hr className="mb-2 mx-3 border-top-1 border-none surface-border" />
                                    <li className="flex align-items-center py-2 px-3">
                                        <i className="pi pi-shopping-cart border-1 surface-border flex-shrink-0 border-circle text-primary p-2 mr-3"></i>
                                        <div>
                                            <h6 className="m-0">New Order</h6>
                                            <span className="text-600">35 mins ago</span>
                                        </div>
                                    </li>
                                    <li className="flex align-items-center py-2 px-3">
                                        <i className="pi pi-check-square border-1 surface-border flex-shrink-0 border-circle text-primary p-2 mr-3"></i>
                                        <div>
                                            <h6 className="m-0">Withdrawn Completed</h6>
                                            <span className="text-600">45 mins ago</span>
                                        </div>
                                    </li>
                                    <li className="flex align-items-center py-2 px-3">
                                        <i className="pi pi-chart-line border-1 surface-border flex-shrink-0 border-circle text-primary p-2 mr-3"></i>
                                        <div>
                                            <h6 className="m-0">Monthly Report</h6>
                                            <span className="text-600">1 hour ago</span>
                                        </div>
                                    </li>
                                    <li className="flex align-items-center py-2 px-3">
                                        <i className="pi pi-comments border-1 surface-border flex-shrink-0 border-circle text-primary p-2 mr-3"></i>
                                        <div>
                                            <h6 className="m-0">New Comment</h6>
                                            <span className="text-600">2 hours ago</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li>
                            <StyleClass nodeRef={tableRef} selector="@next" enterClassName="hidden" enterActiveClassName="px-scalein" leaveToClassName="hidden" leaveActiveClassName="px-fadeout" hideOnOutsideClick>
                                <a className="p-ripple" ref={tableRef}>
                                    <i className="pi pi-table"></i>
                                    <Ripple />
                                </a>
                            </StyleClass>
                            <div className="hidden">
                                <div className="flex flex-wrap">
                                    <div className="w-4 flex flex-column align-items-center p-3">
                                        <Button rounded className="mb-2" icon="pi pi-image"></Button>
                                        <span>Products</span>
                                    </div>
                                    <div className="w-4 flex flex-column align-items-center p-3">
                                        <Button className="mb-2" rounded severity="success" icon="pi pi-file-pdf"></Button>
                                        <span>Reports</span>
                                    </div>
                                    <div className="w-4 flex flex-column align-items-center p-3">
                                        <Button className="mb-2" rounded severity="secondary" icon="pi pi-dollar"></Button>
                                        <span>Balance</span>
                                    </div>
                                    <div className="w-4 flex flex-column align-items-center p-3">
                                        <Button className="mb-2" rounded severity="warning" icon="pi pi-cog"></Button>
                                        <span>Settings</span>
                                    </div>
                                    <div className="w-4 flex flex-column align-items-center p-3">
                                        <Button className="mb-2" rounded severity="help" icon="pi pi-key"></Button>
                                        <span>Credentials</span>
                                    </div>
                                    <div className="w-4 flex flex-column align-items-center p-3">
                                        <Button className="mb-2" rounded severity="info" icon="pi pi-sitemap"></Button>
                                        <span>Sitemap</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <StyleClass nodeRef={avatarRef} selector="@next" enterClassName="hidden" enterActiveClassName="px-scalein" leaveToClassName="hidden" leaveActiveClassName="px-fadeout" hideOnOutsideClick>
                                <a className="p-ripple" ref={avatarRef}>
                                    <img src="/layout/images/avatar/amyelsner.png" alt="avatar" className="w-2rem h-2rem" />
                                    <Ripple />
                                </a>
                            </StyleClass>

                            <div className={classNames('hidden')}>
                                <ul className="list-none p-0 m-0">
                                    <li>
                                        <a className="p-ripple flex align-items-center px-3 py-2">
                                            <i className="pi pi-user mr-2"></i>
                                            <span>Profile</span>
                                            <Ripple />
                                        </a>
                                    </li>
                                    <li>
                                        <a className="p-ripple flex align-items-center px-3 py-2">
                                            <i className="pi pi-cog mr-2"></i>
                                            <span>Settings</span>
                                            <Ripple />
                                        </a>
                                    </li>
                                    <li>
                                        <a className="p-ripple flex align-items-center px-3 py-2">
                                            <i className="pi pi-power-off mr-2"></i>
                                            <span>Logout</span>
                                            <Ripple />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className="layout-topbar-right-button">
                            <a className="p-ripple" onClick={onRightMenuButtonClick}>
                                <i className="pi pi-arrow-left"></i>
                                <Ripple />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
});

export default AppTopbar;
