import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { publishError } from './eventBus';
import { getGraphQLErrorMessage } from './errors';

const GRAPHQL_URL = (import.meta as any).env?.VITE_GRAPHQL_URL || 'http://127.0.0.1:4000/graphql';

const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    credentials: 'include'
});

const retryLink = new RetryLink({
    delay: {
        initial: 300,
        max: 5000,
        jitter: true
    },
    attempts: {
        max: 3,
        retryIf: (error) => !!error
    }
});

const errorLink = onError((err) => {
    const { graphQLErrors, networkError, operation } = (err ?? {}) as any;

    // Log for diagnostics
    if (Array.isArray(graphQLErrors) && graphQLErrors.length) {
        for (const e of graphQLErrors) {
            console.error('[GraphQL error]', {
                op: operation?.operationName,
                message: e?.message,
                path: e?.path,
                extensions: e?.extensions
            });
        }
    }
    if (networkError) {
        console.error('[Network error]', { op: operation?.operationName, networkError });
    }

    // Optionally publish a global toast, unless operation requested suppression
    const suppress = !!operation?.getContext?.()?.suppressGlobalError;
    if (!suppress) {
        const msg = getGraphQLErrorMessage(err as any);
        if (msg) publishError(msg, 'error');
    }
});

function makeCache() {
    return new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    drivers: {
                        keyArgs: false,
                        merge(existing = [], incoming: any[], options) {
                            const offset = (options?.args as any)?.offset ?? 0;
                            const merged = existing ? existing.slice(0) : [];
                            for (let i = 0; i < incoming.length; i++) {
                                merged[offset + i] = incoming[i];
                            }
                            return merged;
                        }
                    },
                    vehicles: {
                        keyArgs: false,
                        merge(existing = [], incoming: any[], options) {
                            const offset = (options?.args as any)?.offset ?? 0;
                            const merged = existing ? existing.slice(0) : [];
                            for (let i = 0; i < incoming.length; i++) {
                                merged[offset + i] = incoming[i];
                            }
                            return merged;
                        }
                    },
                    workOrders: {
                        keyArgs: false,
                        merge(existing = [], incoming: any[], options) {
                            const offset = (options?.args as any)?.offset ?? 0;
                            const merged = existing ? existing.slice(0) : [];
                            for (let i = 0; i < incoming.length; i++) {
                                merged[offset + i] = incoming[i];
                            }
                            return merged;
                        }
                    },
                    maintenanceRecords: {
                        keyArgs: false,
                        merge(existing = [], incoming: any[], options) {
                            const offset = (options?.args as any)?.offset ?? 0;
                            const merged = existing ? existing.slice(0) : [];
                            for (let i = 0; i < incoming.length; i++) {
                                merged[offset + i] = incoming[i];
                            }
                            return merged;
                        }
                    }
                }
            },
            Driver: { keyFields: ['id'] },
            Vehicle: { keyFields: ['id'] },
            WorkOrder: { keyFields: ['id'] },
            MaintenanceRecord: { keyFields: ['id'] }
        }
    });
}

export const apolloClient = new ApolloClient({
    link: from([errorLink, retryLink, httpLink]),
    cache: makeCache()
});

export function createApolloClient(uri?: string) {
    const link = new HttpLink({
        uri: uri || GRAPHQL_URL,
        credentials: 'include'
    });

    return new ApolloClient({
        link: from([errorLink, retryLink, link]),
        cache: makeCache()
    });
}
