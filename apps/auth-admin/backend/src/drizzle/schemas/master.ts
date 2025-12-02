import { pgTable, uuid, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';
import { master } from './schema';

// Countries table
export const countries = master.table('countries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  isoCode2: varchar('iso_code_2', { length: 2 }).notNull().unique(),
  isoCode3: varchar('iso_code_3', { length: 3 }).notNull().unique(),
  phoneCode: varchar('phone_code', { length: 6 }),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// States table
export const states = master.table('states', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 10 }),
  countryId: uuid('country_id').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Cities table
export const cities = master.table('cities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  stateId: uuid('state_id').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Business Natures table
export const businessNatures = master.table('business_natures', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Company Fields table
export const companyFields = master.table('company_fields', {
  id: uuid('id').primaryKey().defaultRandom(),
  countryId: uuid('country_id').notNull(),
  fieldCategory: varchar('field_category', { length: 50 }).notNull(),
  fieldName: varchar('field_name', { length: 100 }).notNull(),
  labelKey: varchar('label_key', { length: 150 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Referral Sources table
export const referralSources = master.table('referral_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Service Zones table
export const serviceZones = master.table('service_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Service Ports table
export const servicePorts = master.table('service_ports', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
