export const typeDefs = `#graphql
  # Enums
  enum UserStatus {
    ACTIVE
    INACTIVE
    DELETED
  }

  enum AuthProvider {
    LOCAL
    GOOGLE
    MICROSOFT
  }

  # Types
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    isActive: Boolean!
    emailConfirmed: Boolean!
    phoneNumber: String
    phoneNumberConfirmed: Boolean!
    twoFactorEnabled: Boolean!
    lockoutEnabled: Boolean!
    lockoutEnd: DateTime
    accessFailedCount: Int!
    lastLoginAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    company: Company
    roles: [Role!]!
    permissions: [Permission!]!
  }

  type Company {
    id: ID!
    name: String!
    address: String!
    city: String!
    state: String!
    country: String!
    zipCode: String!
    phone: String!
    mobile: String!
    altPhone: String
    email: String!
    altEmail: String
    website: String
    isProfileComplete: Boolean!
    isActive: Boolean!
    businessNature: BusinessNature
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Role {
    id: ID!
    name: String!
    normalizedName: String!
    isActive: Boolean!
    permissions: [Permission!]!
    userCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Permission {
    id: ID!
    name: String!
    description: String
    resource: String!
    action: String!
    isActive: Boolean!
    roles: [Role!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type BusinessNature {
    id: ID!
    name: String!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthResponse {
    user: User!
    token: String!
    refreshToken: String!
    expiresAt: DateTime!
  }

  type RegisterResponse {
    user: User!
    emailVerificationRequired: Boolean!
    message: String!
  }

  type PasswordResetResponse {
    success: Boolean!
    message: String!
  }

  type EmailVerificationResponse {
    success: Boolean!
    message: String!
  }

  type Session {
    id: ID!
    user: User!
    token: String!
    expiresAt: DateTime!
    ipAddress: String
    userAgent: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuditLog {
    id: ID!
    user: User
    action: String!
    resource: String!
    resourceId: ID
    details: String
    ipAddress: String
    userAgent: String
    createdAt: DateTime!
  }

  # Auth Statistics
  type AuthStats {
    totalUsers: Int!
    activeUsers: Int!
    totalCompanies: Int!
    activeCompanies: Int!
    totalRoles: Int!
    recentLogins: Int!
    failedLoginAttempts: Int!
  }

  # Inputs
  input LoginInput {
    email: String!
    password: String!
    rememberMe: Boolean
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    companyName: String!
    phoneNumber: String
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input ResetPasswordInput {
    token: String!
    email: String!
    newPassword: String!
  }

  input ForgotPasswordInput {
    email: String!
  }

  input VerifyEmailInput {
    token: String!
    email: String!
  }

  input CreateUserInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    companyId: ID!
    phoneNumber: String
    roleIds: [ID!]
  }

  input UpdateUserInput {
    id: ID!
    email: String
    firstName: String
    lastName: String
    phoneNumber: String
    isActive: Boolean
    roleIds: [ID!]
  }

  input CreateCompanyInput {
    name: String!
    businessNatureId: ID!
    address: String!
    cityId: ID!
    stateId: ID!
    countryId: ID!
    zipCode: String!
    phone: String!
    mobile: String!
    email: String!
    altPhone: String
    altEmail: String
    website: String
  }

  input UpdateCompanyInput {
    id: ID!
    name: String
    address: String
    cityId: ID
    stateId: ID
    countryId: ID
    zipCode: String
    phone: String
    mobile: String
    altPhone: String
    altEmail: String
    website: String
    isActive: Boolean
  }

  input CreateRoleInput {
    name: String!
    permissionIds: [ID!]
  }

  input UpdateRoleInput {
    id: ID!
    name: String
    permissionIds: [ID!]
    isActive: Boolean
  }

  input CreatePermissionInput {
    name: String!
    description: String
    resource: String!
    action: String!
  }

  input UpdatePermissionInput {
    id: ID!
    name: String
    description: String
    resource: String
    action: String
    isActive: Boolean
  }

  # Queries
  type Query {
    # Auth queries
    me: User
    validateToken: Boolean!

    # User management
    users(limit: Int, offset: Int, search: String, companyId: ID, isActive: Boolean): [User!]!
    user(id: ID!): User
    userCount(search: String, companyId: ID, isActive: Boolean): Int!

    # Company management
    companies(limit: Int, offset: Int, search: String, isActive: Boolean): [Company!]!
    company(id: ID!): Company
    companyCount(search: String, isActive: Boolean): Int!

    # Role management
    roles(limit: Int, offset: Int, search: String, isActive: Boolean): [Role!]!
    role(id: ID!): Role
    roleCount(search: String, isActive: Boolean): Int!

    # Permission management
    permissions(limit: Int, offset: Int, search: String, isActive: Boolean): [Permission!]!
    permission(id: ID!): Permission
    permissionCount(search: String, isActive: Boolean): Int!

    # Business natures
    businessNatures(limit: Int, offset: Int, search: String, isActive: Boolean): [BusinessNature!]!
    businessNature(id: ID!): BusinessNature

    # Sessions and audit
    userSessions(userId: ID!, limit: Int, offset: Int): [Session!]!
    auditLogs(
      limit: Int
      offset: Int
      userId: ID
      action: String
      resource: String
      startDate: DateTime
      endDate: DateTime
    ): [AuditLog!]!
    auditLogCount(userId: ID, action: String, resource: String, startDate: DateTime, endDate: DateTime): Int!

    # Statistics
    authStats: AuthStats!
  }

  # Mutations
  type Mutation {
    # Authentication
    login(input: LoginInput!): AuthResponse!
    register(input: RegisterInput!): RegisterResponse!
    logout: Boolean!
    refreshToken(refreshToken: String!): AuthResponse!
    changePassword(input: ChangePasswordInput!): Boolean!
    forgotPassword(input: ForgotPasswordInput!): PasswordResetResponse!
    resetPassword(input: ResetPasswordInput!): PasswordResetResponse!
    verifyEmail(input: VerifyEmailInput!): EmailVerificationResponse!
    resendEmailVerification(email: String!): EmailVerificationResponse!

    # User management
    createUser(input: CreateUserInput!): User!
    updateUser(input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    activateUser(id: ID!): Boolean!
    deactivateUser(id: ID!): Boolean!

    # Company management
    createCompany(input: CreateCompanyInput!): Company!
    updateCompany(input: UpdateCompanyInput!): Company!
    deleteCompany(id: ID!): Boolean!
    activateCompany(id: ID!): Boolean!
    deactivateCompany(id: ID!): Boolean!

    # Role management
    createRole(input: CreateRoleInput!): Role!
    updateRole(input: UpdateRoleInput!): Role!
    deleteRole(id: ID!): Boolean!
    activateRole(id: ID!): Boolean!
    deactivateRole(id: ID!): Boolean!

    # Permission management
    createPermission(input: CreatePermissionInput!): Permission!
    updatePermission(input: UpdatePermissionInput!): Permission!
    deletePermission(id: ID!): Boolean!
    activatePermission(id: ID!): Boolean!
    deactivatePermission(id: ID!): Boolean!

    # Session management
    revokeSession(sessionId: ID!): Boolean!
    revokeAllUserSessions(userId: ID!): Boolean!
  }

  # User Invitation types
  type UserInvitation {
    id: ID!
    email: String!
    company: Company!
    role: Role!
    token: String!
    expiresAt: DateTime!
    isUsed: Boolean!
    invitedBy: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # User Company relationship
  type UserCompany {
    id: ID!
    user: User!
    company: Company!
    role: Role!
    isActive: Boolean!
    joinedAt: DateTime!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Invitation inputs
  input CreateInvitationInput {
    email: String!
    companyId: ID!
    roleId: ID!
    expiresInDays: Int
  }

  input AcceptInvitationInput {
    token: String!
    password: String!
    firstName: String!
    lastName: String!
    phoneNumber: String
  }

  # Invitation responses
  type InvitationResponse {
    success: Boolean!
    message: String!
    invitation: UserInvitation
  }

  type AcceptInvitationResponse {
    success: Boolean!
    message: String!
    user: User
    token: String
  }

  # Add to existing Query type
  type Query {
    # ... existing queries ...

    # User invitations
    userInvitations(limit: Int, offset: Int, companyId: ID, isUsed: Boolean): [UserInvitation!]!
    userInvitation(id: ID!): UserInvitation
    userInvitationByToken(token: String!): UserInvitation

    # User companies
    userCompanies(userId: ID, companyId: ID, limit: Int, offset: Int): [UserCompany!]!
    userCompany(id: ID!): UserCompany
  }

  # Add to existing Mutation type
  type Mutation {
    # ... existing mutations ...

    # User invitations
    createInvitation(input: CreateInvitationInput!): InvitationResponse!
    resendInvitation(invitationId: ID!): InvitationResponse!
    cancelInvitation(invitationId: ID!): Boolean!
    acceptInvitation(input: AcceptInvitationInput!): AcceptInvitationResponse!

    # User company management
    addUserToCompany(userId: ID!, companyId: ID!, roleId: ID!): UserCompany!
    updateUserCompanyRole(userCompanyId: ID!, roleId: ID!): UserCompany!
    removeUserFromCompany(userCompanyId: ID!): Boolean!
    switchUserCompany(userCompanyId: ID!): Boolean!
  }

  # Subscriptions (if needed)
  type Subscription {
    userStatusChanged(userId: ID!): User!
    auditLogCreated: AuditLog!
    invitationCreated: UserInvitation!
    invitationAccepted(invitationId: ID!): User!
  }
`;
