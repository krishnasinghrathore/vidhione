import { Link } from 'react-router-dom';
import React, { useContext } from 'react';
import AppMenu from './AppMenu';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import AppMenuProfile from './AppMenuProfile';
import type { AppMenuItem } from '../types/layout';

type AppSidebarProps = {
    menu?: AppMenuItem[];
    logoPath?: string;
};

const AppSidebar = ({ menu, logoPath }: AppSidebarProps) => {
    const { setLayoutState, logoPath: contextLogoPath } = useContext(LayoutContext);

    const anchor = () => {
        setLayoutState((prevLayoutState: any) => ({
            ...prevLayoutState,
            anchored: !prevLayoutState.anchored
        }));
    };

    const resolvedLogo = logoPath || contextLogoPath || '/layout/images/logo/LogIQImage.png';

    // Debug: surface the menu passed from the host app
    if (process.env.NODE_ENV !== 'production') {
        try {
            const labels = Array.isArray(menu) ? menu.map((m) => m?.label).join(', ') : 'none';
            console.debug('[AppSidebar] host menu items:', labels);
        } catch {
            // ignore logging issues
        }
    }

    return (
        <React.Fragment>
            <div className="layout-sidebar-top">
                <Link to="/">
                    <img src={resolvedLogo} alt="Logo" className="layout-sidebar-logo" style={{ height: '32px' }} />
                    <img src={resolvedLogo} alt="Logo" className="layout-sidebar-logo-slim" style={{ height: '32px' }} />
                </Link>
                <button className="layout-sidebar-anchor p-link" type="button" onClick={anchor}></button>
            </div>

            <div className="layout-menu-container">
                <MenuProvider>
                    <AppMenu model={menu} />
                </MenuProvider>
            </div>
        </React.Fragment>
    );
};

AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;
