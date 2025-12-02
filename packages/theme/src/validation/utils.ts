import { ZodError } from 'zod';

export function zodErrorToRecord(err: ZodError): Record<string, string> {
    const flat = err.flatten();
    const record: Record<string, string> = {};
    const fieldErrors = flat.fieldErrors as Record<string, string[] | undefined>;
    Object.keys(fieldErrors).forEach((key) => {
        const messages = fieldErrors[key];
        if (messages && messages.length > 0) {
            record[key] = messages[0];
        }
    });
    return record;
}
