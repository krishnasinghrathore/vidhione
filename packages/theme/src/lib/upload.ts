/**
 * Simple REST upload client for sending small files to the backend /upload endpoint.
 * The backend creates an attachments row and returns { attachmentId, storageUrl, sizeBytes }.
 */
export type OwnerType = 'vehicle' | 'driver' | 'work_order' | 'maintenance_record';

export type DocType =
    | 'title_document'
    | 'registration_document'
    | 'inspection_document'
    | 'drivers_license_front'
    | 'drivers_license_back'
    | 'medical_card'
    | 'twic_card'
    | 'i9_form'
    | 'work_order_attachment'
    | 'maintenance_record_attachment'
    | 'other';

export type UploadResult = {
    attachmentId: string;
    storageUrl: string;
    sizeBytes: number;
};

function getUploadUrl(): string {
    const graphql = (import.meta as any).env?.VITE_GRAPHQL_URL || 'http://127.0.0.1:4000/graphql';
    const origin = new URL(graphql).origin;
    return `${origin}/upload`;
}

export async function fileToBase64(file: File): Promise<string> {
    // Return a DataURL so backend decoder can accept both raw base64 and dataURL
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error || new Error('File read error'));
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
    });
}

export async function uploadAttachment(params: { ownerType: OwnerType; ownerId: string; docType?: DocType; file: File; signal?: AbortSignal }): Promise<UploadResult> {
    const { ownerType, ownerId, docType, file, signal } = params;
    const contentBase64 = await fileToBase64(file);

    const res = await fetch(getUploadUrl(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ownerType,
            ownerId,
            docType: docType ?? 'other',
            fileName: file.name,
            contentType: file.type || undefined,
            contentBase64
        }),
        // If cookies are needed later, switch to 'include'
        credentials: 'same-origin',
        signal
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Upload failed (${res.status}): ${text || res.statusText}`);
    }
    return (await res.json()) as UploadResult;
}
