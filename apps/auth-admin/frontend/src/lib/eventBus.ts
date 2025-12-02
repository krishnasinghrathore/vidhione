/**
 * Tiny global error event bus for publishing normalized messages from anywhere
 * (e.g., Apollo errorLink) and rendering them via a single top-level toaster.
 */

export type ErrorLevel = 'error' | 'warn' | 'info' | 'success';

type Listener = (message: string, level: ErrorLevel) => void;

const listeners = new Set<Listener>();

export function subscribeErrors(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

export function publishError(message: string, level: ErrorLevel = 'error'): void {
    for (const fn of Array.from(listeners)) {
        try {
            fn(message, level);
        } catch {
            // no-op
        }
    }
}
