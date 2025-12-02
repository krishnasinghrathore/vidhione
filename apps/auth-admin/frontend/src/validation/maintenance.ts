import { z } from 'zod';

export const CompletionTypeEnum = z.enum(['in_house', 'vendor']);

export const DateYYYYMMDD = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a maintenance date.');

export const ServiceDescription = z.string().trim().min(1, 'Service description cannot be empty');

export const MaintenanceRecordCreateSchema = z.object({
    vehicleId: z.string().trim().min(1, 'Please select a vehicle.'),
    serviceDate: DateYYYYMMDD,
    maintenanceCompletionTypeId: z.string().trim().min(1, 'Please select a completion type.'),
    completedBy: z.string().trim().min(1, 'Please enter who completed the maintenance.'),
    services: z.array(ServiceDescription).min(1, 'Please add at least one service.')
});

export type MaintenanceRecordCreateInputZ = z.infer<typeof MaintenanceRecordCreateSchema>;
