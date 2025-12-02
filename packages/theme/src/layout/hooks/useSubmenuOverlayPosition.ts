import { useEventListener } from 'primereact/hooks';
import { DomHandler } from 'primereact/utils';
import { MutableRefObject, useContext, useEffect } from 'react';
import { LayoutContext } from '../context/layoutcontext';
import type { UseSubmenuOverlayPositionProps } from '@/types';
import { MenuContext } from '../context/menucontext';

export const useSubmenuOverlayPosition = ({ target, overlay, container, when }: UseSubmenuOverlayPositionProps) => {
    const layoutCtx = useContext(LayoutContext);
    const { activeMenu } = useContext(MenuContext);
    const isHorizontal =
        typeof layoutCtx?.isHorizontal === 'function' ? layoutCtx.isHorizontal : () => false;
    const isSlim = typeof layoutCtx?.isSlim === 'function' ? layoutCtx.isSlim : () => false;
    const isSlimPlus = typeof layoutCtx?.isSlimPlus === 'function' ? layoutCtx.isSlimPlus : () => false;
    const setLayoutState = layoutCtx?.setLayoutState ?? (() => {});

    const handleScroll = () => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            overlayMenuActive: false,
            overlaySubmenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false,
            resetMenu: true
        }));
    };

    const [bindScrollListener, unbindScrollListener] = useEventListener({
        type: 'scroll',
        target: container as React.Ref<HTMLElement>,
        listener: handleScroll
    });

    const calculatePosition = () => {
        if (overlay && target) {
            const { left, top } = target.getBoundingClientRect();
            const { width: vWidth, height: vHeight } = DomHandler.getViewport();
            const [oWidth, oHeight] = [overlay.offsetWidth, overlay.offsetHeight];
            const scrollbarWidth = DomHandler.calculateScrollbarWidth(container as HTMLElement);
            const topbarEl: HTMLDivElement | null = document.querySelector('.layout-topbar');
            const topbarHeight = topbarEl?.offsetHeight || 0;

            // reset
            overlay.style.top = overlay.style.left = '';

            // Guard against undefined layout helpers
            if (isHorizontal && isHorizontal()) {
                const width = left + oWidth + scrollbarWidth;
                overlay.style.left = vWidth < width ? `${left - (width - vWidth)}px` : `${left}px`;
            } else if ((isSlim && isSlim()) || (isSlimPlus && isSlimPlus())) {
                const topOffset = top - topbarHeight;
                const height = topOffset + oHeight + topbarHeight;
                overlay.style.top = vHeight < height ? `${topOffset - (height - vHeight)}px` : `${topOffset}px`;
            }
        }
    };

    useEffect(() => {
        if (when) {
            bindScrollListener();
        }

        return () => {
            unbindScrollListener();
        };
    }, [when]);

    useEffect(() => {
        if (when) {
            calculatePosition();
        }
    }, [when, activeMenu]);
};
