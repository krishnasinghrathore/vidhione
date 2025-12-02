import { Resolvers } from '../../../types/graphql';
import { db } from '../../../drizzle/client';
import {
  users,
  companies,
  roles,
  permissions,
  userRoles,
  rolePermissions,
  sessions,
  auditLogs,
  emailVerificationTokens,
  passwordResetTokens,
  userInvitations,
  userCompanies,
} from '../../../drizzle/schemas';
import { eq, and, ilike, desc, sql, count } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Helper functions
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (payload: any, expiresIn: string = JWT_EXPIRES_IN): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const logAuditEvent = async (
  userId: string | null,
  action: string,
  resource: string,
  resourceId: string | null = null,
  details: string | null = null,
  ipAddress: string | null = null,
  userAgent: string | null = null
) => {
  await db.insert(auditLogs).values({
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
  });
};

export const resolvers: Resolvers = {
  Query: {
    // Auth queries
    me: async (_, __, { user }) => {
      if (!user) return null;
      return await db.query.users.findFirst({
        where: eq(users.id, user.id),
        with: {
          company: true,
          userRoles: {
            with: {
              role: {
                with: {
                  rolePermissions: {
                    with: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    },

    validateToken: async (_, __, { user }) => {
      return !!user;
    },

    // User management
    users: async (_, { limit = 10, offset = 0, search, companyId, isActive }) => {
      const whereConditions = [];

      if (search) {
        whereConditions.push(ilike(users.email, `%${search}%`));
      }

      if (companyId) {
        whereConditions.push(eq(users.companyId, companyId));
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(users.isActive, isActive));
      }

      return await db.query.users.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        limit,
        offset,
        with: {
          company: true,
          userRoles: {
            with: {
              role: true,
            },
          },
        },
        orderBy: desc(users.createdAt),
      });
    },

    user: async (_, { id }) => {
      return await db.query.users.findFirst({
        where: eq(users.id, id),
        with: {
          company: true,
          userRoles: {
            with: {
              role: {
                with: {
                  rolePermissions: {
                    with: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    },

    userCount: async (_, { search, companyId, isActive }) => {
      const whereConditions = [];

      if (search) {
        whereConditions.push(ilike(users.email, `%${search}%`));
      }

      if (companyId) {
        whereConditions.push(eq(users.companyId, companyId));
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(users.isActive, isActive));
      }

      const result = await db
        .select({ count: count() })
        .from(users)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      return result[0].count;
    },

    // Company management
    companies: async (_, { limit = 10, offset = 0, search, isActive }) => {
      const whereConditions = [];

      if (search) {
        whereConditions.push(ilike(companies.name, `%${search}%`));
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(companies.isActive, isActive));
      }

      return await db.query.companies.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        limit,
        offset,
        with: {
          businessNature: true,
        },
        orderBy: desc(companies.createdAt),
      });
    },

    company: async (_, { id }) => {
      return await db.query.companies.findFirst({
        where: eq(companies.id, id),
        with: {
          businessNature: true,
        },
      });
    },

    companyCount: async (_, { search, isActive }) => {
      const whereConditions = [];

      if (search) {
        whereConditions.push(ilike(companies.name, `%${search}%`));
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(companies.isActive, isActive));
      }

      const result = await db
        .select({ count: count() })
        .from(companies)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      return result[0].count;
    },

    // Role management
    roles: async (_, { limit = 10, offset = 0, search, isActive }) => {
      const whereConditions = [];

      if (search) {
        whereConditions.push(ilike(roles.name, `%${search}%`));
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(roles.isActive, isActive));
      }

      return await db.query.roles.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        limit,
        offset,
        with: {
          rolePermissions: {
            with: {
              permission: true,
            },
          },
        },
        orderBy: desc(roles.createdAt),
      });
    },

    role: async (_, { id }) => {
      return await db.query.roles.findFirst({
        where: eq(roles.id, id),
        with: {
          rolePermissions: {
            with: {
              permission: true,
            },
          },
        },
      });
    },

    roleCount: async (_, { search, isActive }) => {
      const whereConditions = [];

      if (search) {
        whereConditions.push(ilike(roles.name, `%${search}%`));
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(roles.isActive, isActive));
      }

      const result = await db
        .select({ count: count() })
        .from(roles)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      return result[0].count;
    },

    // Statistics
    authStats: async () => {
      const [userStats] = await db
        .select({
          totalUsers: count(),
          activeUsers: sql<number>`count(case when ${users.isActive} = true then 1 end)`,
        })
        .from(users);

      const [companyStats] = await db
        .select({
          totalCompanies: count(),
          activeCompanies: sql<number>`count(case when ${companies.isActive} = true then 1 end)`,
        })
        .from(companies);

      const [roleStats] = await db
        .select({
          totalRoles: count(),
        })
        .from(roles);

      // Recent logins (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const [recentLogins] = await db
        .select({ count: count() })
        .from(auditLogs)
        .where(and(eq(auditLogs.action, 'LOGIN'), sql`${auditLogs.createdAt} > ${yesterday}`));

      // Failed login attempts (last 24 hours)
      const [failedAttempts] = await db
        .select({ count: count() })
        .from(auditLogs)
        .where(and(eq(auditLogs.action, 'LOGIN_FAILED'), sql`${auditLogs.createdAt} > ${yesterday}`));

      return {
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeUsers,
        totalCompanies: companyStats.totalCompanies,
        activeCompanies: companyStats.activeCompanies,
        totalRoles: roleStats.totalRoles,
        recentLogins: recentLogins.count,
        failedLoginAttempts: failedAttempts.count,
      };
    },

    // User Invitations
    userInvitations: async (_, { limit = 10, offset = 0, companyId, isUsed }) => {
      const whereConditions = [];

      if (companyId) {
        whereConditions.push(eq(userInvitations.companyId, companyId));
      }

      if (isUsed !== undefined) {
        whereConditions.push(eq(userInvitations.isUsed, isUsed));
      }

      return await db.query.userInvitations.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        limit,
        offset,
        with: {
          company: true,
          role: true,
          invitedBy: true,
        },
        orderBy: desc(userInvitations.createdAt),
      });
    },

    userInvitation: async (_, { id }) => {
      return await db.query.userInvitations.findFirst({
        where: eq(userInvitations.id, id),
        with: {
          company: true,
          role: true,
          invitedBy: true,
        },
      });
    },

    userInvitationByToken: async (_, { token }) => {
      return await db.query.userInvitations.findFirst({
        where: eq(userInvitations.token, token),
        with: {
          company: true,
          role: true,
          invitedBy: true,
        },
      });
    },

    // User Companies
    userCompanies: async (_, { userId, companyId, limit = 10, offset = 0 }) => {
      const whereConditions = [];

      if (userId) {
        whereConditions.push(eq(userCompanies.userId, userId));
      }

      if (companyId) {
        whereConditions.push(eq(userCompanies.companyId, companyId));
      }

      return await db.query.userCompanies.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        limit,
        offset,
        with: {
          user: true,
          company: true,
          role: true,
        },
        orderBy: desc(userCompanies.joinedAt),
      });
    },

    userCompany: async (_, { id }) => {
      return await db.query.userCompanies.findFirst({
        where: eq(userCompanies.id, id),
        with: {
          user: true,
          company: true,
          role: true,
        },
      });
    },
  },

  Mutation: {
    // Authentication
    login: async (_, { input }, { req }) => {
      const { email, password } = input;

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
        with: {
          company: true,
          userRoles: {
            with: {
              role: {
                with: {
                  rolePermissions: {
                    with: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || !user.passwordHash) {
        await logAuditEvent(
          null,
          'LOGIN_FAILED',
          'USER',
          null,
          'Invalid credentials',
          req?.ip,
          req?.headers['user-agent']
        );
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        await logAuditEvent(
          user.id,
          'LOGIN_FAILED',
          'USER',
          user.id,
          'Account deactivated',
          req?.ip,
          req?.headers['user-agent']
        );
        throw new Error('Account is deactivated');
      }

      if (!user.emailConfirmed) {
        throw new Error('Please verify your email before logging in');
      }

      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        // Increment failed login attempts
        await db
          .update(users)
          .set({
            accessFailedCount: user.accessFailedCount + 1,
            lockoutEnd: user.accessFailedCount >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null, // 15 minutes lockout
          })
          .where(eq(users.id, user.id));

        await logAuditEvent(
          user.id,
          'LOGIN_FAILED',
          'USER',
          user.id,
          'Invalid password',
          req?.ip,
          req?.headers['user-agent']
        );
        throw new Error('Invalid email or password');
      }

      // Reset failed login attempts on successful login
      await db
        .update(users)
        .set({
          accessFailedCount: 0,
          lockoutEnd: null,
          lastLoginAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Generate tokens
      const tokenPayload = {
        id: user.id,
        email: user.email,
        companyId: user.companyId,
        roles: user.userRoles.map((ur) => ur.role.name),
      };

      const token = generateToken(tokenPayload);
      const refreshToken = generateToken({ id: user.id }, REFRESH_TOKEN_EXPIRES_IN);

      // Create session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

      await db.insert(sessions).values({
        userId: user.id,
        token,
        refreshToken,
        expiresAt,
        ipAddress: req?.ip,
        userAgent: req?.headers['user-agent'],
      });

      await logAuditEvent(user.id, 'LOGIN', 'USER', user.id, 'Successful login', req?.ip, req?.headers['user-agent']);

      return {
        user,
        token,
        refreshToken,
        expiresAt,
      };
    },

    register: async (_, { input }) => {
      const { email, password, firstName, lastName, companyName, phoneNumber } = input;

      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create company
      const [company] = await db
        .insert(companies)
        .values({
          name: companyName,
          email,
          phone: phoneNumber || '',
          mobile: phoneNumber || '',
          address: '',
          cityId: '', // Will need to be set later
          stateId: '',
          countryId: '',
          zipCode: '',
          isProfileComplete: false,
        })
        .returning();

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const [user] = await db
        .insert(users)
        .values({
          companyId: company.id,
          email,
          normalizedEmail: email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          phoneNumber,
          emailConfirmed: false,
        })
        .returning();

      // Generate email verification token
      const verificationToken = uuidv4();
      await db.insert(emailVerificationTokens).values({
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // TODO: Send email verification email

      await logAuditEvent(user.id, 'REGISTER', 'USER', user.id, 'User registration');

      return {
        user,
        emailVerificationRequired: true,
        message: 'Registration successful. Please check your email to verify your account.',
      };
    },

    logout: async (_, __, { user, token }) => {
      if (user && token) {
        await db.update(sessions).set({ isActive: false }).where(eq(sessions.token, token));

        await logAuditEvent(user.id, 'LOGOUT', 'USER', user.id, 'User logout');
      }
      return true;
    },

    // User management
    createUser: async (_, { input }, { user: currentUser }) => {
      const { email, password, firstName, lastName, companyId, phoneNumber, roleIds } = input;

      // Check permissions
      // TODO: Add permission check

      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          companyId,
          email,
          normalizedEmail: email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          phoneNumber,
          emailConfirmed: true, // Admin created users are auto-verified
        })
        .returning();

      // Assign roles
      if (roleIds && roleIds.length > 0) {
        const roleInserts = roleIds.map((roleId) => ({
          userId: newUser.id,
          roleId,
        }));
        await db.insert(userRoles).values(roleInserts);
      }

      await logAuditEvent(currentUser?.id || null, 'CREATE_USER', 'USER', newUser.id, 'User created by admin');

      return await db.query.users.findFirst({
        where: eq(users.id, newUser.id),
        with: {
          company: true,
          userRoles: {
            with: {
              role: true,
            },
          },
        },
      });
    },

    updateUser: async (_, { input }, { user: currentUser }) => {
      const { id, email, firstName, lastName, phoneNumber, isActive, roleIds } = input;

      // Check permissions
      // TODO: Add permission check

      const updateData: any = {};
      if (email !== undefined) {
        updateData.email = email;
        updateData.normalizedEmail = email.toLowerCase();
      }
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (isActive !== undefined) updateData.isActive = isActive;

      await db.update(users).set(updateData).where(eq(users.id, id));

      // Update roles if provided
      if (roleIds !== undefined) {
        // Remove existing roles
        await db.delete(userRoles).where(eq(userRoles.userId, id));

        // Add new roles
        if (roleIds.length > 0) {
          const roleInserts = roleIds.map((roleId) => ({
            userId: id,
            roleId,
          }));
          await db.insert(userRoles).values(roleInserts);
        }
      }

      await logAuditEvent(currentUser?.id || null, 'UPDATE_USER', 'USER', id, 'User updated');

      return await db.query.users.findFirst({
        where: eq(users.id, id),
        with: {
          company: true,
          userRoles: {
            with: {
              role: true,
            },
          },
        },
      });
    },

    deleteUser: async (_, { id }, { user: currentUser }) => {
      // Check permissions
      // TODO: Add permission check

      // Soft delete by deactivating
      await db.update(users).set({ isActive: false }).where(eq(users.id, id));

      await logAuditEvent(currentUser?.id || null, 'DELETE_USER', 'USER', id, 'User deactivated');

      return true;
    },

    activateUser: async (_, { id }, { user: currentUser }) => {
      await db.update(users).set({ isActive: true }).where(eq(users.id, id));
      await logAuditEvent(currentUser?.id || null, 'ACTIVATE_USER', 'USER', id, 'User activated');
      return true;
    },

    deactivateUser: async (_, { id }, { user: currentUser }) => {
      await db.update(users).set({ isActive: false }).where(eq(users.id, id));
      await logAuditEvent(currentUser?.id || null, 'DEACTIVATE_USER', 'USER', id, 'User deactivated');
      return true;
    },

    // User Invitations
    createInvitation: async (_, { input }, { user: currentUser }) => {
      const { email, companyId, roleId, expiresInDays = 7 } = input;

      // Check if invitation already exists and is not used
      const existingInvitation = await db.query.userInvitations.findFirst({
        where: and(
          eq(userInvitations.email, email),
          eq(userInvitations.companyId, companyId),
          eq(userInvitations.isUsed, false)
        ),
      });

      if (existingInvitation) {
        throw new Error('An active invitation already exists for this email and company');
      }

      // Check if user already exists in the company
      const existingUserCompany = await db.query.userCompanies.findFirst({
        where: and(
          eq(userCompanies.companyId, companyId),
          eq(
            userCompanies.userId,
            await db.query.users
              .findFirst({
                where: eq(users.email, email),
                select: { id: true },
              })
              .then((u) => u?.id || '')
          )
        ),
      });

      if (existingUserCompany) {
        throw new Error('User is already a member of this company');
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const invitationToken = uuidv4();

      const [invitation] = await db
        .insert(userInvitations)
        .values({
          email,
          companyId,
          roleId,
          token: invitationToken,
          expiresAt,
          invitedBy: currentUser?.id,
        })
        .returning();

      await logAuditEvent(
        currentUser?.id || null,
        'CREATE_INVITATION',
        'USER_INVITATION',
        invitation.id,
        `Invitation created for ${email}`
      );

      return {
        success: true,
        message: 'Invitation created successfully',
        invitation: await db.query.userInvitations.findFirst({
          where: eq(userInvitations.id, invitation.id),
          with: {
            company: true,
            role: true,
            invitedBy: true,
          },
        }),
      };
    },

    resendInvitation: async (_, { invitationId }, { user: currentUser }) => {
      const invitation = await db.query.userInvitations.findFirst({
        where: eq(userInvitations.id, invitationId),
      });

      if (!invitation) {
        throw new Error('Invitation not found');
      }

      if (invitation.isUsed) {
        throw new Error('Invitation has already been used');
      }

      // Update expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await db
        .update(userInvitations)
        .set({ expiresAt, updatedAt: new Date() })
        .where(eq(userInvitations.id, invitationId));

      await logAuditEvent(
        currentUser?.id || null,
        'RESEND_INVITATION',
        'USER_INVITATION',
        invitationId,
        'Invitation resent'
      );

      return {
        success: true,
        message: 'Invitation resent successfully',
        invitation: await db.query.userInvitations.findFirst({
          where: eq(userInvitations.id, invitationId),
          with: {
            company: true,
            role: true,
            invitedBy: true,
          },
        }),
      };
    },

    cancelInvitation: async (_, { invitationId }, { user: currentUser }) => {
      const invitation = await db.query.userInvitations.findFirst({
        where: eq(userInvitations.id, invitationId),
      });

      if (!invitation) {
        throw new Error('Invitation not found');
      }

      await db.delete(userInvitations).where(eq(userInvitations.id, invitationId));

      await logAuditEvent(
        currentUser?.id || null,
        'CANCEL_INVITATION',
        'USER_INVITATION',
        invitationId,
        'Invitation cancelled'
      );

      return true;
    },

    acceptInvitation: async (_, { input }) => {
      const { token, password, firstName, lastName, phoneNumber } = input;

      const invitation = await db.query.userInvitations.findFirst({
        where: eq(userInvitations.token, token),
        with: {
          company: true,
          role: true,
        },
      });

      if (!invitation) {
        throw new Error('Invalid invitation token');
      }

      if (invitation.isUsed) {
        throw new Error('Invitation has already been used');
      }

      if (new Date() > invitation.expiresAt) {
        throw new Error('Invitation has expired');
      }

      // Check if user already exists
      let user = await db.query.users.findFirst({
        where: eq(users.email, invitation.email),
      });

      if (!user) {
        // Create new user
        const passwordHash = await hashPassword(password);
        const [newUser] = await db
          .insert(users)
          .values({
            companyId: invitation.companyId,
            email: invitation.email,
            normalizedEmail: invitation.email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            phoneNumber,
            emailConfirmed: true, // Invitation-based registration is auto-verified
          })
          .returning();
        user = newUser;
      }

      // Add user to company with specified role
      const [userCompany] = await db
        .insert(userCompanies)
        .values({
          userId: user.id,
          companyId: invitation.companyId,
          roleId: invitation.roleId,
        })
        .returning();

      // Mark invitation as used
      await db
        .update(userInvitations)
        .set({ isUsed: true, updatedAt: new Date() })
        .where(eq(userInvitations.id, invitation.id));

      // Generate auth token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        companyId: user.companyId,
        roles: [invitation.role.name],
      };

      const authToken = generateToken(tokenPayload);
      const refreshToken = generateToken({ id: user.id }, REFRESH_TOKEN_EXPIRES_IN);

      await logAuditEvent(user.id, 'ACCEPT_INVITATION', 'USER_INVITATION', invitation.id, 'Invitation accepted');

      return {
        success: true,
        message: 'Invitation accepted successfully',
        user: await db.query.users.findFirst({
          where: eq(users.id, user.id),
          with: {
            company: true,
            userRoles: {
              with: {
                role: true,
              },
            },
          },
        }),
        token: authToken,
      };
    },

    // User Company Management
    addUserToCompany: async (_, { userId, companyId, roleId }, { user: currentUser }) => {
      // Check if relationship already exists
      const existing = await db.query.userCompanies.findFirst({
        where: and(eq(userCompanies.userId, userId), eq(userCompanies.companyId, companyId)),
      });

      if (existing) {
        throw new Error('User is already a member of this company');
      }

      const [userCompany] = await db
        .insert(userCompanies)
        .values({
          userId,
          companyId,
          roleId,
        })
        .returning();

      await logAuditEvent(
        currentUser?.id || null,
        'ADD_USER_TO_COMPANY',
        'USER_COMPANY',
        userCompany.id,
        'User added to company'
      );

      return await db.query.userCompanies.findFirst({
        where: eq(userCompanies.id, userCompany.id),
        with: {
          user: true,
          company: true,
          role: true,
        },
      });
    },

    updateUserCompanyRole: async (_, { userCompanyId, roleId }, { user: currentUser }) => {
      await db.update(userCompanies).set({ roleId, updatedAt: new Date() }).where(eq(userCompanies.id, userCompanyId));

      await logAuditEvent(
        currentUser?.id || null,
        'UPDATE_USER_COMPANY_ROLE',
        'USER_COMPANY',
        userCompanyId,
        'User company role updated'
      );

      return await db.query.userCompanies.findFirst({
        where: eq(userCompanies.id, userCompanyId),
        with: {
          user: true,
          company: true,
          role: true,
        },
      });
    },

    removeUserFromCompany: async (_, { userCompanyId }, { user: currentUser }) => {
      const userCompany = await db.query.userCompanies.findFirst({
        where: eq(userCompanies.id, userCompanyId),
      });

      if (!userCompany) {
        throw new Error('User company relationship not found');
      }

      await db.delete(userCompanies).where(eq(userCompanies.id, userCompanyId));

      await logAuditEvent(
        currentUser?.id || null,
        'REMOVE_USER_FROM_COMPANY',
        'USER_COMPANY',
        userCompanyId,
        'User removed from company'
      );

      return true;
    },

    switchUserCompany: async (_, { userCompanyId }, { user: currentUser }) => {
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      const userCompany = await db.query.userCompanies.findFirst({
        where: and(eq(userCompanies.id, userCompanyId), eq(userCompanies.userId, currentUser.id)),
        with: {
          company: true,
          role: true,
        },
      });

      if (!userCompany) {
        throw new Error('User company relationship not found');
      }

      // Update user's current company context
      await db
        .update(users)
        .set({ companyId: userCompany.companyId, updatedAt: new Date() })
        .where(eq(users.id, currentUser.id));

      await logAuditEvent(
        currentUser.id,
        'SWITCH_USER_COMPANY',
        'USER_COMPANY',
        userCompanyId,
        'User switched company context'
      );

      return true;
    },
  },

  // Field resolvers
  User: {
    roles: async (parent) => {
      const userRolesData = await db.query.userRoles.findMany({
        where: eq(userRoles.userId, parent.id),
        with: {
          role: true,
        },
      });
      return userRolesData.map((ur) => ur.role);
    },

    permissions: async (parent) => {
      const userRolesData = await db.query.userRoles.findMany({
        where: eq(userRoles.userId, parent.id),
        with: {
          role: {
            with: {
              rolePermissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      const permissions = new Set();
      userRolesData.forEach((ur) => {
        ur.role.rolePermissions.forEach((rp) => {
          permissions.add(rp.permission);
        });
      });

      return Array.from(permissions);
    },
  },

  Role: {
    userCount: async (parent) => {
      const result = await db.select({ count: count() }).from(userRoles).where(eq(userRoles.roleId, parent.id));

      return result[0].count;
    },

    permissions: async (parent) => {
      const rolePermissionsData = await db.query.rolePermissions.findMany({
        where: eq(rolePermissions.roleId, parent.id),
        with: {
          permission: true,
        },
      });
      return rolePermissionsData.map((rp) => rp.permission);
    },
  },

  Permission: {
    roles: async (parent) => {
      const rolePermissionsData = await db.query.rolePermissions.findMany({
        where: eq(rolePermissions.permissionId, parent.id),
        with: {
          role: true,
        },
      });
      return rolePermissionsData.map((rp) => rp.role);
    },
  },
};
