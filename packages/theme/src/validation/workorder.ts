import { z } from 'zod';

// Optional ISO date string validator; allows empty string or undefined (not required)
export const OptionalIsoDate = z
    .string()
    .trim()
    .optional()
    .refine((s) => s == null || s === '' || !Number.isNaN(Date.parse(s)), 'Please provide a valid Due Date.');

/**
 * DB-driven validation:
 * - priority and status are string codes coming from master tables
 */
export const WorkOrderBaseSchema = z.object({
    number: z.string().trim().optional(),
    vehicleId: z.string().trim().min(1, 'Please select a vehicle.'),
    taskName: z.string().trim().min(1, 'Please provide a task name.'),
    description: z.string().trim().optional(),
    priority: z.string().trim().min(1, 'Please select a priority.'),
    dueDateIso: OptionalIsoDate,
    dueMeterReading: z.string().trim().optional(),
    estLaborHours: z
        .number()
        .min(0, 'Est. Labor Hours must be 0 or greater.')
        .optional(),
    estCost: z
        .number()
        .min(0, 'Est. Cost must be 0 or greater.')
        .optional(),
    status: z.string().trim().min(1, 'Please select a status.'),
    assignedTo: z.string().trim().optional()
});

// For this UI, create and update share the same constraints
export const WorkOrderCreateSchema = WorkOrderBaseSchema;
export const WorkOrderUpdateSchema = WorkOrderBaseSchema;

export type WorkOrderCreateInputZ = z.infer<typeof WorkOrderCreateSchema>;
export type WorkOrderUpdateInputZ = z.infer<typeof WorkOrderUpdateSchema>;
