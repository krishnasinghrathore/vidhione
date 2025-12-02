import React, { createContext, useContext, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

type SystemConfig = {
    minDriverAge: number;
    maxUploadSizeMB: number;
};

type SystemConfigContextValue = {
    minDriverAge: number; // always a number (defaults to 18 until loaded)
    maxUploadSizeMB: number; // always a number (defaults to 10 until loaded)
    loading: boolean;
    error: string | null;
    // Update helpers (optional UI usage)
    updateMinDriverAge: (age: number) => Promise<void>;
    updateMaxUploadSizeMB: (mb: number) => Promise<void>;
    refetch: () => void;
};

const DEFAULT_MIN_AGE = 18;
const DEFAULT_MAX_UPLOAD_MB = 10;

const SystemConfigContext = createContext<SystemConfigContextValue>({
    minDriverAge: DEFAULT_MIN_AGE,
    maxUploadSizeMB: DEFAULT_MAX_UPLOAD_MB,
    loading: true,
    error: null,
    updateMinDriverAge: async () => {},
    updateMaxUploadSizeMB: async () => {},
    refetch: () => {}
});

const SYSTEM_CONFIG_QUERY = gql`
    query SystemConfig {
        systemConfig {
            minDriverAge
            maxUploadSizeMB
        }
    }
`;

const UPDATE_SYSTEM_CONFIG_MUTATION = gql`
    mutation UpdateSystemConfig($input: SystemConfigInput!) {
        updateSystemConfig(input: $input) {
            minDriverAge
            maxUploadSizeMB
        }
    }
`;

type SystemConfigProviderProps = {
    children: React.ReactNode;
    /**
     * When true (default), run the systemConfig query. Set to false for apps whose backend
     * does not expose systemConfig (e.g., Wealth) to avoid 400 validation errors.
     */
    enabled?: boolean;
};

export function SystemConfigProvider({ children, enabled = true }: SystemConfigProviderProps) {
    const { data, loading, error, refetch } = useQuery<{ systemConfig: SystemConfig }>(SYSTEM_CONFIG_QUERY, {
        fetchPolicy: 'cache-first',
        skip: !enabled
    });

    const [mutate] = useMutation<{ updateSystemConfig: SystemConfig }, { input: { minDriverAge?: number; maxUploadSizeMB?: number } }>(UPDATE_SYSTEM_CONFIG_MUTATION, {
        skip: !enabled
    });

    const updateMinDriverAge = async (age: number) => {
        const safeAge = Math.max(0, Math.floor(Number(age) || 0)) || DEFAULT_MIN_AGE;
        const currentMax = Number(data?.systemConfig?.maxUploadSizeMB);
        const safeMax = Number.isFinite(currentMax) && currentMax > 0 ? currentMax : DEFAULT_MAX_UPLOAD_MB;

        await mutate({
            variables: { input: { minDriverAge: safeAge } },
            optimisticResponse: {
                updateSystemConfig: { minDriverAge: safeAge, maxUploadSizeMB: safeMax, __typename: 'SystemConfig' } as any
            },
            update: (cache, { data: resp }) => {
                const newAge = resp?.updateSystemConfig?.minDriverAge ?? safeAge;
                const newMax = resp?.updateSystemConfig?.maxUploadSizeMB ?? safeMax;
                cache.writeQuery({
                    query: SYSTEM_CONFIG_QUERY,
                    data: { systemConfig: { __typename: 'SystemConfig', minDriverAge: newAge, maxUploadSizeMB: newMax } }
                });
            }
        });
    };

    const updateMaxUploadSizeMB = async (mb: number) => {
        const safeMax = Math.max(1, Math.floor(Number(mb) || 0)) || DEFAULT_MAX_UPLOAD_MB;
        const currentAge = Number(data?.systemConfig?.minDriverAge);
        const safeAge = Number.isFinite(currentAge) && currentAge > 0 ? currentAge : DEFAULT_MIN_AGE;

        await mutate({
            variables: { input: { maxUploadSizeMB: safeMax } },
            optimisticResponse: {
                updateSystemConfig: { minDriverAge: safeAge, maxUploadSizeMB: safeMax, __typename: 'SystemConfig' } as any
            },
            update: (cache, { data: resp }) => {
                const newAge = resp?.updateSystemConfig?.minDriverAge ?? safeAge;
                const newMax = resp?.updateSystemConfig?.maxUploadSizeMB ?? safeMax;
                cache.writeQuery({
                    query: SYSTEM_CONFIG_QUERY,
                    data: { systemConfig: { __typename: 'SystemConfig', minDriverAge: newAge, maxUploadSizeMB: newMax } }
                });
            }
        });
    };

    const ctx = useMemo<SystemConfigContextValue>(() => {
        const minDriverAge = Number(data?.systemConfig?.minDriverAge);
        const maxUploadSizeMB = Number(data?.systemConfig?.maxUploadSizeMB);
        return {
            minDriverAge: Number.isFinite(minDriverAge) && minDriverAge > 0 ? minDriverAge : DEFAULT_MIN_AGE,
            maxUploadSizeMB: Number.isFinite(maxUploadSizeMB) && maxUploadSizeMB > 0 ? maxUploadSizeMB : DEFAULT_MAX_UPLOAD_MB,
            loading,
            error: error ? String(error?.message || error) : null,
            updateMinDriverAge,
            updateMaxUploadSizeMB,
            refetch
        };
    }, [data?.systemConfig?.minDriverAge, data?.systemConfig?.maxUploadSizeMB, loading, error, updateMinDriverAge, updateMaxUploadSizeMB, refetch]);

    return React.createElement(SystemConfigContext.Provider, { value: ctx }, children);
}

export function useSystemConfig(): SystemConfigContextValue {
    return useContext(SystemConfigContext);
}
