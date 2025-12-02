# Auth-Admin System Architecture Plan

## Executive Summary

This document outlines the comprehensive plan for converting the existing project into a complete auth-admin system based on the provided ERD (Entity Relationship Diagram). The system will support multi-tenant authentication, user management, role-based access control, and dynamic company field management across multiple countries.

## Current Implementation Status

### ✅ Completed Components

1. **Backend Authentication System**

   - Complete Drizzle ORM schemas for auth and master data
   - GraphQL API with comprehensive type definitions and resolvers
   - JWT token-based authentication with refresh tokens
   - User registration, login, password reset, and email verification
   - Role-based access control (RBAC) with permissions system
   - Session management and audit logging

2. **Database Schema Implementation**

   - **Auth Schema**: Companies, users, roles, permissions, sessions, audit logs
   - **Master Schema**: Countries, states, cities, business natures, company fields
   - Proper foreign key relationships and constraints
   - Unique indexes and data integrity rules

3. **GraphQL API**
   - 350+ lines of type definitions covering all auth operations
   - 600+ lines of resolvers with full CRUD operations
   - Authentication context with JWT validation
   - Error handling and validation

### ❌ Missing Components (Critical Gaps)

1. **User Invitations System**

   - `user_invitations` table for pre-registration invites
   - Token-based invitation workflow
   - Invitation expiry and status tracking

2. **Multi-Company User Relationships**

   - `user_companies` junction table for users belonging to multiple companies
   - Company-specific roles and permissions

3. **Sales Schema**

   - `demo_requests` table for lead management
   - `demo_request_statuses` for workflow tracking
   - `demo_request_service_ports` for service associations

4. **Enhanced Dynamic Fields**
   - Country-specific field validation rules
   - Field dependency management
   - Required vs optional field logic

## Architecture Overview

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   GraphQL API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • Login/Register│    │ • Auth Resolvers│    │ • Auth Schema   │
│ • User Mgmt     │    │ • User Mgmt     │    │ • Master Schema │
│ • Company Mgmt  │    │ • Company Mgmt  │    │ • Sales Schema  │
│ • Dashboard     │    │ • Invitations   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema Structure

#### Auth Schema (`auth.*`)

- `companies` - Company profiles with dynamic fields
- `users` - User accounts with ASP.NET Identity fields
- `roles` - System roles
- `permissions` - Granular permissions
- `user_roles` - User-role assignments
- `role_permissions` - Role-permission mappings
- `user_companies` - Multi-company user relationships
- `user_invitations` - Pre-registration invitations
- `sessions` - User sessions
- `audit_logs` - Security audit trail
- `company_field_values` - Dynamic company field data

#### Master Schema (`master.*`)

- `countries` - Country reference data
- `states` - State/province data
- `cities` - City reference data
- `business_natures` - Types of businesses
- `company_fields` - Dynamic field definitions by country
- `referral_sources` - How users found the service
- `service_zones` - Geographic service areas
- `service_ports` - Service port definitions

#### Sales Schema (`sales.*`)

- `demo_requests` - Lead/demo requests
- `demo_request_statuses` - Status workflow
- `demo_request_service_ports` - Service associations

## Implementation Plan

### Phase 1: Core Missing Components (Priority: High)

1. **User Invitations System**

   - Create `user_invitations` table
   - Implement invitation token generation
   - Add invitation expiry logic
   - Create GraphQL mutations for sending invitations
   - Implement invitation acceptance workflow

2. **Multi-Company Architecture**

   - Create `user_companies` junction table
   - Update user authentication to support multiple companies
   - Implement company switching functionality
   - Update permission checks for company context

3. **Sales Schema Implementation**
   - Create sales schema and tables
   - Implement demo request management
   - Add status workflow tracking

### Phase 2: Enhanced Features (Priority: Medium)

4. **Dynamic Company Fields Enhancement**

   - Implement country-specific field validation
   - Add field dependency logic
   - Create field requirement rules
   - Update GraphQL resolvers for enhanced validation

5. **ASP.NET Identity Compliance**
   - Add missing Identity tables (AspNetRoleClaims, etc.)
   - Ensure full ASP.NET Identity compatibility
   - Update authentication flows

### Phase 3: Frontend Implementation (Priority: High)

6. **Authentication Pages**

   - Login page with GraphQL integration
   - Registration page with email verification
   - Password reset functionality
   - Invitation acceptance page

7. **Admin Dashboard**
   - User management interface
   - Company management interface
   - Role and permission management
   - Statistics and analytics

### Phase 4: Advanced Features (Priority: Low)

8. **Security Enhancements**

   - Rate limiting implementation
   - Advanced audit logging
   - Session management improvements
   - Security middleware

9. **Integration Features**
   - Token validation endpoints for other projects
   - Integration status monitoring
   - API documentation

## Key Technical Decisions

### 1. Multi-Tenant Architecture

- **Decision**: Company-based multi-tenancy with shared database
- **Rationale**: Simpler management, better resource utilization
- **Implementation**: Company ID in all relevant tables with proper RLS

### 2. Authentication Strategy

- **Decision**: JWT with refresh tokens + ASP.NET Identity compatibility
- **Rationale**: Industry standard, good security, framework compatibility
- **Implementation**: Custom JWT service with Identity integration

### 3. Dynamic Fields Approach

- **Decision**: Metadata-driven dynamic fields with country-specific rules
- **Rationale**: Flexible, maintainable, supports internationalization
- **Implementation**: `company_fields` + `company_field_values` tables

### 4. GraphQL Schema Design

- **Decision**: Comprehensive schema with proper type relationships
- **Rationale**: Type safety, self-documenting API, efficient queries
- **Implementation**: Modular schema with auth, master, and sales modules

## Risk Assessment

### High Risk

- **Multi-company user relationships**: Complex permission management
- **Dynamic field validation**: Country-specific business rules
- **Invitation workflow**: Token security and expiry management

### Medium Risk

- **ASP.NET Identity integration**: Compatibility issues
- **Frontend state management**: Complex authentication flows
- **Performance**: Multi-tenant queries and indexing

### Low Risk

- **Sales schema**: Standard CRUD operations
- **Audit logging**: Well-established patterns
- **Email services**: Standard implementation

## Success Metrics

1. **Functional Completeness**: All ERD tables and relationships implemented
2. **Security**: Zero authentication vulnerabilities
3. **Performance**: <500ms response times for auth operations
4. **User Experience**: Intuitive admin interface
5. **Maintainability**: Clean, documented, testable code

## Next Steps

1. **Immediate**: Implement user invitations system
2. **Week 1**: Complete missing database tables and relationships
3. **Week 2**: Enhance dynamic fields and GraphQL resolvers
4. **Week 3**: Begin frontend authentication pages
5. **Week 4**: Complete admin dashboard and user management
6. **Week 5**: Testing, security review, and deployment preparation

## Dependencies

- PostgreSQL 15+ for advanced features
- Node.js 18+ for backend
- React 18+ for frontend
- GraphQL 16+ for API
- Drizzle ORM for database operations
- JWT for authentication
- Email service for notifications

---

_This plan will be updated as implementation progresses and new requirements are discovered._
