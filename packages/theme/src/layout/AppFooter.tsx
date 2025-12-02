import React from 'react';

type HostMeta = {
    name?: string;
    copyright?: string;
};

const readHostMeta = (): HostMeta => {
    try {
        const meta = (globalThis as any)?.__THEME_META__;
        if (meta && typeof meta === 'object') {
            const { name, copyright } = meta as HostMeta;
            return { name, copyright };
        }
    } catch {
        // ignore malformed host metadata; fall back to defaults below
    }
    return {};
};

const HOST_META = readHostMeta();
const BRAND = HOST_META.name || (import.meta as any).env?.VITE_APP_NAME || 'VidhiOne';
const COPYRIGHT = HOST_META.copyright || (import.meta as any).env?.VITE_COPYRIGHT || BRAND;

const AppFooter = () => {
    return (
        <div className="layout-footer">
            <span className="font-medium ml-2">{BRAND}</span>
            <span className="font-medium ml-2">© {new Date().getFullYear()} {COPYRIGHT}. All rights reserved.</span>
        </div>
    );
};

export default AppFooter;
