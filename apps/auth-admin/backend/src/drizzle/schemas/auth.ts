import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  integer,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { auth } from './schema';

// Companies table
export const companies = auth.table('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  businessNatureId: uuid('business_nature_id').notNull(),
  address: varchar('address', { length: 200 }).notNull(),
  cityId: uuid('city_id').notNull(),
  stateId: uuid('state_id').notNull(),
  countryId: uuid('country_id').notNull(),
  zipCode: varchar('zip_code', { length: 20 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  mobile: varchar('mobile', { length: 20 }).notNull(),
  altPhone: varchar('alt_phone', { length: 20 }),
  email: varchar('email', { length: 256 }).notNull(),
  altEmail: varchar('alt_email', { length: 256 }),
  website: varchar('website', { length: 250 }),
  isProfileComplete: boolean('is_profile_complete').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Users table
export const users = auth.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  normalizedEmail: varchar('normalized_email', { length: 256 }).notNull(),
  emailConfirmed: boolean('email_confirmed').notNull().default(false),
  passwordHash: text('password_hash'),
  securityStamp: text('security_stamp'),
  concurrencyStamp: text('concurrency_stamp').notNull().default(''),
  phoneNumber: text('phone_number'),
  phoneNumberConfirmed: boolean('phone_number_confirmed').notNull().default(false),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  lockoutEnd: timestamp('lockout_end', { withTimezone: true }),
  lockoutEnabled: boolean('lockout_enabled').notNull().default(true),
  accessFailedCount: integer('access_failed_count').notNull().default(0),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Roles table
export const roles = auth.table('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  normalizedName: varchar('normalized_name', { length: 256 }).notNull(),
  concurrencyStamp: text('concurrency_stamp').notNull().default(''),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Permissions table
export const permissions = auth.table('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  resource: varchar('resource', { length: 100 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// User Roles (many-to-many)
export const userRoles = auth.table(
  'user_roles',
  {
    userId: uuid('user_id').notNull(),
    roleId: uuid('role_id').notNull(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.roleId),
  })
);

// Role Permissions (many-to-many)
export const rolePermissions = auth.table(
  'role_permissions',
  {
    roleId: uuid('role_id').notNull(),
    permissionId: uuid('permission_id').notNull(),
  },
  (table) => ({
    pk: primaryKey(table.roleId, table.permissionId),
  })
);

// User Claims
export const userClaims = auth.table('user_claims', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull(),
  claimType: text('claim_type'),
  claimValue: text('claim_value'),
});

// User Logins
export const userLogins = auth.table(
  'user_logins',
  {
    loginProvider: text('login_provider').notNull(),
    providerKey: text('provider_key').notNull(),
    providerDisplayName: text('provider_display_name'),
    userId: uuid('user_id').notNull(),
  },
  (table) => ({
    pk: primaryKey(table.loginProvider, table.providerKey),
  })
);

// User Tokens
export const userTokens = auth.table(
  'user_tokens',
  {
    userId: uuid('user_id').notNull(),
    loginProvider: text('login_provider').notNull(),
    name: text('name').notNull(),
    value: text('value'),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.loginProvider, table.name),
  })
);

// Sessions table
export const sessions = auth.table('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  token: text('token').notNull(),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  refreshExpiresAt: timestamp('refresh_expires_at', { withTimezone: true }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Audit Logs table
export const auditLogs = auth.table('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  resourceId: uuid('resource_id'),
  details: text('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Company Field Values table
export const companyFieldValues = auth.table(
  'company_field_values',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').notNull(),
    companyFieldId: uuid('company_field_id').notNull(),
    fieldValue: varchar('field_value', { length: 200 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueCompanyField: uniqueIndex('uq_company_field_values').on(table.companyId, table.companyFieldId),
  })
);

// Email verification tokens
export const emailVerificationTokens = auth.table('email_verification_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = auth.table('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// User Invitations table
export const userInvitations = auth.table('user_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 256 }).notNull(),
  companyId: uuid('company_id').notNull(),
  roleId: uuid('role_id').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isUsed: boolean('is_used').notNull().default(false),
  invitedBy: uuid('invited_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// User Companies (many-to-many relationship)
export const userCompanies = auth.table('user_companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  companyId: uuid('company_id').notNull(),
  roleId: uuid('role_id').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Role Claims (ASP.NET Identity compatibility)
export const roleClaims = auth.table('role_claims', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  roleId: uuid('role_id').notNull(),
  claimType: text('claim_type'),
  claimValue: text('claim_value'),
});
