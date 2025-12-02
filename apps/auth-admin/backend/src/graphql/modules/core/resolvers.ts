import type { Pool } from 'pg';
import { db } from '../../../drizzle/client';
import { eq } from 'drizzle-orm';
import { systemConfig } from '../../../drizzle/schemas/systemConfig';

// Standard approach: rely on migrations to create tables; do not create tables at runtime.
async function getMinDriverAge(_pool: Pool): Promise<number> {
  try {
    const rows = await db
      .select({ valueInt: systemConfig.valueInt })
      .from(systemConfig)
      .where(eq(systemConfig.key, 'min_driver_age'))
      .limit(1);
    const n = Number(rows?.[0]?.valueInt);
    return Number.isFinite(n) && n > 0 ? n : 18;
  } catch {
    // If the table is missing, this will fall back to default; proper fix is to run migrations.
    return 18;
  }
}

/** Load max upload size (in MB) from system_config with a safe default. */
async function getMaxUploadSizeMB(_pool: Pool): Promise<number> {
  try {
    const rows = await db
      .select({ valueInt: systemConfig.valueInt })
      .from(systemConfig)
      .where(eq(systemConfig.key, 'max_upload_size_mb'))
      .limit(1);
    const n = Number(rows?.[0]?.valueInt);
    // default to 10 MB if not set or invalid
    return Number.isFinite(n) && n > 0 ? n : 10;
  } catch {
    return 10;
  }
}

export const createResolvers = (pool: Pool) => ({
  Query: {
    hello: () => 'Hello from GraphQL',
    health: () => 'ok',
    dbVersion: async () => {
      try {
        const res = await pool.query('select version()');
        return res.rows?.[0]?.version ?? null;
      } catch {
        return null;
      }
    },
    systemConfig: async () => {
      const minDriverAge = await getMinDriverAge(pool);
      const maxUploadSizeMB = await getMaxUploadSizeMB(pool);
      return { minDriverAge, maxUploadSizeMB };
    },
  },
  Mutation: {
    updateSystemConfig: async (
      _: unknown,
      args: { input: { minDriverAge?: number | null; maxUploadSizeMB?: number | null } }
    ) => {
      const toInt = (v: any, fallback: number) => {
        const n = Math.floor(Number(v));
        return Number.isFinite(n) && n > 0 ? n : fallback;
      };

      // Write only provided fields
      const writes: Promise<any>[] = [];

      if (args?.input?.minDriverAge != null) {
        const ageToStore = toInt(args.input.minDriverAge, 18);
        writes.push(
          db
            .insert(systemConfig)
            .values({ key: 'min_driver_age', valueInt: ageToStore })
            .onConflictDoUpdate({
              target: systemConfig.key,
              set: { valueInt: ageToStore },
            })
        );
      }

      if (args?.input?.maxUploadSizeMB != null) {
        const sizeToStore = toInt(args.input.maxUploadSizeMB, 10);
        writes.push(
          db
            .insert(systemConfig)
            .values({ key: 'max_upload_size_mb', valueInt: sizeToStore })
            .onConflictDoUpdate({
              target: systemConfig.key,
              set: { valueInt: sizeToStore },
            })
        );
      }

      if (writes.length > 0) {
        await Promise.all(writes);
      }

      // Return the latest values
      const [minDriverAge, maxUploadSizeMB] = await Promise.all([
        getMinDriverAge(pool),
        getMaxUploadSizeMB(pool),
      ]);
      return { minDriverAge, maxUploadSizeMB };
    },
  },
});
