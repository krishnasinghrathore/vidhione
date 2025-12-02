import { z } from 'zod';

export const VehicleStatusEnum = z.enum(['operational', 'maintenance', 'out_of_service']);

export const Vin17 = z.string().regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Please enter a valid 17-character VIN (A-H, J-N, P, R-Z, 0-9). Letters I, O, Q are not allowed.');

export const VehicleCreateSchema = z.object({
    unitNumber: z.string().trim().min(1, 'Please provide Unit Number.'),
    status: VehicleStatusEnum,
    vin: Vin17
});

export type VehicleCreateInputZ = z.infer<typeof VehicleCreateSchema>;
