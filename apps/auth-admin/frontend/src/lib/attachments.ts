export type OwnerType = 'vehicle' | 'driver' | 'work_order' | 'maintenance_record';

export type AttachmentListItem = {
    id: string;
    ownerType: OwnerType;
    ownerId: string;
    docType?: string | null;
    fileName: string;
    contentType?: string | null;
    storageUrl: string;
    sizeBytes?: number | null;
    createdAt?: string | null;
};

export type AttachmentContent = {
    id: string;
    fileName: string;
    contentType?: string | null;
    contentBase64: string; // data URL
};

function getBaseUrl(): string {
    const graphql = (import.meta as any).env?.VITE_GRAPHQL_URL || 'http://127.0.0.1:4000/graphql';
    const origin = new URL(graphql).origin;
    return origin;
}

export async function listAttachments(ownerType: OwnerType, ownerId: string, signal?: AbortSignal): Promise<AttachmentListItem[]> {
    const url = new URL('/attachments', getBaseUrl());
    url.searchParams.set('ownerType', ownerType);
    url.searchParams.set('ownerId', ownerId);
    const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'same-origin',
        signal
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`List attachments failed (${res.status}): ${text || res.statusText}`);
    }
    const body = await res.json();
    // Backend returns { items: [...] }
    return (body?.items ?? []) as AttachmentListItem[];
}

export async function getAttachmentContent(id: string, signal?: AbortSignal): Promise<AttachmentContent> {
    const url = new URL('/attachments/content', getBaseUrl());
    url.searchParams.set('id', id);
    const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'same-origin',
        signal
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Get attachment content failed (${res.status}): ${text || res.statusText}`);
    }
    return (await res.json()) as AttachmentContent;
}

export async function deleteAttachment(id: string, signal?: AbortSignal): Promise<boolean> {
    // Backend supports DELETE /attachments?id=
    const url = new URL('/attachments', getBaseUrl());
    url.searchParams.set('id', id);
    const res = await fetch(url.toString(), {
        method: 'DELETE',
        credentials: 'same-origin',
        signal
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Delete attachment failed (${res.status}): ${text || res.statusText}`);
    }
    const body = await res.json().catch(() => ({}));
    // Accept either { deleted: true } or 204/200 ok
    if (typeof body?.deleted === 'boolean') return body.deleted;
    return true;
}
