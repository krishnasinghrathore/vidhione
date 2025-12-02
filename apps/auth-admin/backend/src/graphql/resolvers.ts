import type { Pool } from 'pg';
import { resolvers as baseResolvers } from './modules/_base/resolvers';
import { resolvers as documentResolvers } from './modules/documents/resolvers';
import { createResolvers as createCoreResolvers } from './modules/core/resolvers';

/**
 * Compose module resolvers into a single resolver map.
 * - baseResolvers: shared scalars (e.g., JSON)
 * - core resolvers (hello/health/dbVersion) are parameterized by Pool
 * - document resolvers use Drizzle db directly
 */
export const createResolvers = (pool: Pool) => {
  const core = createCoreResolvers(pool);

  return {
    // Root-level spreads allow scalars or type-specific resolvers to flow through
    ...baseResolvers,
    ...(core as any),

    Query: {
      ...((baseResolvers as any).Query ?? {}),
      ...(core.Query ?? {}),
      ...(documentResolvers.Query ?? {}),
    },

    Mutation: {
      ...((baseResolvers as any).Mutation ?? {}),
      ...((core as any).Mutation ?? {}),
      ...(documentResolvers.Mutation ?? {}),
    },

    // Field-level resolvers (e.g., derived fields)
    ...((documentResolvers as any).DocumentTypeAssignment
      ? {
          DocumentTypeAssignment: (documentResolvers as any).DocumentTypeAssignment,
        }
      : {}),
    ...((documentResolvers as any).Document
      ? {
          Document: (documentResolvers as any).Document,
        }
      : {}),
  };
};
