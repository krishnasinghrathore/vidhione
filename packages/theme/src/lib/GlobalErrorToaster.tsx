import React, { useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { subscribeErrors, ErrorLevel } from './eventBus';

/**
 * Renders a single top-level PrimeReact Toast and subscribes to the global
 * error event bus. Any published error/info messages will show here.
 *
 * Usage: Place once at app root (e.g., in main.tsx under providers).
 */
export default function GlobalErrorToaster() {
    const toastRef = useRef<Toast>(null);

    useEffect(() => {
        const unsub = subscribeErrors((message: string, level: ErrorLevel) => {
            toastRef.current?.show({
                severity: level,
                summary: level === 'error' ? 'Error' : level === 'warn' ? 'Warning' : level === 'success' ? 'Success' : 'Info',
                detail: message,
                life: 3000
            });
        });
        return () => unsub();
    }, []);

    return <Toast ref={toastRef} />;
}
