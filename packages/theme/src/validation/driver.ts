import { z } from 'zod';

export const DriverStatusEnum = z.enum(['active', 'inactive', 'on_leave']);

export const DriverCreateSchema = z.object({
    id: z.string().trim().min(1, 'Please provide Driver ID.'),
    fullName: z.string().trim().min(1, 'Please provide Full Name.'),
    dateOfBirthIso: z
        .string()
        .trim()
        .refine((s) => !Number.isNaN(Date.parse(s)), 'Please provide a valid Date of Birth.'),
    status: DriverStatusEnum
});

export const DriverUpdateSchema = z.object({
    fullName: z.string().trim().min(1, 'Please provide Full Name.'),
    status: DriverStatusEnum
});

export type DriverCreateInputZ = z.infer<typeof DriverCreateSchema>;
export type DriverUpdateInputZ = z.infer<typeof DriverUpdateSchema>;
