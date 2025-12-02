import { pgSchema } from 'drizzle-orm/pg-core';

/**
 * Auth schema for authentication and authorization tables
 */
export const auth = pgSchema('auth');

/**
 * Master schema for reference data tables
 */
export const master = pgSchema('master');

/**
 * Sales schema for sales and lead management tables
 */
export const sales = pgSchema('sales');
