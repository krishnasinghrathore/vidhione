import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sales } from './schema';

// Demo Request Statuses table
export const demoRequestStatuses = sales.table('demo_request_statuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Demo Requests table
export const demoRequests = sales.table('demo_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  companyName: varchar('company_name', { length: 200 }).notNull(),
  countryId: uuid('country_id').notNull(),
  stateId: uuid('state_id'),
  cityId: uuid('city_id'),
  referralSourceId: uuid('referral_source_id').notNull(),
  serviceZoneId: uuid('service_zone_id').notNull(),
  demoRequestStatusId: uuid('demo_request_status_id').notNull(),
  userId: uuid('user_id'), // Assigned user after conversion
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Demo Request Service Ports (many-to-many)
export const demoRequestServicePorts = sales.table('demo_request_service_ports', {
  id: uuid('id').primaryKey().defaultRandom(),
  demoRequestId: uuid('demo_request_id').notNull(),
  servicePortId: uuid('service_port_id').notNull(),
  quantity: integer('quantity').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Add unique constraint for demo_request_id + service_port_id
export const demoRequestServicePortsUnique = uniqueIndex('uq_demo_request_service_ports').on(
  demoRequestServicePorts.demoRequestId,
  demoRequestServicePorts.servicePortId
);

// Type exports
export type DemoRequestStatus = typeof demoRequestStatuses.$inferSelect;
export type NewDemoRequestStatus = typeof demoRequestStatuses.$inferInsert;

export type DemoRequest = typeof demoRequests.$inferSelect;
export type NewDemoRequest = typeof demoRequests.$inferInsert;

export type DemoRequestServicePort = typeof demoRequestServicePorts.$inferSelect;
export type NewDemoRequestServicePort = typeof demoRequestServicePorts.$inferInsert;
