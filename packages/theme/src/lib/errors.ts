/**
 * Standardized GraphQL/Apollo error extraction for UI messages.
 * Tries to surface the most relevant/clean message for toasts or inline display.
 */
export function getGraphQLErrorMessage(err: any): string {
    try {
        if (!err) return 'Unexpected error';

        // If it's already a string
        if (typeof err === 'string') return normalizeDatabaseMessage(err);

        // Apollo error shape
        const graphQLErrors = (err.graphQLErrors ?? err?.cause?.graphQLErrors) as any[] | undefined;
        const networkError = (err.networkError ?? err?.cause?.networkError) as any | undefined;
        const directMessage = (err.message ?? err?.cause?.message) as string | undefined;

        const pick = (...vals: any[]) => {
            for (const v of vals) {
                if (typeof v === 'string' && v.trim()) return v;
            }
            return undefined;
        };

        // 1) GraphQL errors from server (preferred)
        if (Array.isArray(graphQLErrors) && graphQLErrors.length > 0) {
            for (const e of graphQLErrors) {
                const found = pick(
                    e?.message,
                    e?.extensions?.message,
                    e?.extensions?.response?.message,
                    Array.isArray(e?.extensions?.errors) ? e?.extensions?.errors?.[0]?.message : undefined,
                    e?.extensions?.originalError?.message,
                    e?.extensions?.exception?.message
                );
                if (found) return normalizeDatabaseMessage(found);
            }
            const fallback = graphQLErrors[0]?.message;
            if (fallback) return normalizeDatabaseMessage(fallback);
        }

        // 2) Network error (fetch/server unavailable or HTTP error)
        if (networkError) {
            const found = pick(
                (networkError as any)?.result?.errors?.[0]?.message,
                (networkError as any)?.result?.message,
                (networkError as any)?.message,
                (networkError as any)?.statusText
            );
            if (found) return normalizeDatabaseMessage(found);
        }

        // 3) Direct message fallback
        if (directMessage) return normalizeDatabaseMessage(directMessage);

        // 4) As a last resort, toString / JSON
        if (typeof err?.toString === 'function') {
            const str = String(err);
            if (str && str !== '[object Object]') return normalizeDatabaseMessage(str);
        }
        try {
            const json = JSON.stringify(err);
            if (json && json !== '{}') return normalizeDatabaseMessage(json);
        } catch {}

        return 'Operation failed. Please try again.';
    } catch {
        return 'Operation failed. Please try again.';
    }
}

/**
 * Attempt to map low-level DB/constraint messages to user-friendly ones.
 */
function normalizeDatabaseMessage(message: string): string {
    let msg = String(message ?? '').trim();

    // Try to extract from JSON-ish payloads
    try {
        if (msg.startsWith('{') || msg.startsWith('[')) {
            const data = JSON.parse(msg);
            const extracted =
                (data && (data.message || data.error || (Array.isArray(data.errors) ? data.errors[0]?.message : undefined))) || undefined;
            if (extracted) msg = String(extracted);
        }
    } catch {}

    // Strip common prefixes added by Apollo/GraphQL or generic Error wrappers
    msg = msg
        .replace(/^GraphQL\s*error:\s*/i, '')
        .replace(/^Network\s*error:\s*/i, '')
        .replace(/^ApolloError:\s*/i, '')
        .replace(/^Error:\s*/i, '')
        .trim();

    // Common Postgres/SQL constraint patterns and generic duplicates
    if (/duplicate key value|unique constraint|already exists/i.test(msg)) {
        if (/vin/i.test(msg)) return 'VIN already exists.';
        if (/unit(_|\s)?number/i.test(msg)) return 'Unit number already exists.';
        if (/name/i.test(msg)) return 'Name already exists.';
        return 'Record already exists.';
    }

    if (/foreign key constraint|referenced by existing/i.test(msg)) {
        return 'This item is referenced by other records and cannot be modified.';
    }

    if (/violates not-null constraint|null value|required/i.test(msg)) {
        return 'Required data is missing.';
    }

    if (/invalid input syntax|invalid data format/i.test(msg)) {
        return 'Invalid data format.';
    }

    if (/permission denied|unauthorized|forbidden/i.test(msg)) {
        return 'You do not have permission to perform this action.';
    }

    // Default to the cleaned original message
    return msg;
}
